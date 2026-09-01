-- Studio Presence — Hindi i18n override store
--
-- The public seed lives in content/i18n/<tenant>/<locale>.json. This table holds
-- owner edits from the dashboard, scoped exactly like client_overrides: owners
-- can edit only their tenant, anonymous visitors read through a narrow function.

create table if not exists public.i18n_overrides (
  tenant_id   uuid not null references public.tenants on delete cascade,
  locale      text not null check (locale in ('hi')),
  patch       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users,
  primary key (tenant_id, locale)
);

grant select, insert, update on table public.i18n_overrides to authenticated;

alter table public.i18n_overrides enable row level security;

create policy i18n_overrides_select on public.i18n_overrides
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

create policy i18n_overrides_insert on public.i18n_overrides
  for insert to authenticated
  with check (tenant_id in (select public.current_tenant_ids()));

create policy i18n_overrides_update on public.i18n_overrides
  for update to authenticated
  using (tenant_id in (select public.current_tenant_ids()))
  with check (tenant_id in (select public.current_tenant_ids()));

create or replace function public.get_i18n_overrides(p_tenant_slug text, p_locale text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select io.patch
      from tenants t
      join i18n_overrides io on io.tenant_id = t.id
      where t.slug = p_tenant_slug
        and io.locale = p_locale
    ),
    '{}'::jsonb
  )
$$;

revoke all on function public.get_i18n_overrides(text, text) from public;
grant execute on function public.get_i18n_overrides(text, text) to anon, authenticated;
