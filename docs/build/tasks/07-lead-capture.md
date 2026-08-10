# Ticket 07 — Lead capture service + API (B11)

## Scope

Backend only. The `leads` service and the API route public site visitors hit to become a row in
`leads`, plus an owner email notification when that happens.

**Out of scope, deliberately:** wiring the actual public-site sections (WhatsApp button, estimate
calculator, inquiry form) to call this endpoint. That is section-by-section follow-up work once this
endpoint exists and is proven. This ticket's acceptance is verified by calling the endpoint directly,
not by clicking through the live site.

## Why this is backend-tier, not tier-1

Every database read and write here goes through Supabase, and one of the two clients involved
(`createAnonClient`) is reachable from an unauthenticated request. A mistake here is a lost lead
(costs the client a project) or a wrong-tenant write (costs trust). This is `docs/build/prompts/codex-backend.md`
work — reviewed by Opus/Sonnet before merge, never sampled.

## What already exists — read before writing anything

- `backend/supabase/migrations/0001_init.sql` — `leads`, `lead_events` tables, RLS policies, and
  `submit_lead()`, a `SECURITY DEFINER` function that is **already the entire anonymous-insert path**.
  It validates name/phone, resolves `p_tenant_slug` to a tenant id, inserts the lead and its
  `created` event. You are wrapping this function, not reimplementing what it does.
- `backend/src/db/scoped.ts` — `createAnonClient()` (for the public path) and `createScopedClient()`
  (for the dashboard read/update path). Both already exist and are exported.
- `backend/src/db/types.ts` — `Lead`, `LeadSource`, `LeadStatus`, and the `submit_lead` RPC's typed
  `Args`/`Returns`.
- `backend/SPEC.md` §3.4 — the service's declared shape: `create · list · get · updateStatus · addNote`.
- `backend/SPEC.md` §5 — "a failed lead write is never silent."

## Build

### `backend/src/services/leads.ts`

```ts
create(input): Promise<{ leadId: string }>
  // Anon client. Calls db.rpc('submit_lead', {...}). input is Zod-validated
  // before the call — the RPC also validates, but this is the layer that turns
  // a Postgres error into something a route handler can log with the actual
  // field that was wrong, not a generic 500.
  // On success, also fire the owner notification (see below). A notification
  // failure must never fail the lead write — the lead is already saved; log
  // the notification failure and move on.

list(db: Db, params?: { status?: LeadStatus }): Promise<Lead[]>
  // Scoped client only. Newest first (created_at desc) — matches leads_tenant_created_idx.

get(db: Db, leadId: string): Promise<Lead | null>
  // Scoped client. RLS means a wrong-tenant id resolves to null, not an error —
  // do not translate "not found" into "not authorized", they read the same to
  // the caller and that's correct: no information leak either way.

updateStatus(db: Db, leadId: string, status: LeadStatus): Promise<Lead>
  // Scoped client, plain `update`. The status-change audit row and
  // `contacted_at` stamp are already handled by the `leads_status_change`
  // trigger in the migration — do not duplicate that here.

addNote(db: Db, leadId: string, note: string): Promise<Lead>
  // Scoped client. Overwrites `leads.notes` — there is one notes field per
  // lead, not a thread. If product later wants a thread, that's a schema
  // change, not something to improvise here.
```

### `frontend/app/api/[tenant]/leads/route.ts`

`POST` only. Public, unauthenticated — this is the one API route in the product anonymous traffic
reaches.

- Parse and Zod-validate the body: `{ name, phone, email?, locality?, projectType?, budgetBand?, timeline?, message?, source, sourcePage? }`.
  `source` is `LeadSource` (`whatsapp · estimate · form · call · other`) — required, not defaulted at
  this layer, so a caller that forgets to pass it fails loudly instead of every lead landing in
  `other`.
- Resolve `tenant` from the route param, same way `middleware.ts` already does — do not re-derive it
  from the `Host` header a second time.
- Call `leads.create()`. Return `{ leadId }` on success.
- Never import `db/service-role` here or anywhere in this ticket. The anon client's narrow surface
  (only `submit_lead()` is reachable to `anon` — see the migration's RLS section) is what makes an
  unauthenticated route safe at all.
- A failed write returns a non-2xx with a message safe to show a visitor ("Something went wrong,
  please call us instead" — never the raw Postgres error) and logs the real error server-side with
  enough detail to act on it. This is the "never silent" rule from SPEC §5 — a route that eats the
  error and returns `{ ok: true }` anyway is the one failure mode that must not happen here.

### Owner notification

- Resend, per `backend/SPEC.md` §2 and §6 (`RESEND_API_KEY`). One email per new lead, to the address
  on the tenant's config (`business.email` — check `backend/src/config/schema.ts` for the exact
  field name before assuming).
- Fire-and-log, not fire-and-forget-silently: if Resend fails, log it with the lead id so it's
  findable, but the API response to the visitor is still success — their lead was saved regardless of
  whether the email went out.
- No PII in logs beyond what's needed to find the lead again (the lead id is enough; don't log the
  visitor's phone number to stdout).

## Files you may create

```
backend/src/services/leads.ts
frontend/app/api/[tenant]/leads/route.ts
backend/src/services/notify.ts        (or inline in leads.ts — your call, keep it small)
```

Plus registering the new service export in `backend/src/index.ts` — one line, `export * from
'./services/leads'` (create `backend/src/services/index.ts` if that's cleaner; either is fine, this
isn't a frozen file).

## Acceptance

- `npm run check:all` exits 0, including `check:tenant-isolation` — this ticket is exactly the kind
  of code that check exists for
- `leads.create()` called with a valid `ashish-interiors` slug and required fields inserts a row,
  visible via `list()` with a scoped client authenticated as that tenant's owner
- `leads.create()` called with an unknown tenant slug fails cleanly (the RPC's `unknown tenant`
  exception surfaces as a real error, not a silent no-op)
- `leads.create()` called with empty `name` or `phone` is rejected by your Zod schema before it
  reaches the database — confirm the RPC's own guard isn't the only thing standing between a bad
  request and a bad row
- **The isolation test, asserted directly against the database, not through the app**: a scoped
  client authenticated as tenant A's owner, calling `list()`, cannot see a lead inserted for tenant B.
  Two tenants, two rows, one query each, confirm the boundary — this is the test
  `docs/build/prompts/codex-backend.md` requires, not optional
- POST to the API route with a missing `source` field returns a 4xx, not a 500 and not a silent
  default
- Simulate a Resend failure (bad API key, or just don't set one in the test) and confirm the lead is
  still written and the route still returns success — the notification is not on the critical path

## Do not touch

`backend/src/config/**`, `backend/supabase/migrations/**` (the RLS policies and `submit_lead()` are
frozen — if this ticket seems to need a policy change, stop and say so, that's an Opus decision), any
`frontend/sections/**`, `docs/product/SPEC.md`, `clients/*.json`.
