-- Local demo access, email-based customer grants, and prospect capture.

alter table public.tenants
  add column if not exists demo_base_revision text not null default 'seed',
  add column if not exists demo_expires_at timestamptz,
  add column if not exists demo_removed_at timestamptz;

create table if not exists public.prospect_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants on delete cascade,
  email_lower text not null,
  email_display text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  source text not null default 'demo_login',
  unique (tenant_id, email_lower)
);

create index if not exists prospect_contacts_tenant_idx
  on public.prospect_contacts (tenant_id, last_seen_at desc);

create table if not exists public.tenant_email_grants (
  tenant_id uuid not null references public.tenants on delete cascade,
  email_lower text not null,
  email_display text not null,
  user_id uuid references auth.users on delete set null,
  granted_by uuid not null references auth.users,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (tenant_id, email_lower)
);

create index if not exists tenant_email_grants_user_idx
  on public.tenant_email_grants (user_id)
  where revoked_at is null;

alter table public.prospect_contacts enable row level security;
alter table public.tenant_email_grants enable row level security;

create policy prospect_contacts_operator_select
  on public.prospect_contacts for select to authenticated
  using (public.is_operator());

create policy tenant_email_grants_operator_select
  on public.tenant_email_grants for select to authenticated
  using (public.is_operator());

create or replace function public.record_demo_contact(p_tenant_slug text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
begin
  if auth.uid() is null or v_email = '' then
    raise exception 'authenticated email required' using errcode = '42501';
  end if;

  select id into v_tenant_id from public.tenants where slug = p_tenant_slug;
  if v_tenant_id is null then raise exception 'unknown tenant'; end if;

  insert into public.prospect_contacts (tenant_id, email_lower, email_display)
  values (v_tenant_id, v_email, coalesce(auth.jwt() ->> 'email', v_email))
  on conflict (tenant_id, email_lower)
  do update set last_seen_at = now(), email_display = excluded.email_display;

  return true;
end;
$$;

create or replace function public.claim_pending_tenant_access()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_grant public.tenant_email_grants;
  v_count integer := 0;
begin
  if auth.uid() is null or v_email = '' then return 0; end if;

  for v_grant in
    select * from public.tenant_email_grants
    where email_lower = v_email and revoked_at is null
    for update
  loop
    insert into public.tenant_members (user_id, tenant_id, role)
    values (auth.uid(), v_grant.tenant_id, 'owner')
    on conflict (user_id, tenant_id) do update set role = 'owner';

    update public.tenant_email_grants
      set user_id = auth.uid()
      where tenant_id = v_grant.tenant_id and email_lower = v_email;

  insert into public.operator_audit_events (actor_user_id, tenant_id, action, payload)
    values (auth.uid(), v_grant.tenant_id, 'owner_transferred', jsonb_build_object('email', v_email, 'source', 'pending_email_grant'));
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.operator_grant_email(p_tenant_id uuid, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_user_id uuid;
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  if v_email = '' or position('@' in v_email) < 2 then raise exception 'valid email required'; end if;

  select id into v_user_id from auth.users
  where lower(email) = v_email order by created_at desc limit 1;

  insert into public.tenant_email_grants (tenant_id, email_lower, email_display, user_id, granted_by, revoked_at)
  values (p_tenant_id, v_email, trim(p_email), v_user_id, auth.uid(), null)
  on conflict (tenant_id, email_lower) do update set
    email_display = excluded.email_display,
    user_id = excluded.user_id,
    granted_by = excluded.granted_by,
    granted_at = now(),
    revoked_at = null;

  if v_user_id is not null then
    insert into public.tenant_members (user_id, tenant_id, role)
    values (v_user_id, p_tenant_id, 'owner')
    on conflict (user_id, tenant_id) do update set role = 'owner';
  end if;

  insert into public.operator_audit_events (actor_user_id, tenant_id, action, payload)
  values (auth.uid(), p_tenant_id, 'owner_granted', jsonb_build_object('email', v_email, 'user_id', v_user_id));
  return true;
end;
$$;

create or replace function public.operator_revoke_email(p_tenant_id uuid, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_user_id uuid;
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;

  select user_id into v_user_id from public.tenant_email_grants
  where tenant_id = p_tenant_id and email_lower = v_email;

  update public.tenant_email_grants
    set revoked_at = now()
    where tenant_id = p_tenant_id and email_lower = v_email;

  if v_user_id is not null then
    delete from public.tenant_members where tenant_id = p_tenant_id and user_id = v_user_id;
  end if;

  insert into public.operator_audit_events (actor_user_id, tenant_id, action, payload)
  values (auth.uid(), p_tenant_id, 'owner_revoked', jsonb_build_object('email', v_email, 'user_id', v_user_id));
  return true;
end;
$$;

create or replace function public.operator_list_email_grants(p_tenant_id uuid)
returns setof public.tenant_email_grants
language sql
security definer
set search_path = public
as $$
  select g from public.tenant_email_grants g
  where public.is_operator() and g.tenant_id = p_tenant_id
  order by g.granted_at desc
$$;

create or replace function public.get_demo_window(p_tenant_slug text)
returns table (available boolean, base_revision text, expires_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select
    t.status <> 'archived'
      and t.demo_removed_at is null
      and (t.demo_expires_at is null or t.demo_expires_at > now()),
    t.slug || ':' || t.demo_base_revision,
    t.demo_expires_at
  from public.tenants t
  where t.slug = p_tenant_slug;
$$;

create or replace function public.operator_open_demo(p_tenant_id uuid, p_days integer default 7)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  if p_days < 1 or p_days > 30 then raise exception 'demo duration must be between 1 and 30 days'; end if;
  update public.tenants
    set status = 'demo', demo_base_revision = gen_random_uuid()::text,
        demo_expires_at = now() + make_interval(days => p_days), demo_removed_at = null
    where id = p_tenant_id;
  return found;
end;
$$;

create or replace function public.operator_grant_email_by_slug(p_tenant_slug text, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_tenant_id uuid;
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  select id into v_tenant_id from public.tenants where slug = p_tenant_slug;
  if v_tenant_id is null then raise exception 'unknown tenant'; end if;
  return public.operator_grant_email(v_tenant_id, p_email);
end;
$$;

create or replace function public.operator_revoke_email_by_slug(p_tenant_slug text, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_tenant_id uuid;
begin
  if not public.is_operator() then raise exception 'operator access required' using errcode = '42501'; end if;
  select id into v_tenant_id from public.tenants where slug = p_tenant_slug;
  if v_tenant_id is null then raise exception 'unknown tenant'; end if;
  return public.operator_revoke_email(v_tenant_id, p_email);
end;
$$;

revoke all on function public.record_demo_contact(text) from public;
grant execute on function public.record_demo_contact(text) to authenticated;
revoke all on function public.claim_pending_tenant_access() from public;
grant execute on function public.claim_pending_tenant_access() to authenticated;
revoke all on function public.operator_grant_email(uuid, text) from public;
grant execute on function public.operator_grant_email(uuid, text) to authenticated;
revoke all on function public.operator_revoke_email(uuid, text) from public;
grant execute on function public.operator_revoke_email(uuid, text) to authenticated;
revoke all on function public.operator_list_email_grants(uuid) from public;
grant execute on function public.operator_list_email_grants(uuid) to authenticated;
revoke all on function public.operator_open_demo(uuid, integer) from public;
grant execute on function public.operator_open_demo(uuid, integer) to authenticated;
revoke all on function public.operator_grant_email_by_slug(text, text) from public;
grant execute on function public.operator_grant_email_by_slug(text, text) to authenticated;
revoke all on function public.operator_revoke_email_by_slug(text, text) from public;
grant execute on function public.operator_revoke_email_by_slug(text, text) to authenticated;
revoke all on function public.get_demo_window(text) from public;
grant execute on function public.get_demo_window(text) to anon, authenticated;
