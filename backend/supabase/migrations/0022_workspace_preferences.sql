-- Studio Presence — durable workspace notification preferences

create table if not exists public.workspace_preferences (
  tenant_id       uuid primary key references public.tenants on delete cascade,
  new_lead_alerts boolean not null default true,
  weekly_digest   boolean not null default true,
  updated_at      timestamptz not null default now(),
  updated_by      uuid not null references auth.users
);

grant select, insert, update on table public.workspace_preferences to authenticated;

alter table public.workspace_preferences enable row level security;

create policy workspace_preferences_select on public.workspace_preferences
  for select to authenticated
  using (tenant_id in (select public.current_tenant_ids()));

create policy workspace_preferences_insert on public.workspace_preferences
  for insert to authenticated
  with check (
    public.current_tenant_role(tenant_id) = 'owner'
    and updated_by = auth.uid()
  );

create policy workspace_preferences_update on public.workspace_preferences
  for update to authenticated
  using (public.current_tenant_role(tenant_id) = 'owner')
  with check (
    public.current_tenant_role(tenant_id) = 'owner'
    and updated_by = auth.uid()
  );
