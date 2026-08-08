# Studio Presence — build todo lists

## Context

Business, pricing, legal and ops docs are complete in `C:\work\studio presence\docs\`.
This is the product build.

**Strategy:** build T3 as the superset; T1/T2 are config subsets; templates A/C are token swaps.

**Division of labour**
| Who | Owns |
|---|---|
| You | Design direction, inspiration sourcing, frontend implementation, business inputs |
| Me | Section components, config schema, plumbing, integrations, validation |
| Small model | Assembles demo configs + copy from a lead record |
| Hermes | Fetches logos, photos, business data |

**Three plumbing phases.** List 2 below is the site plumbing. List 3 (demo assembler) comes after
list 2 is working — it has no value until there is a site to assemble.

---

## Corrections from review

| Item | Was | Now |
|---|---|---|
| `/portfolio/[slug]` | "~6 URLs" | **Unlimited.** It's a `[slug]` route; T3 especially should have no cap |
| `/services/[slug]` | T2 core | **Cut from core.** Optional add-on, only when the client has real distinct content per service |
| `/areas/[locality]` | T2 core | **Cut from core.** Same. Removes doorway-page risk from the default product |
| Instagram | "Hand-picked embeds only, API dead" | **Partly wrong.** The *feed* API is dead (Basic Display API shut down Dec 2024) — that part stands, there is still no way to auto-pull a client's latest posts. But `graph.facebook.com/instagram_oembed` works for rendering a specific post/reel/profile URL the owner already picked — 1,000 req/hr, needs a Meta app token, public accounts with embeds enabled only. Doesn't change the product: still hand-picked, owner pastes URLs via the panel, never an auto-pulled feed. ⚠️ Persisting or deriving from the returned metadata is explicitly prohibited — render their embed HTML, never build our own gallery from their data |
| GBP | "Manual" | Template + on-the-fly model-generated content, published manually. Cuts turnaround; the publishing step stays human because Google blocks agency-wide API management |

**Revised layout counts: T1 = 12 · T2 = 13 · T3 = 16 base** (+ optional add-ons, + custom pages).

---

# TODO LIST 1 — Pages and sections (design / inspiration)

Your side. The unit that matters for inspiration-hunting is the **section**, not the page — the home
page is twelve sections and that's where nearly all the design work sits.

## 1A. Home page sections (12) — the bulk of the work

| # | Section | What it must do | Inspiration to look for |
|---|---|---|---|
| 1 | Hero | Studio name, one-line positioning, one strong image, primary CTA | Interior/architecture studio sites; 4 variants needed: standard, full-bleed, video, split |
| 2 | Quick-actions row | WhatsApp · Call · Directions · Instagram. Large tap targets, directly under hero | Link-in-bio pages, restaurant mobile sites |
| 3 | Trust bar | Years active · projects · areas served. Three numbers | Agency sites, "by the numbers" strips |
| 4 | Services grid | 3–6 services, compact and detailed variants | Service-business cards, icon grids |
| 5 | Featured projects | 6 projects → detail pages. Grid and carousel variants | Portfolio grids, editorial project cards |
| 6 | About + owner | Photo, story, credentials | Founder-led studio pages |
| 7 | Process steps | 4–6 stages with timelines. Addresses the "will they disappear" fear | Timeline/stepper patterns |
| 8 | Testimonials | Cards and carousel variants | Review sections, quote cards |
| 9 | Instagram strip | Horizontal scroll, 6 posts | Feed strips, brand social sections |
| 10 | FAQ accordion | 5–6 questions, `FAQPage` schema | Accordion patterns |
| 11 | Contact + map | Phone, WhatsApp, address, hours, embedded map | Local business contact blocks |
| 12 | Footer | Compact and expanded variants | — |

**Also global:** sticky mobile CTA · mid-page CTA band · pre-footer CTA band · anchor navigation

## 1B. Additional sections (T2/T3)

| # | Section | Tier | Notes |
|---|---|:--:|---|
| 13 | Portfolio grid, filterable | T2 | Filter by room type |
| 14 | Before/After slider | T2 | Disproportionately persuasive in this vertical |
| 15 | Google reviews | T2 | Build-time fetch, 5-review cap |
| 16 | Awards / press strip | T2 | |
| 17 | Inquiry form | T2 | Room type · budget · timeline |
| 18 | Team grid | T2 | |
| 19 | Team member detail | T3 | |
| 20 | Case study long-form | T3 | Problem · approach · outcome. Editorial register |
| 21 | Locations / branches | T3 | Multi-showroom firms |
| 22 | Video / virtual tour | T3 | |
| 23 | Company profile download | T3 | PDF |
| 24 | Language switcher | T3 | |

## 1C. Pages to design

| # | Page | Tier | Design weight |
|---|---|:--:|---|
| 1 | `/` Home | T1 | **Heavy** — 12 sections above |
| 2 | `/portfolio/[slug]` Project detail | T1 | **Heavy** — photo-led, unlimited projects |
| 3 | `/estimate` Estimate calculator | T2 | **Heavy** — interactive, 3 inputs → range + CTA |
| 4 | `/panel` Client editor | T1 | Medium — functional, not marketing |
| 5 | `/panel/login` | T1 | Light — magic link |
| 6 | `/thank-you` | T1 | Light |
| 7 | `/404` | T1 | Light — but never a framework default |
| 8 | `/privacy` | T1 | Light — generated |
| 9 | `/terms` | T1 | Light — generated |
| 10 | `/dashboard/login` | T3 | Deferred |
| 11 | `/dashboard` Leads | T3 | Deferred |
| 12 | `/dashboard/analytics` | T3 | Deferred |

**Optional add-ons** (only when a client has real content): `/services/[slug]` · `/areas/[locality]` ·
`/team` · `/case-studies/[slug]` · `/press` · `/awards` · `/locations/[branch]` · `/company-profile`

## 1D. Template identities

| Identity | Character | Build order |
|---|---|:--:|
| **A — Editorial** | Portfolio-led, magazine feel, generous type, structured grid. Also the base for T3 custom | 1st |
| **C — Premium** | Large imagery, heavy whitespace, restrained palette, slow reveal | 2nd |

Templates are **design token sets + section variant choices**, not separate codebases. A and C are
2–3 days each once the token system exists.

## 1E. System-wide design decisions needed

- [ ] Type scale and font pairing (per identity)
- [ ] Colour token structure — how a client's palette is derived from their logo
- [ ] Spacing scale and grid rhythm
- [ ] Corner radius, border, shadow conventions
- [ ] Image aspect ratios (portfolio, hero, gallery, thumbnails)
- [ ] Mobile breakpoints
- [ ] Loading and empty states
- [ ] Sample-content styling — how demo placeholders read as visibly sample
- [ ] Watermark treatment for demo sites
- [ ] Dark mode: yes or no *(recommend no for v1 — extra QA surface, no client demand)*

---

# TODO LIST 2 — Site plumbing (backend)

My side. Everything the site needs to run before any assembler exists.

## 2A. Foundation
- [ ] Next.js App Router monorepo, TypeScript
- [ ] Repo structure: `app/` · `components/` · `sections/` · `lib/` · `clients/` · `scripts/`
- [ ] Tailwind + token layer wired to CSS variables
- [ ] Git repo, private, per-client configs committed

## 2B. Config system — do this first, everything depends on it
- [ ] **TypeScript types for the full T3 config schema** (superset)
- [ ] **JSON Schema file** — machine-readable, will later constrain the assembler
- [ ] Runtime validation (Zod or valibot) with readable error messages
- [ ] Tier resolution: `tier` sets section defaults, explicit blocks override
- [ ] Template resolution: `template` selects token set + section variants
- [ ] Config loader with defaults merge
- [ ] Build-time validation gate — fail loudly, never render a broken config

## 2C. Multi-tenancy
- [ ] `Host` header → tenant slug middleware
- [ ] Rewrite to `/[subdomain]/...`
- [ ] Wildcard DNS for `*.vectorveda.online`
- [ ] Wildcard certificate
- [ ] Custom domain attach script (Vercel Domains API)
- [ ] **`status` gate** — `demo`/`sold` cannot attach a custom domain. Structural, not procedural
- [ ] `noindex` + watermark enforced whenever status is not `live`

## 2D. Design token system
- [ ] Token schema: colour, type scale, spacing, radius, grid
- [ ] Three token sets (A, B, C)
- [ ] Per-client palette override
- [ ] CSS variable generation from tokens

## 2E. Component library
- [ ] Primitives: button, card, image, grid, accordion, slider, modal, form field, badge
- [ ] **Section registry** — maps config keys to section components
- [ ] Section variant resolution
- [ ] Responsive image component wrapping `next/image`

## 2F. Sections
- [ ] Build all 24 sections from list 1A + 1B
- [ ] Each reads config, renders nothing when disabled
- [ ] Each supports its variants
- [ ] Sample-content mode for `status: demo`

## 2G. Pages
- [ ] 12 T1 layouts
- [ ] `/estimate` calculator logic — client-side, config-driven rate table
- [ ] Optional add-on layouts (services, areas, team, case studies)

## 2H. SEO and system routes
- [ ] `next-seo` LocalBusiness JSON-LD
- [ ] `FAQPage` schema on FAQ section
- [ ] `app/sitemap.ts` generated from config
- [ ] `robots.txt` respecting `status`
- [ ] Dynamic `opengraph-image` per page
- [ ] `manifest.webmanifest` + favicon generation
- [ ] Per-page meta from config

## 2I. Integrations
- [ ] `wa.me` helper — contextual prefilled message per page
- [ ] Click-to-call
- [ ] Google Places API — build-time review fetch, cached per revalidate
- [ ] Web3Forms — per-client access key from env
- [ ] Form → email + WhatsApp notification
- [ ] Umami embed, per-client dashboard flag
- [ ] **Instagram oEmbed** — Meta app + token, profile and post embeds, no metadata persistence
- [ ] Google Maps embed
- [ ] UptimeRobot registration script

## 2J. Image pipeline
- [ ] Sharp CLI: crop to aspect ratios, compress, WebP/AVIF, **strip EXIF/GPS**
- [ ] Real-ESRGAN pass for low-quality photos
- [ ] GFPGAN for photos containing people
- [ ] Batch runner over a client photo dump

## 2K. Client panel
- [ ] Magic-link auth
- [ ] Edit API — phone, hero image, portfolio entries, about, services, testimonials, IG picks
- [ ] Writes back to client config
- [ ] Revalidation trigger on save
- [ ] Scope lock: no layout, structure, colour or tier edits

## 2L. Build, deploy, QA
- [ ] Deploy script: config → subdomain
- [ ] Lighthouse CI wired to deploys
- [ ] PageSpeed PDF export
- [ ] Broken-link checker
- [ ] Placeholder-text scanner (`Lorem`, `TODO`, `{{`)
- [ ] Pre-go-live checklist automation

## 2M. Vercel and infra
- [ ] Vercel project, **Pro plan before first paid go-live** (Hobby forbids commercial use)
- [ ] Environment variables per integration
- [ ] Preview deploys
- [ ] Verify wildcard-domain plan requirements
- [ ] Verify deploy-count limits against bulk demo generation

---

# TODO LIST 3 — Demo assembler plumbing (later)

Build after list 2 works. No value until there's a site to assemble. Recorded here so the schema
work in 2B anticipates it.

- Hermes lead record → config field mapping
- Logo fetch; typographic wordmark fallback where none exists
- Palette extraction from logo or photos
- Photo fetch → image pipeline → aspect-ratio sorting
- Small-model structured output against the JSON Schema from 2B
- Copy generation: headline, service blurbs, about, meta, FAQ
- **Fact guardrail validator** — fields marked `factual: true` may be visibly-sample at
  `status: demo`, must be real or absent at `status: live`
- Validation retry loop, errors fed back to the model
- Slug generation and collision check
- GBP content generation from template
- Automated pre-send gate: Lighthouse · links · placeholders · unresolved factual fields ·
  `noindex` · watermark · WhatsApp link resolves
- n8n orchestration
- Playwright screenshot + walkthrough video for outreach

---

## Verification (after list 2)

1. Second `clients/*.json` → both subdomains render distinct content, one deploy, no code change.
2. `tier: t3` → `t2` → `t1` on one config → three valid sites, no code change.
3. `template: B` → `A` → `C` → three identities, same content, no code change.
4. Unlimited portfolio entries render correctly.
5. `demo` config cannot attach a custom domain.
6. Lighthouse mobile ≥90 perf, ≥95 SEO on all three templates.
7. `LocalBusiness` and `FAQPage` schema validate in Google Rich Results Test.
8. WhatsApp CTA prefills correctly on a real phone.
9. Sharp pipeline strips EXIF/GPS.
10. Intake JSON → live subdomain in **under 30 minutes**.

Failures in 2, 3 or 10 mean the two-axis architecture didn't hold. Fix before selling.

---
