# Universal admin — Dashboard: analytics (T3 only)

Attach: none required

Covers `/dashboard/analytics`. **T3 only.** Deliberately narrow — the note at the bottom explains
why, and it matters more than the layout does.

Paste `00-universal-system.md` first, then this:

```
Design the ANALYTICS screen — the studio owner's view of whether their website is working.

WHY THIS IS DELIBERATELY SMALL: this owner does not read analytics and will never act on a bounce
rate. They have exactly one question — "is this thing bringing me work?" Answer that and stop.
A screen full of metrics they can't act on makes them feel like they're failing to understand their
own website, which is the opposite of what a Growth tier should feel like.

HEADER: client logo + studio name left, tabs "Leads · Analytics" centre, owner initials right.

SHOW EXACTLY FOUR THINGS:

1. THE HEADLINE FIGURE — enquiries this month, very large, with last month beneath for comparison:
   "14 enquiries this month" / "9 last month"
   This is the hero of the screen. Nothing else competes with it.

   Directly beneath it, smaller and clearly secondary, total site visits in the same this-month /
   last-month format: "312 visitors this month" / "260 last month". Same comparison shape as the
   headline, not a new pattern — just gives the enquiry count something to be a fraction of.

2. MONTHLY TREND — one simple bar per month, last 6 months. No y-axis, no gridlines, no legend,
   no tooltips. Just six bars and their month labels.

3. WHERE ENQUIRIES CAME FROM — a short ranked list, never a pie chart:
   "WhatsApp button — 8"
   "Estimate calculator — 4"
   "Enquiry form — 2"

4. MOST-VIEWED PROJECTS — top three project names with view counts. This is the genuinely
   actionable one: it tells them what kind of work to photograph more of.

Below the four blocks, one line of plain-language interpretation:
"Most people who contact you tap WhatsApp after looking at two or three projects."

EMPTY STATE: not enough data yet. "We'll show this once your site has been live for a few weeks."

Mobile first, single column, everything stacked.

ANTI-GOALS — do not include any of these, they are all unactionable for this user: bounce rate,
session duration, page-load time, traffic sources by referrer, geographic map, device breakdown,
pie charts, donut charts, sparklines, date-range picker, export button, comparison toggles,
conversion-funnel diagram, real-time visitor counter.
```

---

## Note for the build phase

This screen shows far less than Umami can report, and that's deliberate. The finding earlier in this
project was that analytics only create value when the owner *acts* on them — and a Tier 2-3 studio
owner will not act on a bounce rate. Four numbers they can act on beat twenty that are merely
accurate. Expect pressure to add more during implementation; resist it.

The one addition worth making is the visits stat under the headline. It's not the same category as
bounce rate or session duration — it needs no interpretation, and a T3 customer paying ₹45–55k
otherwise sees only enquiry counts with no sense of how much traffic is happening at all, which reads
thin. It also removes any reason for them to want a second login into Umami directly — there is
deliberately only one owner-facing dashboard in this product. If someone asks for a second Umami-fed
number, the bar is the same as the other four: would this owner ever act on it.
