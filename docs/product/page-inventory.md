# Page inventory and tier composition

## Terminology

| Term | Means |
|---|---|
| **Template** | One complete site design — a whole visual identity with all its pages inside it. The unit the client sees and buys |
| **Page layout** | One page type inside a template — home, project detail, contact |
| **Section** | A block within a page. Tiering mostly happens here |
| **URL** | What Google indexes. One `/portfolio/[slug]` layout produces six URLs if the client has six projects |

The client picks a **tier**, then chooses from **2–3 base templates**. The demo the intern sends is
one of those templates with their name, logo and photos already in it.

**Moving up a tier changes the layout, not just the content.** T2 is not T1 with sections bolted on —
it is a visibly richer design. The client can *see* what ₹25,000 buys over ₹15,000 instead of being
told. A tier upgrade you can point at closes far better than one you have to explain.

---

## Three tiers only — no cheap tier

**T1 ₹15,000 · T2 ₹25,000 · T3 ₹45,000–55,000.** A sub-₹10k tier was considered and dropped.

The case against a cheap tier, in order of weight:

1. **Cannibalisation.** A prospect who would have paid ₹15,000 takes the ₹5,000 option the moment
   it's offered. You don't win the ones who'd have said no — you discount the ones who'd have said
   yes. With 1,500 leads and one founder, protecting average deal value beats raising conversion
   count.
2. **Perverse incentive for the intern.** A cheap tier closes in a fraction of the effort. Even at a
   lower commission, per-hour it can out-earn chasing a real deal — so the intern optimises toward
   the tier that damages the business.
3. **Support burden scales with client count, not revenue.** Forty-five clients at a higher average
   is strictly better for a founder-bottlenecked business than sixty at a lower one. Every extra
   client is a permanent support relationship regardless of what they paid.
4. **Brand.** "Starting at ₹15,000" positions differently from "from ₹3,000." In a market where the
   entire pitch is *we're a real firm, not a freelancer who vanishes*, the floor price is part of the
   argument.

**Consequence for negotiation: there is no downsell.** ₹12,000 is a real floor with nothing beneath
it, so below that the answer is no. That's harder discipline, and it's the right kind.

---

## Margin per founder-hour

| Tier | Price | COGS | Intern 33% | Net | Founder hours | **Net per hour** |
|---|---:|---:|---:|---:|---:|---:|
| T1 | ₹15,000 | ₹800 | ₹4,950 | ₹9,250 | 2.5 | **₹3,700** |
| T2 | ₹25,000 | ₹800 | ₹8,250 | ₹15,950 | 5.5 | **₹2,900** |
| T3 | ₹50,000 | ₹1,500 | ₹16,500 | ₹32,000 | 30 | **₹1,067** |

*Founder hours include build, review rounds and go-live — not sales.*

**T1 is the best hourly rate in the ladder, and T3 is 3.5× worse.** The big custom project feels
like the win and is the least efficient thing you can do with your time.

- **Build the business around T1 volume.** It is both the easiest sell and the highest return per
  hour.
- **Take T3 selectively** — when the client is a strategic reference or genuinely low-friction. It
  is not the prize it looks like.
- T2 is the natural upgrade, not the target. Sell it where the client has the content to justify it.

---

## T1 — "Presence" · ₹15,000

Full site. Long home page with anchor navigation plus project detail pages.

### Home sections
| # | Section | Notes |
|---|---|---|
| 1 | Hero | Image, headline, primary CTA |
| 2 | **Quick actions row** | WhatsApp · Call · Directions · Instagram. Large tap targets, directly under the hero. Most visitors arrive from an Instagram bio link and want to contact, not read |
| 3 | **Trust bar** | Years active · projects completed · areas served. Three numbers, high impact, near-zero effort |
| 3 | Services grid | 3–6 with short descriptions |
| 4 | Featured projects | 6, linking to detail pages |
| 5 | About + owner photo | Does more conversion work than expected in this vertical |
| 6 | **Process** | 4 steps with timelines. Addresses the real fear — the contractor who takes money and disappears |
| 7 | Testimonials | 2–3 with name and area |
| 8 | **Instagram strip** | 6 posts, horizontal scroll, link to profile |
| 9 | FAQ | 5–6 questions. Also carries `FAQPage` schema |
| 10 | Contact + map | |
| 11 | Footer | |

### Page layouts (12)
| Group | Layouts |
|---|---|
| Client content (2) | `/` · `/portfolio/[slug]` |
| Generated (2) | `/privacy` · `/terms` |
| Utility (2) | `/thank-you` · `/404` |
| System (4) | `sitemap.xml` · `robots.txt` · `opengraph-image` · `manifest` |
| Panel (2) | `/panel/login` · `/panel` — **universal, not themed** |

**Live URLs:** ~10 · **Layouts needing client content: 2**

---

## T2 — "Presence Plus" · ₹25,000

Richer layout treatment plus four new pages.

### Home sections — upgraded
Everything in T1, with these changes:
| # | Change | Notes |
|---|---|---|
| 1 | Hero → **full-bleed, optional video** | The single most visible tier difference |
| 2 | **Before/After slider section** | Cheap to build, disproportionately persuasive in this vertical |
| 3 | **Google reviews block** | Places API, fetched at build time |
| 4 | **Awards / press strip** | |
| 5 | **Estimate CTA band** | Drives to `/estimate` |
| 6 | Portfolio grid → larger, filterable by room type | |

### New pages (3)
| Route | Page | Why a page, not a section |
|---|---|---|
| `/estimate` | **Estimate calculator** | Interactive; cannot be a section. See below |
| `/services/[slug]` | Service detail — ~4 URLs | "Modular kitchen design in Patna" is a real search a homepage section cannot rank for |
| `/areas/[locality]` | Service-area — ~5 URLs | How Tier 2-3 local search is actually won |

⚠️ **`/instagram` was cut.** It duplicated the portfolio grid, produced no indexable content
(embeds are iframes), and — decisively — since there is no live feed at any tier, a whole page of
hand-picked embeds goes stale and *undermines the one thing Instagram is there to prove*. Instagram
is a home-page strip only, at every tier. See "Instagram strategy by tier" below.

**Layouts:** 15 · **Live URLs:** ~19

---

## T3 — "Growth / Custom" · ₹45,000–55,000

### Build it on Editorial, not from scratch

T3's problem is that "custom" invites a from-zero build, which is how it ends up at ₹1,067 per
founder-hour — the worst rate in the business.

**Fix: T3 is template A (Editorial) extended, not a blank page.** Bigger firms want the editorial
register anyway — long-form case studies, generous type, structured grids, a company that looks
established. Starting from A rather than nothing cuts the build roughly in half and keeps T3 inside
the same config schema, which is also what makes it handoff-able later.

"Custom" then means *custom sections and custom pages on a known foundation* — not a bespoke
codebase. Say it that way in the pitch; nobody at this price point is asking for a rewrite, they're
asking to not look like a template.

### The 26 base layouts — agency-grade

T3 is not "T2 plus a dashboard". That was too thin to justify the tier, and it made T3 hard to
describe. T3 is the **agency-grade site**: a categorised portfolio, the team, press coverage, a
working journal, careers, and multiple offices — the page set that [BAMO](https://bamo.com/) and
[Tredi](https://www.trediinteriors.com/) actually run.

| Group | Layouts | Count |
|---|---|:--:|
| Client content | `/` · `/portfolio/[slug]` · `/projects/[category]` · `/services/[slug]` · `/areas/[locality]` | 5 |
| **Practice** | `/team` · `/team/[slug]` · `/careers` · `/locations/[office]` | 4 |
| **Editorial** | `/news` · `/news/[slug]` · `/journal` · `/journal/[slug]` | 4 |
| Interactive | `/estimate` — optional, config-gated | 1 |
| Generated | `/privacy` · `/terms` | 2 |
| Utility | `/thank-you` · `/404` | 2 |
| System | `sitemap.xml` · `robots.txt` · `opengraph-image` · `manifest` | 4 |
| Client panel | `/panel/login` · `/panel` — **universal** | 2 |
| **Dashboard** | `/dashboard/login` · `/dashboard` (leads) · `/dashboard/analytics` — **universal** | 3 |
| | **Total** | **27** |

Three are config files with nothing to design → **24 designable layouts.**

### The estimate calculator is a gimmick — offer it, don't push it

A light engagement device: three inputs, a ballpark range, a CTA. Some clients like it, some won't.
Available at every tier, `estimate: false` to turn it off.

Worth knowing that neither BAMO nor Tredi runs one — at agency tier many firms prefer to leave
pricing to a conversation. Treat that as a per-client preference, not a rule. The "highest-converting
page on the site" claim in an earlier draft came from Livspace and HomeLane, who are volume players;
it was overstated for this market either way.

### Build for capability, gate by config

Every page type above ships in the template. Whether a given client *uses* one is a config flag —
`journal: false` for a firm that won't publish, `locations: false` for a single-office practice.

This is deliberate. An earlier version of this document argued against building a journal at all on
the grounds that "a Tier 2-3 studio owner will never write blog posts." That reasoned from the
median studio rather than the target one, and it was wrong: a practice running five projects a
month at ₹8–15L each has a marketing function and publishes. Building the capability costs nothing
per client; assuming it away costs the clients who would have used it.

Of these 18, three (`sitemap.xml`, `robots.txt`, `manifest`) are config files with nothing to
design — **15 designable layouts**, covered by 13 prompts, split by audience:

- **9 customer-facing, themed** — `prompts/unit-1-editorial/` (privacy+terms share one prompt)
- **4 owner-facing, universal** — `prompts/admin-universal/`, one design for all four identities
  (`/panel/login` and `/dashboard/login` share one design)

The panel and dashboard are seen only by the studio owner, doing work, so they aren't themed —
theming them would mean 4× the design and build for an aesthetic nobody asked for. That decision
turns 16 admin screens into 4.

### Genuinely custom, still quoted separately

The page types above are now standard T3. These remain per-client work:

| Page | Who asks for it |
|---|---|
| `/company-profile` | Downloadable PDF profile. Common in B2B and commercial interiors |
| Video / virtual tour pages | Firms with walkthrough footage |
| Language variants | Hindi or regional, for commercial work |
| CRM / lead routing integration | Firms already running a sales team |
| Client-portal / project tracking | Firms wanting to show clients live project status |

**T3 shipped size: 27 layouts standard, plus any of the above.**

### ⚠️ Scope control — this is where T3 goes wrong

T3 is the tier that eats margin, and it does it through scope, not price. Two rules:

1. **The page list goes in the contract, by name, before work starts.** Not "a custom website" —
   an enumerated list. Anything not on it is a change order.
2. **Quote the additions individually**, so the client sees each one's cost and self-selects. A
   lump-sum "custom" price invites unlimited asks against a fixed number.

**Do not build the dashboard until a real prospect asks for it.** It is the largest single build in
the plan and the hardest piece to hand to someone else when you step back from this business.

---

## Instagram strategy by tier

Instagram is where this audience already lives, so it earns a place at every level — but the depth
has to match what's maintainable.

| Tier | Instagram treatment | Maintenance |
|---|---|---|
| T1 | Quick-actions row links to profile · horizontal strip section on home, 6 posts | Client updates picks via panel |
| T2 | Above, with a recency signal (latest post date) given real visual weight | Client updates via panel |
| T3 | Same strip, hand-picked — we maintain it instead of the client | Managed |

**A strip, never a page — at every tier.** Instagram's job here is *proof of recency*: a portfolio
can be three years stale and look identical to a fresh one, and this is the only element that shows
the studio is working right now. Since there is no live feed (below), a dedicated gallery page of
hand-picked embeds goes stale and undermines exactly the thing it exists to prove. A home-page strip
does the job and degrades gracefully.

**Design the T1 home page to work as an Instagram bio destination.** That is where most traffic
will actually come from for this audience — the site's first job is to catch someone arriving from
a bio link and get them to WhatsApp, which is why the quick-actions row sits directly under the hero.

⚠️ **There is no live auto-updating feed, at any tier.** Instagram's Basic Display API shut down on
4 December 2024, and the Graph API needs a per-client Business account plus Meta app review —
impossible at a two-day turnaround. Everything above is hand-picked embeds, updated through the
panel.

**Say this plainly in the pitch.** Promising a live feed and shipping a static one is exactly the
kind of small dishonesty that costs a referral in a city where designers talk to each other.

---

## The estimate calculator

`/estimate` — the one genuinely new page worth building.

Livspace and HomeLane built their funnels on this. Visitor enters carpet area, home type and finish
level; gets a range; the CTA captures the lead. It works because it **gives before it asks** — someone
who has just seen "₹4.5–6 lakh for a 2BHK essential package" is qualified and anchored, which also
cuts the tyre-kicker calls designers complain about.

Client-side arithmetic against a per-sq-ft table in config. No backend. About a day of work.

⚠️ Needs a rate table from the designer, and some won't provide one. A wrong number becomes a dispute
later. Always a **range**, never a figure, labelled indicative. If they won't give rates, ship
without it — do not invent numbers on their behalf.

---

## Templates: how many, and when

**6 templates total** — three design identities × two tier treatments. T3 is custom per client and
isn't counted.

| Identity | Character | Suits |
|---|---|---|
| **A — Editorial** | Portfolio-led, magazine feel. Generous type, structured grid, project stories | Established studios with strong photography and a body of work |
| **B — Instagram-centric** | **Grid-first.** The whole page reads like their Instagram: image-dominant, minimal text, square-tile rhythm, fast tap targets, almost no prose | Studios whose entire presence is already Instagram — most of this market |
| **C — Premium** | Large imagery, heavy whitespace, restrained palette, slow reveal | Higher-end studios pitching ₹10L+ projects |

Each exists in a T1 and a T2 treatment: **A-T1, A-T2, B-T1, B-T2, C-T1, C-T2 = 6 templates.**

They share one config schema and one component library, so B and C are restyles of A — roughly
2–3 days each once A exists.

**Identity B is the likely volume seller.** For a designer whose whole business runs through
Instagram, a site that looks and behaves like their feed is an easier yes than one that looks like
a corporate brochure — it feels continuous with what they already have rather than a separate thing
to maintain.

| Stage | Build | Trigger |
|---|---|---|
| **Now** | **Template A only**, all tier treatments | The demo must be good enough that a stranger wants to buy it. One excellent template beats three mediocre ones |
| After 2–3 closes | Template B | **Clone risk.** Two Patna studios with visibly identical sites embarrasses both and damages us. They will notice |
| Client 6+ in a city | Template C | Same |
| First T3 sale | Custom | Never pre-built |

---

## Totals

| Tier | Price | Page layouts | Live URLs | What it is |
|---|---:|:--:|:--:|---|
| T1 | ₹15,000 | 12 | ~10 | A working studio site |
| T2 | ₹25,000 | 15 (T1 + 3) | ~19 | + estimate calculator, service and area SEO pages |
| T3 | ₹45–55k | **27** (T2 + 12) | ~40+ | **Agency-grade** — categorised portfolio, team, press, journal, careers, offices, lead dashboard |

Counts are cumulative — T2's 15 *includes* T1's 12. **24 designable layouts** at full T3; the other
three are config files.

Split by audience: **20 customer-facing** (themed, 4 identities) and **4 owner-facing**
(universal, designed once). Design work at full build = (20 × 4) + 4 = **84 designs**.

**Build now: template A (Editorial), customer-facing pages first.**

---

## Deliberately not building

| | Why |
|---|---|
| **Blog** | A Tier 2-3 interior designer will not write posts. What happens is two posts dated 2026 sitting there forever, which signals abandonment louder than no blog at all |
| Separate about / services / process / FAQ pages | Sections on home. Same content, no extra intake, no navigation drop-off |
| Separate contact page | A page people go to in order to leave. The sticky CTA and contact section do the job |
| Pricing page | Designers resist publishing prices and a hard number invites comparison. The estimate calculator solves it better — a range, contextual, and it captures a lead |
| Careers, newsletter, accessibility statement | No audience, no repeat-purchase cycle, no legal requirement for private SMBs in India |

---

## ⚠️ Doorway pages — before building area or service pages

Five near-identical pages saying "interior designer in [locality]", generated from one template with
swapped place names, is **exactly what Google's doorway-page policy targets**. The penalty lands on
the client's domain, not ours.

**Rule: no area or service page ships without at least one real project and 150+ words of unique
content for it.** If the client can only supply that for two localities, ship two. Two real pages
beat five thin ones and carry no penalty risk.

---

## Build order

**Now — 12 layouts, template A:**
1. Layout shell — header, footer, sticky WhatsApp CTA, anchor nav
2. `/` home, section by section
3. `/portfolio/[slug]`
4. `/privacy`, `/terms`
5. `/thank-you`, `/404`
6. `sitemap.xml`, `robots.txt`, `opengraph-image`, manifest
7. `/panel/login`, `/panel`

**T2** adds `/estimate`, then `/services/[slug]` and `/areas/[locality]` under the content rule above.
**T3** on the first real sale — the three dashboard layouts.

*(Design prompts for all of these, including the T3 dashboard, already exist in
`prompts/unit-1-editorial/`. Designing the dashboard was decoupled from building it: designing costs
one prompt, building costs three weeks.)*

Every page reads content from `config-schema.md`. If a page needs a code change to serve a different
client, the model is broken — that is the test.
