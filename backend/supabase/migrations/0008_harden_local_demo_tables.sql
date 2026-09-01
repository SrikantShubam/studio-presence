revoke all on table public.prospect_contacts from anon, authenticated;
revoke all on table public.tenant_email_grants from anon, authenticated;

revoke all on function public.operator_grant_email(uuid, text) from public;
grant execute on function public.operator_grant_email(uuid, text) to authenticated;
revoke all on function public.operator_revoke_email(uuid, text) from public;
grant execute on function public.operator_revoke_email(uuid, text) to authenticated;
revoke all on function public.operator_list_email_grants(uuid) from public;
grant execute on function public.operator_list_email_grants(uuid) to authenticated;
