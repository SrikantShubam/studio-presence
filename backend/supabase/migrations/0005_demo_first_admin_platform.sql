create type demo_workflow_state as enum (
  'generated', 'review_failed', 'review_passed', 'sent', 'opened', 'editor_opened',
  'edited_locally', 'activation_requested', 'expired', 'payment_confirmed', 'activated',
  'domain_live', 'lost', 'removed'
);

create type paid_draft_state as enum ('draft', 'published', 'discarded', 'rolled_back');
create type operator_audit_action as enum (
  'demo_created', 'demo_reviewed', 'demo_sent', 'demo_extended', 'demo_expired', 'demo_removed',
  'activation_requested', 'payment_confirmed', 'owner_granted', 'owner_revoked', 'owner_transferred',
  'draft_imported', 'draft_published', 'draft_rolled_back', 'domain_launched', 'tenant_archived'
);

create table prospect_demos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  prospect_name text,
  prospect_contact text,
  workflow_state demo_workflow_state not null default 'generated',
  base_revision text not null,
  provenance jsonb not null default '{}'::jsonb,
  review_notes text,
  sent_at timestamptz,
  expires_at timestamptz,
  opened_at timestamptz,
  editor_opened_at timestamptz,
  activation_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table paid_content_drafts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  source_demo_id uuid references prospect_demos on delete set null,
  base_revision text not null,
  patch jsonb not null default '{}'::jsonb,
  state paid_draft_state not null default 'draft',
  created_by uuid references auth.users,
  published_by uuid references auth.users,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table operator_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users,
  tenant_id uuid references tenants on delete set null,
  prospect_demo_id uuid references prospect_demos on delete set null,
  action operator_audit_action not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table operator_users (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'operator' check (role in ('operator', 'super_admin')),
  created_at timestamptz not null default now()
);

create index prospect_demos_state_idx on prospect_demos (workflow_state, created_at desc);
create index prospect_demos_tenant_idx on prospect_demos (tenant_id);
create index paid_content_drafts_tenant_idx on paid_content_drafts (tenant_id, created_at desc);
create index audit_tenant_idx on operator_audit_events (tenant_id, created_at desc);

alter table prospect_demos enable row level security;
alter table paid_content_drafts enable row level security;
alter table operator_audit_events enable row level security;
alter table operator_users enable row level security;

create or replace function public.is_operator()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from operator_users where user_id = auth.uid()) $$;

create policy prospect_demos_operator_select on prospect_demos for select to authenticated using (public.is_operator());
create policy paid_drafts_operator_select on paid_content_drafts for select to authenticated using (public.is_operator());
create policy audit_operator_select on operator_audit_events for select to authenticated using (public.is_operator());

create or replace function public.operator_list_demos(p_state demo_workflow_state default null)
returns setof prospect_demos language sql stable security definer set search_path = public as $$
  select d from prospect_demos d where public.is_operator() and (p_state is null or d.workflow_state = p_state) order by d.created_at desc
$$;

create or replace function public.operator_update_demo_state(p_demo_id uuid, p_state demo_workflow_state, p_notes text default null)
returns prospect_demos language plpgsql security definer set search_path = public as $$
declare v_demo prospect_demos;
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  update prospect_demos set workflow_state = p_state, review_notes = coalesce(p_notes, review_notes), updated_at = now()
  where id = p_demo_id returning * into v_demo;
  if v_demo.id is null then raise exception 'demo not found'; end if;
  insert into operator_audit_events(actor_user_id, tenant_id, prospect_demo_id, action, payload)
  values (auth.uid(), v_demo.tenant_id, v_demo.id, 'demo_reviewed', jsonb_build_object('state', p_state));
  return v_demo;
end; $$;

create or replace function public.operator_grant_owner(p_tenant_id uuid, p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  insert into tenant_members(user_id, tenant_id, role) values (p_user_id, p_tenant_id, 'owner')
  on conflict (user_id, tenant_id) do update set role = 'owner';
  insert into operator_audit_events(actor_user_id, tenant_id, action, payload)
  values (auth.uid(), p_tenant_id, 'owner_granted', jsonb_build_object('user_id', p_user_id));
  return true;
end; $$;

create or replace function public.operator_revoke_owner(p_tenant_id uuid, p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  delete from tenant_members where tenant_id = p_tenant_id and user_id = p_user_id;
  insert into operator_audit_events(actor_user_id, tenant_id, action, payload)
  values (auth.uid(), p_tenant_id, 'owner_revoked', jsonb_build_object('user_id', p_user_id));
  return true;
end; $$;

create or replace function public.operator_import_paid_draft(p_tenant_id uuid, p_source_demo_id uuid, p_base_revision text, p_patch jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  insert into paid_content_drafts(tenant_id, source_demo_id, base_revision, patch, created_by)
  values (p_tenant_id, p_source_demo_id, p_base_revision, p_patch, auth.uid()) returning id into v_id;
  insert into operator_audit_events(actor_user_id, tenant_id, prospect_demo_id, action, payload)
  values (auth.uid(), p_tenant_id, p_source_demo_id, 'draft_imported', jsonb_build_object('draft_id', v_id));
  return v_id;
end; $$;

create or replace function public.operator_publish_paid_draft(p_draft_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_draft paid_content_drafts;
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  select * into v_draft from paid_content_drafts where id = p_draft_id and state = 'draft' for update;
  if v_draft.id is null then raise exception 'draft not found or already published'; end if;
  insert into client_overrides(tenant_id, patch, updated_by) values (v_draft.tenant_id, v_draft.patch, auth.uid())
  on conflict (tenant_id) do update set patch = client_overrides.patch || excluded.patch, updated_at = now(), updated_by = auth.uid();
  update paid_content_drafts set state = 'published', published_by = auth.uid(), published_at = now() where id = p_draft_id;
  insert into operator_audit_events(actor_user_id, tenant_id, action, payload)
  values (auth.uid(), v_draft.tenant_id, 'draft_published', jsonb_build_object('draft_id', p_draft_id));
  return true;
end; $$;

revoke all on function public.is_operator() from public;
grant execute on function public.is_operator() to authenticated;
revoke all on function public.operator_list_demos from public;
grant execute on function public.operator_list_demos to authenticated;
revoke all on function public.operator_update_demo_state from public;
grant execute on function public.operator_update_demo_state to authenticated;
revoke all on function public.operator_grant_owner from public;
grant execute on function public.operator_grant_owner to authenticated;
revoke all on function public.operator_revoke_owner from public;
grant execute on function public.operator_revoke_owner to authenticated;
revoke all on function public.operator_import_paid_draft from public;
grant execute on function public.operator_import_paid_draft to authenticated;
revoke all on function public.operator_publish_paid_draft from public;
grant execute on function public.operator_publish_paid_draft to authenticated;
