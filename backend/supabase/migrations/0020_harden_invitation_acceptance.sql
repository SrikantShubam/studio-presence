-- Keep invitation errors truthful and make reopening an accepted invite idempotent.
-- The token is still required, and the function remains scoped to the current user.

begin;

create or replace function public.accept_tenant_invitation(p_token_hash text)
returns table (tenant_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.tenant_invitations%rowtype;
  v_email text;
  v_existing_role text;
begin
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null then
    raise exception 'authenticated email is required' using errcode = '42501';
  end if;

  select * into v_invitation
  from public.tenant_invitations
  where token_hash = p_token_hash
  for update;

  if not found then
    raise exception 'invitation is invalid' using errcode = '22023';
  end if;

  if v_invitation.revoked_at is not null then
    raise exception 'invitation was revoked' using errcode = '22023';
  end if;

  if v_invitation.accepted_at is not null then
    select tm.role into v_existing_role
    from public.tenant_members tm
    where tm.tenant_id = v_invitation.tenant_id
      and tm.user_id = auth.uid();

    if v_existing_role is not null then
      return query select v_invitation.tenant_id, v_existing_role;
      return;
    end if;

    raise exception 'invitation was already accepted' using errcode = '23505';
  end if;

  if v_invitation.expires_at <= now() then
    raise exception 'invitation has expired' using errcode = '22023';
  end if;

  if v_invitation.email_lower <> v_email then
    raise exception 'invitation is for another email address' using errcode = '22023';
  end if;

  select tm.role into v_existing_role
  from public.tenant_members tm
  where tm.tenant_id = v_invitation.tenant_id
    and tm.user_id = auth.uid();

  if v_existing_role is not null then
    return query select v_invitation.tenant_id, v_existing_role;
    return;
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

revoke all on function public.accept_tenant_invitation(text) from public;
grant execute on function public.accept_tenant_invitation(text) to authenticated;

commit;
