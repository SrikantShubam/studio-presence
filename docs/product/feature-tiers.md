# Feature tiers

> **Superseded as a build instruction.** `docs/product/SPEC.md` is the spec of record;
> where this file disagrees with it, SPEC.md is correct. Kept for the reasoning.

Working reference for what each tier includes. Every row maps to a flag in
`config-schema.md`. Tiering is editing JSON — never editing code.

Legend: ● included · ○ paid add-on · — not available

---

## The matrix

| # | Feature | T1 ₹15k | T2 ₹25k | T3 ₹45–55k |
|---|---|:--:|:--:|:--:|
| **Conversion** ||||
| 1 | Sticky WhatsApp CTA (prefilled contextual message) | ● | ● | ● |
| 2 | Click-to-call button | ● | ● | ● |
| 2b | Quick-actions row (WhatsApp · Call · Directions · Instagram) | ● | ● | ● |
| 2c | Estimate calculator (`/estimate`) | — | ● | ● |
| 3 | Smart inquiry form (room type / budget / timeline) | — | ● | ● |
| 4 | Lead notification to owner (email + WhatsApp) | — | ● | ● |
| 5 | WhatsApp Cloud API auto-reply / automation | — | ○ | ● |
| **Credibility** ||||
| 6 | Hero + positioning block | ● | ● | ● |
| 7 | Project/portfolio grid | ● | ● | ● |
| 8 | Project detail pages | — | ● | ● |
| 9 | Before/After slider | — | ● | ● |
| 10 | Testimonials block | ● | ● | ● |
| 11 | Google reviews block (build-time fetch) | — | ● | ● |
| 12 | Team / designer bio | ● | ● | ● |
| 13 | Awards / press strip | — | ● | ● |
| **Discovery** ||||
| 14 | LocalBusiness JSON-LD schema | ● | ● | ● |
| 15 | sitemap / robots / per-page meta | ● | ● | ● |
| 16 | Google Business Profile setup + optimisation | ● | ● | ● |
| 17 | Google Search Console setup | — | ● | ● |
| 18 | ~~Blog / articles~~ — **not building**, see `page-inventory.md` | — | — | — |
| 19 | Deeper on-page SEO + service-area pages | — | ● | ● |
| 20 | i18n (Hindi / regional) | — | ○ | ● |
| **Trust / ops** ||||
| 21 | Privacy policy + T&C + data-retention line | ● | ● | ● |
| 22 | Domain email (Zoho free tier) | ● | ● | ● |
| 23 | Umami installed (disclosed, no client access) | ● | ● | — |
| 24 | Uptime monitor | ● | ● | ● |
| 25 | Lighthouse/PageSpeed score PDF | ● | ● | ● |
| 26 | Google Maps embed + directions | ● | ● | ● |
| **Client control** ||||
| 27 | Self-serve mini-panel (phone, hero, gallery, about) | ● | ● | ● |
| 28 | Loom handover walkthrough video | ● | ● | ● |
| 29 | Contentful CMS (we create + invite their account) | — | ● | ● |
| **Growth** ||||
| 30 | Multi-tenant lead dashboard | — | — | ● |
| 31 | ~~Full Umami dashboard access~~ — **cut**, redundant with the analytics screen. One owner-facing dashboard, not two; see `prompts/admin-universal/04-dashboard-analytics.md` | — | — | — |
| 32 | Automated review-request flow | — | — | ● |
| 33 | Instagram strip on home (hand-picked embeds) | ● | ● | ● |
| 33b | ~~Dedicated `/instagram` gallery page~~ — **cut**, duplicates the portfolio grid and produces no indexable content; see `prompts/README.md` | — | — | — |
| **Commercial terms** ||||
| 34 | Domain + hosting, year 1 | ● | ● | ● |
| 35 | Domain/hosting renewal, year 2+ | ₹1,500–2,500/yr | ₹1,500–2,500/yr | ₹1,500–2,500/yr |
| 36 | Setup fee if client brings own domain/host | small fee | waived | waived |
| 37 | Layout / structural / look-and-feel changes | ○ | ○ | ○ |
| 38 | Handover if they leave (code+content export) | flat ₹5,000–8,000, all tiers | ← | ← |
| 39 | Ongoing SEO / ads / social | ○ | ○ | ○ |

---

## Tier positioning

**Three tiers only.** A sub-₹10k tier was considered and dropped — it cannibalises T1, gives the
intern a perverse incentive, and adds support relationships that scale with client count rather than
revenue. See `page-inventory.md`.

**T1 — Presence, ₹15,000 (floor ₹12,000).** The core product. A real multi-section site with the
conversion path, GBP setup, and schema. This is what most clients buy.

**T2 — Presence Plus, ₹25,000 (floor ~₹20,000).** Adds the things that need client cooperation
(reviews, Instagram, inquiry form) and the things that compound (blog, service-area pages, Search
Console). Setup fee waived here — that waiver is a negotiation lever, use it.

**T3 — Growth, ₹45,000–55,000.** Only sell this to a client who has articulated lead-tracking pain
unprompted. **Do not build the T3 dashboard until a real prospect asks for it** — it's the largest
build in the plan and the hardest thing to hand off later.

---

## Build effort

🟢 near-zero (config only) · 🟡 build once, reusable forever · 🔴 custom, always a change order

Everything in rows 1–29 is 🟢 or 🟡 once the template exists. Rows 30–32 are the 🟡 T3 build.
Row 37 is 🔴 by definition — that's the scope line.

**The scope line, verbatim, for every contract:**
> Included: adding new content blocks within existing pages (e.g. an "Awards" section on your About
> page, a new project entry in your portfolio). Requires Presence Plus pricing: adding an entirely
> new page (e.g. a standalone "Awards" page, a new "Team" page) or restructuring site navigation.

---

## Vertical reuse

The same template serves other verticals by changing copy and toggling sections. No new build.

| Vertical | Portfolio becomes | Extra emphasis | Drop |
|---|---|---|---|
| Interior design (v1) | Project gallery | Before/After, awards | — |
| Architects | Project gallery | Before/After, credentials | — |
| Yoga / dance studios | Class photos | Timetable block, trial-class CTA | Before/After |
| Salons / spas | Work gallery | Price list, booking | Before/After |
| Photographers | Portfolio | Package pricing | Before/After |

Timetable and price-list blocks don't exist yet — build them when the second vertical is real,
not before.
