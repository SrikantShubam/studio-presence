-- Studio Presence - customer workspace membership and lead assignment
--
-- Membership changes and lead mutations are intentionally exposed through
-- narrow RPCs. The browser never receives a general-purpose write policy for
-- these tables.

begin;

alter table public.tenant_members
  add constraint tenant_members_role_check
  check (role in ('owner', 'editor', 'viewer'));

create table public.tenant_invitations (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants on delete cascade,
  email_lower   text not null,
  email_display text not null,
  role          text not null check (role in ('editor', 'viewer')),
  token_hash    text not null unique,
  expires_at    timestamptz not null,
  accepted_at   timestamptz,
  revoked_at    timestamptz,
  invited_by    uuid not null references auth.users on delete restrict,
  created_at    timestamptz not null default now()
);

create index tenant_invitations_tenant_idx
  on public.tenant_invitations (tenant_id, created_at desc);

create index tenant_invitations_pending_email_idx
  on public.tenant_invitations (tenant_id, email_lower)
  where accepted_at is null and revoked_at is null;

create table public.tenant_membership_events (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants on delete cascade,
  actor_user_id uuid references auth.users on delete set null,
  target_user_id uuid references auth.users on delete set null,
  invitation_id uuid references public.tenant_invitations on delete set null,
  type          text not null,
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index tenant_membership_events_tenant_idx
  on public.tenant_membership_events (tenant_id, created_at desc);

alter table public.leads
  add column assigned_to uuid references auth.users on delete set null;

create index leads_tenant_assignee_idx
  on public.leads (tenant_id, assigned_to, created_at desc);

update public.leads l
set assigned_to = (
  select tm.user_id
  from public.tenant_members tm
  where tm.tenant_id = l.tenant_id
    and tm.role = 'owner'
  order by tm.created_at
  limit 1
)
where l.assigned_to is null
  and exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = l.tenant_id
      and tm.role = 'owner'
  );

-- RLS-safe membership lookup. The definer is required to avoid recursion when
-- policies on tenant_members use the helper to inspect another member row.
create or replace function public.current_tenant_role(p_tenant_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select tm.role
  from public.tenant_members tm
  where tm.tenant_id = p_tenant_id and tm.user_id = auth.uid()
  limit 1
$$;

revoke all on function public.current_tenant_role(uuid) from public;
grant execute on function public.current_tenant_role(uuid) to authenticated;
create or replace function public.list_tenant_members(p_tenant_id uuid)
returns table (
  user_id uuid,
  tenant_id uuid,
  role text,
  created_at timestamptz,
  email text,
  display_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    tm.user_id,
    tm.tenant_id,
    tm.role,
    tm.created_at,
    lower(u.email),
    coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name')
  from public.tenant_members tm
  join auth.users u on u.id = tm.user_id
  where tm.tenant_id = p_tenant_id
    and public.current_tenant_role(p_tenant_id) is not null
  order by tm.created_at;
$$;

revoke all on function public.list_tenant_members(uuid) from public;
grant execute on function public.list_tenant_members(uuid) to authenticated;

drop policy if exists tenant_members_select on public.tenant_members;
create policy tenant_members_select on public.tenant_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.current_tenant_role(tenant_id) = 'owner'
  );

alter table public.tenant_invitations enable row level security;
alter table public.tenant_membership_events enable row level security;

create policy tenant_invitations_select on public.tenant_invitations
  for select to authenticated
  using (public.current_tenant_role(tenant_id) = 'owner');

create policy tenant_membership_events_select on public.tenant_membership_events
  for select to authenticated
  using (public.current_tenant_role(tenant_id) = 'owner');

-- Existing broad update/insert policies would let an editor rewrite an
-- assignee or forge activity rows. All writes now go through the RPCs below.
drop policy if exists leads_update on public.leads;
drop policy if exists lead_events_insert on public.lead_events;
revoke update on public.leads from authenticated;
revoke insert on public.lead_events from authenticated;
revoke insert, update, delete on public.tenant_members from authenticated;
revoke insert, update, delete on public.tenant_invitations from authenticated;
revoke insert, update, delete on public.tenant_membership_events from authenticated;

create or replace function public.create_tenant_invitation(
  p_tenant_id uuid,
  p_email_lower text,
  p_email_display text,
  p_role text,
  p_token_hash text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation_id uuid;
begin
  if public.current_tenant_role(p_tenant_id) <> 'owner' then
    raise exception 'only the workspace owner can invite members' using errcode = '42501';
  end if;

  if p_role not in ('editor', 'viewer') then
    raise exception 'invalid invitation role' using errcode = 'check_violation';
  end if;

  if p_expires_at <= now() then
    raise exception 'invitation must expire in the future' using errcode = 'check_violation';
  end if;

  insert into public.tenant_invitations (
    tenant_id, email_lower, email_display, role, token_hash, expires_at, invited_by
  ) values (
    p_tenant_id, lower(trim(p_email_lower)), trim(p_email_display), p_role,
    p_token_hash, p_expires_at, auth.uid()
  ) returning id into v_invitation_id;

  insert into public.tenant_membership_events (
    tenant_id, actor_user_id, invitation_id, type, payload
  ) values (
    p_tenant_id, auth.uid(), v_invitation_id, 'invitation_created',
    jsonb_build_object('email', lower(trim(p_email_lower)), 'role', p_role)
  );

  return v_invitation_id;
end;
$$;

create or replace function public.revoke_tenant_invitation(p_invitation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  select tenant_id into v_tenant_id
  from public.tenant_invitations
  where id = p_invitation_id and accepted_at is null and revoked_at is null;

  if v_tenant_id is null or public.current_tenant_role(v_tenant_id) <> 'owner' then
    raise exception 'invitation not found or not manageable' using errcode = '42501';
  end if;

  update public.tenant_invitations
  set revoked_at = now()
  where id = p_invitation_id;

  insert into public.tenant_membership_events (
    tenant_id, actor_user_id, invitation_id, type
  ) values (v_tenant_id, auth.uid(), p_invitation_id, 'invitation_revoked');

  return true;
end;
$$;

create or replace function public.accept_tenant_invitation(p_token_hash text)
returns table (tenant_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.tenant_invitations%rowtype;
  v_email text;
begin
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null then
    raise exception 'authenticated email is required' using errcode = '42501';
  end if;

  select * into v_invitation
  from public.tenant_invitations
  where token_hash = p_token_hash
    and email_lower = v_email
    and accepted_at is null
    and revoked_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'invitation is invalid, expired, revoked, or for another email' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.tenant_members tm
    where tm.tenant_id = v_invitation.tenant_id and tm.user_id = auth.uid()
  ) then
    raise exception 'user is already a workspace member' using errcode = '23505';
  end if;

  insert into public.tenant_members (user_id, tenant_id, role)
  values (auth.uid(), v_invitation.tenant_id, v_invitation.role);

  update public.tenant_invitations
  set accepted_at = now()
  where id = v_invitation.id;

  insert into public.tenant_membership_events (
    tenant_id, actor_user_id, target_user_id, invitation_id, type, payload
  ) values (
    v_invitation.tenant_id, auth.uid(), auth.uid(), v_invitation.id,
    'invitation_accepted', jsonb_build_object('role', v_invitation.role)
  );

  return query select v_invitation.tenant_id, v_invitation.role;
end;
$$;

create or replace function public.change_tenant_member_role(
  p_tenant_id uuid,
  p_user_id uuid,
  p_role text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous_role text;
begin
  if public.current_tenant_role(p_tenant_id) <> 'owner' then
    raise exception 'only the workspace owner can change roles' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() or p_role not in ('editor', 'viewer') then
    raise exception 'invalid member role change' using errcode = 'check_violation';
  end if;

  select role into v_previous_role
  from public.tenant_members
  where tenant_id = p_tenant_id and user_id = p_user_id
  for update;

  if v_previous_role is null then
    raise exception 'member not found' using errcode = 'no_data_found';
  end if;

  update public.tenant_members
  set role = p_role
  where tenant_id = p_tenant_id and user_id = p_user_id;

  insert into public.tenant_membership_events (
    tenant_id, actor_user_id, target_user_id, type, payload
  ) values (
    p_tenant_id, auth.uid(), p_user_id, 'member_role_changed',
    jsonb_build_object('from', v_previous_role, 'to', p_role)
  );
  return true;
end;
$$;

create or replace function public.remove_tenant_member(p_tenant_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_tenant_role(p_tenant_id) <> 'owner' or p_user_id = auth.uid() then
    raise exception 'only the owner can remove another member' using errcode = '42501';
  end if;

  delete from public.tenant_members
  where tenant_id = p_tenant_id and user_id = p_user_id and role <> 'owner';

  if not found then
    raise exception 'member not found or cannot be removed' using errcode = 'no_data_found';
  end if;

  insert into public.tenant_membership_events (
    tenant_id, actor_user_id, target_user_id, type
  ) values (p_tenant_id, auth.uid(), p_user_id, 'member_removed');
  return true;
end;
$$;

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
  update public.leads set assigned_to = p_user_id where id = p_lead_id returning * into v_lead;

  insert into public.lead_events (lead_id, tenant_id, type, payload)
  values (
    p_lead_id, v_lead.tenant_id,
    case when v_previous is null then 'assigned' else 'reassigned' end,
    jsonb_build_object('from_user_id', v_previous, 'to_user_id', p_user_id, 'actor_user_id', auth.uid())
  );
  return v_lead;
end;
$$;

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
  if v_role is null or (v_role = 'editor' and (v_lead.assigned_to is null or v_lead.assigned_to <> auth.uid())) or v_role not in ('owner', 'editor') then
    raise exception 'you cannot update this lead' using errcode = '42501';
  end if;

  update public.leads
  set status = p_status, notes = nullif(trim(p_notes), '')
  where id = p_lead_id
  returning * into v_lead;
  return v_lead;
end;
$$;

-- New public enquiries start with the workspace owner when one exists.
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
begin
  select id into v_tenant_id from public.tenants where slug = p_tenant_slug;
  if v_tenant_id is null then raise exception 'unknown tenant' using errcode = 'no_data_found'; end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'name and phone are required' using errcode = 'check_violation';
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

revoke all on function public.create_tenant_invitation(uuid, text, text, text, text, timestamptz) from public;
revoke all on function public.revoke_tenant_invitation(uuid) from public;
revoke all on function public.accept_tenant_invitation(text) from public;
revoke all on function public.change_tenant_member_role(uuid, uuid, text) from public;
revoke all on function public.remove_tenant_member(uuid, uuid) from public;
revoke all on function public.assign_lead(uuid, uuid) from public;
revoke all on function public.update_lead_work(uuid, public.lead_status, text) from public;
revoke all on function public.submit_lead(text, text, text, text, text, text, text, text, text, public.lead_source, text) from public;

grant execute on function public.create_tenant_invitation(uuid, text, text, text, text, timestamptz) to authenticated;
grant execute on function public.revoke_tenant_invitation(uuid) to authenticated;
grant execute on function public.accept_tenant_invitation(text) to authenticated;
grant execute on function public.change_tenant_member_role(uuid, uuid, text) to authenticated;
grant execute on function public.remove_tenant_member(uuid, uuid) to authenticated;
grant execute on function public.assign_lead(uuid, uuid) to authenticated;
grant execute on function public.update_lead_work(uuid, public.lead_status, text) to authenticated;
grant execute on function public.submit_lead(text, text, text, text, text, text, text, text, text, public.lead_source, text) to anon, authenticated;

commit;
