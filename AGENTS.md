# AGENTS.md — rules for any model working in this repo

Read this before your first edit. It applies to every agent: OpenCode, Codex, Antigravity, Claude
Code. If your ticket contradicts this file, the ticket is wrong — stop and say so.

## What this is

A multi-tenant website product for interior design studios in India. Every client site is one JSON
file in `clients/`. Tiering and visual identity are fields in that JSON. **If changing a client's
tier or template ever requires a code change, the architecture has failed** — that is the single
test this whole codebase is organised around.

## Read these, in this order

1. `docs/product/SPEC.md` — the spec of record. Everything else in `docs/` is background history
2. `backend/src/config/schema.ts` — the contract. What a client site can contain
3. `frontend/sections/Hero/` — the worked example. Match its shape, not just its rules
4. Your ticket in `docs/build/tasks/`

Do not read the other 70 markdown files in `docs/`. They contain superseded decisions and will
mislead you. Each carries a banner saying so.

## Frozen paths — you may not edit these

```
backend/src/config/**          the contract
frontend/sections/registry.ts   the section interface
docs/product/SPEC.md   the spec
clients/*.json         client data and test fixtures
```

If your code needs a change in any of them, **your ticket fails**. Stop and report why. Do not work
around it, do not add a field, do not loosen a type. A schema edited to make code compile is how
this codebase stops being checkable, and it is not recoverable cheaply.

## Non-negotiable rules

**Nothing hardcoded in a component.** No hex codes, no phone numbers, no business names, no copy. If
a string or a colour appears in JSX, it belongs in config or in a token. `npm run check:hardcode` is
the arbiter, not your judgement. This includes Tailwind arbitrary values — `bg-[#141414]` is a
hardcoded colour and will fail.

**Every section renders `null` when off.** A section is off when its config block is absent, when
`enabled` is false, or when its content array is empty. All three. A section that renders an empty
shell is a bug.

**Tailwind classes only.** No inline `style` attributes, no new `.css` files. Colours come from
token utilities (`text-ink`, `bg-cta`, `border-hairline`), never from literals. The one exception is
`app/layout.tsx`, which injects the token variables — that file is not yours to edit.

**Square corners, no shadows, no gradients** for the Editorial identity. The single allowed
exception is a dark scrim behind text sitting on a photo.

**Sample content must read as sample.** On a `demo` build, a plausible-looking fake testimonial is
worse than an obvious placeholder, because it can reach a real prospect and be believed.

## Definition of done

```bash
npm run check:all
```

Exit 0, plus:

- The section renders against all three fixtures: `clients/minimal.json`,
  `clients/ashish-interiors.json`, `clients/stress.json`
- Every variant named in your ticket renders, switchable from config alone
- At 375px: no horizontal scroll, primary action reachable by thumb
- Screenshots captured to `design/actual/<section>/`

## When you are stuck

**Two failed attempts at `check:all`, stop.** Do not keep iterating, do not guess, do not disable a
check. Report what failed and what you tried. The ticket escalates to a stronger model — that is a
normal part of the process and costs far less than a plausible-looking wrong answer.

Never disable, weaken or add exclusions to a check script to make your work pass.

## Staying out of each other's way

Two agents work this repo in parallel. Your ticket lists the files you may create; that list is
exhaustive and no two open tickets overlap. A section owns `sections/<Name>/` and nothing outside
it. If you find yourself needing to edit a file another ticket owns, stop and report it.
