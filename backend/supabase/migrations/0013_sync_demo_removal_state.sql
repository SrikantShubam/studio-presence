create or replace function public.operator_update_demo_state(p_demo_id uuid, p_state demo_workflow_state, p_notes text default null)
returns prospect_demos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_demo prospect_demos;
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;

  update public.prospect_demos
    set workflow_state = p_state,
        review_notes = coalesce(p_notes, review_notes),
        updated_at = now()
    where id = p_demo_id
    returning * into v_demo;

  if v_demo.id is null then raise exception 'demo not found'; end if;

  if p_state in ('expired', 'removed') then
    update public.tenants
      set demo_removed_at = now(), demo_expires_at = now()
      where id = v_demo.tenant_id;
  end if;

  insert into public.operator_audit_events(actor_user_id, tenant_id, prospect_demo_id, action, payload)
  values (auth.uid(), v_demo.tenant_id, v_demo.id, 'demo_reviewed', jsonb_build_object('state', p_state));
  return v_demo;
end;
$$;

revoke all on function public.operator_update_demo_state(uuid, demo_workflow_state, text) from public, anon, authenticated;
grant execute on function public.operator_update_demo_state(uuid, demo_workflow_state, text) to authenticated;
