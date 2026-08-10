# Ticket 05 — About + owner

## Scope

One section: a short studio/owner story, sitting after Services on the home page. Config key:
`about`. No variants.

## Config

From `backend/src/config/schema.ts`:

```ts
const about = z.object({
  ...sectionBase,
  heading: z.string().optional(),
  /**
   * Optional so that raising a client's tier never fails the build for want of
   * copy. The section renders nothing without it, which is the correct outcome —
   * an empty About block is invisible, a build error blocks the whole site.
   */
  body: z.string().optional(),
  image: assetPath.optional(),
})
```

Both `heading` and `body` are optional, but `body` is the one that actually matters — a heading with
no body is not a usable About section. Treat "no `body`" as no real content (see Acceptance below);
`heading` alone is not enough to render something meaningful.

## Reference

`design/reference/editorial/home-sections/about.html`

Two columns on desktop (photo one side, text the other — read the fragment for which side), single
column stacked on mobile. `heading` in the two-tone treatment if present; plain if a client hasn't
set one, don't fabricate a heading.

## Files you may create

```
frontend/sections/About/index.tsx
frontend/sections/About/**
```

Plus one line in `frontend/sections/registry.ts`.

## Acceptance

- `npm run check:all` exits 0
- Renders against all three fixtures:
  - `clients/minimal.json` — `about` absent entirely (t0 doesn't include it). Renders nothing
  - `clients/ashish-interiors.json` — `heading` and `body` both set, no `image`. Confirm the layout
    holds with no photo — don't leave a blank column or broken image icon
  - `clients/stress.json` — `body` set, no `heading`, no `image`. Confirm this reads fine without a
    heading — it should not look like something is missing, just simpler
- The registry's `hasContent()` check already gates on `body` being non-empty before this component
  ever mounts — you don't need to re-implement that gate, but do not assume `heading` or `image` are
  present just because the component rendered at all
- At 375px: no horizontal scroll
- Every colour is a token utility
- Screenshots to `design/actual/about/`

## Do not touch

`backend/src/config/**`, `frontend/sections/registry.ts` beyond your one line, `docs/product/SPEC.md`,
`clients/*.json`, any other file under `frontend/sections/`.
