# Ticket 09 prompt — paste into Codex CLI

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
You are implementing a backend slice of a multi-tenant Next.js product. Studio owners edit their own
website content through this API — a mistake here either breaks their live site or lets them (or a
devtools session) change something they're not supposed to.

READ FIRST:
1. AGENTS.md — the rules, absolute
2. docs/product/SPEC.md — the spec of record
3. backend/SPEC.md §4.1 — the panel write-back design, in full. This ticket implements exactly what
   that section describes, nothing more
4. docs/build/tasks/09-panel-writeback.md — your ticket
5. docs/product/prompts/admin-universal/02-client-panel.md — the design brief for the screen this API
   backs, so you understand which fields are actually editable and why
6. backend/src/config/schema.ts — the client config contract
7. backend/src/config/load.ts — read this carefully. It already accepts an `override` parameter and
   merges it — that mechanism is not yours to touch, but your ticket does need to wire a fetch of
   `client_overrides` into it somewhere. Read the ticket for exactly where
8. backend/src/db/ — the Supabase schema, the RLS policies and the scoped client

Do not read anything else in docs/. Most of it is superseded.

THE SCOPE RULE — the entire point of this ticket
Content is theirs, structure is ours. An owner can change what the site says. They cannot change
layout, colours, template, tier, or which sections exist. The allowlist in your ticket is not a
suggestion — anything outside it must be REJECTED with a clear error, never silently dropped and
never silently accepted. A UI that hides a control is not the real boundary; this API is.

THE RULE THAT MATTERS MOST
Every database read and write goes through the RLS-scoped client in backend/src/db/. Never the
service-role client, never a raw query with a hand-written tenant filter. Tenant isolation is
enforced by the database, not by remembering a WHERE clause. `npm run check:tenant-isolation`
enforces this.

The RLS policies themselves are frozen. If your ticket seems to need a policy change, stop and say
so — that is an Opus decision, not a workaround.

ALSO NON-NEGOTIABLE
- No secrets in code or in clients/*.json. Env vars only, named in config as accessKeyEnv
- Every API route validates its input with Zod before touching the database — and every allowlisted
  field's value is validated against the *same* shape schema.ts uses for it, not a looser ad-hoc check
- No PII in logs or in URL query strings

DONE MEANS
- `npm run check:all` exits 0, including check:tenant-isolation
- Your ticket's own acceptance criteria, including the end-to-end one: save a field through the API,
  then confirm it actually appears on the tenant's public home page — not just that the database row
  changed
- Saving a non-allowlisted field is rejected with a clear error naming the field — this is the
  ticket's actual point, test it explicitly
- A test proving a session scoped to tenant A cannot read or write tenant B's client_overrides row —
  asserted against the database directly, not through the application

WHEN YOU GET STUCK
Two failed attempts and you stop with a written report. Do not weaken a check, do not fall back to
the service-role client to get past a permissions error, do not add an RLS bypass "temporarily".

Start by reading the eight files above and telling me, in four sentences, what you are about to build
and which tables/files it touches — including whether load.ts's override mechanism was already wired
up anywhere or whether that's new work you're adding.
```
