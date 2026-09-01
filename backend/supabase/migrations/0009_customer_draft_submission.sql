create or replace function public.submit_paid_draft(
  p_tenant_slug text,
  p_base_revision text,
  p_patch jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_draft_id uuid;
begin
  select t.id into v_tenant_id
  from public.tenants t
  where t.slug = p_tenant_slug
    and exists (
      select 1 from public.tenant_members m
      where m.tenant_id = t.id and m.user_id = auth.uid()
    );

  if v_tenant_id is null then raise exception 'customer access required' using errcode = '42501'; end if;

  insert into public.paid_content_drafts (tenant_id, base_revision, patch, created_by)
  values (v_tenant_id, p_base_revision, p_patch, auth.uid())
  returning id into v_draft_id;

  insert into public.operator_audit_events (actor_user_id, tenant_id, action, payload)
  values (auth.uid(), v_tenant_id, 'activation_requested', jsonb_build_object('draft_id', v_draft_id));

  return v_draft_id;
end;
$$;

revoke all on function public.submit_paid_draft(text, text, jsonb) from public;
grant execute on function public.submit_paid_draft(text, text, jsonb) to authenticated;
