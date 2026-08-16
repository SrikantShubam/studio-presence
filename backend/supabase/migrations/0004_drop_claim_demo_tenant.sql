-- Studio Presence — remove claim_demo_tenant()
--
-- 0003 let the first person to click a magic link on any unowned demo site
-- become its permanent owner, no approval step. That made site access
-- uncontrolled by design: anyone who found a demo URL first — not necessarily
-- the person it was meant for — could end up owning it, with nothing admin-side
-- to stop them. Replaced entirely by an operator-initiated handover
-- (backend/src/services/handover.ts): every tenant's owner is now assigned
-- deliberately, never claimed.
--
-- Idempotent — `if exists` means this is safe to run whether or not 0003 was
-- ever actually applied to this database.
--
-- Apply:  paste into the Supabase SQL editor. This is the only migration step
-- needed for this change — 0003 does not need to be applied first or at all.

drop function if exists public.claim_demo_tenant(text);
