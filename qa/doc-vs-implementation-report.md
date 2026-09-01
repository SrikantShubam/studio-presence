# TL;DR

**What matches the spec:**

- All 16 sections the spec calls "built now" exist and are registered.
- Sections turn off from config alone (absent block, `enabled: false`, empty content all render nothing).
- The demo/sold/live/archived payment gate is enforced in middleware, not by anyone remembering.
- Colours flow through identity tokens; no hex codes in components.

**What does not match:**

- The lead dashboard is fully built. SPEC.md says "not built"; two other docs say don't build it until a real prospect asks. Keep it and update the spec, or park it behind a flag.
- `/admin` and `/super` admin screens exist in zero documents.
- `/portfolio`, `/projects`, `/locations` index pages ship though the spec lists only their detail pages (`/[slug]` children).
- `/about` is a standalone page; an earlier decision recorded in the docs said never build one.
- Login lives at `/login`; the spec says `/panel/login` and `/dashboard/login`.
- Hindi ships as 9 hardcoded `/hi/*` routes. No document describes this design. Careers, journal, news, team member pages, legal pages have no Hindi version and fallback behaviour is undefined.
- The schema contains a fourth tier `t0`. Every business document insists there are exactly three tiers.

**What to do first:** decide the six open questions in section E (dashboard fate, `t0`, Hindi coverage, index pages, watermark location, panel vs content-manager overlap), then run the workbook against your one built unit.

---

# Documentation vs implementation - gap report

Date: 2026-02-20. Spec of record: `docs/product/SPEC.md`. Everything else in `docs/product/`
is background history, so where history and code disagree the question is always "does the code
match SPEC.md", not "does the code match the old doc".

Method: static reading of routes (`frontend/app/[tenant]/**`), the section registry,
the config schema, middleware, and the client fixtures. Nothing here was verified in a
running browser; the workbook's manual passes cover the runtime half.

---

## Verdict in one paragraph

The core architecture matches the spec: all 16 "built now" sections are registered, the render
gate chain (registered, enabled, non-empty) is centralised in `registry.ts`, the payment-gate
status rules live in middleware, and identity tokens flow through CSS variables rather than
literals. The deviations are almost all in the same direction: **more pages and more admin surface
shipped than any document authorises**, plus a Hindi implementation whose shape no document
describes. None of these break the two-axis acceptance test by themselves, but several expand the
QA surface beyond what the spec's layout counts assume, and the dashboard directly contradicts an
explicit "do not build yet" instruction.

---

## A. Deviations where implementation exceeds the documents

### A1. The lead dashboard is built. Every document says don't. HIGH

- **SPEC.md section 1**: Dashboard - "not built", deferred to a real T3 sale.
- **page-inventory.md**: "Do not build the dashboard until a real prospect asks for it."
- **feature-tiers.md** row 30 and the T3 positioning paragraph repeat the same instruction.
- **Implementation**: `/dashboard`, `/dashboard/analytics`, `/dashboard/content`,
  `/dashboard/enquiries`, `/dashboard/settings`, `/dashboard/[leadId]`, plus `DashboardTabs`,
  `AnalyticsDashboard`, `ContentManagerPage`.

SPEC's T3 dashboard allowance was 3 layouts (login, leads, analytics). The implementation carries
6+ routes including a content manager and settings screens no document mentions. This is either
scope creep that needs reversing, or a decision that was made without updating SPEC.md. Both
states are unacceptable long-term because SPEC.md is the file agents are told wins.

### A2. An admin/super-admin surface exists in no document. MEDIUM

`/admin` (`AdminChrome`, `components`, `actions`), `/super` (`SuperAdminConsole`),
`ThemeToggle`. Zero mentions in SPEC.md, page-inventory.md, feature-tiers.md, or
config-schema.md. Undocumented privileged surfaces are exactly what a tenant-isolation audit
misses, so they need a doc entry and explicit RLS/test coverage.

### A3. Index pages for collections the spec lists as detail-only. MEDIUM

SPEC section 5 names these layouts: `/portfolio/[slug]`, `/projects/[category]`,
`/services/[slug]`, `/areas/[locality]`, `/locations/[office]`, `/team`, `/team/[slug]`.
The implementation additionally ships listing/index pages:

| Extra route | In any doc? |
|---|---|
| `/portfolio` | No - SPEC counts only `/portfolio/[slug]` |
| `/projects` | No - only `/projects/[category]` is listed |
| `/locations` | No - only `/locations/[office]` is listed |

These change the "27 base layouts" arithmetic, they add indexable URLs the sitemap and SEO story
never accounted for, and `/portfolio` as a grid landing page overlaps the home-page portfolio
section the spec describes. Each should be either documented or cut.

### A4. `/about` as a standalone page contradicts a recorded decision. LOW-MEDIUM

page-inventory.md ("Deliberately not building"): separate about/services/process/FAQ pages -
sections on home instead. SPEC's T1 and T3 layout lists contain no `/about`. The implementation
has `/about` (and `/hi/about`). It may be a good idea, but it is an unrecorded reversal of a
recorded decision, and unrecorded reversals are how this repo's doc rot started.

### A5. Login lives at `/login`, not the documented paths. LOW

SPEC section 5: `/panel/login` (T1) and `/dashboard/login` (T3). Implementation: one shared
`/login` route, with `/panel` and `/dashboard` beside it. Functionally equivalent, but every
handover doc, Loom walkthrough, and support email will say the wrong URL until this is reconciled.

---

## B. The Hindi implementation matches no document. HIGH (decision needed)

Three documents, three positions:

| Source | Position on i18n |
|---|---|
| page-inventory.md | Language variants are "genuinely custom, still quoted separately" |
| feature-tiers.md row 20 | Included at T3, paid add-on at T2 |
| SPEC.md | `i18n` is a top-level config block, listed under T3 "in the schema, built later" |

Implementation reality: a hardcoded `/hi/*` route tree parallel to the English tree, switched per
client by `i18n.locales` containing `hi` (`lib/i18n.ts`). That is closest to feature-tiers row 20,
but nobody wrote down that design. Consequences that need decisions and then tests:

1. **Partial coverage.** English has about, areas, careers, estimate, journal, locations, news,
   portfolio, projects, services, team, privacy, terms, thank-you, 404. Hindi has 9 routes: home,
   about, estimate, locations (index), portfolio (index + slug), projects/[category],
   services/[slug], team (index). Missing: careers, journal, news, `/team/[slug]`,
   `/locations/[office]`, `/areas/[locality]`, legal pages, thank-you. What happens when a Hindi
   user hits an untranslated route must be defined (redirect to English? 404?) and tested.
2. **hreflang/canonical pairing.** The Hindi home page emits `alternates.languages` for en/hi.
   Whether every paired route does the same is unverified.
3. **Who decides a client gets Hindi?** If it is purely `i18n.locales` in JSON, that satisfies the
   no-code-change acceptance test. Confirm no Hindi string is hardcoded in any component -
   `check:hardcode` may not catch Devanagari literals depending on its patterns.
4. **Translation source.** `loadPublicClientConfigForLocale` implies translated config content.
   Where does the Hindi copy come from - a parallel block in client JSON, or machine translation?
   The docs are silent; sample-content rules apply doubly in Hindi.

---

## C. Schema/config divergences

### C1. A fourth tier, `t0`, exists in code and nowhere else. LOW

`backend/src/config/schema.ts`: `TIERS = ['t0', 't1', 't2', 't3']`. Every business document
insists on exactly three tiers ("three tiers only - no cheap tier"). `clients/minimal.json` is a
`t0` fixture. If `t0` means "internal smoke-test fixture, not sellable", write that next to the
type. If it is anything else, it resurrects the sub-₹10k tier the docs killed twice.

### C2. Section registry vs schema superset - expected state, recorded for completeness

All 16 sections from SPEC section 4 ("Built now") are registered: hero, quickActions, trustBar,
services, portfolio, about, process, testimonials, instagram, faq, contact, map, footer, ctaBand,
stickyMobileCta, team. The registry's `hasContent` map already anticipates unbuilt sections
(awards, beforeAfter, reviews-adjacent keys like journal, news, careers, caseStudy, locations) -
harmless forward preparation, matching "build narrow, type wide".

### C3. `/demo-editor` and `[...path]`

A `demo-editor` directory sits in the site route group with no page file found at review time, and
the `[...path]` catch-all immediately calls `notFound()`. Neither appears in docs. Likely dead or
half-removed; confirm and delete or document. The catch-all behaviour itself is correct (unknown
paths become the styled 404).

---

## D. Spec requirements that look satisfied in code (verify at runtime anyway)

These matched during static reading, but they are behavioural claims, so the workbook's manual
passes are their real verification:

1. **Payment gate** (SPEC section 6): middleware blocks custom domains unless `status: "live"`,
   returns 410 for archived, sets `x-robots-tag: noindex, nofollow` on blocked responses, and the
   layout independently sets `robots: { index: false }` when `seo.noindex` is set. Watermark on
   demo/sold builds could not be confirmed statically.
2. **Render-null rule**: enforced centrally in `renderableSections` - unregistered, absent block,
   `enabled: false`, or empty content array all skip the section. Matches AGENTS.md and SPEC
   section 4 exactly. Per-section visual confirmation still needed on all three fixtures.
3. **No hardcoded strings**: enforced by `check:hardcode` / `check:public-content`; the single
   sanctioned `style` attribute is the tenant layout injecting token variables.
4. **Variant resolution**: explicit `block.variant` wins, else the identity default from
   `getTokenSet(template)` - the two-axis mechanism works as specified.
5. **Hero variants**: standard, full-bleed, video, split components all exist, matching SPEC
   section 4.

---

## E. Open questions this exercise should close

1. Is the dashboard a keep (update SPEC.md section 1) or a park (feature-flag it off)?
2. What is `t0` for, in one written sentence?
3. Which pages must exist in Hindi, and what is the fallback for the rest?
4. Are `/portfolio`, `/projects`, `/locations` index pages wanted (document them) or not (cut them)?
5. Where does the demo watermark actually render, and is it on every viewport?
6. Do `/panel` (owner self-edit) and `/dashboard/content` overlap in purpose? Two content-editing
   surfaces is one more than the docs describe.

---

## F. Suggested order of operations

1. Resolve E1-E6 with one-line decisions appended to SPEC.md's "Conflicts, resolved" table.
2. Run the workbook's Page QA pass on `ashish-interiors` (t3 demo, richest fixture) first; it
   exercises the most surface per hour.
3. Then `minimal.json` (t0) to prove the render-null rule, then `stress.json` for variant coverage.
4. File every Fail from the workbook into the Defect log sheet with a screenshot path under
   `design/actual/<section>/`.
