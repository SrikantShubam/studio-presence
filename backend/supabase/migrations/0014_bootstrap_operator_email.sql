create table if not exists public.operator_email_allowlist (
  email_lower text primary key,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.operator_email_allowlist enable row level security;

insert into public.operator_email_allowlist (email_lower)
values ('vector.veda.dev@gmail.com')
on conflict (email_lower) do update set enabled = true;

create or replace function public.claim_operator_access()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
begin
  if auth.uid() is null or v_email = '' then return false; end if;
  if not exists (select 1 from public.operator_email_allowlist where email_lower = v_email and enabled) then return false; end if;

  insert into public.operator_users (user_id, role)
  values (auth.uid(), 'super_admin')
  on conflict (user_id) do update set role = 'super_admin';
  return true;
end;
$$;

revoke all on table public.operator_email_allowlist from anon, authenticated;
revoke all on function public.claim_operator_access() from public, anon, authenticated;
grant execute on function public.claim_operator_access() to authenticated;
