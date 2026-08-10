# Tier 1 — section conversion

For **DeepSeek v4-flash via OpenCode** or **Gemini 3.6 via Antigravity**. One section, one fresh
session. Substitute `<TICKET>`.

```
You are implementing one section of a multi-tenant Next.js website product. Work only on the ticket
named below. Do not touch anything outside the files that ticket lists.

READ FIRST, IN THIS ORDER:
1. AGENTS.md — the rules. They are absolute and this prompt does not override them
2. docs/build/tasks/<TICKET>.md — your ticket
3. backend/src/config/schema.ts — the config contract, specifically the block your ticket names
4. frontend/sections/Hero/ — the worked example. Match its file layout, its prop shape and its variant
   handling. When this prompt and Hero disagree, follow Hero

Do not read anything else in docs/. Most of it is superseded and carries a banner saying so.

YOUR JOB
Convert the reference HTML fragment named in your ticket into a React section component that reads
its content from config instead of having it hardcoded. The HTML is a static mockup — every string,
colour, phone number and image path in it is placeholder data that must come from the config block
instead. The layout and visual structure are what you are preserving; the content is not.

DONE MEANS
- `npm run check:all` exits 0
- The section renders against all three fixtures: clients/minimal.json,
  clients/ashish-interiors.json, clients/stress.json
- It renders null when its config block is absent, when enabled is false, and when its content
  array is empty — all three cases
- Every variant listed in the ticket renders, selected from config alone
- No horizontal scroll at 375px
- Screenshots captured to design/actual/<section>/

WHEN YOU GET STUCK
Two failed attempts at `npm run check:all` and you stop. Report what failed, what you tried, and
what you think the cause is. Do not keep iterating. Do not disable, weaken or add an exclusion to
any check to make your work pass — that is the one thing that makes your output worthless rather
than merely unfinished.

If the ticket cannot be completed without editing backend/src/config/**, frontend/sections/registry.ts or
docs/product/SPEC.md, stop immediately and say so. Those are frozen. Needing to change them is a
legitimate outcome and it escalates — inventing a workaround is not.

Start by reading the four files above and telling me, in three sentences, what you are about to
build. Then build it.
```

## Notes for whoever is driving

Ask for the three-sentence summary before letting it write. A tier-1 model that has misread the
ticket says so in that summary, and catching it there costs nothing.

If the same agent fails two different tickets in a row, the problem is more likely the ticket format
than the model. Escalate the ticket, but also flag the format.
