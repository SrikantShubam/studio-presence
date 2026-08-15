-- Studio Presence — claim an unowned demo site by signing in
--
-- THE PROBLEM THIS REPLACES: signing in already works for anyone. `signInWithOtp`
-- creates the auth user and mails the link with no help from us. The only thing
-- standing between "clicked the link" and "looking at your panel" is one row in
-- `tenant_members`. Writing that row needed the service-role key, so it needed a
-- terminal, so handing a site to a paying customer meant someone running a script
-- on a laptop. That is the wrong shape for a product you sell.
--
-- Same narrow SECURITY DEFINER shape as submit_lead() (0001) and
-- get_client_overrides() (0002): RLS on `tenant_members` is untouched, and this
-- function can do exactly one thing.
--
-- The three guards, and why each is load-bearing:
--   status = 'demo'   a live or sold site is somebody's paid property. Claiming
--                     is strictly a pre-sale affordance
--   zero members      first come, first owned — and once owned, permanently
--                     closed. Without this, anyone signing in later would join
--                     a site that already has an owner
--   auth.uid()        you can only ever claim FOR YOURSELF. The caller does not
--                     get to name a user id, so this cannot be used to bind
--                     somebody else's account to a site
--
-- Deliberately NOT a general-purpose "add member" function. Handover to a paying
-- customer is a separate, authenticated, deliberate action — not something that
-- should fall out of a stranger visiting a URL.
--
-- Apply:  supabase db push       (or paste into the SQL editor)

create or replace function public.claim_demo_tenant(p_slug text)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return false;
  end if;

  -- Lock the row for the duration: two links clicked at the same moment would
  -- otherwise both see zero members and both insert, and the site would come out
  -- of it with two owners. requireTenant() treats that as unrecoverable, so a
  -- race here would brick the very site it was meant to hand over.
  select t.id into v_tenant_id
  from tenants t
  where t.slug = p_slug
    and t.status = 'demo'
  for update;

  if v_tenant_id is null then
    return false;
  end if;

  if exists (select 1 from tenant_members m where m.tenant_id = v_tenant_id) then
    return false;
  end if;

  insert into tenant_members (user_id, tenant_id)
  values (v_user_id, v_tenant_id);

  return true;
end;
$$;

-- Returns a plain boolean and never raises: "you did not get it" and "there was
-- nothing to get" are the same answer to the caller on purpose. Telling an
-- anonymous-ish caller WHY a claim failed would report whether a given slug
-- exists and whether it already has an owner, neither of which is theirs to know.

revoke all on function public.claim_demo_tenant from public;
grant execute on function public.claim_demo_tenant to authenticated;
