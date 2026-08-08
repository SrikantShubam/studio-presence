# Unit 1 — Editorial — Open Graph share card

Attach: none required

This is the image that renders when someone shares the site link on **WhatsApp** — which for this
audience is the primary way the site gets distributed. It's the first impression before anyone
reaches the site at all, and a missing or broken card at that moment is expensive.

Not a page — a 1200×630 image template, generated per page from config.

Paste `00-identity-system.md` first, then this:

```
Design the OPEN GRAPH SHARE CARD — a 1200×630 image template, rendered dynamically per page.

Design THREE variants:

1. HOME / DEFAULT
   - Full-bleed interior photograph with a dark scrim over the left half
   - "ASHISH INTERIORS" large in white uppercase, upper-left
   - "Interior design · Patna" underneath, small caps
   - A thin gold rule under the text
   - "Est. 2013" bottom-left, small

2. PROJECT PAGE
   - The project's cover photo, full-bleed, dark scrim on the lower third
   - Project title bottom-left in white uppercase, e.g. "3BHK, BORING ROAD"
   - Location and duration on one line beneath it: "Boring Road, Patna · 45 days"
   - Small "ASHISH INTERIORS" wordmark, top-left, white

3. ESTIMATE CALCULATOR
   - Solid near-black (#141414) background, no photograph
   - "CALCULATE YOUR / INTERIOR ESTIMATE" as a two-tone heading — second line in warm brown
     against the dark background, so use the gold #D9BC72 for it instead to stay legible
   - Small wordmark bottom-left

Constraints for all three:
- Exactly 1200×630
- All text must remain legible when the card is displayed at roughly 300px wide in a WhatsApp chat
  bubble — this means very few words and very large type. Show it at that size to check.
- Nothing important within 40px of any edge (platforms crop differently)
- Square corners, per identity

ANTI-GOALS: no small print, no body paragraphs, no URLs printed on the image, no logos of other
platforms, no drop shadows. If it isn't readable as a thumbnail it has failed, regardless of how it
looks at full size.
```
