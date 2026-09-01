revoke all on table public.operator_users from anon, authenticated;

revoke execute on function public.is_operator() from anon;
revoke execute on function public.operator_list_demos(public.demo_workflow_state) from anon;
revoke execute on function public.operator_update_demo_state(uuid, public.demo_workflow_state, text) from anon;
revoke execute on function public.operator_grant_owner(uuid, uuid) from anon;
revoke execute on function public.operator_revoke_owner(uuid, uuid) from anon;
revoke execute on function public.operator_import_paid_draft(uuid, uuid, text, jsonb) from anon;
revoke execute on function public.operator_publish_paid_draft(uuid) from anon;
