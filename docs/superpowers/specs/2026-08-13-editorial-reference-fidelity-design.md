# Editorial Reference Fidelity Rebuild

**Date:** 2026-08-13  
**Status:** Approved for implementation planning  
**Reference:** `design/reference/editorial/home.html`  
**Target:** `http://ashish.localhost:3000/`

## Goal

Bring the existing Ashish Interiors tenant from its current approximately 90% match to a reference-faithful implementation of the supplied HTML artifact. The supplied HTML is the source of truth for copy, section order, layout geometry, spacing, typography, image treatment, navigation, decorative devices, and responsive behavior.

This is a fidelity rebuild of the existing work, not a new visual direction and not a Rocket-generated interpretation.

## Scope

The rebuild covers the complete public home page:

- header, navigation, logo/wordmark, and hero
- hero copy, CTA, image treatment, overlays, and decorative framing
- trust/stat strip
- services presentation and supporting copy
- portfolio/project presentation and captions
- about section and all visible copy
- process section and step treatment
- testimonials and metadata
- FAQ/contact areas
- footer, social links, and closing reassurance copy
- all visible ornaments, rules, numerals, outlines, and editorial identity devices
- desktop and mobile spacing, typography, and overflow behavior

## Source-of-truth rule

The reference HTML wins over the current fixture wherever they disagree. Existing Ashish JSON content is temporary input only for this fidelity pass. No text may be omitted because it is not currently represented by the fixture.

The implementation will remain componentized. Reference copy and fixed visual values will be kept behind a dedicated reference-content layer rather than scattered through JSX. When the later configurability document arrives, only the explicitly configurable fields will move into tenant configuration; fixed reference structure and visual rules will remain stable.

## Implementation shape

1. Inspect and inventory the reference artifact into a section/content checklist.
2. Compare that checklist against the current rendered section registry and components.
3. Preserve the current tenant routing and section boundaries where they can express the reference.
4. Rework the owned section components and their local layout classes to match the reference.
5. Add narrowly scoped reference-content data only where the current config cannot express visible reference copy.
6. Keep the existing token system and Tailwind-only styling constraints. No inline styles, new CSS files, literal component colors, or changes to frozen contract paths.
7. Verify the live tenant after each major section group, then run the repository checks allowed by the existing repo state.

## Fidelity acceptance criteria

- Every visible text block in the reference is present in the rendered page.
- Section order and major vertical landmarks match the reference.
- Horizontal page padding, max-widths, grid gaps, section padding, and CTA spacing match the reference at desktop widths.
- Font family, weight, size, line-height, casing, and tracking match the reference closely.
- Images use the correct reference assets/crops and preserve the intended focal points.
- Editorial devices remain visible and correctly positioned: two-tone headings, ghost numerals, offset outline frames, broken uppercase eyebrows, and vertical wordmark treatment.
- At 375px there is no horizontal scroll, no clipped primary CTA, and no accidental text loss.
- The supplied reference remains unchanged.
- Frozen paths remain unchanged: `backend/src/config/**`, `frontend/sections/registry.ts`, `docs/product/SPEC.md`, and `clients/*.json`.

## Verification

- Compare the live tenant at `http://ashish.localhost:3000/` against the supplied reference.
- Check the reference checklist against the rendered DOM text.
- Run focused type/lint checks for changed files.
- Run `npm run check:all`; report unrelated pre-existing failures separately rather than weakening checks.
- Capture fresh screenshots under `design/actual/<section>/` where the existing definition of done requires them.

## Out of scope

- changing tenant resolution
- changing the schema or tenant contract
- deciding which fields become configurable later
- redesigning other tenants
- introducing a component library or replacing the existing section architecture
