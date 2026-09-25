begin;

alter table public.leads
  add column if not exists updated_at timestamptz;

update public.leads
set updated_at = created_at
where updated_at is null;

alter table public.leads
  alter column updated_at set default now();

alter table public.leads
  alter column updated_at set not null;

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
  v_role text;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then raise exception 'lead not found' using errcode = 'no_data_found'; end if;

  v_role := public.current_tenant_role(v_lead.tenant_id);
  if v_role is null then
    raise exception 'you cannot update this lead' using errcode = '42501';
  end if;
  if v_role = 'editor' and (v_lead.assigned_to is null or v_lead.assigned_to <> auth.uid()) then
    raise exception 'editors can update only enquiries assigned to them' using errcode = '42501';
  end if;
  if v_role not in ('owner', 'editor', 'viewer') then
    raise exception 'you cannot update this lead' using errcode = '42501';
  end if;

  update public.leads
  set status = p_status,
      notes = nullif(trim(p_notes), ''),
      updated_at = now()
  where id = p_lead_id
  returning * into v_lead;

  return v_lead;
end;
$$;

commit;
