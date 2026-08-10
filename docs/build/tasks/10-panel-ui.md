# Ticket 10 — Client panel UI

## Scope

Frontend only, `/panel`. Depends on ticket 09 (panel write-back service) being merged — this ticket
calls `GET`/`PATCH /api/[tenant]/panel`, it does not touch `client_overrides` directly.

Available at every tier, unlike the two dashboard tickets. This is the highest-traffic admin screen —
every owner uses this one, only t3 owners see the dashboard.

## This is not a themed section

Everything you know from tickets 01-06 about identity variants, `getTokenSet`, `--t-*` tokens does
**not** apply here. Read `docs/product/prompts/admin-universal/00-universal-system.md` in full — one
palette, one layout, every client, every tier. The colours are already wired as Tailwind classes:
`bg-admin-surface`, `bg-admin-bg`, `border-admin-border`, `text-admin-ink`, `text-admin-muted`,
`text-admin-primary` / `bg-admin-primary`, `text-admin-alert` / `bg-admin-alert` — see
`frontend/app/globals.css` lines ~36-52 and ~68-74 for where these come from. **Use these, never a
literal hex value or a `--t-*` token** — `check:hardcode` has no admin exemption, on purpose.

Look at `frontend/app/[tenant]/(admin)/panel/layout.tsx` and `.../login/LoginForm.tsx` first — they're
the only admin UI that exists so far, and they establish the pattern (rounded-lg cards, 1px borders,
no shadows, 48px+ tap targets) this ticket continues.

## Reference

`docs/product/prompts/admin-universal/02-client-panel.md` — the full screen spec: header, the seven
editable-section cards (contact details, hero image, projects, about text, services, testimonials,
Instagram posts), the sticky save bar, empty states, anti-goals. Read it in full; it is short and it
is the actual design brief, there is no HTML fragment to copy from because this screen was designed
in Stitch, not exported.

Design principle worth repeating because it is easy to drift from while building: **content is
theirs, structure is ours.** No control on this screen may let an owner change layout, colours,
template or which pages/sections exist. If you're unsure whether a field belongs on this screen,
check whether it's in ticket 09's allowlist — if it isn't, it doesn't go here either, the two are the
same boundary enforced twice (API and UI).

## Build

`frontend/app/[tenant]/(admin)/panel/page.tsx` replaces the current placeholder (read it first — it
explains why it exists as a stub and points to this exact ticket).

- Server component fetches `GET /api/[tenant]/panel` for initial data (or call `panel.getEditableConfig`
  directly if that's cleaner from a server component — your call)
- Client component(s) for the interactive editing: collapsible cards, the projects reorderable list,
  image upload, the sticky save bar with dirty-state tracking
- Image upload: check how `assetPath` works in the schema and how existing images are served
  (`/clients/<slug>/...` per the middleware passthrough) before inventing an upload mechanism — if
  there's no existing upload endpoint, that's a real gap; flag it rather than silently building
  something that writes to a location nothing else reads from
- Save calls `PATCH /api/[tenant]/panel` with only the changed, allowlisted fields
- After a successful save: "Saved. Your site updates in about a minute." per the design doc, not a
  generic "Saved" toast — the timing detail is there because an owner who doesn't see the change
  instantly needs to know that's expected, not broken

## Files you may create

```
frontend/app/[tenant]/(admin)/panel/page.tsx     (replaces the placeholder)
frontend/app/[tenant]/(admin)/panel/**
```

## Acceptance

- `npm run check:all` exits 0
- Every colour is an `admin-*` token utility, zero literal hex, zero `--t-*` token
- Renders against `clients/minimal.json` (t0 — sparse content, most optional fields absent) and
  `clients/stress.json` (t3 — 40 projects in the reorderable list, long Hindi text in about/services)
  without layout breaking. **The 40-project list is the real stress case here** — confirm it's usable,
  not a 40-item unstyled dump
- Editing and saving `business.phone` round-trips: change it, save, reload the page, the new value
  persists (this exercises ticket 09's API end to end from the UI side)
- Attempting to save a value ticket 09 would reject (if you can trigger that from the UI at all — if
  every field is properly constrained by its input type, note that instead) surfaces an error the
  owner can understand, not a raw API error string
- Mobile (390px) is the primary layout per the design doc — verify at 375px and 390px, not just
  desktop
- Empty states for projects/services/testimonials read as instructions ("No projects yet. Add your
  first one...") not "No data"
- No control anywhere lets you change template, tier, colours, or section on/off state — verify this
  by reading your own component tree, not just by eye

## Do not touch

`backend/**`, `frontend/sections/**`, `frontend/lib/tokens/**`, `docs/product/SPEC.md`,
`clients/*.json`, `frontend/app/[tenant]/(admin)/panel/layout.tsx` (the auth gate — read it, don't
edit it), `frontend/app/[tenant]/(admin)/login/**`, `frontend/app/[tenant]/(admin)/actions.ts`.
