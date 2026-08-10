# Ticket 02 — Trust bar

## Scope

One section: a horizontal band of 3–4 large numeric stats (years active, projects delivered, areas
served, etc.), sitting between Quick Actions and Services on the home page. Config key: `trustBar`.

No variants. The only thing that varies per client is how many stats they have (1 to 4) and what the
stats say.

## Config

From `backend/src/config/schema.ts`:

```ts
const trustBar = z.object({
  ...sectionBase,
  stats: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .max(4)
    .default([]),
})
```

`value` is the large number/figure (e.g. `"12"`, `"40+"`, `"★★★★★"` — it's a string, not always a
number, so don't assume it parses as one). `label` is the small caption beneath it.

## Reference

`design/reference/editorial/home-sections/trust-bar.html`

Stats laid out in an even row on desktop, wrapping to 2 columns on mobile if there are 4. Thin
vertical dividers between stats (not full borders around each) — read the fragment for the exact
divider treatment. Large serif-adjacent numeral, small uppercase letter-spaced label beneath.

## Files you may create

```
frontend/sections/TrustBar/index.tsx
frontend/sections/TrustBar/**
```

Plus one line in `frontend/sections/registry.ts`.

## Acceptance

- `npm run check:all` exits 0
- Renders against all three fixtures:
  - `clients/minimal.json` — `trustBar` absent entirely. Renders nothing
  - `clients/ashish-interiors.json` — 3 stats
  - `clients/stress.json` — 4 stats, one with a long label ("YEARS OF CONTINUOUS PRACTICE ACROSS
    PATNA AND SURROUNDING AREAS") and one with a non-numeric value (`★★★★★`). Confirm the long label
    doesn't break the layout and the star value renders as plain text, not as something that assumes
    numeric formatting
- `stats: []` (present, enabled, but empty array) renders nothing — this is the empty-content case
  `hasContent()` in the registry already gates on; your component doesn't need its own extra guard
  for it, but confirm nothing breaks if it somehow reaches your component anyway
- 1, 2, 3 and 4 stats all lay out sensibly — don't hardcode a 3-column or 4-column grid assuming a
  fixed count
- At 375px: no horizontal scroll
- Every colour is a token utility
- Screenshots to `design/actual/trust-bar/`

## Do not touch

`backend/src/config/**`, `frontend/sections/registry.ts` beyond your one line, `docs/product/SPEC.md`,
`clients/*.json`, any other file under `frontend/sections/`.
