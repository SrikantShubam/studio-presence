# Ticket 12 — Dashboard: analytics UI

## Scope

Frontend only, `/dashboard/analytics`. **T3 only.** Depends on ticket 08 (analytics service) and, for
the shared header/tab chrome, on whichever of this ticket or ticket 11 lands first — see the note in
ticket 11's "Files you may create" about not duplicating the tab bar.

## Reference

`docs/product/prompts/admin-universal/04-dashboard-analytics.md` — read the whole file, **including
the "Note for the build phase" at the bottom**. It is the most important part of this ticket: this
screen shows deliberately less than the data allows, and the instinct to add a sixth metric during
implementation is exactly what that note warns against. If a stakeholder (including future-you)
proposes an addition, the bar stated there is "would this owner ever act on it" — apply it before
adding anything.

Also `design/reference/admin/dashboard-analytics-5f9092cb.png` — a screenshot captured from the
Stitch project this was designed in, confirmed to match the text spec (headline figure, 6-month
trend, source ranking, top projects, interpretation line — no extras). Read
`design/reference/admin/INDEX.md` first — **the colours in it are wrong, ignore them**, same caveat
as ticket 11.

Same admin token system as tickets 10-11.

## The exact four things, per the design doc

1. **Headline figure**: "N enquiries this month" (large) / "N last month" (smaller, comparison).
   Directly beneath, smaller and secondary: "N visitors this month" / "N last month" — same
   this-month/last-month shape, not a new pattern
2. **Monthly trend**: six plain bars, one per month, no axis, no gridlines, no legend, no tooltips
3. **Where enquiries came from**: ranked list, e.g. "WhatsApp button — 8" — never a pie chart
4. **Most-viewed projects**: top 3 project names with view counts

Below all four, one line of plain-language interpretation (the design doc's example: "Most people who
contact you tap WhatsApp after looking at two or three projects.") — this line is generated from
whichever of the four numbers is most notable that month, not hand-written per client. Decide a
simple rule (e.g. highest-ranked source + a fixed sentence template) rather than anything that reads
as an LLM-generated insight — see AGENTS.md's "no copy" rule; a fabricated-sounding insight line is
the same violation class as tickets 02-06's hardcoded eyebrows, just in a different section.

**Anti-goals, explicit** — do not build any of: bounce rate, session duration, page-load time,
referrer breakdown, geographic map, device breakdown, pie/donut charts, sparklines, date-range picker,
export button, comparison toggles, funnel diagram, real-time visitor counter. Umami can report most of
these; this screen deliberately doesn't.

## Build

`frontend/app/[tenant]/(admin)/dashboard/analytics/page.tsx`.

- Fetch `GET /api/[tenant]/analytics` (ticket 08's route)
- Handle the degraded case ticket 08's spec calls out: if `visitStats`/`topProjects` come back
  null/empty because Umami wasn't reachable, show the three lead-based numbers normally and an honest
  state for the traffic-dependent ones ("Visitor data isn't available right now" or similar) — not a
  fabricated zero
- Bars: plain divs sized by relative height, six months, month labels beneath — no charting library,
  this is explicitly simple per the design doc
- Empty state (not enough history yet): "We'll show this once your site has been live for a few
  weeks." per the design doc, verbatim is fine here since it's the doc's own specified copy, not
  fabricated

## Files you may create

```
frontend/app/[tenant]/(admin)/dashboard/analytics/page.tsx
frontend/app/[tenant]/(admin)/dashboard/analytics/**
```

If the Leads/Analytics tab header doesn't exist yet (check ticket 11's status first), build it as a
small shared component both routes use — do not fork two separate headers.

## Acceptance

- `npm run check:all` exits 0
- A t1/t2 tenant hitting this route is redirected to `/panel`, same gate as ticket 11
- Renders the "not enough data" empty state for a tenant with no leads and no traffic history
- Renders all four blocks correctly for a tenant with real lead history across multiple months and
  sources — trend bars have six months even if some are zero, source list is ranked descending,
  top-3 projects list is capped at 3 even if more have views
- The interpretation line changes based on the underlying data (verify with two different fixtures'
  worth of lead data, not a hardcoded sentence) and never reads as a fabricated/generic insight
  disconnected from the actual numbers shown above it
- Umami-unreachable case: three lead-based numbers still render, visitor-dependent ones show an
  honest unavailable state, nothing crashes
- None of the anti-goal items appear anywhere on the screen — check this explicitly against the list
  above, it's easy to add "just one more useful metric" without noticing it's on the excluded list
- Mobile-first, single column, everything stacked, no horizontal scroll at 375px
- Every colour is an `admin-*` token utility

## Do not touch

`backend/**` except reading it, `frontend/sections/**`, `frontend/lib/tokens/**`,
`docs/product/SPEC.md`, `clients/*.json`, `frontend/app/[tenant]/(admin)/panel/**`,
`frontend/app/[tenant]/(admin)/login/**`, `frontend/app/[tenant]/(admin)/actions.ts`,
`frontend/app/[tenant]/(admin)/dashboard/page.tsx` and `[leadId]/**` (ticket 11's files — share the
header component, don't edit its logic).
