# Unit 1 — Editorial — Section variants

Attach: `devun/01`, `devun/02`, `devun/03`, `devun/04`

Editorial's home page (`01-home-page.md`) already shipped one composition per section. Per
`master-scope.md`'s section library and `build-todo.md`'s section table, five of those sections have
a second (or third/fourth) documented variant that was never generated. This file covers exactly
those — nothing here is a new decision, it's finishing a list that was already written down.

| Section | Built in `01-home-page.md` | Variant covered here |
|---|---|---|
| Hero | full-bleed | standard, video, split |
| Services grid | detailed (alternating image/text) | compact |
| Featured projects | grid (asymmetric mosaic) | carousel |
| Testimonials | cards (featured quote + grid) | carousel |
| Footer | expanded (Global Chrome master spec, 3-column) | compact |

**Each prompt below is section-only** — generate it in isolation, not the whole page. Note what
comes immediately before/after it in the real home-page flow so the composition reads as something
that could slot into that context, without redrawing the rest of the page.

Paste `00-identity-system.md` first, then the relevant block below.

## How to run this in Claude Design

1. **Same project** as Editorial's finished base pages — it already has the identity system
   established there, no need to re-import it.
2. **New canvas** inside that project, separate from the finished home-page canvas — e.g.
   "Editorial — Section Variants." Keeps the shipped work clean and gives all 7 variants one place
   to land, compare, and get pulled out of.
3. Work through the 7 prompts below **one at a time, into that same canvas**:
   - Paste `00-identity-system.md`'s block, then one variant prompt
   - Let it generate as its own frame on the canvas
   - Move to the next prompt, same canvas, new frame
   - Do **not** paste multiple variant prompts in a single message — that's the failure mode that
     produced the broken SaaS hero earlier in this project (four variants asked for in one prompt).
     One prompt in, one frame out, seven times.
4. After each frame generates, check it against that prompt's own REQUIRED (signature devices) and
   ANTI-GOALS lines before moving on — same check used on the base pages.
5. Once all 7 are on the canvas, compare side by side, then export/extract each one individually.

---

### Hero — standard variant

```
Design the HERO section only, STANDARD variant — a more conventional, contained treatment than the
full-bleed hero already built. This sits at the very top of the page, above the quick-actions row.

Two columns, roughly 55/45. Left: small uppercase eyebrow text broken across 2 lines, then
"ASHISH INTERIORS" in the two-tone heading treatment, then one line of positioning copy ("Creating
interiors that inspire."), then the sand-gold CTA button "CALCULATE THE ESTIMATE →". Right: ONE
interior photograph, inset with generous margin and an offset outline frame — NOT edge-to-edge, this
is the whole point of "standard" versus the full-bleed variant already built. Plain white background
behind the text column, not overlaid on the photo.

NAV sits on the plain white background in #141414, not overlaid with a scrim (that treatment belongs
to the full-bleed variant only).

REQUIRED: use at least 2 of the 5 signature devices.

ANTI-GOALS: same as the home page. Additionally — this must not become full-bleed with a small crop;
the contained, framed photo and visible white margin around it is the entire distinguishing feature.
```

### Hero — video variant

```
Design the HERO section only, VIDEO variant. Same full-bleed footprint as the existing full-bleed
photo hero, but the background is a looping video (a slow interior walkthrough) instead of a static
photograph. Show it as a single representative frame, with a small "audio off" icon bottom-right and
a subtle scroll-cue chevron bottom-centre to signal it's a video, not a photo.

Same text treatment as the full-bleed variant: "ASHISH INTERIORS" huge white uppercase upper-left,
positioning line beneath, gold CTA button, "EST. 2013 · PATNA" bottom corner.

REQUIRED: use at least 2 of the 5 signature devices.

ANTI-GOALS: same as the home page. No visible video-player chrome (no play button, no scrubber, no
platform-branded controls) — this must read as ambient background motion, not an embedded player.
```

### Hero — split variant

```
Design the HERO section only, SPLIT variant. A hard 50/50 vertical split, no overlap. Left half:
solid #141414 background, white text — "ASHISH INTERIORS" two-tone-adapted for a dark background
(white primary word, sand-gold second word), positioning line, gold CTA button. Right half: one
full-height interior photograph, flush to the edge on its own side only (no offset frame here — the
hard vertical seam between the two halves is the device).

NAV sits across the top spanning both halves, white text on the dark half, dark text with scrim on
the photo half.

REQUIRED: use at least 2 of the 5 signature devices.

ANTI-GOALS: same as the home page. No diagonal or curved seam — the split must be a single hard
vertical line, not a masked/angled cut (that belongs to a different identity).
```

### Services grid — compact variant

```
Design the SERVICES section only, COMPACT variant — sits where the existing detailed alternating
image/text version currently sits, between TRUST BAR above and FEATURED PROJECTS below.

Two-tone heading "OUR / SERVICES". A simple 3-column grid (no photos), each column: one ghost
numeral (01/02/03), a service title, one line of description only — no alternating layout, no price
line, no image. This is a much shorter section than the detailed version; it should read as roughly
a third of the vertical height.

Same three services: "Interior Design", "Turnkey Renovation", "Selection of Materials".

REQUIRED: use at least 2 of the 5 signature devices (ghost numerals must be one of them here).

ANTI-GOALS: same as the home page. No icons in place of the ghost numerals, no card borders or
shadows around each column, no images anywhere in this section — that's the detailed variant's job.
```

### Featured projects — carousel variant

```
Design the FEATURED PROJECTS section only, CAROUSEL variant — sits where the existing asymmetric
mosaic currently sits, between SERVICES above and ABOUT below.

Two-tone heading "OUR / PORTFOLIO". A single horizontal row of uniform-size project cards (unlike the
mosaic's mixed sizes), designed to convey horizontal scroll — show 3 full cards plus a sliver of a
4th cut off at the right edge. Each card: photo with offset outline frame, project name and
"location: PATNA" beneath, not overlaid on the image (unlike the mosaic version). Left/right arrow
controls, small and unobtrusive, vertically centred at the row's edges.

REQUIRED: use at least 2 of the 5 signature devices.

ANTI-GOALS: same as the home page. No dot/pagination indicators beneath the row — the partially
visible next card is the only affordance needed. No drop shadow on the cards.
```

### Testimonials — carousel variant

```
Design the TESTIMONIALS section only, CAROUSEL variant — sits where the existing featured-quote-plus-
grid layout currently sits, between PROCESS above and INSTAGRAM below.

Two-tone heading "WHAT / CLIENTS SAY". ONE large quote centred, full-width, generous whitespace
around it — no side grid of smaller cards (that's the cards variant's job). Small round photo above
the quote, name and area beneath ("R. Kumar, Boring Road"). Small left/right arrows either side of
the quote block, and a row of small dash-shaped (not dot-shaped) indicators beneath showing position
in the set.

REQUIRED: use at least 2 of the 5 signature devices.

ANTI-GOALS: same as the home page. No card border or background panel behind the quote — it should
sit directly on the page background. Neutral placeholder names, visibly sample content, same as the
cards variant.
```

### Footer — compact variant

```
Design the FOOTER section only, COMPACT variant — for use on secondary/utility pages, distinct from
the full 3-column contact-form footer (Global Chrome master spec) already used on the home page.

Single row, one horizontal band: wordmark left, then inline contact info — phone, WhatsApp, address —
separated by thin vertical dividers, then "INSTAGRAM" as a plain text link far right. No contact form,
no multi-column layout. Beneath this row, the same bottom bar as the expanded footer: #141414
background, white text, copyright left, "PRIVACY | TERMS" right.

ANTI-GOALS: same as the home page. No contact form of any kind — if there's a field or a button that
isn't a link, it's become the expanded variant, not this one.
```
