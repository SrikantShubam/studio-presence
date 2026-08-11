-- Studio Presence — public read of client_overrides
--
-- The public site renders for anonymous visitors and needs a tenant's panel edits
-- (client_overrides.patch) merged into the config it serves. `client_overrides`'
-- RLS is deliberately authenticated-tenant-member-only (0001_init.sql) — there is
-- no anon policy on the table, on purpose, same as every other tenant-scoped
-- table. Adding one would mean any anonymous caller who guesses a tenant id can
-- read that row, which is a wider hole than this needs: the only thing the public
-- site actually needs is "the patch JSON for the tenant at this slug", nothing
-- about who owns it or when it changed.
--
-- Same shape as submit_lead() in 0001_init.sql, mirrored for reads instead of
-- writes: a narrow SECURITY DEFINER function that can return exactly one thing
-- and nothing else. The table's RLS itself is untouched.
--
-- Apply:  supabase db push       (or paste into the SQL editor)

create or replace function public.get_client_overrides(p_tenant_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select co.patch
      from tenants t
      join client_overrides co on co.tenant_id = t.id
      where t.slug = p_tenant_slug
    ),
    '{}'::jsonb
  )
$$;

-- Both "no such tenant" and "tenant exists but has never been edited" return
-- '{}'::jsonb, never null — a scalar subquery over zero rows evaluates to null,
-- and the outer coalesce is what turns that into an empty patch. Deliberately
-- the same result either way: distinguishing them would tell an anonymous
-- caller whether a given slug is provisioned at all, which is not information
-- this function needs to leak. middleware.ts already 404s on an unresolved
-- slug before this function would ever be reached with a bad one.

revoke all on function public.get_client_overrides from public;
grant execute on function public.get_client_overrides to anon, authenticated;
