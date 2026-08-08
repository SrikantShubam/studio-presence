# Global chrome — nav, footer, contact form

One structure, reused across all 4 identities. **Structure stays constant; only the palette, type
and corner-radius change per identity.** Every page prompt in every unit says "per Global Chrome,
this identity's palette" instead of re-describing nav and footer from scratch.

---

## Northline Atelier — full breakdown (the master reference)

File: `home projects  about stats services footer.jpg`. Full composition, top to bottom:

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

## Master nav spec (paste into any page prompt)

```
NAV, full width, sits at the very top of every page:
- Left: wordmark (stacked on two lines for a formal identity, single line for a casual one)
- Centre-right: 4–5 items, all-caps, letter-spaced, generous horizontal gaps: "SERVICES · PORTFOLIO
  · ABOUT · CONTACT" (4-item version) or add "REVIEWS" or "PROCESS" for a 5-item version
- Far right: phone number OR a language/utility icon cluster (search, menu) — pick one, not both
- On the home page only, the nav sits overlaid on the hero photo with white text and a subtle dark
  scrim. On every other page, the nav sits on a plain background in the identity's ink colour
```

## Master footer spec (paste into any page prompt) — three columns, always

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

## Per-identity chrome variants

| Identity | Nav wordmark | Nav far-right | Footer form fields | Footer bottom bar |
|---|---|---|---|---|
| Editorial | single line, #141414 | phone number | underlined, #141414 | #141414 bg, white text |
| Premium | stacked two lines, small caps | language toggle / search / menu icons | underlined, #2B2A28 | dark-olive #3A3F30 bg |
| Warm Contemporary | single line, casual | phone number | soft rounded input boxes (not underlines) | #3A3530 bg |
| Bold Modern | single line, bold caps | phone number | bold-bordered boxes (not underlines) | full black #0A0A0A bg |
