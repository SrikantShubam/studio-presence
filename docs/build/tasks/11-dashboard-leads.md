# Ticket 11 — Dashboard: leads UI

## Scope

Frontend only, `/dashboard`. **T3 only.** Depends on ticket 07 (lead capture + list/get/updateStatus/
addNote service) being merged. Also depends on there being a `/dashboard` route group and its own
tier-gated layout, which does not exist yet — check whether `frontend/app/[tenant]/(admin)/` needs a
sibling `dashboard/` folder with its own `layout.tsx` (same auth pattern as `panel/layout.tsx`, plus
the `canAccessDashboard()` check from `backend/src/auth/index.ts` — redirect to `/panel` if false,
same as `destinationForTenant()` already implies at login) — or whether that gate belongs to this
ticket. If it doesn't exist, building it is in scope here; it's small and this is the first ticket
that needs it.

## Reference

`docs/product/prompts/admin-universal/03-dashboard-leads.md` — the full spec: header with Leads/
Analytics tabs, the three-figure summary row, filter chips, lead cards (never a table), the detail
view, empty state, anti-goals. Read it in full.

Also `design/reference/admin/dashboard-leads-548568e5.png` — a screenshot captured from the Stitch
project this was designed in, matching the spec closely (summary row, filter chips, card layout with
WhatsApp/Call buttons). Read `design/reference/admin/INDEX.md` first — **the colours in it are
wrong, ignore them**, Stitch used its own palette that conflicts with `00-universal-system.md`. Use
it for layout and density only, same as the text spec governs everything else.

Same admin token system as ticket 10 — `docs/product/prompts/admin-universal/00-universal-system.md`,
same `admin-*` Tailwind classes, same "content is theirs, structure is ours" scope discipline (though
this screen has no editable content at all, only status/notes on existing leads).

**"Every row here is worth ₹2-15 lakh to this person"** — the design doc's framing, worth keeping in
mind for anything ambiguous: when in doubt, optimize for the owner reaching a lead in one tap over
anything else.

## Build

`frontend/app/[tenant]/(admin)/dashboard/page.tsx` — the leads list.
`frontend/app/[tenant]/(admin)/dashboard/[leadId]/page.tsx` (or a modal/drawer, your call, the design
doc shows a detail view but doesn't mandate the routing mechanism) — the detail view.

- List: `leads.list()` with a `status` filter matching the active chip. Newest first.
- Summary row: "N new this week" / "N total" / "N not contacted" — three small queries or derived
  from the full list, your call; the "not contacted" figure uses `text-admin-alert` when > 0, per the
  design doc's "the only thing on this screen that should ever feel urgent"
- Each card: name, locality, project type, budget band (only if `source === 'estimate'` and it's
  present — not every lead has one), time-since-arrival in relative form ("2 hours ago"), status
  pill, and the two full-width buttons (WhatsApp primary, Call secondary) — these two buttons are, per
  the design doc, "the point of the screen"
  - WhatsApp button: `https://wa.me/<phone>` (strip formatting, confirm the phone is already E.164
    per the config schema's `phone` validator so this is a straight concat, not reformatting logic)
  - Call button: `tel:<phone>`
- Status pill values map to `LeadStatus` (`new · contacted · quoted · won · lost`) — five values, five
  labels, not more
- Detail view: full message, estimate calculator inputs if present, `source_page`, a notes field
  (`leads.addNote()`), a status selector (`leads.updateStatus()`), WhatsApp/Call again, sticky at the
  bottom on mobile
- Filter chips: All · New · Not contacted · This month — "Not contacted" is `status === 'new' AND
  contacted_at IS NULL`... actually check: is "not contacted" simply `status === 'new'`, given the
  `leads_status_change` trigger stamps `contacted_at` on any status change away from `new`? Verify
  against the migration (`backend/supabase/migrations/0001_init.sql`) rather than assuming, the two
  read the same in the common case but diverge if a lead is set back to `new` after being touched

## Files you may create

```
frontend/app/[tenant]/(admin)/dashboard/layout.tsx     (only if it doesn't already exist — see Scope)
frontend/app/[tenant]/(admin)/dashboard/page.tsx
frontend/app/[tenant]/(admin)/dashboard/[leadId]/**     (or your chosen detail-view structure)
```

Plus one entry in the header's Leads/Analytics tabs if that chrome is shared with ticket 12 — check
whether ticket 12 has landed first; if not, build the tab bar here and ticket 12 slots into it, don't
duplicate the header.

## Acceptance

- `npm run check:all` exits 0
- A t1/t2 tenant hitting `/dashboard` directly is redirected to `/panel`, not shown an error or a
  blank screen — the tier gate is the first thing to verify, before any leads content
- Renders with zero leads: the empty state reads "No enquiries yet. Put your website link in your
  Instagram bio..." per the design doc, not "No data"
- Renders with several leads across different statuses and sources: summary figures are correct,
  filter chips actually filter, WhatsApp/Call buttons produce the right `wa.me`/`tel:` links
- A lead with no `budget_band` (didn't use the estimate calculator) doesn't show a blank/broken
  budget line — omit it entirely, same discipline as ticket 06's optional `context` field
- Status change from the detail view persists and is reflected in the list on return
- Mobile (390px) primary, cards not a table, no horizontal scroll at 375px
- Every colour is an `admin-*` token utility

## Do not touch

`backend/**` except reading it, `frontend/sections/**`, `frontend/lib/tokens/**`,
`docs/product/SPEC.md`, `clients/*.json`, `frontend/app/[tenant]/(admin)/panel/**`,
`frontend/app/[tenant]/(admin)/login/**`, `frontend/app/[tenant]/(admin)/actions.ts`.
