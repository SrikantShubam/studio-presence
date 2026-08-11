# Ticket 08 prompt — paste into Codex CLI

Model: `gpt-5.5`. Run as:

```bash
codex exec -m gpt-5.5 -s workspace-write -C "C:\work\studio presence" -
```

Then paste everything in the fenced block below as stdin (or paste it as your first message if
running Codex interactively instead of via `exec`).

If it fails `npm run check:all` twice, don't re-run gpt-5.5 — hand this same block to `gpt-5.6-luna`
for the fix instead.

---

```
You are implementing a backend slice of a multi-tenant Next.js product. Studio owners see their own
website enquiries here; every row is worth ₹2–15 lakh to that person.

READ FIRST:
1. AGENTS.md — the rules, absolute
2. docs/product/SPEC.md — the spec of record
3. docs/build/tasks/08-analytics.md — your ticket
4. docs/product/prompts/admin-universal/04-dashboard-analytics.md — the design brief this service
   feeds. Read the "Note for the build phase" at the bottom especially — it explains why this screen
   answers exactly five questions and no more
5. backend/src/config/schema.ts — the client config contract
6. backend/src/db/ — the Supabase schema, the RLS policies and the scoped client

Do not read anything else in docs/. Most of it is superseded.

THE RULE THAT MATTERS MOST
Every database read and write goes through the RLS-scoped client in backend/src/db/. Never the service-role
client, never a raw query with a hand-written tenant filter. Tenant isolation is enforced by the
database, not by remembering a WHERE clause — and a query that happens to filter correctly today is
one refactor away from not doing so. `npm run check:tenant-isolation` enforces this.

The RLS policies themselves are frozen. If your ticket seems to need a policy change, stop and say
so — that is an Opus decision, not a workaround.

ALSO NON-NEGOTIABLE
- No secrets in code or in clients/*.json. Env vars only, named in config as accessKeyEnv
- Every API route validates its input with Zod before touching the database
- No PII in logs or in URL query strings
- Exactly the five functions the ticket names, answering exactly the questions the design doc lists.
  Resist adding a sixth metric even if it seems useful — the design doc's whole point is that more
  numbers make this screen worse for this specific user, not better

DONE MEANS
- `npm run check:all` exits 0, including check:tenant-isolation
- Your ticket's own acceptance criteria
- A test proving a session scoped to tenant A cannot read tenant B's rows — asserted against the
  database directly, not through the application. The app happening to filter correctly proves
  nothing about whether the database would have stopped it
- Umami unreachable (bad/unset env vars) does not crash the route — the three lead-based numbers
  still work, the two traffic-based ones degrade to an honest empty state, not a fabricated zero

WHEN YOU GET STUCK
Two failed attempts and you stop with a written report. Do not weaken a check, do not fall back to
the service-role client to get past a permissions error, do not add an RLS bypass "temporarily".

Start by reading the six files above and telling me, in four sentences, what you are about to build
and which tables/APIs it touches.
```
