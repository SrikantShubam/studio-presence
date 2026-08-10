# Codex — page assembly

For **gpt-5.6-terra via Codex**. Composing already-built sections into a page layout. Only run this once
the sections a page needs are merged — assembling a page from sections that do not exist yet is how
a model ends up inventing them.

Substitute `<TICKET>`.

```
You are assembling one page of a multi-tenant Next.js product from sections that already exist. You
are not writing sections. If a section your page needs is missing, stop and say which one.

READ FIRST:
1. AGENTS.md — the rules, absolute
2. docs/build/tasks/<TICKET>.md — your ticket
3. frontend/sections/registry.ts — how sections are looked up and how variants resolve
4. The reference HTML named in your ticket, for section order and page-level spacing

YOUR JOB
Compose existing sections into a page. Which sections appear, in what order, and with which variant
all come from config — the page decides nothing. A page that hardcodes its section list defeats the
tier system: switching a client from t1 to t2 is supposed to change what renders, with no code
change anywhere.

Read the section list from the resolved config via the registry. Do not import section components
directly by name.

DONE MEANS
- `npm run check:all` exits 0
- The page renders against all three fixtures: clients/minimal.json,
  clients/ashish-interiors.json, clients/stress.json
- Flipping `tier` between t1, t2 and t3 in a fixture changes which sections appear, with zero code
  edits. This is the acceptance test the whole architecture exists for — verify it explicitly rather
  than assuming it follows
- Sections absent from config leave no gap, no empty wrapper and no stray spacing
- No horizontal scroll at 375px
- Screenshots to design/actual/<page>/

WHEN YOU GET STUCK
Two failed attempts, stop and report. Never disable a check. Never edit backend/src/config/**,
frontend/sections/registry.ts or a section component to make your page work — if a section behaves wrongly,
that is a section ticket, not yours to fix.

Start by listing the sections this page needs and confirming each one exists in sections/.
```
