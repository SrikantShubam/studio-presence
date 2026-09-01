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

  update public.tenants
  set demo_expires_at = coalesce(demo_expires_at, now() + interval '7 days')
  where id = v_tenant_id and status = 'demo' and demo_removed_at is null;

  return true;
end;
$$;
