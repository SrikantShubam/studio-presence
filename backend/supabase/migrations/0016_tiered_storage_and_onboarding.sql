-- Studio Presence — Onboarding Core, Hostnames, Workspaces & Tiered Storage
-- Combines 0003_onboarding_completion + 0004_onboarding_workspace_read_grant + storage columns

-- 1. Onboarding drafts
create table if not exists public.onboarding_drafts (
  user_id       uuid primary key references auth.users on delete cascade,
  payload       jsonb not null default '{}'::jsonb,
  completed_at  timestamptz,
  updated_at    timestamptz not null default now()
);

-- 2. Tenant hostnames
create table if not exists public.tenant_hostnames (
  tenant_id  uuid primary key references public.tenants on delete cascade,
  hostname   text not null unique,
  source     text not null check (source in ('organic', 'cold-call')),
  created_at timestamptz not null default now(),
  constraint tenant_hostnames_format check (hostname ~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$')
);

-- 3. Tenant workspaces with storage metadata
create table if not exists public.tenant_workspaces (
  tenant_id           uuid primary key references public.tenants on delete cascade,
  config              jsonb not null,
  storage_provider    text not null default 'supabase' check (storage_provider in ('supabase', 'r2')),
  storage_bucket      text not null default 'tenant-assets',
  storage_prefix      text not null default '',
  cdn_base_url        text,
  storage_quota_bytes bigint not null default 5242880, -- 5 MB for demo
  storage_used_bytes  bigint not null default 0,
  updated_at          timestamptz not null default now(),
  updated_by          uuid not null references auth.users
);

-- Enable RLS
alter table public.onboarding_drafts enable row level security;
alter table public.tenant_hostnames enable row level security;
alter table public.tenant_workspaces enable row level security;

-- Policies
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'onboarding_drafts' and policyname = 'onboarding_drafts_owner') then
    create policy onboarding_drafts_owner on public.onboarding_drafts
      for all to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'tenant_hostnames' and policyname = 'tenant_hostnames_member_select') then
    create policy tenant_hostnames_member_select on public.tenant_hostnames
      for select to authenticated
      using (tenant_id in (select public.current_tenant_ids()));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'tenant_workspaces' and policyname = 'tenant_workspaces_member_select') then
    create policy tenant_workspaces_member_select on public.tenant_workspaces
      for select to authenticated
      using (tenant_id in (select public.current_tenant_ids()));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'tenant_workspaces' and policyname = 'tenant_workspaces_member_update') then
    create policy tenant_workspaces_member_update on public.tenant_workspaces
      for update to authenticated
      using (tenant_id in (select public.current_tenant_ids()))
      with check (
        tenant_id in (select public.current_tenant_ids())
        and updated_by = auth.uid()
      );
  end if;
end $$;

-- Grants
grant select on table public.tenant_workspaces to authenticated;

-- 4. complete_onboarding RPC
create or replace function public.complete_onboarding(
  p_requested_slug text,
  p_name           text,
  p_hostname       text,
  p_config         jsonb,
  p_source         text default 'organic'
)
returns table (tenant_id uuid, tenant_slug text, hostname text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user_id uuid := auth.uid();
  v_existing uuid;
  v_tenant_id uuid;
  v_slug text := lower(trim(p_requested_slug));
  v_hostname text := lower(trim(p_hostname));
  v_config jsonb := p_config;
  v_suffix integer := 1;
  v_source text := lower(trim(p_source));
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = 'insufficient_privilege'; end if;
  if coalesce(trim(p_name), '') = '' or v_slug !~ '^[a-z0-9-]+$' then raise exception 'invalid onboarding identity' using errcode = 'check_violation'; end if;
  if v_source not in ('organic', 'cold-call') then raise exception 'invalid onboarding source' using errcode = 'check_violation'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select tm.tenant_id into v_existing from tenant_members tm where tm.user_id = v_user_id order by tm.created_at limit 1;
  if v_existing is not null then
    select t.slug, th.hostname into tenant_slug, hostname from tenants t left join tenant_hostnames th on th.tenant_id = t.id where t.id = v_existing;
    tenant_id := v_existing;
    return next;
    return;
  end if;

  if v_source = 'cold-call' then
    select th.tenant_id into v_existing from tenant_hostnames th where th.hostname = v_hostname;
    if v_existing is null then raise exception 'cold-call hostname is not assigned' using errcode = 'no_data_found'; end if;
    raise exception 'cold-call access requires an approved membership' using errcode = 'insufficient_privilege';
  end if;

  loop
    exit when not exists (select 1 from tenants t where t.slug = v_slug)
      and not exists (select 1 from tenant_hostnames th where th.hostname = v_hostname);
    v_suffix := v_suffix + 1;
    v_slug := lower(trim(p_requested_slug)) || '-' || v_suffix;
    v_hostname := regexp_replace(lower(trim(p_hostname)), '^[^.]+', v_slug);
  end loop;

  v_config := jsonb_set(v_config, '{slug}', to_jsonb(v_slug), true);
  v_config := jsonb_set(v_config, '{domain,demoSubdomain}', to_jsonb(v_slug), true);

  insert into tenants (slug, name, tier, status) values (v_slug, trim(p_name), 't0', 'demo') returning id into v_tenant_id;
  insert into tenant_members (user_id, tenant_id, role) values (v_user_id, v_tenant_id, 'owner');
  insert into tenant_hostnames (tenant_id, hostname, source) values (v_tenant_id, v_hostname, 'organic');
  insert into tenant_workspaces (tenant_id, config, updated_by) values (v_tenant_id, v_config, v_user_id);
  insert into onboarding_drafts (user_id, payload, completed_at) values (v_user_id, v_config, now())
    on conflict (user_id) do update set payload = excluded.payload, completed_at = excluded.completed_at, updated_at = now();

  tenant_id := v_tenant_id; tenant_slug := v_slug; hostname := v_hostname;
  return next;
exception when unique_violation then
  raise exception 'onboarding allocation raced; retry safely' using errcode = 'serialization_failure';
end;
$$;

revoke all on function public.complete_onboarding(text, text, text, jsonb, text) from public;
grant execute on function public.complete_onboarding(text, text, text, jsonb, text) to authenticated;

-- 5. get_public_tenant_config_by_hostname RPC
create or replace function public.get_public_tenant_config_by_hostname(p_hostname text)
returns table (tenant_slug text, config jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select t.slug, tw.config - 'internal'
  from tenant_hostnames th
  join tenants t on t.id = th.tenant_id
  join tenant_workspaces tw on tw.tenant_id = t.id
  where lower(th.hostname) = lower(trim(p_hostname))
    and t.status <> 'archived'
$$;

revoke all on function public.get_public_tenant_config_by_hostname(text) from public;
grant execute on function public.get_public_tenant_config_by_hostname(text) to anon, authenticated;
