-- Activity correctness and safe workspace-event writes.
begin;

-- Keep the trigger responsible for contacted_at, while update_lead_work owns
-- the single status event and its actor payload.
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and new.status <> 'new'
     and old.contacted_at is null then
    new.contacted_at := now();
  end if;
  return new;
end;
$$;

alter table public.workspace_activity_events
  add constraint workspace_activity_event_type_check
  check (event_type in ('content_published', 'analytics_monthly_summary'));

create or replace function public.record_workspace_activity(
  p_tenant_id uuid,
  p_event_type text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_payload jsonb default '{}'::jsonb,
  p_period_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null or public.current_tenant_role(p_tenant_id) is null then
    raise exception 'workspace access denied' using errcode = '42501';
  end if;

  if p_event_type not in ('content_published', 'analytics_monthly_summary') then
    raise exception 'unsupported workspace activity type' using errcode = 'check_violation';
  end if;

  insert into public.workspace_activity_events (
    tenant_id, actor_user_id, event_type, entity_type, entity_id, payload, period_key
  ) values (
    p_tenant_id, auth.uid(), p_event_type, p_entity_type, p_entity_id,
    coalesce(p_payload, '{}'::jsonb), p_period_key
  )
  on conflict (tenant_id, event_type, period_key)
    where event_type = 'analytics_monthly_summary' and period_key is not null
  do update set
    actor_user_id = excluded.actor_user_id,
    entity_type = excluded.entity_type,
    entity_id = excluded.entity_id,
    payload = excluded.payload,
    created_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.record_workspace_activity(uuid, text, text, uuid, jsonb, text) from public;
grant execute on function public.record_workspace_activity(uuid, text, text, uuid, jsonb, text) to authenticated;

create or replace function public.log_client_override_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_activity_events (
    tenant_id, actor_user_id, event_type, entity_type, payload
  ) values (
    new.tenant_id, auth.uid(), 'content_published', 'workspace',
    jsonb_build_object('fields', coalesce((select jsonb_agg(key) from jsonb_object_keys(new.patch) as key), '[]'::jsonb))
  );
  return new;
end;
$$;

drop trigger if exists client_overrides_content_published on public.client_overrides;
create trigger client_overrides_content_published
after insert or update on public.client_overrides
for each row execute function public.log_client_override_publish();

commit;
