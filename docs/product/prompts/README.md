# Design prompts — one file per page

Two kinds of screen, and they're designed differently:

- **Customer-facing pages** are themed. Four identities, because each client's public site should
  feel bespoke to *their* customers.
- **Owner-facing admin screens** are universal. One design, every client, every tier — see
  `admin-universal/`.

```
00-shared/
  reference-catalog.md      — every inspiration file, what's actually in it
  global-chrome.md          — nav + footer + contact form master spec, themed units only

admin-universal/            — NOT themed. One design serves all 4 identities.
  00-universal-system.md    — neutral palette, system fonts, admin-tool conventions
  01-login.md               — /panel/login and /dashboard/login, one screen
  02-client-panel.md        — /panel, all tiers
  03-dashboard-leads.md     — /dashboard, T3 only
  04-dashboard-analytics.md — /dashboard/analytics, T3 only

unit-1-editorial/            — DEV.UN-based. Full agency-grade set. Do this unit first.
  00-identity-system.md
  01-home-page.md
  02-project-detail.md
  03-projects-category.md       categorised portfolio — designed for 48 projects
  04-estimate-calculator.md     optional at every tier — config-gated gimmick
  05-services-detail.md         conditional — content gate applies
  06-areas-detail.md            conditional — content gate applies
  07-team.md                    T3 — index + member detail
  08-news-press.md              T3 — index + article
  09-journal.md                 T3 — index + post
  10-careers.md                 T3
  11-locations.md               T3 — office pages, distinct from area pages
  12-thank-you-page.md
  13-404-page.md
  14-privacy-terms-page.md
  15-og-image.md                WhatsApp share card, 3 variants
  16-variants.md                section variants: hero, services grid, featured projects,
                                 testimonials, footer — the second documented layout for each

unit-2-premium/               — Northline Atelier + Apex Arc based. 6 pages.
unit-3-warm-contemporary/     — no direct reference, expect more iteration. 6 pages.
unit-4-bold-modern/           — no direct reference, expect more iteration. 6 pages.
  00-identity-system.md
  01-home-page.md
  02-project-detail.md
  03-estimate-calculator.md
  04-thank-you-page.md
  05-404-page.md
  06-privacy-terms-page.md
```

**Units 2–4 are deliberately shorter.** They cover the core customer-facing set only. Services,
areas and OG-card prompts get written for them once Unit 1's designs are validated — writing
speculative prompts for unproven identities is the same mistake as building the least-validated
thing first.

## Why the admin screens aren't themed

The four identities exist so each client's *public site* feels bespoke to their customers. The panel
and dashboard are seen only by the studio owner, doing work. Personality in an admin tool is
friction — they want to find a phone number in three seconds, not admire a two-tone heading.

Theming them would mean 4× the design, build and QA for an aesthetic nobody asked for. Shopify's
admin looks the same whatever your storefront theme is, for exactly this reason. The only
client-specific element is their logo and name in the header, so they know whose panel they're in.

**This cut 16 screens down to 4.**

## What T3 actually is

T3 was "T2 plus a dashboard" — too thin to justify the tier, and hard to describe in a pitch. It's
now the **agency-grade site**: the page set [BAMO](https://bamo.com/) and
[Tredi](https://www.trediinteriors.com/) actually run. Categorised portfolio, the team, press
coverage, a working journal, careers, multiple offices.

**Build the capability, gate by config.** Every page type ships in the template; `journal: false`
turns it off for a client who won't publish. An earlier version of these docs argued against
building a journal at all because "a Tier 2-3 studio owner will never write blog posts" — that
reasoned from the median studio rather than the target one. A practice running five projects a
month at ₹8–15L each has a marketing function. Building the capability costs nothing per client;
assuming it away costs the clients who would have used it.

**The estimate calculator is a gimmick — offer it, don't push it.** Three inputs, a ballpark range,
a CTA. Available at every tier, `estimate: false` turns it off. Neither reference site runs one, so
expect some agency-tier clients to decline it; that's a preference, not a rule.

## Coverage against the 27 T3 layouts

| Layout | Prompt |
|---|---|
| `/` | unit-N/01 |
| `/portfolio/[slug]` | unit-N/02 |
| `/projects/[category]` | unit-1/03 |
| `/estimate` | unit-N/04 — optional, config-gated |
| `/services/[slug]` | unit-1/05 — conditional |
| `/areas/[locality]` | unit-1/06 — conditional |
| `/team` + `/team/[slug]` | unit-1/07 (both, one prompt) |
| `/news` + `/news/[slug]` | unit-1/08 (both, one prompt) |
| `/journal` + `/journal/[slug]` | unit-1/09 (both, one prompt) |
| `/careers` | unit-1/10 |
| `/locations/[office]` | unit-1/11 |
| `/thank-you` | unit-N |
| `/404` | unit-N |
| `/privacy` + `/terms` | unit-N (both, one prompt) |
| `opengraph-image` | unit-1/15 |
| `/panel/login` + `/dashboard/login` | admin-universal/01 (both, one design) |
| `/panel` | admin-universal/02 |
| `/dashboard` | admin-universal/03 |
| `/dashboard/analytics` | admin-universal/04 |
| `sitemap.xml`, `robots.txt`, `manifest` | none — config files, nothing to design |
| ~~`/instagram`~~ | **cut** — now a home-page section, see below |

15 customer-facing prompts + 4 universal admin prompts = **19 prompts covering 24 designable
layouts.**

## Why there's no Instagram page

Instagram's job here is **proof of recency** — a portfolio can be three years stale and look
identical to a fresh one; an Instagram strip showing recent posts is the only element proving the
studio is working right now. That's exactly why a dedicated page is wrong: there's no live feed at
any tier (Basic Display API shut down Dec 2024, so all embeds are hand-picked), meaning a whole page
of them goes stale and **undermines the one thing Instagram is there to prove.** A home-page strip
does the job and degrades gracefully.

It also duplicated the portfolio grid and generated no indexable SEO content — embeds are iframes.

## How to run a page

1. Open the relevant system file — `00-identity-system.md` for a themed page,
   `admin-universal/00-universal-system.md` for an admin screen. Copy the block inside the fence.
2. Open the page file, copy the block inside its fence.
3. Paste the system block, then the page block, into Claude design as one message.
4. Attach the files listed under "Attach:" at the top of the page file.
5. Check against the relevant checklist below.

## Checklist — themed customer-facing pages

1. No SaaS centred-headline-subtitle-two-buttons pattern
2. At least 2 of that identity's named signature devices present and visible
3. Nav and footer follow the Global Chrome structure, in this identity's palette
4. No factual errors (city, year, stats) — check against the stated business facts
5. Reads unmistakably as this identity, not blended with another unit
6. Instagram, where present, styled to match — not a bolted-on widget
7. Case-study pages carry the 300–400 word / budget / room-type / quote structure
8. Conditional pages (services, areas) satisfy the content gate — a real project plus 150+ unique
   words, and cannot be turned into a sibling page by find-and-replace

## Checklist — universal admin screens

1. Mobile view designed first and actually shown
2. Every input has a visible label; no placeholder-as-label
3. Every icon has a text label; nothing icon-only
4. Empty states say what to do next, not "No data"
5. Primary action is thumb-reachable on mobile
6. Nothing on screen could break the client's site design (no colour, font or layout controls)
7. Neutral palette — no client brand colours anywhere except the logo in the header
