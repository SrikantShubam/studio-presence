-- Workspace activity and timezone support.
-- Existing lead and membership events remain their source of truth.
begin;

alter table public.workspace_preferences
  add column if not exists timezone text not null default 'Asia/Kolkata';

create table if not exists public.workspace_activity_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  period_key text,
  created_at timestamptz not null default now()
);

create index if not exists workspace_activity_events_tenant_created_idx
  on public.workspace_activity_events (tenant_id, created_at desc, id desc);

create unique index if not exists workspace_activity_events_monthly_summary_unique_idx
  on public.workspace_activity_events (tenant_id, event_type, period_key)
  where event_type = 'analytics_monthly_summary' and period_key is not null;

alter table public.workspace_activity_events enable row level security;

create policy workspace_activity_events_select on public.workspace_activity_events
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

revoke insert, update, delete on public.workspace_activity_events from authenticated;

drop policy if exists tenant_membership_events_select on public.tenant_membership_events;
create policy tenant_membership_events_select on public.tenant_membership_events
  for select to authenticated
  using (public.current_tenant_role(tenant_id) is not null);

create or replace function public.update_lead_work(
  p_lead_id uuid,
  p_status public.lead_status,
  p_notes text
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_previous_status public.lead_status;
  v_previous_notes text;
  v_next_notes text := nullif(trim(p_notes), '');
  v_role text;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then raise exception 'lead not found' using errcode = 'no_data_found'; end if;

  v_role := public.current_tenant_role(v_lead.tenant_id);
  if v_role is null or (v_role = 'editor' and (v_lead.assigned_to is null or v_lead.assigned_to <> auth.uid())) or v_role not in ('owner', 'editor') then
    raise exception 'you cannot update this lead' using errcode = '42501';
  end if;

  v_previous_status := v_lead.status;
  v_previous_notes := v_lead.notes;

  update public.leads
  set status = p_status, notes = v_next_notes
  where id = p_lead_id
  returning * into v_lead;

  if v_previous_status is distinct from v_lead.status then
    insert into public.lead_events (lead_id, tenant_id, type, payload)
    values (
      v_lead.id, v_lead.tenant_id, 'status_changed',
      jsonb_build_object('from', v_previous_status, 'to', v_lead.status, 'actor_user_id', auth.uid())
    );
  end if;

  if v_previous_notes is distinct from v_lead.notes then
    insert into public.lead_events (lead_id, tenant_id, type, payload)
    values (
      v_lead.id, v_lead.tenant_id, 'note_updated',
      jsonb_build_object('actor_user_id', auth.uid())
    );
  end if;

  return v_lead;
end;
$$;

commit;
