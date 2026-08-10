# Sonnet 5 — Gate 3 batch review

Run every ~5 merged tickets. This is the gate that catches what the check scripts structurally
cannot: right pixels, wrong behaviour, and drift that is only visible across several sections at
once. Substitute the commit range.

```
Review a batch of merged work in a multi-tenant Next.js product. The automated checks already pass —
`npm run check:all` is green on every commit in this range. Do not re-verify what the checks cover.

READ FIRST:
1. AGENTS.md — the rules the work was supposed to follow
2. frontend/sections/Hero/ — the reference pattern every section is meant to match
3. backend/src/config/schema.ts — the contract
4. `git diff <FROM>..<TO>` — the batch

WHAT THE CHECKS ALREADY GUARANTEE, SO SKIP IT
Types compile. No hardcoded hex, phone numbers or copy. Config validates. Tier resolution works.
No placeholder text. Every section renders against all three fixtures without crashing.

LOOK FOR EXACTLY THREE THINGS

1. PATTERN DRIFT — sections that work but do not match frontend/sections/Hero. Different prop shape,
   different file layout, variants resolved a different way, a helper reimplemented locally that
   already exists in lib/. Individually harmless; collectively this is what makes identity two cost
   as much as identity one.

2. SEMANTIC ERRORS — the class checks cannot see. Right pixels, wrong behaviour. A CTA pointing at
   the wrong number. A section reading the wrong config key and rendering plausible content from
   it. An empty state that renders when content exists. A variant that silently falls back instead
   of erroring.

3. CROSS-SECTION INCONSISTENCY — only visible in aggregate. Two sections spacing their headings
   differently. Three different ways of handling a missing image. Two competing helpers for the
   same job.

OUTPUT
For each finding: the file and line, what is wrong, and why it matters. Rank by consequence, not by
how easy it is to describe.

Then one line at the end: ESCALATE or CLEAN.

Escalate only for findings that need an architectural decision or a contract change — those go to
Opus. Everything else goes back to the tier-1 queue as a fix ticket. If you find nothing, say CLEAN
and stop; a review that manufactures findings to look thorough costs more than it saves.
```
