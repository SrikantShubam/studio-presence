# Universal admin system — owner-facing screens

**These screens are NOT themed.** One design serves all four identities, every client, every tier.

Paste this block at the start of every prompt in this folder, in place of a unit identity system.

---

## Why these aren't themed

The four visual identities (Editorial, Premium, Warm Contemporary, Bold Modern) exist to make each
client's *public site* feel bespoke to their customers. The panel and dashboard are seen only by the
studio owner, doing work. Personality in an admin tool is friction — the owner wants to find a phone
number in three seconds, not admire a two-tone heading.

Themed admin screens would mean 4× the design work, 4× the build, 4× the QA, and 4× the surface
for bugs, in exchange for an aesthetic nobody asked for. Shopify's admin looks the same whatever
your storefront theme is, for exactly this reason.

**One exception:** the client's own logo and studio name appear in the header, so the owner knows
whose panel they're in. Chrome, colour and layout stay universal.

---

## The system

```
CONTEXT: internal admin screens for a website product used by interior design studio owners in
Tier 2-3 Indian cities (Patna, Lucknow, Indore). These are NOT customer-facing marketing pages.

THE USER: a non-technical studio owner, 35–55, on an Android phone, between site visits. They use
this a handful of times a month. They are not a "power user" and never will be. If a screen needs
explaining, it has failed.

DESIGN PRINCIPLE: boring, legible, fast. This should look like a well-made tool, not a brand
statement. Think Stripe dashboard or Shopify admin — quiet, obvious, unremarkable in the best way.

PALETTE — neutral, deliberately not tied to any client brand:
- #FFFFFF  surface / cards
- #F6F6F5  page background
- #E4E4E2  borders and dividers
- #1C1C1B  primary text
- #6B6B68  secondary text and labels
- #2F6F4E  primary action green — buttons, active states, confirmations
- #B4462F  destructive / alert only — deletion, errors, "not contacted" warnings

TYPE: system font stack (-apple-system, Segoe UI, Roboto, sans-serif). No display faces, no serif,
no custom fonts. Body 16px minimum — this user's eyesight is not 22-year-old designer eyesight.

COMPONENTS:
- 8px corner radius throughout. Not square (too severe for a tool), not pill (too playful)
- One-level-deep card surfaces, subtle 1px borders, no drop shadows
- Buttons: solid green for primary, plain bordered for secondary, text-only for tertiary
- Every input has a visible label above it. Never a placeholder used as a label
- Every icon has a text label beside it. Never icon-only, at any size
- Minimum 48px tap targets

LAYOUT:
- MOBILE FIRST, always. Design the phone view first and show it. Desktop is the secondary case
- Single column on mobile. Never a horizontally scrolling table
- Sticky bottom action bar on mobile for the primary action, so it's always thumb-reachable

BRANDING: the client's logo and studio name sit in the top-left of the header. That is the only
client-specific element. Everything else is identical for every client.

STATES: every screen needs its empty state designed, and the empty state must say what to do next
in plain language — never just "No data".
```

---

## Screens in this folder

| File | Covers |
|---|---|
| `01-login.md` | `/panel/login` and `/dashboard/login` — same screen, one design |
| `02-client-panel.md` | `/panel` — content editing, all tiers |
| `03-dashboard-leads.md` | `/dashboard` — T3 only |
| `04-dashboard-analytics.md` | `/dashboard/analytics` — T3 only |
