# Ticket 01 — Quick actions row

## Scope

One section: the row of large-tap-target action buttons (WhatsApp, Call, Directions, Instagram)
that sits directly beneath the hero on the home page. Config key: `quickActions`.

No variants — this section always renders the same layout. What changes per client is *which*
actions appear, driven by `config.actions`.

## Config

From `backend/src/config/schema.ts`:

```ts
const quickActions = z.object({
  ...sectionBase,
  /** Which of the four to show. Directions needs `business.address.mapsEmbedUrl`. */
  actions: z
    .array(z.enum(['whatsapp', 'call', 'directions', 'instagram']))
    .default(['whatsapp', 'call', 'directions']),
})
```

`sectionBase` = `{ enabled: z.boolean().default(false) }`.

Each action resolves to a real destination, all from `site`, never hardcoded:

| Action | Destination |
|---|---|
| `whatsapp` | `https://wa.me/<digits of site.business.whatsapp>?text=<encoded site.cta.whatsappMessage>` |
| `call` | `tel:<site.business.phone>` |
| `directions` | `site.business.address.mapsEmbedUrl` (a full URL — link to it directly, do not embed a map here) |
| `instagram` | `https://instagram.com/<site.sections.instagram?.handle without the @>` — only meaningful if `site.sections.instagram?.handle` is set |

If an action in `config.actions` cannot resolve (e.g. `directions` present but
`business.address.mapsEmbedUrl` is empty, or `instagram` present but no handle set), skip rendering
that one button rather than rendering a dead link. `check:config`'s cross-field rule already catches
the `directions`-without-`mapsEmbedUrl` case at the config level for the fixtures in this repo, but
your component should not assume every config it ever receives passed that check — defend at render
time too.

## Reference

`design/reference/editorial/home-sections/quick-actions.html`

Four large tap-target buttons in a row (grid on desktop, still a row but tighter on mobile — this is
a `quick-actions row`, not a stack). Read the fragment for the exact spacing, border and icon
treatment. Icons: use simple inline SVGs (phone, chat bubble, pin, camera/Instagram glyph) — plain
strokes matching Editorial's line weight, not a icon-font or an external icon package dependency.

## Files you may create

```
frontend/sections/QuickActions/index.tsx
frontend/sections/QuickActions/**   (any files you need inside this directory only)
```

Nothing outside `frontend/sections/QuickActions/`. One line added to
`frontend/sections/registry.ts` registering it — that line only, nothing else in that file.

## Acceptance

- `npm run check:all` exits 0
- Renders correctly against all three fixtures:
  - `clients/minimal.json` — `quickActions` is absent (t0 doesn't include it). Confirm the section
    renders nothing when its config block doesn't exist at all, not just when `enabled` is false
  - `clients/ashish-interiors.json` — `actions: ["whatsapp", "call", "directions"]`, exactly 3
    buttons
  - `clients/stress.json` — same three actions; confirm the row doesn't overflow or wrap awkwardly
- Toggling `enabled: false` on a fixture that has the block renders nothing
- An `actions` array containing `instagram` when no Instagram handle is configured renders 2 or 3
  buttons, not 4 with one broken
- At 375px width: no horizontal scroll, every button at least 44px tall (a real tap target, not a
  small link)
- Every colour is a token utility (`bg-cta`, `text-ink`, `border-hairline`, etc.) — `check:hardcode`
  is the arbiter
- Screenshots captured to `design/actual/quick-actions/`

## Do not touch

`backend/src/config/**`, `frontend/sections/registry.ts` beyond your one line, `docs/product/SPEC.md`,
`clients/*.json`, any other file under `frontend/sections/`.
