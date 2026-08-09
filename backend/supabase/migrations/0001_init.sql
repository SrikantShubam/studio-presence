-- Studio Presence — initial schema
--
-- Tenant isolation is enforced here, by row-level security, not in application
-- code. A query that filters correctly today is one refactor away from not doing
-- so, and the failure mode is one studio reading another studio's enquiries —
-- invisible in testing, because the app returns the right rows either way.
--
-- Apply:  supabase db push       (or paste into the SQL editor)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Ranked by the analytics screen, so free text would make that ranking
-- meaningless within a month.
create type lead_source as enum ('whatsapp', 'estimate', 'form', 'call', 'other');

create type lead_status as enum ('new', 'contacted', 'quoted', 'won', 'lost');

create type tenant_tier as enum ('t0', 't1', 't2', 't3');

create type tenant_status as enum ('demo', 'sold', 'live', 'archived');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  tier        tenant_tier not null default 't1',
  status      tenant_status not null default 'demo',
  created_at  timestamptz not null default now(),

  -- Mirrors clients/<slug>.json. Kept in sync by the deploy script; the file
  -- stays authoritative for content, this copy exists so the dashboard can
  -- answer "which tenant is this" without reading the filesystem.
  constraint tenants_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table tenant_members (
  user_id     uuid not null references auth.users on delete cascade,
  tenant_id   uuid not null references tenants on delete cascade,
  role        text not null default 'owner',
  created_at  timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

create table leads (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants on delete cascade,

  name          text not null,
  phone         text not null,
  email         text,
  locality      text,
  project_type  text,
  budget_band   text,
  timeline      text,
  message       text,

  source        lead_source not null default 'form',
  -- Which page they were on. The dashboard shows it; it also tells us which
  -- sections actually convert.
  source_page   text,

  status        lead_status not null default 'new',
  notes         text,

  created_at    timestamptz not null default now(),
  contacted_at  timestamptz
);

create index leads_tenant_created_idx on leads (tenant_id, created_at desc);
create index leads_tenant_status_idx on leads (tenant_id, status);

-- Status is mutable, so "when did this become CONTACTED" would otherwise be
-- unanswerable. It is the first thing an owner asks about a lost lead.
create table lead_events (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads on delete cascade,
  tenant_id   uuid not null references tenants on delete cascade,
  type        text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index lead_events_lead_idx on lead_events (lead_id, created_at desc);

-- The panel's write channel.
--
-- clients/<slug>.json is committed to git and Vercel's filesystem is read-only
-- at runtime, so the panel cannot write the file back. The file is the seed and
-- this holds the diff; the loader merges them. See backend/SPEC.md §4.1.
create table client_overrides (
  tenant_id   uuid primary key references tenants on delete cascade,
  patch       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users
);

-- ---------------------------------------------------------------------------
-- Membership helper
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so that policies on other tables can ask "which tenants does
-- this user belong to" without triggering RLS on tenant_members and recursing.
-- search_path is pinned because a definer function that resolves names through a
-- caller-controlled path is a privilege-escalation route.
create or replace function public.current_tenant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from tenant_members where user_id = auth.uid()
$$;

revoke all on function public.current_tenant_ids() from public;
grant execute on function public.current_tenant_ids() to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table tenants           enable row level security;
alter table tenant_members    enable row level security;
alter table leads             enable row level security;
alter table lead_events       enable row level security;
alter table client_overrides  enable row level security;

-- Deliberately no policy grants anything to `anon` on these tables. Public site
-- visitors reach the database only through submit_lead() below.

-- tenants ------------------------------------------------------------------
create policy tenants_select on tenants
  for select to authenticated
  using (id in (select public.current_tenant_ids()));

-- tenant_members -----------------------------------------------------------
-- Filters on user_id directly rather than calling the helper: a policy on this
-- table that queried this table would recurse.
create policy tenant_members_select on tenant_members
  for select to authenticated
  using (user_id = auth.uid());

-- leads --------------------------------------------------------------------
create policy leads_select on leads
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

-- Owners update status and notes on their own leads. They never insert or
-- delete: inserts come from submit_lead(), and a lead is a record of something
-- that happened, so it is marked lost rather than removed.
create policy leads_update on leads
  for update to authenticated
  using (tenant_id in (select public.current_tenant_ids()))
  with check (tenant_id in (select public.current_tenant_ids()));

-- lead_events --------------------------------------------------------------
create policy lead_events_select on lead_events
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

create policy lead_events_insert on lead_events
  for insert to authenticated
  with check (tenant_id in (select public.current_tenant_ids()));

-- client_overrides ---------------------------------------------------------
create policy client_overrides_select on client_overrides
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

create policy client_overrides_upsert on client_overrides
  for insert to authenticated
  with check (tenant_id in (select public.current_tenant_ids()));

create policy client_overrides_update on client_overrides
  for update to authenticated
  using (tenant_id in (select public.current_tenant_ids()))
  with check (tenant_id in (select public.current_tenant_ids()));

-- ---------------------------------------------------------------------------
-- Lead submission
-- ---------------------------------------------------------------------------

-- Enquiries arrive from anonymous visitors on the public site, so something has
-- to insert on their behalf. The obvious answer — the service-role client in an
-- API route — is the wrong one: it bypasses every policy above, and once that
-- key is reachable from request-handling code the isolation guarantee is gone.
--
-- A narrow SECURITY DEFINER function instead. It can insert a lead and nothing
-- else. It cannot read one back.
create or replace function public.submit_lead(
  p_tenant_slug text,
  p_name        text,
  p_phone       text,
  p_email       text default null,
  p_locality    text default null,
  p_project_type text default null,
  p_budget_band text default null,
  p_timeline    text default null,
  p_message     text default null,
  p_source      lead_source default 'form',
  p_source_page text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_lead_id   uuid;
begin
  select id into v_tenant_id from tenants where slug = p_tenant_slug;
  if v_tenant_id is null then
    raise exception 'unknown tenant' using errcode = 'no_data_found';
  end if;

  -- Trimmed here as well as in the API layer. This function is the last line
  -- before the table and should not trust that it was called correctly.
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'name and phone are required' using errcode = 'check_violation';
  end if;

  insert into leads (
    tenant_id, name, phone, email, locality, project_type,
    budget_band, timeline, message, source, source_page
  ) values (
    v_tenant_id, trim(p_name), trim(p_phone), nullif(trim(p_email), ''),
    p_locality, p_project_type, p_budget_band, p_timeline, p_message,
    p_source, p_source_page
  )
  returning id into v_lead_id;

  insert into lead_events (lead_id, tenant_id, type, payload)
  values (v_lead_id, v_tenant_id, 'created', jsonb_build_object('source', p_source));

  return v_lead_id;
end;
$$;

revoke all on function public.submit_lead from public;
grant execute on function public.submit_lead to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Status transitions
-- ---------------------------------------------------------------------------

-- Stamps contacted_at and writes the audit row, so neither depends on the
-- application remembering to.
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if new.status <> 'new' and old.contacted_at is null then
      new.contacted_at := now();
    end if;

    insert into lead_events (lead_id, tenant_id, type, payload)
    values (
      new.id, new.tenant_id, 'status_changed',
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$;

create trigger leads_status_change
  before update on leads
  for each row execute function public.log_lead_status_change();
