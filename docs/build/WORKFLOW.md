# Build workflow — who does what, and why

The build is delegated across several models. This file says which model gets which work, how work
moves between them, and where the quality gates are. It is operational: read it before assigning
anything.

The organising constraint is that **Opus tokens are the scarcest resource in this project.** Every
decision below follows from that. The design is not "Claude orchestrates everything" — that puts
Opus back in the loop for every result. It is **files in, exit codes out**, with Opus reserved for
the few places judgement is genuinely the only tool.

---

## 1. Assignment

| Role | Model | Why this one |
|---|---|---|
| Contract — schema, types, validation, `SPEC.md` | **Opus 5** | Everything downstream is checked against these. Wrong here means nothing else is verifiable |
| Check scripts | **Opus 5** | They replace human review. A weak check is worse than no check, because it grants false confidence |
| RLS policies, magic-link auth | **Opus 5** | ~200 lines where a subtle error means one studio reads another's leads |
| Multi-tenant middleware + `status` gate | **Opus 5** | Small, and it enforces the commercial rule that a demo cannot attach a custom domain |
| Gate 3 batch review | **Sonnet 5** | Reading diffs for drift and semantic error is its shape. Escalates to Opus only on a flag. Biggest single saving in this table |
| Tickets 07+ | **Sonnet 5** | Mechanical once 01–06 exist as templates |
| Fixtures | **Sonnet 5** | Derived from the contract, verified by the checks |
| Section conversion, HTML → React | **DeepSeek v4-flash** (OpenCode) | Highest volume, lowest judgement |
| Section conversion, parallel queue | **Gemini 3.6** (Antigravity) | Second tier-1 worker on a disjoint slice. Doubles throughput |
| Bulk mechanical transforms (design-asset splitting, codemods) | **gpt-5.6-luna** (Codex) | "Fast and affordable" per its own catalog entry — deterministic, no judgement, highest volume per token |
| Page assembly from built sections | **gpt-5.5** (Codex CLI), **gpt-5.6-luna** for follow-up fixes | gpt-5.6-terra dropped from this table — costed like a frontier model without the frontier label, worse trade than gpt-5.5. gpt-5.5 does the first pass; luna is cheap enough to iterate on a near-miss without re-running the expensive model |
| Escalation — any ticket failing twice | **gpt-5.6-sol** (Codex) | Catalog's own "latest frontier agentic coding model". Debugging someone else's half-working code is the hardest cheap-tier task |
| Dashboard CRUD, API routes, analytics queries | **gpt-5.5** (Codex CLI), **gpt-5.6-luna** for follow-up fixes | Same reasoning as page assembly above. Opus reviews rather than writes, review is never sampled |
| — | Gemini 3.5 | Unassigned. Overflow only when 3.6 hits quota. Do not add a tier for it |

Assignments are swappable. If DeepSeek keeps failing section tickets, move that queue to Gemini and
let DeepSeek take something narrower. The tier structure matters more than the specific model in
each slot.

---

## 2. The loop

**Setup, once.** Opus finishes the contract, the check scripts and the three fixtures, splits the
design export into per-section fragments, and writes tickets 01–06.

**Per ticket:**

1. Assign to whichever tier-1 worker is free — DeepSeek/OpenCode or Gemini/Antigravity
2. Agent reads ticket → `AGENTS.md` → contract → its reference HTML fragment. Works on a branch
3. Agent runs `npm run check:all` and captures screenshots to `design/actual/`
4. Green → done. **Two failures → gpt-5.6-sol** (Codex). Sol fails twice → Opus
5. Human flips the side-by-side screenshots, accepts or bounces
6. Merge

**Every ~5 merged tickets:** Sonnet 5 reads the batch diff. Flags only reach Opus.

**Always, never sampled:** Opus reviews anything touching auth, RLS, lead capture, payment status,
or `backend/src/config/**`.

---

## 3. The gates, and what each one can actually catch

Checks are necessary and not sufficient. Each gate exists because the one before it is blind to
something specific.

| Gate | Who | Catches | Blind to |
|---|---|---|---|
| **0** `check:all` | scripts | type errors, hardcoded values, invalid config, tier resolution breaking, placeholder text, sections that crash on the stress fixture | anything about whether it *looks* right |
| **1** fixture matrix | scripts | empty states, overflow, unicode, missing optional fields, the 40-project client | semantics — right pixels, wrong behaviour |
| **2** screenshot pairs | **human, 10 seconds** | styling drift, layout collapse, "that isn't the design" | subtle behaviour, cross-section consistency |
| **3** batch diff | Sonnet 5 | drift from the Hero pattern, semantic errors, inconsistency visible only in aggregate | novel architectural mistakes |
| **4** security review | Opus 5 | tenant isolation holes, auth bypass, lost-lead paths | — |

Gate 2 is a human because you designed these pages and will spot wrongness in a second. Spending
Opus tokens on "does this look like the mockup" is the worst trade in the table.

### The fixture matrix

Three client configs. Every section renders all three or the ticket is not done.

| Fixture | What | Catches |
|---|---|---|
| `clients/minimal.json` | t0, only required fields, empty arrays everywhere optional | sections that assume content exists |
| `clients/ashish-interiors.json` | realistic t3 | the normal path |
| `clients/stress.json` | 40 projects, 600-character headline, missing optional images, Hindi text, no testimonials | overflow, layout collapse, unicode, missing empty states |

This is what converts most of "edge cases" from a judgement call into an exit code.

---

## 4. Two rules that keep parallel workers from colliding

**Disjoint file ownership.** Every ticket lists the files it may create. That list is exhaustive, and
no two open tickets overlap. A section owns `sections/<Name>/` and nothing outside it. This is what
makes two agents safe on one repo without worktrees.

**The contract is frozen to tiers 1 and 2.** `backend/src/config/**`, `frontend/sections/registry.ts` and `SPEC.md`
cannot be edited by a delegated agent. A model that can change the contract to make its code compile
will do exactly that, and then nothing downstream is checkable. A ticket that genuinely needs a
contract change fails and comes to Opus — that is the design, not a failure of it.

---

## 5. The backend, specifically — who builds what

Backend goes first. The exported HTML is full of hardcoded strings; converting it to React before a
config contract exists produces twenty files that then need rewriting.

Most of the backend lands on Opus, and that is the correct trade rather than a failure of
delegation. It is roughly fifteen files, most under a hundred lines, and it is the part where a
mistake is a data leak or a broken payment gate. The volume — 28 sections and 27 pages — is fully
delegated.

| # | Piece | Owner | Depends on |
|---|---|---|---|
| B1 | `backend/src/config/validate.ts` — cross-field rules | Opus | schema (done) |
| B2 | `backend/src/config/load.ts` — read → resolve → validate | Opus | B1 |
| B3 | `scripts/gen-schema.ts` → `client.schema.json` | Opus | schema |
| B4 | Three fixtures — minimal, ashish, stress | Sonnet 5 | B2 |
| B5 | Five check scripts + `check:all` | **Opus** | B2, B4 |
| B6 | `middleware.ts` — host → slug, `status` gate | Opus | B2 |
| B7 | `app/layout.tsx` — token injection | Opus | tokens (done) |
| B8 | `frontend/sections/registry.ts` — the section interface | Opus | types |
| B9 | Supabase schema + **RLS policies** | Opus | — |
| B10 | Magic-link auth, both login routes | Opus | B9 |
| B11 | Lead capture API + owner notification — `docs/build/tasks/07-lead-capture.md` | gpt-5.5 (Codex CLI), luna for fixes | B9, B10 |
| B12 | Analytics aggregation queries — `docs/build/tasks/08-analytics.md` | gpt-5.5 (Codex CLI), luna for fixes | B9 |
| B13 | Panel write-back API, scope-locked — `docs/build/tasks/09-panel-writeback.md` | gpt-5.5 (Codex CLI), luna for fixes | B9, B10 |
| B14 | `check:tenant-isolation` | Opus | B9 |

B5 is the gate. Nothing is delegated until the checks exist and are proven — specifically, until
`check:hardcode` demonstrably catches `bg-[#141414]` in the real exported HTML. Until then a
delegated ticket can come back green and wrong, which is worse than it coming back red.

B11–B13 use `prompts/codex-backend.md`: **gpt-5.5 via Codex CLI** for the first pass, **gpt-5.6-luna**
for a fix after a failed `check:all` run rather than re-running gpt-5.5 from scratch. Reviewed by
Opus before merge, never sampled.

### 5.1 Dashboard/panel frontend — tickets 10-12

Once B11-B13 are merged and reviewed, the three admin screens they back are ordinary frontend
tickets, same tier as 01-06 (`docs/build/tasks/10-panel-ui.md`, `11-dashboard-leads.md`,
`12-dashboard-analytics.md`). They are **not** themed sections — no identity variants, no `--t-*`
tokens — they use the fixed `admin-*` palette in `frontend/app/globals.css`, per
`docs/product/prompts/admin-universal/00-universal-system.md`. Assign them the same way as 07+:
Sonnet-reviewed, tier-1-buildable, escalate on two failures. `check:hardcode` has no admin exemption,
so the same gate applies.

Dependency order: 10 depends only on 09. 11 and 12 both depend on their respective backend ticket
(07, 08) and share one tab-header component — whichever lands first builds it, the second reuses it
rather than forking.

---

## 6. Escalation

Mechanical, never a judgement call:

```
tier 1 fails check:all twice   →  gpt-5.6-sol (Codex)
gpt-5.6-sol fails twice        →  Opus 5
ticket needs a frozen path     →  Opus 5, immediately, no attempts
Sonnet flags a batch           →  Opus 5 reads only what was flagged
```

Model slugs confirmed against the actual Codex catalog (`~/.codex/models_cache.json`), not guessed —
"GPT-5.6" alone isn't installable. The real options: `gpt-5.6-sol` ("latest frontier agentic coding
model"), `gpt-5.6-terra` ("balanced... everyday work"), `gpt-5.6-luna` ("fast and affordable"), and
`gpt-5.5` ("frontier model for complex coding, research, and real-world work"). **Backend and page
assembly use gpt-5.5, not gpt-5.6-terra** — terra's "balanced" label undersells what it actually
costs per run, and gpt-5.5 via the CLI is the better spend for that tier of work; gpt-5.6-luna
absorbs the follow-up-fix passes so the expensive model only runs once per ticket. Verified via
`codex exec -m <slug>` before assigning any work to it.

Nobody decides whether output "feels right enough". Two failures, move up.
