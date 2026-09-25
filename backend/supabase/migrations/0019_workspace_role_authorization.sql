-- Studio Presence - workspace role authorization matrix hardening
--
-- Enforces:
-- 1. update_lead_work:
--    - owner: can update any lead in the tenant
--    - editor: can update only leads assigned to that editor
--    - viewer: can update status and private notes on any visible lead in the tenant
--    - cross-tenant / unauthorized callers: denied (42501)
--    - assigned_to is immutable through update_lead_work
-- 2. assign_lead:
--    - strictly owner-only (editor & viewer denied)
--    - target must be an active owner or editor
-- 3. Lead creation & dashboard mutations:
--    - create_dashboard_lead RPC: owner allowed, editor & viewer denied (42501)
--    - submit_lead: if authenticated caller has role = 'viewer' in this tenant, denied (42501)
--    - direct table insert, update, delete on public.leads revoked from authenticated
-- 4. Website and configuration data:
--    - client_overrides: insert and update allowed only for owner and editor; viewer denied
--    - i18n_overrides: insert and update allowed only for owner and editor; viewer denied
--    - tenant_workspaces: update allowed only for owner; editor & viewer denied
--    - submit_paid_draft: owner & editor allowed, viewer denied (42501)
-- 5. Membership management:
--    - create/revoke invitations, change roles, remove members: strictly owner-only
--    - direct table mutations on tenant_members/invitations/events remain revoked

begin;

-- 1. Update update_lead_work
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

  -- Editor: assigned-only
  if v_role = 'editor' and (v_lead.assigned_to is null or v_lead.assigned_to <> auth.uid()) then
    raise exception 'editors can update only enquiries assigned to them' using errcode = '42501';
  end if;

  -- Only owner, editor (if assigned), and viewer are valid roles
  if v_role not in ('owner', 'editor', 'viewer') then
    raise exception 'you cannot update this lead' using errcode = '42501';
  end if;

  update public.leads
  set status = p_status,
      notes = nullif(trim(p_notes), '')
  where id = p_lead_id
  returning * into v_lead;

  return v_lead;
end;
$$;

-- 2. Ensure assign_lead remains strictly owner-only and cannot assign to viewer
create or replace function public.assign_lead(p_lead_id uuid, p_user_id uuid)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_previous uuid;
  v_role text;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then raise exception 'lead not found' using errcode = 'no_data_found'; end if;

  if public.current_tenant_role(v_lead.tenant_id) <> 'owner' then
    raise exception 'only the workspace owner can assign leads' using errcode = '42501';
  end if;

  select role into v_role
  from public.tenant_members
  where tenant_id = v_lead.tenant_id and user_id = p_user_id;
  if v_role is null or v_role not in ('owner', 'editor') then
    raise exception 'lead assignee must be an active owner or editor' using errcode = 'check_violation';
  end if;

  v_previous := v_lead.assigned_to;
  update public.leads
  set assigned_to = p_user_id
  where id = p_lead_id
  returning * into v_lead;

  insert into public.lead_events (lead_id, tenant_id, type, payload)
  values (
    p_lead_id, v_lead.tenant_id,
    case when v_previous is null then 'assigned' else 'reassigned' end,
    jsonb_build_object('from_user_id', v_previous, 'to_user_id', p_user_id, 'actor_user_id', auth.uid())
  );
  return v_lead;
end;
$$;

-- 3. Dedicated dashboard lead creation RPC (owner only)
create or replace function public.create_dashboard_lead(
  p_tenant_id uuid,
  p_name text,
  p_phone text,
  p_email text default null,
  p_locality text default null,
  p_project_type text default null,
  p_budget_band text default null,
  p_timeline text default null,
  p_message text default null,
  p_source public.lead_source default 'other',
  p_source_page text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_lead_id uuid;
  v_owner_id uuid;
begin
  v_role := public.current_tenant_role(p_tenant_id);
  if v_role is null or v_role <> 'owner' then
    raise exception 'only workspace owners can create dashboard leads' using errcode = '42501';
  end if;

  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'name and phone are required' using errcode = 'check_violation';
  end if;

  select user_id into v_owner_id
  from public.tenant_members
  where tenant_id = p_tenant_id and role = 'owner'
  order by created_at
  limit 1;

  insert into public.leads (
    tenant_id, assigned_to, name, phone, email, locality, project_type,
    budget_band, timeline, message, source, source_page
  ) values (
    p_tenant_id, v_owner_id, trim(p_name), trim(p_phone), nullif(trim(p_email), ''),
    p_locality, p_project_type, p_budget_band, p_timeline, p_message, p_source, p_source_page
  ) returning id into v_lead_id;

  insert into public.lead_events (lead_id, tenant_id, type, payload)
  values (v_lead_id, p_tenant_id, 'created', jsonb_build_object('source', p_source, 'assigned_to', v_owner_id, 'actor_user_id', auth.uid()));

  return v_lead_id;
end;
$$;

-- 4. Guard submit_lead against viewer creating leads in their tenant
create or replace function public.submit_lead(
  p_tenant_slug text,
  p_name text,
  p_phone text,
  p_email text default null,
  p_locality text default null,
  p_project_type text default null,
  p_budget_band text default null,
  p_timeline text default null,
  p_message text default null,
  p_source public.lead_source default 'form',
  p_source_page text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_lead_id uuid;
  v_owner_id uuid;
  v_role text;
begin
  select id into v_tenant_id from public.tenants where slug = p_tenant_slug;
  if v_tenant_id is null then raise exception 'unknown tenant' using errcode = 'no_data_found'; end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'name and phone are required' using errcode = 'check_violation';
  end if;

  if auth.uid() is not null then
    v_role := public.current_tenant_role(v_tenant_id);
    if v_role = 'viewer' then
      raise exception 'viewers cannot create leads' using errcode = '42501';
    end if;
  end if;

  select user_id into v_owner_id
  from public.tenant_members
  where tenant_id = v_tenant_id and role = 'owner'
  order by created_at
  limit 1;

  insert into public.leads (
    tenant_id, assigned_to, name, phone, email, locality, project_type,
    budget_band, timeline, message, source, source_page
  ) values (
    v_tenant_id, v_owner_id, trim(p_name), trim(p_phone), nullif(trim(p_email), ''),
    p_locality, p_project_type, p_budget_band, p_timeline, p_message, p_source, p_source_page
  ) returning id into v_lead_id;

  insert into public.lead_events (lead_id, tenant_id, type, payload)
  values (v_lead_id, v_tenant_id, 'created', jsonb_build_object('source', p_source, 'assigned_to', v_owner_id));
  return v_lead_id;
end;
$$;

-- 5. Revoke direct mutations on leads table from authenticated
revoke insert, update, delete on public.leads from authenticated;
drop policy if exists leads_update on public.leads;
drop policy if exists leads_insert on public.leads;

-- Ensure leads_select allows all active tenant members
drop policy if exists leads_select on public.leads;
create policy leads_select on public.leads
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

-- 6. Lock down website & configuration overrides (owner and editor allowed, viewer denied)
drop policy if exists client_overrides_insert_paid on public.client_overrides;
drop policy if exists client_overrides_update_paid on public.client_overrides;
drop policy if exists client_overrides_select_paid on public.client_overrides;
drop policy if exists client_overrides_upsert on public.client_overrides;
drop policy if exists client_overrides_update on public.client_overrides;
drop policy if exists client_overrides_select on public.client_overrides;

create policy client_overrides_select on public.client_overrides
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

create policy client_overrides_insert on public.client_overrides
  for insert to authenticated
  with check (public.current_tenant_role(tenant_id) in ('owner', 'editor'));

create policy client_overrides_update on public.client_overrides
  for update to authenticated
  using (public.current_tenant_role(tenant_id) in ('owner', 'editor'))
  with check (public.current_tenant_role(tenant_id) in ('owner', 'editor'));

revoke delete on public.client_overrides from authenticated;

-- i18n_overrides
drop policy if exists i18n_overrides_insert_paid on public.i18n_overrides;
drop policy if exists i18n_overrides_update_paid on public.i18n_overrides;
drop policy if exists i18n_overrides_select_paid on public.i18n_overrides;
drop policy if exists i18n_overrides_insert on public.i18n_overrides;
drop policy if exists i18n_overrides_update on public.i18n_overrides;
drop policy if exists i18n_overrides_select on public.i18n_overrides;

create policy i18n_overrides_select on public.i18n_overrides
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

create policy i18n_overrides_insert on public.i18n_overrides
  for insert to authenticated
  with check (public.current_tenant_role(tenant_id) in ('owner', 'editor'));

create policy i18n_overrides_update on public.i18n_overrides
  for update to authenticated
  using (public.current_tenant_role(tenant_id) in ('owner', 'editor'))
  with check (public.current_tenant_role(tenant_id) in ('owner', 'editor'));

-- tenant_workspaces (owner only update)
drop policy if exists tenant_workspaces_member_update on public.tenant_workspaces;
create policy tenant_workspaces_member_update on public.tenant_workspaces
  for update to authenticated
  using (public.current_tenant_role(tenant_id) = 'owner')
  with check (
    public.current_tenant_role(tenant_id) = 'owner'
    and updated_by = auth.uid()
  );

-- submit_paid_draft (owner & editor only)
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
  if exists (
    select 1
    from jsonb_object_keys(coalesce(p_patch, '{}'::jsonb)) as key
    where key not in (
      'business.phone', 'business.whatsapp', 'business.email', 'business.hours',
      'business.address', 'sections.hero.image', 'sections.portfolio.projects',
      'sections.about.heading', 'sections.about.body', 'sections.services.items',
      'sections.testimonials.items', 'sections.instagram.embedPostUrls'
    )
  ) then
    raise exception 'draft contains fields that are not customer-editable' using errcode = '42501';
  end if;

  select t.id into v_tenant_id
  from public.tenants t
  where t.slug = p_tenant_slug
    and exists (
      select 1 from public.tenant_members m
      where m.tenant_id = t.id and m.user_id = auth.uid() and m.role in ('owner', 'editor')
    );

  if v_tenant_id is null then raise exception 'customer access required' using errcode = '42501'; end if;

  insert into public.paid_content_drafts (tenant_id, base_revision, patch, created_by)
  values (v_tenant_id, p_base_revision, coalesce(p_patch, '{}'::jsonb), auth.uid())
  returning id into v_draft_id;

  insert into public.operator_audit_events (actor_user_id, tenant_id, action, payload)
  values (auth.uid(), v_tenant_id, 'activation_requested', jsonb_build_object('draft_id', v_draft_id));

  return v_draft_id;
end;
$$;

-- Function grants
revoke all on function public.create_dashboard_lead(uuid, text, text, text, text, text, text, text, text, public.lead_source, text) from public;
grant execute on function public.create_dashboard_lead(uuid, text, text, text, text, text, text, text, text, public.lead_source, text) to authenticated;

revoke all on function public.update_lead_work(uuid, public.lead_status, text) from public;
grant execute on function public.update_lead_work(uuid, public.lead_status, text) to authenticated;

revoke all on function public.assign_lead(uuid, uuid) from public;
grant execute on function public.assign_lead(uuid, uuid) to authenticated;

revoke all on function public.submit_lead(text, text, text, text, text, text, text, text, text, public.lead_source, text) from public;
grant execute on function public.submit_lead(text, text, text, text, text, text, text, text, text, public.lead_source, text) to anon, authenticated;

revoke all on function public.submit_paid_draft(text, text, jsonb) from public;
grant execute on function public.submit_paid_draft(text, text, jsonb) to authenticated;

commit;
