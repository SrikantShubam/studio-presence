# Universal admin — Dashboard: leads (T3 only)

Attach: none required

Covers `/dashboard`. **T3 only** — this is the screen that justifies ₹45–55k over T2, so it has to
feel worth the difference. Design it now; building it stays deferred until a real T3 sale.

Paste `00-universal-system.md` first, then this:

```
Design the LEADS screen — where the studio owner sees enquiries that came in through their website.

WHY THIS MATTERS: every row here is worth ₹2–15 lakh to this person. They check it on a phone
between site visits. The screen has one job — show me who's new, and let me contact them in one tap.

HEADER: client logo + studio name left, tabs "Leads · Analytics" centre, owner initials right.

SUMMARY ROW — three figures across the top, plain and large:
"6 new this week"  ·  "43 total"  ·  "2 not contacted yet"
The "not contacted" figure uses the alert colour if it's above zero — it's the only thing on this
screen that should ever feel urgent.

FILTER CHIPS: All · New · Not contacted · This month

THE LEAD LIST, newest first. Each lead as a card on mobile (never a table row):
- Name, and locality underneath
- What they want: "3BHK — full home interiors"
- Budget band if they used the estimate calculator: "₹8–10 lakh"
- Time since arrival: "2 hours ago", "yesterday", "3 days ago"
- Status pill: NEW / CONTACTED / QUOTED / WON / LOST
- Two buttons on every single card, side by side, full width, thumb-height:
  a green "WhatsApp" primary and a bordered "Call" secondary
  These are the point of the screen. They must be the most tappable thing on it.

TAPPING A CARD opens a detail view:
- The full enquiry message
- Their estimate calculator inputs, if they used it
- Which page they were on when they enquired
- A notes field the owner can type into
- Status selector
- WhatsApp and Call buttons again, sticky at the bottom

EMPTY STATE: no leads yet. Say what to do about it — "No enquiries yet. Put your website link in
your Instagram bio and send it to anyone who asks for your work." Not just "No data."

Show mobile (390px) as the primary view, desktop secondary.

ANTI-GOALS: no dense enterprise data table, no horizontally scrolling columns, no bulk-select
checkboxes (this owner gets 20 leads a month, not 2,000), no sparkline charts, no CRM pipeline
kanban board, no "assign to team member", no icon-only buttons. Anything that makes this feel like
Salesforce is wrong.
```
