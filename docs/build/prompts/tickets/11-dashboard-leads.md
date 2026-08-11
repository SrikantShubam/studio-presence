# Ticket 11 prompt — paste into Codex CLI

Model: `gpt-5.5`. Run as:

```bash
codex exec -m gpt-5.5 -s workspace-write -C "C:\work\studio presence" -
```

Then paste everything in the fenced block below as stdin (or paste it as your first message if
running Codex interactively instead of via `exec`).

If it fails `npm run check:all` twice, don't re-run gpt-5.5 — hand this same block to `gpt-5.6-luna`
for the fix instead. **Do not start this ticket before ticket 07 (lead capture service) is merged** —
this screen has no data to render without it.

---

```
You are building one admin screen of a multi-tenant Next.js product: the T3-only leads dashboard,
where a studio owner sees enquiries from their website. This is NOT one of the themed marketing
sections you may have seen elsewhere in this repo — forget identity variants, --t-* design tokens and
per-client theming entirely for this ticket.

READ FIRST:
1. AGENTS.md — the rules, absolute
2. docs/build/tasks/11-dashboard-leads.md — your ticket
3. docs/product/prompts/admin-universal/00-universal-system.md — the ONE fixed design system every
   admin screen uses, regardless of client or tier. Read this in full before writing any markup
4. docs/product/prompts/admin-universal/03-dashboard-leads.md — the full screen spec: header, summary
   row, filter chips, lead cards, detail view, empty state, anti-goals
5. design/reference/admin/INDEX.md, then look at dashboard-leads-548568e5.png in that same folder —
   a real screenshot of this screen. IGNORE ITS COLOURS: it's from a design tool that used its own
   palette, conflicting with this project's actual admin-* tokens (step 8). Use it only for layout,
   card structure, and information density
6. backend/src/auth/index.ts — requireTenant() and canAccessDashboard() already exist and do exactly
   the tier gate this screen needs. Do not reimplement it
7. frontend/app/[tenant]/(admin)/panel/layout.tsx — the existing auth-gate pattern to mirror for
   whatever dashboard layout you build
8. frontend/app/globals.css lines ~36-52 and ~68-74 — the admin-* colour tokens. Use these classes.
   Never a literal hex value, never a --t-* token

Do not read anything else in docs/. Most of it is superseded.

WHY THIS SCREEN MATTERS — worth keeping in mind for anything ambiguous
Every row here is worth ₹2–15 lakh to this person, checked on a phone between site visits. When in
doubt, optimize for the owner reaching a lead in one tap over anything else. The WhatsApp/Call buttons
on each card are, per the design doc, "the point of the screen."

TWO REFERENCES, DIFFERENT AUTHORITY
docs/product/prompts/admin-universal/03-dashboard-leads.md is the design brief — its structure and
copy are authoritative. The screenshot in design/reference/admin/ shows the same screen visually,
useful for layout, but its colours and font are wrong — this project's own admin-* tokens (step 8)
are what ship, always.

DONE MEANS
- `npm run check:all` exits 0
- A t1/t2 tenant hitting /dashboard is redirected to /panel, not shown an error or blank screen —
  verify this before anything else
- Empty state (zero leads) reads "No enquiries yet. Put your website link in your Instagram bio..."
  per the design doc, not "No data"
- Cards never a table — mobile-first, single column
- A lead missing an optional field (e.g. budget_band, when they didn't use the estimate calculator)
  doesn't show a blank/broken line — omit it entirely
- WhatsApp button produces a correct wa.me link, Call button a correct tel: link
- Status change from the detail view persists and reflects back in the list
- No horizontal scroll at 375px
- Every colour is an admin-* token utility

WHEN YOU GET STUCK
Two failed attempts and you stop with a written report. Do not weaken a check.

Start by reading the files above and telling me, in four sentences, what you are about to build.
```
