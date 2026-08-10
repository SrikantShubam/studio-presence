# Ticket 08 — Analytics service (B12)

## Scope

Backend only. The `analytics` service backing `/dashboard/analytics`. T3 only — read
`docs/product/prompts/admin-universal/04-dashboard-analytics.md` in full before starting, especially
the "Note for the build phase" at the bottom. It explains why this service answers exactly five
questions and no more, and pressure to add a sixth should be resisted here, not just at the design
stage.

## The five things this service answers

Straight from `backend/SPEC.md` §3.4 and the design doc:

```ts
enquiryStats(db, tenantId): Promise<{ thisMonth: number; lastMonth: number }>
monthlyTrend(db, tenantId): Promise<{ month: string; count: number }[]>   // last 6 months
sourceBreakdown(db, tenantId): Promise<{ source: LeadSource; count: number }[]>  // this month, ranked
topProjects(db, tenantId, umami): Promise<{ slug: string; title: string; views: number }[]>  // top 3
visitStats(umami): Promise<{ thisMonth: number; lastMonth: number }>
```

Exact return shapes are your call within that — the point is five functions, each answering one
question on the design doc, nothing that isn't on it.

## Two data sources, and why they're split

- **`enquiryStats`, `monthlyTrend`, `sourceBreakdown`** come from `leads` in Postgres — real SQL
  aggregation, which is `backend/SPEC.md` §2's stated reason for choosing Supabase over Firebase in
  the first place. All three: **scoped client, tenant-filtered by RLS, no exceptions.**
- **`topProjects`, `visitStats`** come from the Umami API (`UMAMI_API_URL`, `UMAMI_API_KEY` — already
  named in `backend/SPEC.md` §6). Read-only, called at request time, not stored — see SPEC §4's "No
  page-views table" note. `topProjects` needs both: view counts from Umami, titles from
  `loadClientConfig()`'s portfolio projects, joined by slug.

## Build

### `backend/src/services/analytics.ts`

The three SQL-backed functions are straightforward `count(*)` / `group by` queries against `leads`,
scoped by the RLS-carrying client (tenant filtering happens in the database, same as every other
service — do not add a `.eq('tenant_id', ...)` filter yourself, RLS already restricts the rows a
scoped client can see).

`monthlyTrend`: six months, oldest first, zero-filled for months with no leads — a bar chart with a
missing bar reads as broken, not as "zero that month."

`sourceBreakdown`: this calendar month only, ranked descending. Matches the design doc's example
exactly: `"WhatsApp button — 8"`, so the human-readable label per `LeadSource` value lives here, not
scattered into the frontend ticket.

### `backend/src/services/umami.ts`

A thin, typed wrapper around whatever subset of the Umami API `visitStats` and `topProjects` need —
pageviews for the tenant's site this month vs last, and per-page view counts to rank projects by.
Read `UMAMI_API_URL`/`UMAMI_API_KEY` the same way `backend/src/db/scoped.ts` reads its env vars
(`requireEnv`-style, fails loudly if unset, not silently returning zeros).

**If Umami is unreachable or the two env vars aren't set** (a realistic case before it's provisioned
for a given deployment), `visitStats` and `topProjects` should degrade to `null`/empty rather than
throwing — the three lead-based numbers should still render even if traffic data can't be fetched.
Decide and document the exact shape (e.g. `visitStats` returns `null` vs `{thisMonth: 0, lastMonth:
0}`) — whichever you pick, the frontend ticket needs to render an honest state for it, not a
fabricated zero that looks like real data.

## Files you may create

```
backend/src/services/analytics.ts
backend/src/services/umami.ts
frontend/app/api/[tenant]/analytics/route.ts
```

The route is a thin `GET` — `requireTenant()`, `canAccessDashboard()` check (403 if not t3, see
`backend/src/auth/index.ts` — both already exist, do not reimplement the tier gate), call the five
service functions, return the combined shape.

Plus the same one-line export addition to `backend/src/index.ts` (or `services/index.ts`) as ticket 07.

## Acceptance

- `npm run check:all` exits 0, including `check:tenant-isolation`
- Against a tenant with zero leads: `enquiryStats` returns `{0, 0}`, not an error; `monthlyTrend`
  returns six zero-filled months, not an empty array — this is the "not enough data yet" case the
  design doc's empty state depends on being distinguishable from "one enquiry"
- Against two tenants with different lead counts, each sees only their own numbers — scoped-client
  test asserted directly, same pattern as ticket 07's isolation test
- `sourceBreakdown` only counts the current calendar month's leads, confirmed with a lead seeded with
  a `created_at` in a previous month
- The `/api/[tenant]/analytics` route returns 403 for a signed-in t1/t2 owner, not 200 with data they
  shouldn't see
- Umami unreachable (bad/unset env vars in the test) does not crash the route — `enquiryStats`,
  `monthlyTrend`, `sourceBreakdown` still return real data, `visitStats`/`topProjects` degrade per
  whatever shape you documented

## Do not touch

`backend/src/config/**`, `backend/supabase/migrations/**`, `backend/src/services/leads.ts` (ticket
07's file — read it for the `Db`/scoped-client pattern, don't edit it), `frontend/sections/**`,
`docs/product/SPEC.md`, `clients/*.json`.
