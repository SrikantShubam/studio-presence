# Backend spec

Read `docs/product/SPEC.md` first for product scope. This file covers only the backend: what it is,
what it owns, and the decisions that are settled so nobody re-litigates them mid-build.

---

## 1. What `backend/` is

**A workspace package, not a running service.** It exports the config contract, the data layer, auth
and the domain services. `frontend/` imports it and exposes thin route handlers that validate input
and call a service — no business logic in a route.

Chosen over a standalone HTTP service because the client sites are mostly static and the backend is
about fifteen files. A second deploy target would buy a cleaner boundary at the cost of CORS,
cross-service auth, duplicated types and another thing to keep running — a bad trade at this size.

The real payoff of the split is reuse: the same package is imported by the deploy script, the future
demo assembler and n8n, none of which are Next.js.

```
backend/
  src/
    config/      the client config contract — schema, types, tier resolution, loader
    db/          Supabase clients and generated DB types
    auth/        magic link, session, tenant resolution
    services/    leads · analytics · panel — the actual domain logic
    index.ts     public surface. Nothing outside src/index.ts is importable
  supabase/
    migrations/  SQL, including the RLS policies
```

`clients/*.json` and `scripts/` stay at the repo root — both workspaces read them.

Design tokens live in `frontend/lib/tokens/`, not here. The backend knows `editorial` is a valid
identity slug; what it *looks* like is not its business.

---

## 2. Stack

| | | Why |
|---|---|---|
| **Supabase** | Postgres + auth + RLS | The analytics screen needs month-bucketed counts and a ranked list — two SQL queries here, hand-maintained counters in Firestore. RLS puts tenant isolation in the database rather than in code somebody has to remember to write |
| **Zod** | validation | Already the config contract. Same library for API input |
| **Resend** | transactional email | Lead notifications to the owner. Supabase handles magic links itself |
| **Umami** | traffic analytics | Read-only, via its API. We store no page views |
| TypeScript strict · npm workspaces | | |

---

## 3. The four responsibilities

### 3.1 Config contract
Already built: `src/config/{schema,types,resolve}.ts`. Zod is authoritative; types are inferred, never
hand-written; `client.schema.json` is generated from it so the two cannot drift.

**Frozen to every delegated agent.** A model that can edit the contract to make its code compile will.

### 3.2 Data layer
Two Supabase clients, and the distinction is load-bearing:

- **Scoped client** — carries the user's access token, subject to RLS. **Every request path uses
  this.** No exceptions.
- **Service-role client** — bypasses RLS. Migrations, the deploy script and the lead-capture insert
  only. Never reachable from a route handler that serves a signed-in user.

`check:tenant-isolation` fails the build if a service-role import appears anywhere under
`frontend/app/**`.

### 3.3 Auth
Supabase magic link. One login screen at `/panel/login` and `/dashboard/login`; after sign-in,
`tenant_members` resolves the tenant and the tier decides the destination — `/panel` for everyone,
`/dashboard` additionally for t3.

No passwords, no social sign-in, no account creation. Owners are provisioned by us at handover.

### 3.4 Services
The package's public surface. Route handlers call these and do nothing else.

| Service | Functions |
|---|---|
| `leads` | `create` · `list` · `get` · `updateStatus` · `addNote` |
| `analytics` | `enquiryStats` · `monthlyTrend` · `sourceBreakdown` · `topProjects` · `visitStats` |
| `panel` | `getEditableConfig` · `saveEditableConfig` |
| `config` | `loadClientConfig` · `validate` |

---

## 4. Data model

```
tenants          id · slug · name · tier · status · created_at
tenant_members   user_id → auth.users · tenant_id · role
leads            id · tenant_id · name · phone · locality · project_type ·
                 budget_band · timeline · message · source · source_page ·
                 status · notes · created_at · contacted_at
lead_events      id · lead_id · tenant_id · type · payload · created_at
client_overrides tenant_id · patch (jsonb) · updated_at
```

`leads.source` is an enum — `whatsapp` · `estimate` · `form` · `call` — because the analytics screen
ranks by it and free text would make that ranking meaningless within a month.

`lead_events` exists so "when did this become CONTACTED" survives a later status change. Lead history
is the one thing an owner will ask about that a mutable status column cannot answer.

### No page-views table
Traffic comes from the Umami API at request time, cached. Most-viewed projects, visits this month —
all read-only calls out. Storing a second copy of analytics we already pay Umami to collect buys
nothing and drifts.

### RLS is the isolation mechanism
Every tenant-scoped table carries `tenant_id` and one policy shape:

```sql
tenant_id in (select tenant_id from tenant_members where user_id = auth.uid())
```

Not an application-layer `WHERE`. A query that filters correctly today is one refactor from not
doing so, and the failure mode is one studio reading another's enquiries.

### 4.1 The panel write-back problem, and the decision

The panel edits client content, but `clients/<slug>.json` is committed to git and Vercel's
filesystem is read-only at runtime. Writing the file back is not possible and pretending otherwise
would surface as a bug weeks later.

**Decision: the file is the seed, the database holds the diff.**

```
load = clients/<slug>.json  →  merge client_overrides.patch  →  resolve tier  →  validate
```

The panel writes only to `client_overrides.patch`, through a **field allowlist** — phone, WhatsApp,
email, hours, hero image, projects, about, services, testimonials, Instagram picks. Anything outside
that list is rejected by the service, not filtered silently. Layout, colours, structure, tier and
status are not editable by anyone but us, which is the scope rule the whole panel design rests on.

Base configs keep their git history; panel edits take effect on revalidation, in about a minute.

---

## 5. Rules

- **Every request-path query goes through the scoped client.** Enforced by `check:tenant-isolation`
- **No secrets in code or in `clients/*.json`.** Env vars, named in config as `accessKeyEnv`
- **A failed lead write is never silent.** Losing an enquiry costs the client a project and costs us
  the account. Log it, surface it, retry it
- **Every route handler validates input with Zod before touching the database**
- **No PII in logs or in query strings**
- **`status` is the payment gate.** `demo` and `sold` cannot attach a custom domain and are always
  `noindex`. Structural, in middleware — never a thing anyone has to remember

---

## 6. Environment variables

| Var | For | Needed by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | project URL | B9 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | scoped client | B9 |
| `SUPABASE_SERVICE_ROLE_KEY` | migrations, deploy script. **Never in a request path** | B9 |
| `RESEND_API_KEY` | lead notification email | B11 |
| `UMAMI_API_URL` · `UMAMI_API_KEY` | analytics reads | B12 |
| `WEB3FORMS_<SLUG>` | one per client, form fallback | later |
| `GOOGLE_PLACES_API_KEY` | build-time review fetch, t2+ | later |
| `META_APP_ID` · `META_APP_SECRET` | Instagram oEmbed token | later |

Only the first three block the current work.

---

## 7. Build order

| # | Piece | Owner |
|---|---|---|
| B1 | `config/validate.ts` — cross-field rules | Opus |
| B2 | `config/load.ts` — read → merge overrides → resolve → validate | Opus |
| B3 | `scripts/gen-schema.ts` → `client.schema.json` | Opus |
| B4 | Three fixtures — minimal · ashish · stress | Sonnet 5 |
| B5 | **Five check scripts + `check:all`** | Opus |
| B6 | `middleware.ts` — host → slug, `status` gate | Opus |
| B7 | `app/layout.tsx` — token injection | Opus |
| B8 | `sections/registry.ts` | Opus |
| B9 | Supabase schema + RLS migrations | Opus |
| B10 | Magic-link auth, both login routes | Opus |
| B11 | Lead capture + owner notification | GPT-5.6 |
| B12 | Analytics aggregations | GPT-5.6 |
| B13 | Panel write-back, allowlisted | GPT-5.6 |
| B14 | `check:tenant-isolation` | Opus |

**B5 is the gate.** Nothing is delegated until the checks exist and `check:hardcode` provably
catches `bg-[#141414]` in the real exported HTML. Before that a delegated ticket can come back green
and wrong, which is worse than red.

---

## 8. Verification

- `npm run check:all` green from a clean clone
- Fixture at `tier` t1 → t2 → t3 produces three valid configs, **zero code edits**
- Break the fixture deliberately — bad phone, `noindex: false` while `status: demo`, missing image,
  `customDomain` set while `status: demo` — each fails loudly with a readable message
- **Two tenants in the database; tenant A's session cannot read tenant B's leads.** Asserted against
  the database directly, not through the app. The app happening to filter correctly proves nothing
  about whether the database would have stopped it
- A panel save writing a disallowed field (`tier`, `palette`) is rejected with an error, not
  silently dropped
- Magic link signs in, resolves the right tenant, and routes by tier
