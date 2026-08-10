# Ticket 04 — Featured projects (portfolio)

## Scope

One section: the studio's project showcase on the home page — "PORTFOLIO" in the identity's
two-tone heading. Config key: `portfolio`. **Two variants.**

This is the home-page teaser only — 3 to 6 projects with a "view all" link. It is NOT the full
`/portfolio/[slug]` project listing or detail pages; those are separate, later tickets.

## Config

From `backend/src/config/schema.ts`:

```ts
const portfolio = z.object({
  ...sectionBase,
  variant: z.enum(['grid', 'carousel']).optional(),
  /** T2+. Turns each project into `/portfolio/[slug]`. */
  detailPages: z.boolean().default(false),
  /** No upper limit. A studio with 40 projects lists 40. */
  projects: z.array(project).default([]),
})
```

Where `project` is:

```ts
const project = z.object({
  title: z.string(),
  slug,
  cover: assetPath,
  images: z.array(assetPath).default([]),
  blurb: z.string().optional(),
  location: z.string().optional(),
  duration: z.string().optional(),
  projectType: z.enum(['residential', 'commercial', 'office', 'retail']).optional(),
  area: z.string().optional(),
  category: slug.optional(),
})
```

**This section shows a subset, not every project.** `stress.json` has 40 projects — do not render
all 40 in this home-page teaser. Show the first 6 (`projects.slice(0, 6)`) and, if there are more
than 6, render a "VIEW ALL PROJECTS →" link pointing at `/portfolio` when `config.detailPages` is
true. If `detailPages` is false, omit that link — there's nowhere for it to go.

`cover` is required on every project (never optional) — you do not need an empty-image fallback for
the cover photo the way Services does.

## Reference

Two fragments:

- **grid** (default) — `design/reference/editorial/home-sections/portfolio.html`. Asymmetric mosaic
  sizing, not a uniform grid — read the fragment for the exact sizing pattern
- **carousel** — `design/reference/editorial/featured-projects--carousel.html`. Uniform-size cards in
  a single horizontal-scroll row, 3 full cards plus a sliver of a 4th cut off at the right edge to
  signal more content. Offset outline frame on each photo (signature device). Left/right arrow
  controls — small, unobtrusive. No dot/pagination indicators.

## Files you may create

```
frontend/sections/Portfolio/index.tsx
frontend/sections/Portfolio/**
```

Plus one line in `frontend/sections/registry.ts`.

## Acceptance

- `npm run check:all` exits 0
- Both variants render, selected from config alone
- Renders against all three fixtures:
  - `clients/minimal.json` — `portfolio` present but `projects: []` (t0 includes portfolio with no
    projects). Confirm this renders nothing, not an empty grid frame or a "no projects" placeholder —
    per `hasContent()` in the registry, an empty `projects` array means the section doesn't render
  - `clients/ashish-interiors.json` — `variant: "grid"`, 3 projects, `detailPages: true` — confirm
    the "view all" link appears despite having only 3 (fewer than 6) — the link's presence is gated
    on `detailPages`, not on project count
  - `clients/stress.json` — `variant: "grid"`, 40 projects, `detailPages: true`. **Confirm only 6
    render**, and the "view all" link is present. Also confirm each project's Hindi-script title
    renders correctly and doesn't break the grid's card sizing
- The carousel variant's horizontal scroll works at 375px (finger-scrollable, not clipped)
- At 375px in the grid variant: no horizontal scroll (this constraint does NOT apply to the carousel
  variant's own internal scroll region, which is horizontal-scroll by design — but the page around it
  still shouldn't scroll horizontally)
- Every colour is a token utility
- Screenshots to `design/actual/portfolio/` — both variants

## Do not touch

`backend/src/config/**`, `frontend/sections/registry.ts` beyond your one line, `docs/product/SPEC.md`,
`clients/*.json`, any other file under `frontend/sections/`.
