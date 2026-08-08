# Studio Presence — documentation

Vector Veda's productized website offering for interior design studios in Tier 2-3 India.

**Current phase: build.** Outreach starts only once GST registration, contracts, and the intern are
all ready. Nothing here should be used for client-facing outreach before then — and no material
should claim GST registration until it actually completes.

---

## Index

### Product
| File | Contents |
|---|---|
| [product/build-todo.md](product/build-todo.md) | **Start here.** Two todo lists — design (yours) and site plumbing (mine), plus the deferred assembler list |
| [product/prompts/](product/prompts/README.md) | **Run these.** One file per page, per identity — `unit-1-editorial/01-home-page.md` etc. Start here |
| [product/design-prompts.md](product/design-prompts.md) | Source document the prompts/ folder was split from. Keep for context, run from prompts/ instead |
| ~~product/image-prompts.md~~ | Superseded — Stitch/ChatGPT section-based approach abandoned in favour of whole-page units above |
| [product/master-scope.md](product/master-scope.md) | T3 as the superset; T1/T2 strip down from it. Plumbing, section library, phases |
| [product/config-schema.md](product/config-schema.md) | The client config JSON schema. Every tier flag and content field |
| [product/feature-tiers.md](product/feature-tiers.md) | The 39-feature tier matrix, build effort, vertical reuse |
| [product/page-inventory.md](product/page-inventory.md) | Every page by tier, system routes, build order |

### Sales
| File | Contents |
|---|---|
| [sales/content-system.md](sales/content-system.md) | **Instagram · YouTube · Journal as one funnel.** One story, four depths; the serialised carousel; formats ranked by leverage |
| [sales/interiors-page-copy.md](sales/interiors-page-copy.md) | Copy deck for the `/studios` page |
| [sales/journal-content-plan.md](sales/journal-content-plan.md) | Journal pillar, categories, first 10 posts, post→outreach mapping |
| [sales/interiors-landing-page.md](sales/interiors-landing-page.md) | Earlier draft copy for `vectorveda.online/interiors` |
| [sales/outreach-scripts.md](sales/outreach-scripts.md) | Segment-specific scripts, objection handling, follow-up sequence |
| [sales/intern-kit.md](sales/intern-kit.md) | Intern onboarding, job scope, pay, compliance limits, tracker discipline |

### Operations
| File | Contents |
|---|---|
| [ops/onboarding-sop.md](ops/onboarding-sop.md) | The fixed delivery sequence, intake, QA checklist, go-live |
| [ops/handover-kit.md](ops/handover-kit.md) | Loom script, client self-serve boundaries, exit handover, Day 90 |
| [ops/compliance-calendar.md](ops/compliance-calendar.md) | Filing dates, TDS routine, foreign-SaaS reverse charge |

### Legal
| File | Contents |
|---|---|
| [legal/services-agreement.md](legal/services-agreement.md) | Client contract draft — **needs a lawyer's review before first use** |
| [legal/partnership-deed-checklist.md](legal/partnership-deed-checklist.md) | Deed clauses, why partnership over LLP, registration order |

### Finance
| File | Contents |
|---|---|
| [finance/pricing-and-negotiation.md](finance/pricing-and-negotiation.md) | Tiers, concession ladder, payment gate, unit economics |
| [finance/README.md](finance/README.md) | Tax structure — open questions, handled in a separate session |

### Superseded
`studio-intake-form.md` and `studios-landing-page.md` were written for the fitness/yoga studio
vertical before interior design was confirmed as v1. Kept for when the second vertical opens; the
current equivalents are `ops/onboarding-sop.md` and `sales/interiors-landing-page.md`.

Prior strategy work is in `../Studio_Presence_System_Complete.zip` — positioning, segments, and the
Hermes targeting spec. Still valid; this documentation set builds on it.

---

## The five things that carry the business

1. **The config schema.** One JSON file per client, tiering by flag. If a site ever needs a code
   change to ship, the model is broken.
2. **The payment gate.** No work before the 50% clears; no custom domain before the balance clears.
   Structural in the deploy pipeline, not a matter of discipline. Never waived, not once.
3. **The fixed delivery order.** Config → photos → generate. Letting clients bounce between stages
   is exactly where scope creep enters.
4. **The 30-minute build target.** Time a fresh demo from JSON to live subdomain. Under 30 minutes
   and the economics work. Over two hours and ₹12,000 is a loss-maker.
5. **The scope line.** Verbatim in every contract. Content changes are included; structural changes
   are quoted.

---

## Build order

1. Config schema and validation
2. Interior design template, config-driven
3. Multi-tenant routing, wildcard subdomains, watermarked demos
4. SEO schema, sitemap, privacy/T&C, Umami
5. Sharp CLI + Real-ESRGAN photo pipeline
6. Lighthouse CI
7. Self-serve mini-panel
8. Three demo sites
9. Landing page — gated on GST
10. Tier 3 dashboard — only after 3–5 real closes

Steps 1–8 can proceed now. Step 9 waits for GST. Step 10 waits for evidence.
