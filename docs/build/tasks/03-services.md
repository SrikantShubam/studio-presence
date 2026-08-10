# Ticket 03 — Services grid

## Scope

One section: the studio's service offerings (Interior Design, Turnkey Renovation, etc.), sitting
after Trust Bar / About on the home page. Config key: `services`. **Two variants.**

## Config

From `backend/src/config/schema.ts`:

```ts
const services = z.object({
  ...sectionBase,
  variant: z.enum(['compact', 'detailed']).optional(),
  items: z
    .array(
      z.object({
        title: z.string(),
        blurb: z.string(),
        image: assetPath.optional(),
        slug: slug.optional(),
      }),
    )
    .default([]),
})
```

No `variant` set → default to the identity's default (`detailed`, per
`frontend/lib/tokens/editorial.ts`'s `defaultVariants.services`) — this resolution already happens in
`frontend/sections/registry.ts` before your component ever sees `variant`; you just switch on
whatever string you receive, same pattern as `frontend/sections/Hero/index.tsx`.

## Reference

Two fragments, one per variant:

- **detailed** (default) — `design/reference/editorial/home-sections/services.html`. Ghost numeral
  behind each item (01/02/03 — one of Editorial's signature devices), alternating
  image/text layout, one short blurb per service
- **compact** — `design/reference/editorial/services---grid-compact.html`. Simple 3-column grid, no
  photos, ghost numeral only — roughly a third of the vertical height of `detailed`

Read `frontend/sections/Hero/eyebrow.ts` and `frontend/sections/Hero/index.tsx` for how this repo
composes a ghost numeral and does variant dispatch — match that shape, don't invent a new one.

## Files you may create

```
frontend/sections/Services/index.tsx
frontend/sections/Services/**
```

Plus one line in `frontend/sections/registry.ts`.

## Acceptance

- `npm run check:all` exits 0
- Both variants render, selected from config alone (test by editing a scratch copy of
  `clients/ashish-interiors.json` locally with `variant: "compact"` set — do not commit a config
  change; this ticket doesn't touch `clients/*.json`)
- Renders against all three fixtures:
  - `clients/minimal.json` — `services` absent (t0 doesn't include it). Renders nothing
  - `clients/ashish-interiors.json` — `variant: "detailed"`, 3 items, no images set on any item
    (confirm the layout holds without a photo — this fixture doesn't set `services.items[].image`)
  - `clients/stress.json` — `variant: "detailed"`, 12 items. Confirm 12 items doesn't produce an
    absurdly tall page or broken numeral sequence (numerals should read 01 through 12, not repeat or
    reset)
- `items: []` renders nothing
- An item with no `image` renders correctly in the `detailed` variant (text-only, no broken image
  icon, no empty gap where the photo would be)
- At 375px: no horizontal scroll
- Every colour is a token utility
- Screenshots to `design/actual/services/` — both variants

## Do not touch

`backend/src/config/**`, `frontend/sections/registry.ts` beyond your one line, `docs/product/SPEC.md`,
`clients/*.json`, any other file under `frontend/sections/`.
