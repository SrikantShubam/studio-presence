# Image mockup prompts — ChatGPT

For generating visual mockups, not code. Paste into ChatGPT with image generation.

**How to use:** paste `STYLE` + one `SHOT` + `ANTI-GOALS` as a single message. Attach
`devun/previews/02_d064ed…` where noted.

Why this structure: the first attempt failed because the brief led with constraints and mixed a SaaS
reference into an interior brief. Constraint-led briefs produce safe, generic output. These lead with
the visual target and explicitly name what to avoid.

---

## STYLE — prepend to every prompt

```
Generate a high-fidelity website design mockup — a flat, straight-on screen render, as if
exported from Figma. Not a photo of a laptop, not a device mockup, not a 3D scene.

BRAND: an interior design studio in Patna, India. Name: "ASHISH INTERIORS".

DESIGN SYSTEM — follow exactly:
- Palette: #141414 near-black, #51372A warm brown, #D9BC72 sand/gold accent, #FFFFFF white
- Typography: Helvetica / Neue Haas Grotesk. Tight tracking. Very large headlines
- TWO-TONE HEADINGS: first word in near-black, second word in warm brown.
  Stacked on two lines, second line indented right. Example:
      OUR
         SERVICES
- GHOST NUMERALS: large hollow outlined numbers (01, 02, 03) — outline only, no fill,
  light grey stroke, oversized, sitting behind or beside content
- OFFSET OUTLINE FRAMES: a thin 1px rectangle outline offset diagonally from each photo,
  so the frame and the image are deliberately misaligned
- EYEBROW TEXT: tiny uppercase, left-aligned, broken across 2–3 short lines
- Generous whitespace, confident asymmetry, editorial magazine feel
- Gold (#D9BC72) used only for the primary CTA button
- Photography: warm, neutral, minimal Indian residential interiors — beige and cream walls,
  wood tones, soft daylight. Realistic, not luxury-magazine perfect
```

---

## SHOT 1 — Full-bleed hero
**Attach:** `devun/previews/02_d064ed…`

```
Design the HERO section, desktop, 1920×1080.

COMPOSITION: full-bleed interior photograph filling the entire frame. All text overlaid.

- Top bar: small wordmark left. Nav right: HOME · SERVICES · ABOUT · PORTFOLIO · CONTACT.
  Phone number far right. All small uppercase, white, thin
- Studio name "ASHISH INTERIORS" set very large in white, upper-left, occupying roughly a
  third of the frame width. This is the dominant element
- Beneath it: "CREATING INTERIORS THAT INSPIRE" — smaller, uppercase, white
- Below that: a solid gold (#D9BC72) rectangular button, dark text:
  "CALCULATE THE ESTIMATE ↗"
- Far right edge, small, right-aligned, stacked over three lines:
  APARTMENTS / HOUSES / OFFICES
- A subtle dark gradient scrim from the left so white text stays readable

The photo: a warm minimal Indian living room — cream sofa, wooden coffee table, soft
daylight from the left, a floor lamp, neutral rug.
```

---

## SHOT 2 — Split hero
**Attach:** `devun/previews/02_d064ed…`

```
Design the HERO section, desktop, 1920×1080.

COMPOSITION: vertical split. Left 45% white background with text. Right 55% a single
interior photograph running full-bleed to the right and bottom edges.

LEFT SIDE:
- Tiny uppercase eyebrow, left-aligned, three lines:
      INTERIOR DESIGN
      AND TURNKEY
      RENOVATION
- Two-tone headline, very large, stacked:
      CREATING
         INTERIORS
      with "CREATING" in #141414 and "INTERIORS" in #51372A, second line indented right
- One line of body text, maximum two lines long, in grey
- A solid gold (#D9BC72) button: "CALCULATE THE ESTIMATE ↗"
- Bottom-left: a thin horizontal rule, then three small stats in a row:
  12 YEARS · 240 PROJECTS · PATNA

RIGHT SIDE:
- The photograph, with a thin 1px brown outline rectangle offset diagonally up-left from
  it, overlapping the white area

Top bar spans the full width: small wordmark left, nav right, all uppercase and small.
```

---

## SHOT 3 — Asymmetric offset-frame hero
**Attach:** `devun/previews/02_d064ed…`

```
Design the HERO section, desktop, 1920×1080.

COMPOSITION: white background. A single interior photograph sits off-centre right,
roughly 50% of frame width, NOT touching any edge — floating in whitespace with a thin
1px outline rectangle offset diagonally behind it.

- Far left edge, vertical: the studio name "ASHISH INTERIORS" rotated 90°, outline-only
  hollow lettering, light grey, running the full height
- Upper left: tiny uppercase eyebrow, three lines:
      WE DESIGN
      HOMES ACROSS
      PATNA
- Large two-tone headline overlapping the left edge of the photograph:
      ASHISH
         INTERIORS
  "ASHISH" in #141414, "INTERIORS" in #51372A
- A large ghost numeral "01" — hollow outline, light grey, oversized — in the lower-left
  whitespace, partially cropped by the frame edge
- Gold (#D9BC72) button, lower left: "CALCULATE THE ESTIMATE ↗"
- Lower right, small, under the photo: "location: PATNA" and "est. 2013"

Top bar: small wordmark left, nav right, thin hairline rule beneath.
```

---

## SHOT 4 — Mobile
Run after picking a desktop direction. Replace the composition line to match the winner.

```
Design the HERO section for MOBILE, 390×844, portrait.

COMPOSITION: [describe the chosen desktop composition, adapted to one column]

- Top: small wordmark left, hamburger right
- Interior photograph, full width, roughly 55% of screen height
- Below it on white: tiny uppercase eyebrow, then two-tone headline stacked
- Gold (#D9BC72) button, full width minus margins: "CALCULATE THE ESTIMATE ↗"
- Directly beneath: a row of four contact actions, evenly spaced, icon above label —
  WHATSAPP · CALL · DIRECTIONS · INSTAGRAM. The WhatsApp one visually emphasised
- Everything above must fit on screen without scrolling

Show the full phone screen, no device frame — just the screen content.
```

---

## ANTI-GOALS — append to every prompt

```
DO NOT produce any of the following. These are the failure modes:
- A centred headline with a subtitle and two buttons underneath. This is the default
  SaaS landing page and it is exactly wrong
- A SaaS or tech product aesthetic: gradient meshes, glassmorphism, floating UI cards,
  3D shapes, abstract blobs, dashboard screenshots
- Purple, blue or teal anywhere. The palette is near-black, warm brown, sand gold, white
- Rounded corners on photographs. Corners are square
- Drop shadows or glows of any kind
- Stock-photo "luxury villa" imagery. These are real middle-class Indian homes
- Icon rows with generic feature blurbs
- Any text lorem ipsum. Use the copy specified
- A laptop, phone or browser chrome frame around the design. Flat screen render only
```

---

## Iteration

```
Same layout, but make the headline twice as large and reduce the body copy to one line.
```
```
Same layout with a 20-word headline instead of 3 words. Show me what breaks.
```
```
Same layout, but the photo is badly lit, slightly blurry and shot on a phone.
Adjust the treatment so it still looks intentional.
```
```
Remove the stats and the eyebrow. Show the minimal version for a studio that supplied
almost no information.
```
```
Give me the same composition in the Premium identity instead: light, airy, serif display
headings, muted palette, no gold.
```

---

## Once the hero is settled

Reuse `STYLE` + `ANTI-GOALS` and swap the composition brief for each section, in this order:

1. Services grid — alternating left/right image + text, ghost numerals `01 02 03`
2. Featured projects — asymmetric mosaic, location label overlaid on each tile
3. Trust bar — image + big number + label + one line, stacked (the DEV.UN treatment)
4. Process steps — 4–5 stages with durations, vertical on mobile
5. About + owner
6. Testimonials — featured quote left, card grid right
7. FAQ accordion
8. Contact + map
9. Footer

Then the standalone pages: project detail, estimate calculator, client panel.

---

## Accepting a mockup

1. It does not read as a SaaS landing page.
2. It uses at least three system devices: two-tone heading, ghost numeral, offset outline frame,
   vertical wordmark, multi-line eyebrow.
3. It reads unmistakably as an interior design studio.
4. It survives a 20-word headline and one badly-lit photo.
5. The gold CTA is the visual focus after the headline.
