# Studio Presence landing page concepts

Two independent single-page HTML concepts for Vector Veda. Each includes product positioning, benefits, scope, process, three priced tiers, an explanation of Vector Veda, FAQs, enquiry presentation and an in-page login dialog. No animation or form validation. No submissions, authentication, storage or analytics.

## Direction

- Clear presence: architectural blue, cool mineral panels, asymmetric website composition and direct product copy. Archivo throughout. Left-aligned sales narrative, with a centred pricing comparison.
- Studio salon: deep green, pale sage, large photographic composition and rounded architectural framing. Archivo throughout. Large headline paired with a concise explanation; a more spacious studio-oriented presentation.

The Vector Veda mark from the first concepts is preserved. Login is secondary to the buying journey. Navigation stays on the page. The other-concept link is a review aid.

## Content sources

- `docs/product/SPEC.md`: product identity, audience, section inventory, core versus extended feature scope.
- `docs/product/page-inventory.md`: historical commercial tier names and prices. User explicitly reconfirmed ₹15,000 / ₹25,000 / ₹45,000–55,000 in this conversation. Historical build instructions are not adopted.
- Domain, hosting, tax, support and renewal details are left to the agreed quote, rather than inventing current commercial terms.
- Wider-tier capabilities are described as scoped service offerings, not a claim that every integration has been verified live.
- No fabricated testimonials, client counts, case studies or conversion claims.

## Visual references

- [Mirova, One Week Wonders on Dribbble](https://dribbble.com/shots/26981881-Mirova-Interior-Landing-Page): large interior imagery, varied composition and readable typographic hierarchy. Inspected visually. No artwork or copy was copied.
- [Website Builder Landing Page, Ryan Devine](https://dribbble.com/shots/24315485-Website-Builder-Landing-Page-Web-Design): product framing reference, inspected visually.

## Asset

[Interior photograph by Spacejoy on Unsplash](https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-large-window-ctyssSFmXmU). Public page identifies it as free under the Unsplash License. Used as illustrative stock imagery, labelled in the concepts. It is not presented as a Vector Veda client project. Source file is in `assets/` and embedded in both HTMLs.

Archivo is embedded from the repository's existing font asset. HTML files can be opened directly without an app server or network connection.

To regenerate the HTMLs from the repository root: `node design/prototypes/vector-veda-landing/build-concepts.mjs`.
