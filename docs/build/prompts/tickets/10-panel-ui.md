# Ticket 10 prompt — paste into Codex CLI

Model: `gpt-5.5`. Run as:

```bash
codex exec -m gpt-5.5 -s workspace-write -C "C:\work\studio presence" -
```

Then paste everything in the fenced block below as stdin (or paste it as your first message if
running Codex interactively instead of via `exec`).

If it fails `npm run check:all` twice, don't re-run gpt-5.5 — hand this same block to `gpt-5.6-luna`
for the fix instead. **Do not start this ticket before ticket 09 (panel write-back API) is merged** —
this screen calls that API and has nothing to render without it.

---

```
You are building one admin screen of a multi-tenant Next.js product: the client content panel, where
a non-technical studio owner edits their own website. This is NOT one of the themed marketing
sections you may have seen elsewhere in this repo — forget identity variants, --t-* design tokens and
per-client theming entirely for this ticket.

READ FIRST:
1. AGENTS.md — the rules, absolute
2. docs/build/tasks/10-panel-ui.md — your ticket
3. docs/product/prompts/admin-universal/00-universal-system.md — the ONE fixed design system every
   admin screen in this product uses, regardless of client or tier. Read this in full before writing
   any markup
4. docs/product/prompts/admin-universal/02-client-panel.md — the full screen spec for what you're
   building: header, the seven editable-section cards, sticky save bar, empty states, anti-goals
5. design/reference/admin/INDEX.md, then look at client-panel-overview-27191186.png,
   client-panel-overview-d9eb7911.png and client-panel-edit-project-75340c80.png in that same
   folder — real screenshots of this screen. IGNORE THEIR COLOURS: they're from a design tool that
   used its own palette, which conflicts with this project's actual admin-* tokens (step 7). Use them
   only for layout, card grouping, and information density
6. frontend/app/[tenant]/(admin)/panel/layout.tsx and .../login/LoginForm.tsx — the only admin UI that
   exists so far. This establishes the actual pattern (rounded-lg cards, 1px borders, no shadows,
   48px+ tap targets, the admin-* Tailwind classes) — match it
7. frontend/app/globals.css lines ~36-52 and ~68-74 — where the admin-* colour tokens
   (admin-surface, admin-bg, admin-border, admin-ink, admin-muted, admin-primary, admin-alert) come
   from. Use these classes. Never a literal hex value, never a --t-* token — check:hardcode has no
   admin exemption

Do not read anything else in docs/. Most of it is superseded.

THE SCOPE RULE — read this twice
Content is theirs, structure is ours. No control on this screen may let an owner change layout,
colours, template, or which sections/pages exist. If you're unsure whether a field belongs on this
screen, it's in the allowlist ticket 09 already enforces server-side — if it isn't there, it doesn't
go here either.

TWO REFERENCES, DIFFERENT AUTHORITY
docs/product/prompts/admin-universal/02-client-panel.md is the design brief — its structure and copy
are authoritative. The screenshots in design/reference/admin/ show the same screen visually, useful
for layout and spacing, but their colours and font are wrong — this project's own admin-* tokens
(step 7) are what ship, always.

DONE MEANS
- `npm run check:all` exits 0
- Every colour is an admin-* token utility, zero literal hex, zero --t-* token
- Renders against clients/minimal.json (sparse, most optional fields absent) and clients/stress.json
  (40-project reorderable list, long Hindi text) without breaking — the 40-project list is the real
  stress case, confirm it's usable
- Editing and saving a field round-trips through ticket 09's API: change it, save, reload, the value
  persists
- Mobile (390px) is the primary layout — verify at 375px and 390px, not just desktop
- Empty states read as instructions ("No projects yet. Add your first one...") not "No data"
- No control anywhere lets you change template, tier, colours, or section on/off state

WHEN YOU GET STUCK
Two failed attempts and you stop with a written report. Do not weaken a check. If something you need
(e.g. an image upload endpoint) doesn't exist yet, say so explicitly rather than inventing a
mechanism nothing else reads from.

Start by reading the files above and telling me, in four sentences, what you are about to build.
```
