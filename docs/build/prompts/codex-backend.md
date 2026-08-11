# Codex — backend work

For **gpt-5.5 via Codex CLI** (`codex exec -m gpt-5.5 -s workspace-write -C "<path>" -`): dashboard
CRUD, API routes, analytics queries. If a run fails `check:all` twice, hand the same prompt to
**gpt-5.6-luna** for the fix rather than re-running gpt-5.5 from scratch — luna is for iterating on an
existing near-miss, not the first pass. Everything here is reviewed by Opus before merge — that
review is mandatory and not sampled, because this is the code where a silent failure loses a lead or
leaks a tenant's data.

Substitute `<TICKET>`.

```
You are implementing a backend slice of a multi-tenant Next.js product. Studio owners see their own
website enquiries here; every row is worth ₹2–15 lakh to that person.

READ FIRST:
1. AGENTS.md — the rules, absolute
2. docs/product/SPEC.md — the spec of record
3. docs/build/tasks/<TICKET>.md — your ticket
4. backend/src/config/schema.ts — the client config contract
5. backend/src/db/ — the Supabase schema, the RLS policies and the scoped client

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
- A failed lead write is never silent. Losing an enquiry costs the client a project and costs us the
  account. Log it, surface it, retry it — never swallow it
- Every API route validates its input with Zod before touching the database
- No PII in logs or in URL query strings

DONE MEANS
- `npm run check:all` exits 0, including check:tenant-isolation
- Your ticket's own acceptance criteria
- A test proving a session scoped to tenant A cannot read tenant B's rows — asserted against the
  database directly, not through the application. The app happening to filter correctly proves
  nothing about whether the database would have stopped it

WHEN YOU GET STUCK
Two failed attempts and you stop with a written report. Do not weaken a check, do not fall back to
the service-role client to get past a permissions error, do not add an RLS bypass "temporarily".

Start by reading the five files above and telling me, in four sentences, what you are about to build
and which tables it touches.
```
