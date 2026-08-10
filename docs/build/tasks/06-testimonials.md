# Ticket 06 — Testimonials

## Scope

One section: client quotes, sitting after Process on the home page. Config key: `testimonials`.
**Two variants.**

## Config

From `backend/src/config/schema.ts`:

```ts
const testimonials = z.object({
  ...sectionBase,
  variant: z.enum(['cards', 'carousel']).optional(),
  items: z
    .array(
      z.object({
        quote: z.string(),
        author: z.string(),
        context: z.string().optional(),
        image: assetPath.optional(),
      }),
    )
    .default([]),
})
```

`context` is typically a locality ("Boring Road") — render it beneath the author name when present,
omit the line entirely when absent, don't render an empty comma or dash.

## Reference

Two fragments:

- **cards** (default) — `design/reference/editorial/home-sections/testimonials.html`. One featured
  quote larger/prominent, remaining quotes in a smaller grid beneath
- **carousel** — `design/reference/editorial/testimonials---carousel-variant.html`. One large quote
  centred, full width, generous whitespace, small round author photo above it, left/right arrows
  either side, dash-shaped (not dot-shaped) position indicators beneath. No card border or background
  panel — the quote sits directly on the page background.

## Files you may create

```
frontend/sections/Testimonials/index.tsx
frontend/sections/Testimonials/**
```

Plus one line in `frontend/sections/registry.ts`.

## Acceptance

- `npm run check:all` exits 0
- Both variants render, selected from config alone
- Renders against all three fixtures:
  - `clients/minimal.json` — `testimonials` absent entirely (t0 doesn't include it). Renders nothing
  - `clients/ashish-interiors.json` — `variant: "cards"`, 2 items, neither has an `image`. Confirm
    cards render without author photos — no broken image icon, no empty circle placeholder unless
    that's a deliberate, real empty-state treatment you design, not a broken one
  - `clients/stress.json` — `testimonials.enabled: true` but `items: []`. **This is the important
    case**: `enabled` is true, tier resolution turned it on, but there is no actual content. Confirm
    the section renders nothing — `enabled: true` with zero items must not produce an empty
    card-carousel frame with nothing inside it
- One card with `context` set and one without, in the same render, both look intentional (not one
  looking "more complete" than the other in a way that reads as broken)
- In the `carousel` variant, confirm the position indicators are dashes, not dots, and that there's
  no card border/background panel behind the quote — that distinction is the entire point of this
  variant existing separately from `cards`
- At 375px: no horizontal scroll (carousel's own internal transition/swipe is fine; the page around
  it should not scroll horizontally)
- Every colour is a token utility
- Screenshots to `design/actual/testimonials/` — both variants

## Do not touch

`backend/src/config/**`, `frontend/sections/registry.ts` beyond your one line, `docs/product/SPEC.md`,
`clients/*.json`, any other file under `frontend/sections/`.
