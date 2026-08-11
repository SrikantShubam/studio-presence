# Ticket 12 prompt — paste into Codex CLI

Model: `gpt-5.5`. Run as:

```bash
codex exec -m gpt-5.5 -s workspace-write -C "C:\work\studio presence" -
```

Then paste everything in the fenced block below as stdin (or paste it as your first message if
running Codex interactively instead of via `exec`).

If it fails `npm run check:all` twice, don't re-run gpt-5.5 — hand this same block to `gpt-5.6-luna`
for the fix instead. **Do not start this ticket before ticket 08 (analytics service) is merged** —
this screen has no data to render without it. If ticket 11 has already landed, reuse its Leads/
Analytics tab header component rather than building a second one — check before you start.

---

```
You are building one admin screen of a multi-tenant Next.js product: the T3-only analytics dashboard,
where a studio owner sees whether their website is working. This is NOT one of the themed marketing
sections you may have seen elsewhere in this repo — forget identity variants, --t-* design tokens and
per-client theming entirely for this ticket.

READ FIRST:
1. AGENTS.md — the rules, absolute
2. docs/build/tasks/12-dashboard-analytics.md — your ticket
3. docs/product/prompts/admin-universal/00-universal-system.md — the ONE fixed design system every
   admin screen uses, regardless of client or tier
4. docs/product/prompts/admin-universal/04-dashboard-analytics.md — the full screen spec, INCLUDING
   the "Note for the build phase" at the bottom. Read that note twice — it explains why this screen
   shows deliberately less than the data allows, and that matters more than the layout does
5. design/reference/admin/INDEX.md, then look at dashboard-analytics-5f9092cb.png in that same
   folder — a real screenshot of this screen, confirmed to match the text spec. IGNORE ITS COLOURS:
   it's from a design tool that used its own palette, conflicting with this project's actual admin-*
   tokens (step 7). Use it only for layout and density
6. backend/src/auth/index.ts — requireTenant() and canAccessDashboard() already exist, use them, do
   not reimplement the tier gate
7. frontend/app/globals.css lines ~36-52 and ~68-74 — the admin-* colour tokens. Use these classes.
   Never a literal hex value, never a --t-* token

Do not read anything else in docs/. Most of it is superseded.

SHOW EXACTLY FOUR THINGS — no more, ever
1. Headline: enquiries this month / last month, plus visitors this month / last month beneath it,
   smaller
2. Six-month trend, plain bars, no axis/gridlines/legend/tooltips
3. Where enquiries came from, ranked list, never a pie chart
4. Top 3 most-viewed projects with view counts

Below those: one line of plain-language interpretation, generated from the actual numbers by a simple
rule (e.g. highest-ranked source + a fixed sentence template) — not hand-written, not an
LLM-generated-sounding "insight" disconnected from the data above it. That would be the same
fabricated-copy violation this product's AGENTS.md forbids elsewhere, just in a different section.

ANTI-GOALS — do not build any of these, full stop
Bounce rate, session duration, page-load time, referrer breakdown, geographic map, device breakdown,
pie/donut charts, sparklines, date-range picker, export button, comparison toggles, funnel diagram,
real-time visitor counter. If you find yourself wanting to add "just one more useful metric," don't —
check the anti-goals list first.

DONE MEANS
- `npm run check:all` exits 0
- A t1/t2 tenant hitting this route is redirected to /panel, same gate as the leads dashboard
- Empty state: "We'll show this once your site has been live for a few weeks." per the design doc
- All four blocks render correctly with real data across several months — trend bars are six months
  even when some are zero, source list ranked descending, top-3 projects capped at 3
- Umami unreachable: the three lead-based numbers still render, the two traffic-based ones show an
  honest "not available" state, nothing crashes
- None of the anti-goal items appear anywhere — check explicitly against the list, it's easy to add
  one without noticing it's excluded
- Mobile-first, single column, no horizontal scroll at 375px
- Every colour is an admin-* token utility

WHEN YOU GET STUCK
Two failed attempts and you stop with a written report. Do not weaken a check.

Start by reading the files above and telling me, in four sentences, what you are about to build.
```
