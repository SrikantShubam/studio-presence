# SPEC — the single spec of record

**This file wins.** Where any other document in `docs/` disagrees with this one, this one is
correct and the other is history. The rest of `docs/` is background: how decisions were reached,
pricing logic, sales scripts, design briefs. Useful reading, not build instructions.

Written because the older docs contradict each other on template naming, layout counts, tier keys
and whether the journal exists. A model generating code anchors on whichever number it reads first,
so there is now exactly one place with one answer.

---

## 1. Scope

| | In scope now | Later |
|---|---|---|
| **Identity** | Editorial only | Premium · Warm Contemporary · Bold Modern |
| **Tier built** | T1 | T2, then T3 |
| **Tier the schema covers** | **T3 — the full superset** | — |
| **Dashboard** | not built | on a real T3 sale |

Editorial is the only identity whose designs exist. The schema is shaped for T3 from day one because
retrofitting a section flag into a schema that never anticipated it is how the two-axis architecture
dies. Build narrow, type wide.

### Template naming — letters are dead

Old docs use `A` / `B` / `C`, disagree about whether `B` exists, and separately name four identity
units. One naming system from here:

```
template: "editorial" | "premium" | "warm-contemporary" | "bold-modern"
```

`editorial` is the former "template A". There is no `B`. `premium` is the former "C". Any `A`/`B`/`C`
in another document is stale.

---

## 2. The architecture — two independent axes

| Axis | Field | Controls |
|---|---|---|
| **Tier** | `tier` | which sections are on |
| **Identity** | `template` | design tokens + which variant of each section renders |

**The acceptance test, and it is the only one that matters:** changing `tier` or `template` in a
client's JSON must never require a code change. If it does, the architecture has failed and that is
worth stopping to fix rather than working around.

---

## 3. Conflicts, resolved

Recorded explicitly so that anyone who reads an old doc and gets a different answer knows which way
it went and why.

| Conflict | Old docs said | **Resolved** |
|---|---|---|
| Template names | A/C · A/B/C · four unit dirs | **Identity slugs**, no letters. `editorial` is the only one built |
| T3 layout count | 26 · 27 · 24 · 18 · 15 | **27 base**, 24 designable (3 are config files with nothing to design) |
| T1 layout count | 12 · 16 | **12** |
| Journal / blog | `feature-tiers.md:18` "not building"; config has `blog`; a T3 journal prompt exists | **Built, T3, config-gated.** `page-inventory.md` reversed the earlier call and gave the reasoning; that reversal stands. Key is `journal`, not `blog` — one name, matching the route |
| `t3` key `i18n` | listed as a tier default, exists nowhere in the schema | top-level `i18n` block. Not a section |
| `t3` key `leadDashboard` | same | `integrations.leadDashboard`. Flag ships; the screens do not, per the Phase 8 deferral |
| `t3` key `reviewRequestFlow` | same | `integrations.reviewRequestFlow`. Real T3 feature (`feature-tiers.md:32`), ops-driven |
| `/instagram` page | a dedicated gallery page | **cut.** Home-page strip only, every tier, hand-picked embeds |
| Umami client dashboard | full Umami access at T3 | **cut.** One owner-facing analytics screen, Umami is the invisible backend |

---

## 4. Section library

`enabled: true` is necessary but not sufficient — a section also renders nothing when its content
array is empty. **A section that cannot decide from config alone whether to render is a bug.**

### Built now (T1)
| Config key | Variants | Design prompt |
|---|---|---|
| `hero` | standard · full-bleed · video · split | `01-home-page.md`, `16-variants.md` |
| `quickActions` | — | `01-home-page.md` |
| `trustBar` | — | `01-home-page.md` |
| `services` | compact · detailed | `01-home-page.md`, `16-variants.md` |
| `featuredProjects` | grid · carousel | `01-home-page.md`, `16-variants.md` |
| `about` | — | `01-home-page.md` |
| `process` | — | `01-home-page.md` |
| `testimonials` | cards · carousel | `01-home-page.md`, `16-variants.md` |
| `instagram` | — | `01-home-page.md` |
| `faq` | — | `01-home-page.md` |
| `contact` | — | `01-home-page.md` |
| `map` | — | `01-home-page.md` |
| `footer` | expanded · compact | `00-shared/global-chrome.md`, `16-variants.md` |
| `ctaBand` | mid-page · pre-footer | `01-home-page.md` |
| `stickyMobileCta` | — | `01-home-page.md` |
| `team` | — | `01-home-page.md` |

### In the schema, built later
**T2** — `portfolio.detailPages` · `beforeAfter` · `reviews` · `awards` · `inquiryForm` · `estimate`
**T3** — `teamDetail` · `caseStudy` · `locations` · `videoTour` · `companyProfile` · `journal` · `news` · `careers` · `i18n`

---

## 5. Layouts

### T1 — 12, built now
`/` · `/portfolio/[slug]` · `/panel` · `/panel/login` · `/thank-you` · `/404` · `/privacy` ·
`/terms` · `sitemap.xml` · `robots.txt` · `opengraph-image` · `manifest`

### T3 — 27 total, for reference
The 12 above, plus: `/projects/[category]` · `/services/[slug]` · `/areas/[locality]` · `/team` ·
`/team/[slug]` · `/careers` · `/locations/[office]` · `/news` · `/news/[slug]` · `/journal` ·
`/journal/[slug]` · `/estimate` · `/dashboard/login` · `/dashboard` · `/dashboard/analytics`.

`/services/[slug]` and `/areas/[locality]` are **add-ons, not core** — they ship only when a client
has genuinely distinct content per page. Five near-identical pages differing by locality is a
doorway-page pattern and a real ranking risk.

---

## 6. Config contract

The schema lives in code, not in prose: **`lib/config/client.schema.json`** is authoritative, with
`lib/config/types.ts`, `validate.ts` and `resolve.ts` alongside it. `docs/product/config-schema.md`
is the design rationale; when the two differ, the code is right.

Five rules that are not negotiable:

1. **Nothing is hardcoded in a component.** A string, colour, phone number or image path in JSX
   belongs in config instead. `npm run check:hardcode` enforces this.
2. **Every section is independently toggleable** and renders `null` when off.
3. **`tier` sets defaults; explicit blocks override.** Adding a `reviews` block to a T1 client is how
   an exception gets granted during negotiation — without moving them to T2 or touching code.
4. **Validate at build.** A malformed config fails loudly. It never renders a broken page on a
   client's subdomain.
5. **No secrets in the file.** API keys are env vars. `clients/*.json` is committed.

### `status` — the payment gate
| `status` | Subdomain | Custom domain | Watermark | `noindex` |
|---|---|---|---|---|
| `demo` | yes | **blocked** | yes | yes |
| `sold` | yes | **blocked** | yes | yes |
| `live` | yes | allowed | no | no |
| `archived` | no | no | — | — |

Structural, not procedural. The deploy script refuses; nobody has to remember. Moving to `live` is
always a deliberate manual step.

---

## 7. Stack

Next.js 15 App Router · TypeScript strict · Tailwind v4 (`@theme`, CSS-first) · Zod · `next/image` +
Sharp · Vercel.

**No component library.** Sections are bespoke per identity; shadcn or MUI would be fought rather
than used. Primitives are hand-rolled and thin.

**Tailwind classes only** — no inline `style`, no separate `.css` files beyond the one global sheet
that declares the token variables. Every colour, size and spacing value resolves to a token.

---

## 8. Editorial identity — the constraints that get checked

Full brief: `prompts/unit-1-editorial/00-identity-system.md`. The parts that are mechanical:

```
#141414  near-black   — primary text, logo, nav
#51372A  warm brown   — accent word in two-tone headings, hairlines, footer rule
#D9BC72  sand-gold    — PRIMARY CTA BUTTONS ONLY, never anything else
#FFFFFF  white        — background, text-on-photo
```

Helvetica / Neue Haas Grotesk or equivalent grotesque sans, headings and body both, all-caps headings.

**Square corners always. No drop shadows. No gradients** — except a dark scrim behind text-on-photo,
which is necessary and allowed.

Five signature devices; **every page uses at least two**: two-tone headings · ghost numerals ·
offset outline frames · uppercase eyebrow text broken across lines · outlined vertical wordmark.

---

## 9. Definition of done

For any piece of work, all of these, no exceptions:

- `npm run check:all` green
- The section renders correctly with its config block absent, present-but-disabled, and present-with-empty-content
- Every variant named in §4 renders, switchable from config alone
- At 375px: no horizontal scroll, primary action thumb-reachable
- Nothing hardcoded — `check:hardcode` is the arbiter, not judgement
- No placeholder text (`Lorem`, `TODO`, unresolved `{{`) — `check:placeholder` is the arbiter

Sample content in a `demo` build must *read* as visibly sample. A plausible-looking fake testimonial
on a demo site is worse than an obvious placeholder, because it can reach a real prospect and be
believed.
