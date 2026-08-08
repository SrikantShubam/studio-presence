# Master scope — T3 as the superset build

**Strategy: build T3 first.** T1 and T2 are config subsets of it, and templates A/B/C are token swaps
over it. Build the full thing once; everything else is switches.

This is the right call architecturally — retrofitting a dashboard, a section library, or a design-token
system into a template built without them is more expensive than building them in from the start.

**The trade, stated once:** first revenue moves out by roughly two months. ~8–12 weeks to a complete
T3 versus ~3–4 weeks to a sellable T1 demo. Accepted.

---

## The architecture that makes strip-down work

Two independent axes. Keep them independent and everything else follows.

| Axis | Controls | Values |
|---|---|---|
| **Sections on/off** | Tier | T1 · T2 · T3 |
| **Design tokens + section variants** | Template identity | A Editorial · C Premium |

A tier is a set of sections switched on. A template is a set of tokens and variant choices. Neither
touches code. If changing tier or template ever requires a code change, the architecture has failed —
that is the single test that matters.

---

## 1. Plumbing (build first, everything depends on it)

| # | Item | Notes |
|---|---|---|
| 1.1 | Next.js App Router monorepo | |
| 1.2 | Multi-tenant middleware | `Host` header → tenant slug → `clients/<slug>.json` |
| 1.3 | **Full T3 config schema** | The superset. Every section flag, every content field, every tier and template selector. Extend `config-schema.md` to T3 scope before writing components |
| 1.4 | Schema validation at build | Fails loudly on malformed config; enforces the `noindex` and custom-domain rules |
| 1.5 | Wildcard DNS + cert for `*.vectorveda.online` | |
| 1.6 | Custom domain attach | Gated on `status: "live"` — structural, not procedural |
| 1.7 | **Design token system** | Colour, type scale, spacing, radius, grid rhythm. This is what makes A/B/C cheap. Get it right here or pay three times |
| 1.8 | Component library | Primitives: button, card, image, grid, accordion, slider, modal, form field |
| 1.9 | Image pipeline | Sharp CLI (crop, compress, **strip EXIF/GPS**) + Real-ESRGAN pass |
| 1.10 | Deploy script | Config → subdomain, watermark + `noindex` while demo/sold |
| 1.11 | Lighthouse CI | Score capture per build, exported as the sales PDF |

---

## 2. Section library — the actual product

~28 sections. This is the superset that tiers toggle. Build every one at T3 scope; T1 and T2 simply
turn some off.

### Hero and conversion
| Section | Variants | T1 | T2 | T3 |
|---|---|:--:|:--:|:--:|
| Hero | standard · full-bleed · video · split | ● | ● | ● |
| Quick-actions row | WhatsApp · Call · Directions · Instagram | ● | ● | ● |
| Sticky mobile CTA | | ● | ● | ● |
| CTA band | mid-page and pre-footer | ● | ● | ● |
| Inquiry form | room type · budget · timeline | — | ● | ● |
| **Estimate calculator** | area × home type × finish level → range | — | ● | ● |

### Credibility
| Section | Variants | T1 | T2 | T3 |
|---|---|:--:|:--:|:--:|
| Trust bar | years · projects · areas | ● | ● | ● |
| Services grid | compact · detailed | ● | ● | ● |
| Featured projects | grid · carousel | ● | ● | ● |
| Portfolio grid | filterable by room type | — | ● | ● |
| Before/After slider | | — | ● | ● |
| About + owner | | ● | ● | ● |
| Team grid | | — | ● | ● |
| Team member detail | | — | — | ● |
| Process steps | 4–6 with timelines | ● | ● | ● |
| Testimonials | quote cards · carousel | ● | ● | ● |
| Google reviews | Places API, build-time | — | ● | ● |
| Awards / press strip | | — | ● | ● |
| Case study long-form | narrative blocks: problem · approach · outcome | — | — | ● |

### Instagram
| Section | Variants | T1 | T2 | T3 |
|---|---|:--:|:--:|:--:|
| Instagram strip | horizontal scroll, 6 posts | ● | ● | ● |

### Information
| Section | Variants | T1 | T2 | T3 |
|---|---|:--:|:--:|:--:|
| FAQ accordion | carries `FAQPage` schema | ● | ● | ● |
| Contact + map | | ● | ● | ● |
| Locations / branches | multi-showroom | — | — | ● |
| Video / virtual tour embed | | — | — | ● |
| Company profile download | PDF | — | — | ● |
| Language switcher | | — | ○ | ● |
| Footer | compact · expanded | ● | ● | ● |

---

## 3. Page layouts (19 base)

| Group | Layouts | Count |
|---|---|:--:|
| Client content | `/` · `/portfolio/[slug]` · `/services/[slug]` · `/areas/[locality]` | 4 |
| Interactive | `/estimate` | 1 |
| Generated | `/privacy` · `/terms` | 2 |
| Utility | `/thank-you` · `/404` | 2 |
| System | `sitemap.xml` · `robots.txt` · `opengraph-image` · `manifest` | 4 |
| Client panel | `/panel/login` · `/panel` | 2 |
| Dashboard | `/dashboard/login` · `/dashboard` · `/dashboard/analytics` | 3 |
| | **Total** | **18** |

### Custom additions — built per client, quoted individually
`/locations/[branch]` · `/team` + `/team/[member]` · `/case-studies/[slug]` · `/press` · `/awards` ·
`/careers` + `/careers/[role]` · `/company-profile` · video/tour pages · language variants.

Realistic shipped T3: **23–27 layouts.**

---

## 4. Integrations

| # | Integration | Notes |
|---|---|---|
| 4.1 | WhatsApp deep link | `wa.me` with contextual prefilled message. No API, no cost |
| 4.2 | Google Places reviews | Build-time fetch, 5-review cap, 10k free req/mo |
| 4.3 | Web3Forms | 250/mo per client key |
| 4.4 | Umami | Per-client flag for dashboard access |
| 4.5 | `next-seo` LocalBusiness JSON-LD | |
| 4.6 | Instagram oEmbed | ⚠️ Hand-picked only. Basic Display API dead since Dec 2024 |
| 4.7 | Uptime monitor | |
| 4.8 | Zoho Mail | Domain email |
| 4.9 | Google Business Profile | ⚠️ Manual. Google's policy blocks agency-wide API management |
| 4.10 | Razorpay payment links | |

---

## 5. Client self-serve panel

`/panel/login` (magic link) · `/panel`

Editable: phone/WhatsApp · hero image · portfolio entries · about text · services list · testimonials ·
Instagram post picks.

Not editable: layout, structure, navigation, colours, tier. Content is theirs, structure is ours.

---

## 6. Dashboard — build this LAST, and treat it as separable

`/dashboard/login` · `/dashboard` (lead list) · `/dashboard/analytics`

This is the one piece that is **not** a page template. It needs auth, a datastore, per-client lead
capture and retention rules — a different kind of build with a different failure mode.

**Recommendation: build the other 16 layouts and the full section library first, then the dashboard.**
It is separable by design, so deferring it costs nothing architecturally, and if no T3 prospect
materialises in the first months you haven't sunk weeks into the largest and least reusable component
in the plan.

Everything else in this document is worth building regardless of whether a single T3 ever sells.
The dashboard is not.

---

## 7. Automation pipeline

| # | Step | Tool |
|---|---|---|
| 7.1 | Intake → config JSON | LLM with JSON-mode against the schema |
| 7.2 | Copy generation | Same call, human-reviewed before any demo ships |
| 7.3 | Photo enhancement | Real-ESRGAN + GFPGAN, ~₹15 per portfolio |
| 7.4 | Logo / favicon / OG | Generated, hand-tuned |
| 7.5 | Demo deploy | Config → subdomain, target **under 30 minutes** |
| 7.6 | Outreach personalisation | Playwright renders the prospect into the real template |
| 7.7 | Quality PDF | Lighthouse CI export |
| 7.8 | Orchestration | Self-hosted n8n (Sustainable Use Licence — internal use only) |

---

## Build order

| Phase | Contents | Rough effort |
|---|---|---|
| **1** | Plumbing 1.1–1.11 — schema, multi-tenant, tokens, component library, image pipeline | 1–2 weeks |
| **2** | Section library, all ~28 | 3–4 weeks |
| **3** | 15 non-dashboard layouts, assembled from sections | ~1 week |
| **4** | Integrations 4.1–4.10 | ~1 week |
| **5** | Client panel | ~1 week |
| **6** | Automation pipeline | ~1 week |
| **7** | Template A (Editorial) and C (Premium) tokens | 2–3 days each |
| **8** | **Dashboard** — deferred, on a real T3 sale | 2–3 weeks |

**Phases 1–7 ≈ 8–10 weeks and produce everything sellable at T1 and T2**, in both identities.
Phase 8 waits for evidence.

---

## The strip-down test

When phases 1–8 are done, verify in this order:

1. Set `tier: "t1"` on a T3 config → the site renders as a valid T1 with no code change.
2. Set `tier: "t2"` → valid T2, no code change.
3. Switch `template: "A"` → `"C"` → two distinct identities, same content, no code change.
4. Time a fresh client from intake JSON to live subdomain. **Under 30 minutes.**

If any of these needs a code change, the two-axis architecture didn't hold and it's worth fixing
before selling rather than after.
