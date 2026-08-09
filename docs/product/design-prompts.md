# Claude design prompts — whole-page units

> **Superseded as a build instruction.** `docs/product/SPEC.md` is the spec of record;
> where this file disagrees with it, SPEC.md is correct. Kept for the reasoning.

No Stitch. Run these yourself in Claude design, one whole page at a time. Every reference cited
below has actually been viewed and described from what's really in the image — not guessed from
its filename.

## The process

One **unit** = one complete identity, built in this order:
1. **Base** — the home page, whole page in one prompt, not section by section
2. **Full house** — every other page in that same identity, heaviest first
3. **Variants** — only after the full house exists: controlled alternates of that *same* identity

**4 units total:** Editorial, Premium, Warm Contemporary, Bold Modern. Finish one identity's full
house before starting the next.

Every prompt keeps four things non-negotiable: **exact hex codes, exact copy, required signature
devices, anti-goals.** Dropped: the process preamble (mobile-first, degrades-gracefully) — that's a
build-phase concern for your own frontend work, not something a reference mockup needs to encode.

---

## Verified reference catalog

Every file in `C:\work\studio presence\inspirations\`, described from what's actually in it.

| File | What it actually shows | Use it for |
|---|---|---|
| `devun/previews/01…` | DEV.UN case-study cover: palette swatches, font choices, project scope | Editorial system reference |
| `devun/previews/02…` | DEV.UN home: full-bleed hero, wordmark, nav, gold CTA; services as **alternating left/right image+text blocks**, ghost-numbered 01/02/03 | Editorial hero + services |
| `devun/previews/03…` | DEV.UN about+stats (photo + big number + label + sentence, stacked ×3) and portfolio (project title, description, **location** + **duration** metadata, asymmetric mosaic) | Editorial trust bar + portfolio + project detail metadata |
| `devun/previews/04…` | DEV.UN portfolio continued, contact, mobile view | Editorial contact + mobile reference |
| `liora-previews/01…` | Liora Interiors homepage on a laptop mockup. Dark warm-brown gradient background, huge white condensed headline. **Nav on the mockup:** wordmark left, "ABOUT · PORTFOLIO · SERVICES · REVIEWS · CONTACT" right (5 items, no separate "Home"). **Hero copy** in mixed case (not all-caps): "Functional elegance shaped by your lifestyle" with individual words tinted warm tan. Two **text-link CTAs** (not filled buttons): "Book a Consultation ↘" and "View Portfolio ↘", each with a down-right arrow. Faint concentric topographic line-art behind the text | Editorial nav alternative (5-item, no "Home"); text-link CTA style as an option |
| `liora-previews/05…` | Liora Interiors **Services page** on an iPad mockup. Heading "SERVICES", intro paragraph top-right. **Four-column image-card grid**, numbered 001–004: "001 RESIDENTIAL DESIGN — Apartments and houses — from 50 USD/m²", "002 COMMERCIAL DESIGN — Offices, shops, cafés — from 70 USD/m²", "003 FULL PROJECT DEVELOPMENT — Concept to implementation — from 60 USD/m²", "004 3D VISUALIZATION — Detailed renderings of your space — from 10 USD/m²" | An **alternate** services layout (image-card grid with per-service pricing) — DEV.UN's alternating-block layout is still primary for Editorial, but the "from ₹X" pricing convention is worth borrowing |
| `home about  services portfolio.jpg` *(Apex Arc)* | Nav + dark architectural hero "Designing Spaces That Inspire & Endure" + stat block ("25+ Years of Excellence", "500+ Projects Successfully Completed", "98% Client Retention", "15+ Countries") + client logos + 4 numbered image service cards (Arch Design, Interior Design, Urban Planning, Project Manage) + **asymmetric portfolio mosaic** (mixed tile sizes: tall office, wide restaurant, tall house, small hotel) + "See More Projects" | Premium: stat block + asymmetric mosaic + numbered service cards |
| `home projects  about stats services footer.jpg` *(Northline Atelier — the richest reference in the set)* | A **complete real site.** See the full breakdown below — nav, diagonal-cut hero, 3-col project grid, about section, stats band, icon-based services, and a fully composed 3-column contact+footer | **Primary structural reference for nav, footer, and contact form**, across all 4 identities |
| `testinomials.jpg` | One large featured quote with a photo on the left (name, role, 5-star rating); a 2×2 grid of smaller quote cards to the right, each with a small round avatar, name, role, star rating | Testimonials section, all identities |
| `faq.jpg` | ⚠️ This is a marketing screenshot for a **Showit accordion add-on product**, not a real client site. Cream background, italic serif "Frequently Asked Questions" heading, each question in italic serif with a "+" expand icon and a hairline divider below | Use only the **interaction pattern** (question + "+" icon + hairline divider) and the **actual example questions** ("Why should I trust you with my business?" is directly reusable). Do not import its italic-serif typography into Editorial — that contradicts Editorial's own type system |
| `process.jpg` | ⚠️ A generic dark-mode SaaS "How We Work" component — 5-step vertical zigzag timeline with rounded gradient-icon badges, connecting line, tech copy ("Automation Blueprint", "Build & Integration") | Use only the **structural pattern** (numbered vertical zigzag timeline with a connecting line) — never its dark rounded cards, gradient icons, or SaaS copy |
| `process steps.jpg` | ⚠️ **Dropped from the reference set.** This is a generic SaaS product landing page ("Active" — an analytics tool) with a centred headline + subtitle + two buttons, floating dashboard-card mockups, and an orange gradient hero glow — exactly the anti-pattern this whole project is trying to avoid | Do not reference. Kept in the folder only as a labelled example of what NOT to produce |
| `hero w video.jpg` | ⚠️ Also a generic SaaS product page (an AI agent tool, "Try It Free", flower-suit imagery, stat overlay) | Anti-pattern reference only — same category as `process steps.jpg` |

---

## Northline Atelier — full breakdown (the nav/footer master reference)

This is the file that was previously under-described. Full composition, top to bottom:

**Nav:** "NORTHLINE / ATELIER" wordmark stacked on two lines, small caps, letter-spaced, top-left.
Centre-right: "PROJECTS · STUDIO · SERVICES · JOURNAL · CONTACT", all-caps, letter-spaced, generous
gaps. Far right: "EN | FR" language toggle → vertical divider → search icon → menu icon. Cream
background throughout, no border.

**Hero:** Two columns, roughly 45/55. Left: small eyebrow "— SPACES. CRAFTED WITH INTENTION." (a
horizontal line + caps text). Large **serif** display headline in **sentence case**, three lines:
"Architecture / that elevates / life." — the word "life." is italic and sage-green, the rest is dark
charcoal. Below: a 2-line sans body paragraph. Below that: a solid moss-green rectangular button
(softened, not fully pill-shaped) "EXPLORE OUR WORK →" in cream text. Right column: a full-height
photo, **masked along a diagonal cut line**, not a rectangle. Faint concentric topographic line-art
behind the left column.

**Featured projects:** "FEATURED PROJECTS" label left, "VIEW ALL PROJECTS →" right. Three equal-size
cards (uniform grid, not a mosaic here): photo, then below it — bold caps project name left / category
right (e.g. "DESERT PAVILION" / "RESIDENTIAL"), then a location line with a small arrow far right
("Scottsdale, Arizona ↗"). Thin divider lines between rows.

**About/Studio:** Two columns. Left: one photo. Right: "OUR STUDIO —" eyebrow, two-line sentence-case
serif headline "We design with clarity. / We build with care.", a body paragraph, and an
outline-only button (1px border, no fill) "LEARN MORE ABOUT OUR STUDIO". Faint architectural
floor-plan line drawing as background texture on the far right of this section.

**Stats band:** Full-width, muted taupe-grey background. Four stats separated by thin vertical
dividers, each with a short dash mark above the number: "145+ / PROJECTS DELIVERED", "21 / YEARS OF
PRACTICE", "36 / DESIGN HONORS", "14 / COUNTRIES SERVED". Numbers in large serif, labels small caps.

**Services:** "OUR SERVICES —" eyebrow. Four columns, each with a simple line-art icon (no numbers
here), a caps title (ARCHITECTURE, INTERIOR DESIGN, PLANNING, BESPOKE FURNISHINGS), a 2–3 line
description, and a "LEARN MORE →" text link.

**Contact + footer, three columns:**
- Left: sentence-case serif headline "Let's build / something / exceptional.", one line of body copy.
- Middle: an actual form with **underlined-only fields** (no boxes): Name, Email, Project Type
  (dropdown chevron), Tell Us About Your Project (textarea) — then a solid moss-green button
  "SEND INQUIRY →".
- Right: a small line-art logo glyph, the wordmark stacked, then an address block (pin icon +
  address), email (envelope icon), phone (phone icon), then a social row "INSTAGRAM | LINKEDIN |
  PINTEREST", caps, pipe-separated.

**Bottom bar:** full-width dark olive-green strip: "© 2026 NORTHLINE ATELIER. ALL RIGHTS RESERVED."
left, "PRIVACY | TERMS" right.

---

# GLOBAL CHROME — nav, footer, contact form

One structure, reused across all 4 identities. **Structure stays constant; only the palette, type
and corner-radius change per identity.** This is what was missing before — nav and footer were
described in one throwaway line each, on every page, instead of specified once properly.

## Master nav spec
```
NAV, full width, sits at the very top of every page:
- Left: wordmark (stacked on two lines for a formal identity, single line for a casual one)
- Centre-right: 4–5 items, all-caps, letter-spaced, generous horizontal gaps: "SERVICES · PORTFOLIO
  · ABOUT · CONTACT" (4-item version) or add "REVIEWS" or "PROCESS" for a 5-item version
- Far right: phone number OR a language/utility icon cluster (search, menu) — pick one, not both
- On the home page only, the nav sits overlaid on the hero photo with white text and a subtle dark
  scrim. On every other page, the nav sits on a plain background in the identity's ink colour
```

## Master footer spec — three columns, always
```
FOOTER, full width, three columns:
- LEFT: a short reassuring line in the identity's display type ("Let's build something
  exceptional." / "Ready when you are.") plus one line of body copy
- MIDDLE: a real contact form — underlined-only fields (no boxes, no heavy borders): Name, Email,
  Project Type (dropdown), a short message textarea — then a solid CTA button in the identity's
  primary accent colour
- RIGHT: a small logo mark, the wordmark stacked, an address line with a pin icon, email with an
  envelope icon, phone with a phone icon, then a social-links row, caps, pipe-separated:
  "INSTAGRAM | FACEBOOK"

Below the three columns: a full-width bottom bar in the identity's darkest tone — copyright line
left ("© 2026 ASHISH INTERIORS. ALL RIGHTS RESERVED."), "PRIVACY | TERMS" right.
```

Each identity's page prompts below say **"use the Global Chrome spec, in this identity's palette"**
rather than re-describing nav and footer every time.

---

# UNIT 1 — EDITORIAL

## Identity system

```
IDENTITY: Editorial. Reference: DEV.UN (attach devun/01, devun/02, devun/03, devun/04).

PALETTE — exact hex, no substitutes:
- #141414 near-black — primary dark text, logo, nav
- #51372A warm brown — accent word in two-tone headings, hairline borders, footer rule
- #D9BC72 sand-gold — PRIMARY CTA BUTTONS ONLY. Never use it for anything else
- #FFFFFF white — background and text-on-photo

TYPE: Helvetica / Neue Haas Grotesk or equivalent grotesque sans, headings and body both, all-caps
for headings. (Not the italic serif seen in faq.jpg — that belongs to a different identity's voice.)

SIGNATURE DEVICES — every page must use at least 2:
1. TWO-TONE HEADINGS: first word #141414, second word #51372A, stacked two lines, second line
   indented right. Example: "OUR" / "   SERVICES"
2. GHOST NUMERALS: large hollow outlined numbers (01, 02, 03), stroke only, no fill, light grey,
   oversized, placed behind or beside content
3. OFFSET OUTLINE FRAMES: thin 1px rectangle outline offset diagonally from each photo — frame and
   image deliberately don't align
4. Small uppercase eyebrow text, left-aligned, broken across 2–3 short lines
5. An outlined vertical wordmark running down a page edge (use sparingly, not every page)

LAYOUT: square corners always, never rounded. No drop shadows, no gradients except a necessary dark
scrim behind text-on-photo. Generous whitespace, confident asymmetry.

NAV (per Global Chrome, this identity's palette): wordmark left, "HOME · SERVICES · ABOUT ·
PORTFOLIO · CONTACT" right, phone far right, all in #141414 on white pages or white-on-scrim over
the hero photo.

FOOTER (per Global Chrome): background #FFFFFF, hairline rule in #51372A across the top, form field
underlines in #141414, CTA button in #D9BC72, bottom bar background #141414 with white text.

BUSINESS: "ASHISH INTERIORS", interior design studio, Patna, India. Est. 2013.
Phone: (555) 0123. Tagline: "Creating interiors that inspire."
```

## 1A. Home page (Base)

```
[paste IDENTITY system above]

Design the complete HOME PAGE for Ashish Interiors, desktop, in full, top to bottom.

1. NAV — per Global Chrome spec above, overlaid on the hero photo, white text, subtle dark scrim.

2. HERO — full-bleed interior photograph. "ASHISH INTERIORS" huge white uppercase upper-left,
   dominant element. Beneath it: "CREATING INTERIORS THAT INSPIRE". Gold button: "CALCULATE THE
   ESTIMATE →". Far right edge, small white stacked text: "APARTMENTS / HOUSES / OFFICES". Bottom
   corner: "EST. 2013 · PATNA" — must say PATNA, nowhere else.

3. QUICK-ACTIONS ROW — directly under the hero, on white. Four items: WhatsApp · Call · Directions
   · Instagram. Icon and label each. WhatsApp visually primary.

4. TRUST BAR — three stats, each with a small photo, a big number, a label, one line of copy,
   stacked (DEV.UN's treatment — photo+number+label+sentence, not a bare number strip): "12+ / YEARS
   OF EXCELLENCE", "240+ / PROJECTS COMPLETED", "18 / TEAM MEMBERS".

5. SERVICES — two-tone heading "OUR / SERVICES". Three services, **alternating left/right
   image-and-text blocks** (DEV.UN's layout, devun/02), ghost-numbered 01/02/03: "Interior Design",
   "Turnkey Renovation", "Selection of Materials" — one real sentence of copy each, plus an optional
   small "from ₹X/sq ft" price line under each title (the pricing convention from Liora's services
   page, liora/05).

6. FEATURED PROJECTS — two-tone heading "OUR / PORTFOLIO". Asymmetric mosaic, 6 project tiles,
   mixed sizes, project name and "location: PATNA" overlaid on each image.

7. ABOUT — two-tone heading "ABOUT / THE STUDIO". Owner photo, two short paragraphs, founding year.

8. PROCESS — two-tone heading "HOW WE / WORK". Four steps in a **vertical zigzag timeline with a
   connecting line** (the structural pattern only — plain ghost numerals in place of icons, no
   gradient badges, no dark cards): Consultation, Design, Execution, Handover — one line each, with
   a rough duration under each.

9. TESTIMONIALS — one large featured quote with a photo on the left (per testinomials.jpg), three
   smaller quote cards in a 2×2-adjacent grid to the right. Neutral names ("R. Kumar, Boring Road")
   — sample content, visibly a placeholder, not styled to look like a verified real review.

10. INSTAGRAM — a strip of 6 square photo tiles matching the page's square-corner, offset-frame
    language exactly. "Follow @ashishinteriors" link.

11. FAQ — two-tone heading "COMMON / QUESTIONS" (Editorial's own type system — not faq.jpg's italic
    serif). 5 questions in an accordion with a "+" expand icon and hairline dividers (the interaction
    pattern from faq.jpg). Use real questions in this register: "How long does a 3BHK take?", "Do
    you handle civil work?", "What's the payment schedule?", "Why should I trust you with my
    business?", "Do you work outside Patna?"

12. CONTACT — phone, WhatsApp, address, hours, a map placeholder block, gold CTA repeated.

13. FOOTER — per Global Chrome spec, this identity's palette.

REQUIRED: use at least 3 of the 5 signature devices across the whole page.

ANTI-GOALS:
- No centred-headline-plus-subtitle-plus-two-buttons SaaS pattern, anywhere on the page
- No gradient meshes, glassmorphism, floating dashboard cards, 3D shapes
- No purple, blue or teal
- No rounded photo corners anywhere
- No drop shadows or glows
- No luxury-villa stock photography — real middle-class Indian homes, warm, lived-in
- Instagram section must not look like a pasted-in third-party widget
- Process section must not import process.jpg's dark rounded cards or gradient icon badges
- FAQ must not import faq.jpg's italic serif type — Editorial keeps its own two-tone caps system
```

## 1B. Full house — run in this order once the home page is approved

### Project / case-study detail
```
[paste IDENTITY system]

Design the PROJECT DETAIL page for one project: "3BHK, Boring Road".

NAV — per Global Chrome, on a white background (not overlaid, no hero photo on this page).

Structure — a case study, not a bare gallery:
- Title, location "Boring Road, Patna", room type "Residential — 3BHK", budget range
  "₹8–10 lakh", duration "45 days" — displayed as a real, visible metadata block (per DEV.UN's
  "location / terms of execution" treatment in devun/03), not buried as small print
- 8–10 photos, photo-led, square corners, consistent crop treatment
- A 300–400 word description: the client's brief, our approach, 2–3 key design decisions, the
  outcome
- One client quote with name and area (sample/placeholder content, marked visibly as such)
- Gold CTA: "Discuss your project on WhatsApp"
- Previous / next project navigation at the bottom
- FOOTER — per Global Chrome spec

Use ghost numerals for section markers. Offset frame on the hero photo.

ANTI-GOALS: same as home page.
```

### Estimate calculator
```
[paste IDENTITY system]

Design the ESTIMATE CALCULATOR page — the highest-converting page on the site, give it real
visual weight, not a throwaway utility page.

NAV — per Global Chrome, white background.

Inputs: carpet area (sq ft slider), home type (1/2/3/4 BHK, selectable), finish level (Essential /
Premium / Luxe, selectable). Output: a price RANGE (e.g. "₹6.5 – 8.2 lakh"), clearly labelled
"Indicative estimate", updating live as inputs change — no submit button needed. Below the result:
gold CTA "Get an exact quote on WhatsApp".

Two-tone heading: "CALCULATE / THE ESTIMATE". Show the pre-interaction state — sensible defaults
already selected, result already visible.

FOOTER — per Global Chrome spec.

ANTI-GOALS: same as home page. Never show a single number without "indicative" labelling.
```

### Client panel
```
[paste IDENTITY system]

Design the CLIENT PANEL — where the studio owner edits their own content. Functional, not
marketing, but still on-brand (same type, same palette, gold reserved for primary actions only).

Editable fields: phone number, hero image (with upload control), portfolio entries (add/remove/
reorder), about text, services list, testimonials.

Non-technical studio owner, on a phone, a few times a year. Every field needs a clear label and an
obvious save action. Empty states say what to do next in plain language.

ANTI-GOALS: no dashboard-style dense data tables, no icon without a label, no ambiguous save state.
```

### Trivial pages — batch together
```
[paste IDENTITY system]

Design three small pages, kept simple:

1. THANK YOU — confirms enquiry received, sets a response-time expectation ("we reply within
   24 hours"), offers a WhatsApp link as a faster route.
2. 404 — brief, on-brand, one line of copy, link back to home. Must not look like a framework
   default.
3. PRIVACY / TERMS — the site's heading style at top, plain body copy below. Boilerplate —
   don't over-design it.

ANTI-GOALS: same as home page.
```

---

# UNIT 2 — PREMIUM

## Identity system

```
IDENTITY: Premium. References: Northline Atelier (attach "home projects  about stats services
footer.jpg" — primary) and Apex Arc (attach "home about  services portfolio.jpg" — secondary,
for the stat block and asymmetric mosaic).

PALETTE:
- #FAF9F6 warm cream background
- #2B2A28 dark charcoal — primary text (not pure black)
- #4A5240 moss/olive green — primary CTA buttons, hairlines
- #8B7355 muted taupe-gold — secondary accent, used sparingly

TYPE: a serif for display headlines, **sentence case, not all-caps** (per Northline Atelier: "We
design with clarity. / We build with care."), paired with a clean grotesque sans for body, nav and
labels.

SIGNATURE DEVICES — every page must use at least 2:
1. DIAGONAL-CUT HERO PHOTO — the photo is masked along a diagonal line, not a rectangle
   (Northline Atelier's device)
2. STAT BAND: 3–4 numbers in a full-width muted-taupe band, thin vertical dividers, short dash
   marks above each number (Northline Atelier), OR the photo+number+sentence stacked treatment
   (Apex Arc) — pick one and use it consistently on a given page
3. Asymmetric image mosaic for the portfolio (Apex Arc) — mixed tile sizes, never uniform
4. Outline-only buttons (1px border, no fill) for secondary actions; solid moss-green for primary
5. Faint architectural line-art (floor plan or topographic contour) as background texture behind a
   text block

LAYOUT: heavy whitespace, slow reveal. Rounded corners acceptable here (12–16px on cards) — unlike
Editorial's strict square corners, this is a deliberate identity difference.

NAV (per Global Chrome): wordmark stacked two lines, small caps, top-left. Centre-right: "PROJECTS
· STUDIO · SERVICES · CONTACT". Far right: a language toggle or search/menu icon cluster, not a
phone number.

FOOTER (per Global Chrome): cream background, three columns exactly as Northline Atelier's — form
with underlined-only fields, moss-green submit button, dark-olive bottom bar.

BUSINESS: "ASHISH INTERIORS", Patna, India, presented for a higher-end/luxury-leaning clientele.
```

## Base — home page
```
[paste UNIT 2 identity system]

Design the complete HOME PAGE for Ashish Interiors in this identity, desktop, top to bottom:

1. NAV — per this identity's Global Chrome variant.
2. HERO — diagonal-cut photo device, sentence-case serif headline in two lines, one short body
   paragraph, solid moss-green button "Explore our work →". Faint topographic line-art behind the
   text.
3. QUICK-ACTIONS ROW — WhatsApp · Call · Directions · Instagram, in this identity's restrained
   palette.
4. FEATURED PROJECTS — three equal-size cards (Northline Atelier's uniform grid) OR the asymmetric
   mosaic (Apex Arc) — choose the asymmetric mosaic here to differentiate from Editorial's own
   asymmetric portfolio, since Editorial already uses that device; this page can use the uniform
   3-card grid instead for genuine contrast.
5. ABOUT/STUDIO — two columns, photo left, sentence-case serif headline right, outline-only "Learn
   more" button, floor-plan line-art texture.
6. STATS BAND — full-width muted taupe band, 4 stats with dash marks: "12+ / Years of Practice",
   "240+ / Projects Delivered", "98% / Client Retention", "3 / Cities Served".
7. SERVICES — four columns, simple line-art icons (not numbered), caps titles, 2–3 line
   descriptions, "Learn more →" links.
8. TESTIMONIALS — per testinomials.jpg.
9. INSTAGRAM STRIP — styled into this identity's cream/moss palette.
10. FAQ — sentence-case serif heading is appropriate HERE (unlike Editorial), "+" accordion icons,
    hairline dividers.
11. CONTACT + FOOTER — per this identity's Global Chrome variant, exactly as Northline Atelier's
    three-column composition.

REQUIRED: at least 2 signature devices from this identity's list.

ANTI-GOALS: no ghost numerals or offset outline frames (Editorial's devices, don't blend the two
systems). No all-caps headline type. Otherwise same as Unit 1: no SaaS centred-hero pattern, no
purple/blue/teal, no glassmorphism, no generic stock photos.
```

*(Full house for Unit 2 follows the same page list as Unit 1 §1B, once this base is approved,
adapted to this identity's palette, type and nav/footer variant.)*

---

# UNIT 3 — WARM CONTEMPORARY

## Identity system

```
IDENTITY: Warm Contemporary. No direct visual reference in the inspirations folder — this is a new
register, deliberately softer than Editorial or Premium. Structure (nav/footer shape) still follows
Global Chrome; only tokens change.

PALETTE:
- #FAF6F0 warm cream background
- #C97B5D terracotta/clay accent — primary CTA colour
- #8A9A7E muted sage secondary accent — small details only
- #3A3530 warm charcoal (not pure black) for text

TYPE: a rounded humanist sans throughout, friendly not sharp. Generous line-height, larger body
text than the other identities.

SIGNATURE DEVICES — every page must use at least 2:
1. ROUNDED CORNERS EVERYWHERE — 16–24px on photos, cards, buttons. The opposite of Editorial's
   square corners, deliberately
2. Soft organic accent shapes (a blob or soft arc) behind key content blocks, sage or terracotta,
   low opacity
3. Warm colour-wash overlay on photos — a subtle terracotta or cream tint unifying mixed photo
   quality
4. Fully rounded pill buttons, solid terracotta fill

NAV (per Global Chrome): single-line wordmark (not stacked — this identity is more casual), 4 items,
rounded pill-shaped active-state indicator if any.

FOOTER (per Global Chrome): same three-column structure, cream background, rounded card treatment
around the form fields rather than underlined-only (this identity's forms use soft rounded input
boxes, not hairline underlines — a deliberate contrast with Premium and Editorial).

BUSINESS: same business, positioned for a newer or smaller studio, or a client base that might find
Editorial's sharp architectural register intimidating.
```

## Base — home page
```
[paste UNIT 3 identity system]

Design the complete HOME PAGE for Ashish Interiors in this identity, desktop, top to bottom, same
section list and order as Unit 1 (hero → quick-actions → trust element → services → projects →
about → process → testimonials → Instagram → FAQ → contact → footer), expressed entirely in the
Warm Contemporary visual language.

REQUIRED: at least 2 signature devices from this identity's list.

ANTI-GOALS: no square corners, no ghost numerals, no offset outline frames (Editorial's devices).
No stat-block-as-clean-row styled like Premium — keep any numbers here softer, embedded in prose
rather than a bare band. Otherwise same as Unit 1: no SaaS centred-hero pattern, no purple/blue/teal
(sage is the only green-adjacent tone permitted), no glassmorphism.
```

---

# UNIT 4 — BOLD MODERN

## Identity system

```
IDENTITY: Bold Modern. No direct visual reference in the inspirations folder — a fourth, more
graphic register for contemporary/urban studios. Structure follows Global Chrome; tokens differ.

PALETTE:
- #0A0A0A true black — large solid background blocks
- #FFFFFF white — text on black, alternating white background sections
- #FF4B2B bold red-orange — the single accent, used boldly (CTA buttons, large numerals, highlights)

TYPE: a heavy-weight geometric sans, very large, tight tracking. Poster-scale contrast — one huge
word next to small body text is the core visual trick.

SIGNATURE DEVICES — every page must use at least 2:
1. FULL-BLEED SOLID COLOUR BLOCKS as section backgrounds — black and white sections alternate down
   the page; colour is structural, not just background
2. BOLD FILLED NUMERALS (solid, not outlined) for services and process steps — the opposite of
   Editorial's ghost/hollow numerals
3. Diagonal cut lines or angled dividers between sections
4. Duotone or high-contrast black-and-white photo treatment, not full-colour photography

NAV (per Global Chrome): wordmark left in bold caps, nav items right in bold caps, sits on whichever
colour block (black or white) opens the page — invert text colour accordingly.

FOOTER (per Global Chrome): same three-column structure, on a full-black background, white text,
red-orange CTA button, form fields as bold-bordered boxes (not underlines — underlines are too
quiet for this identity).

BUSINESS: same business, positioned toward younger designers, contemporary/urban projects, or
commercial/office interior work rather than traditional residential warmth.
```

## Base — home page
```
[paste UNIT 4 identity system]

Design the complete HOME PAGE for Ashish Interiors in this identity, desktop, top to bottom, same
section list as Unit 1, expressed in the Bold Modern visual language — alternating black and white
full-bleed section blocks, bold filled numerals, red-orange accent used confidently.

REQUIRED: at least 2 signature devices from this identity's list.

ANTI-GOALS: no ghost/outline numerals (Editorial), no soft rounded corners or organic shapes (Warm
Contemporary), no muted taupe-gold restraint (Premium) — this identity should look distinctly
different from the other three. Otherwise same base anti-goals: no SaaS centred-hero pattern, no
purple/blue/teal replacing the red-orange accent, no glassmorphism.
```

---

## Iteration prompts

```
This looks like a generic SaaS page. Redo it using [identity]'s signature devices more explicitly
— I don't see [device] anywhere.
```
```
The [element] has a factual error — it should say [correct fact], not [wrong fact]. Fix only that,
keep everything else exactly as is.
```
```
Show me this with 8 projects instead of 6 — does the mosaic still hold together?
```
```
The testimonials look like real reviews, not sample content. Make it obviously placeholder —
neutral name format, a visible "sample" treatment.
```
```
This blends two identities together. Strip out anything that belongs to [other identity] and keep
it purely [this identity].
```
```
The nav/footer doesn't match the Global Chrome spec — [describe the gap]. Fix only that.
```

---

## Checklist before accepting any page

1. No SaaS centred-headline-subtitle-two-buttons pattern
2. At least 2 of that identity's named signature devices are actually present and visible
3. Nav and footer follow the Global Chrome structure, in this identity's palette
4. No factual errors (city, year, stats) — re-check against the stated business facts
5. Reads unmistakably as this specific identity, not blended with another unit
6. Instagram, where present, is styled to match — not a bolted-on widget
7. Case-study pages carry the 300–400 word / budget / room-type / quote structure
