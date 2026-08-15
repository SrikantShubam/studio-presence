# Prompt — review the pages Grok built (for Codex)

Run from the repo root:

```bash
codex exec -m gpt-5.5 -s workspace-write -C "C:\work\studio presence" -
```

Then paste everything inside the fence as stdin.

This is a REVIEW prompt, not a build prompt. It is deliberately adversarial: the
thing being checked is whether pages that pass mechanical checks actually match
the designs, because that is exactly the gap that has bitten this project before
— `check:all` is all static analysis and never once opened a browser.

```
You are reviewing work another model just did in this repo: it converted finished HTML page designs
into React pages. Your job is to find where it went wrong. Assume it did, and go looking — a review
that concludes "looks good" without having compared anything specific is worthless here.

CONTEXT
Multi-tenant Next.js 15 / TypeScript / Tailwind v4 monorepo. One real client: Ashish Interiors,
"editorial" identity, tier t3. The home page was already built before this work and is CORRECT — use
it as the standard the new pages should meet.

READ FIRST
1. AGENTS.md — the rules the work had to follow
2. frontend/sections/Hero/ and frontend/app/[tenant]/(site)/page.tsx — the reference for correct shape
3. `git diff main...HEAD` and `git log main..HEAD --oneline` — what actually changed

Do not read the other markdown in docs/. Superseded.

REVIEW ON FOUR AXES, IN THIS ORDER

1. FIDELITY TO THE DESIGN — the most important one, and the one automated checks cannot see.
   For each new page, open BOTH its design file in design/reference/editorial/ AND the component
   that was built from it. Compare computed intent, not syntax: the design uses inline styles with
   literal values, the build uses Tailwind and tokens, so they will never look alike as text.
   Check specifically:
     - type scale: the designs use clamp(a, b, c). Does the build use the SAME clamp values?
     - font weight, letter-spacing, line-height, text-transform
     - layout structure: grid vs flex, column counts, aspect ratios, row spans. A design with a
       6-tile mosaic of varying spans rebuilt as a uniform 3-column grid is a FAILURE, even though
       nothing in check:all would notice
     - spacing rhythm: section padding, gaps between blocks
     - colour after resolving tokens: read frontend/app/globals.css and frontend/lib/tokens/, then
       verify the token the component used actually equals the hex the design specified. A token
       that resolves to a different colour than the design is real drift and matters
   Report each mismatch with the design's value and the build's value, side by side.

2. THE NON-NEGOTIABLE RULES — verify by reading, not by trusting check:all to have caught it:
     - any hex code, phone number, business name, or client-specific copy literal in a component
     - any inline style attribute outside app/[tenant]/(site)/layout.tsx
     - any new .css file
     - any edit to a frozen path: backend/src/config/**, frontend/sections/registry.ts,
       docs/product/SPEC.md, clients/*.json. Check `git diff main...HEAD --stat` for these
       explicitly. An edit here invalidates the work regardless of whether it passes
     - any check script that was weakened, given a new exclusion, or had a rule disabled. Diff the
       scripts/ directory and the eslint config. This is the most serious thing you can find

3. EMPTY AND EDGE STATES — every section must render NOTHING when its config block is absent, when
   enabled is false, and when its content array is empty. All three, not just one. Read the actual
   guard in each new component. A section that renders an empty frame, a bare heading with no items
   under it, or a "no data" placeholder where the spec wants silence, is a bug.

4. DOES IT ACTUALLY RUN — do not skip this and do not substitute reading the code for it.
     - `npm run check:all` and report the real exit code
     - start the dev server and request each new route, e.g.
       curl -s -o /dev/null -w "%{http_code}" -H "Host: ashish.localhost:3000" http://127.0.0.1:3000/team
       Every new page must return 200, not 404 and not 500. A page that typechecks and 500s at
       runtime has happened in this repo before
     - at 375px, confirm no horizontal scroll

WHAT NOT TO DO
- Do not fix anything. This is a review. Report findings; the decision to fix is not yours
- Do not report style preferences, naming opinions, or refactors you would have done differently.
  Only report: it breaks a stated rule, it does not match the design, or it does not work
- Do not pad the report. Three real findings beat fifteen with twelve of them speculative

OUTPUT
A list, worst first. For each: the file and line, what is wrong, the evidence (quote both the design
and the build), and how bad it is — BLOCKER (breaks a rule, or does not run), DRIFT (works but does
not match the design), or MINOR. Then one line: how many pages you checked, and how many you would
ship as-is.
```
