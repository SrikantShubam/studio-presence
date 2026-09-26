-- Remove legacy duplicate status events created before the status trigger was corrected.
-- Keep the attributed event and delete only an unattributed event with the same
-- tenant, lead, timestamp, transition, and event type.
begin;

with duplicate_unattributed_events as (
  select unattributed.id
  from public.lead_events unattributed
  where unattributed.type = 'status_changed'
    and nullif(unattributed.payload ->> 'actor_user_id', '') is null
    and exists (
      select 1
      from public.lead_events attributed
      where attributed.tenant_id = unattributed.tenant_id
        and attributed.lead_id = unattributed.lead_id
        and attributed.type = unattributed.type
        and attributed.created_at = unattributed.created_at
        and nullif(attributed.payload ->> 'actor_user_id', '') is not null
        and attributed.payload ->> 'from' is not distinct from unattributed.payload ->> 'from'
        and attributed.payload ->> 'to' is not distinct from unattributed.payload ->> 'to'
    )
)
delete from public.lead_events event
using duplicate_unattributed_events duplicate
where event.id = duplicate.id;

commit;
