# Editorial Reference Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Rebuild the Ashish Interiors home page so its rendered output matches `design/reference/editorial/home.html` as closely as possible in copy, layout, typography, spacing, imagery, and responsive behavior.

**Architecture:** Keep tenant routing, the frozen section registry, the schema, and client fixtures unchanged. Use the existing section components and Tailwind token utilities, adding one isolated reference-content adapter only where the current fixture cannot express visible reference copy. Validate the page through its real tenant URL and the repository checks.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, existing Editorial tokens, local reference HTML and assets.

---

### Task 1: Inventory the reference and current render surface

**Files:**
- Read: `design/reference/editorial/home.html`
- Read: `frontend/sections/registry.ts`
- Read: `frontend/sections/*/*.tsx`
- Read: `frontend/app/globals.css`
- Read: `clients/ashish-interiors.json`

- [ ] Extract the reference’s visible section order, copy blocks, imagery, typography rules, spacing landmarks, and decorative elements into a checklist.
- [ ] Map every checklist item to the existing component that owns it; record missing items and layout mismatches before editing.
- [ ] Confirm the edit boundary excludes frozen paths: `backend/src/config/**`, `frontend/sections/registry.ts`, `docs/product/SPEC.md`, and `clients/*.json`.

### Task 2: Add the reference-content adapter

**Files:**
- Create: `frontend/lib/reference/editorial-home.ts`
- Modify: only the section components that need reference-only copy

- [ ] Define typed, immutable reference content for visible copy that is absent or materially different in the current fixture.
- [ ] Keep the adapter separate from JSX so the later configurability pass can replace individual fields without changing the visual components.
- [ ] Do not duplicate content already correctly supplied by the tenant config unless the reference visibly requires different copy.

### Task 3: Rework global Editorial geometry and typography

**Files:**
- Modify: `frontend/lib/tokens/editorial.ts`
- Modify: `frontend/sections/Hero/**`
- Modify: `frontend/sections/QuickActions/**`
- Modify: `frontend/sections/TrustBar/**`

- [ ] Match the reference’s page gutters, max-widths, headline weights, body weights, tracking, line heights, hero height, button proportions, and navigation spacing using existing token utilities.
- [ ] Preserve square corners, no shadows, no gradients, and the Editorial palette rules.
- [ ] Verify the hero and first viewport at desktop and 375px before moving on.

### Task 4: Rework primary content sections

**Files:**
- Modify: `frontend/sections/Services/**`
- Modify: `frontend/sections/Portfolio/**`
- Modify: `frontend/sections/About/**`
- Modify: `frontend/sections/Process/**`

- [ ] Match section padding, grid/list proportions, image crops, captions, numerals, hairlines, outline frames, and heading treatments to the reference.
- [ ] Restore every reference-visible text block through config or the reference-content adapter.
- [ ] Keep sections null when disabled or empty.

### Task 5: Rework trust, conversion, and closing sections

**Files:**
- Modify: `frontend/sections/Testimonials/**`
- Modify: `frontend/sections/FAQ/**`
- Modify: `frontend/sections/Contact/**`
- Modify: `frontend/sections/Footer/**`
- Modify: `frontend/sections/Instagram/**`
- Modify: `frontend/sections/Map/**`
- Modify: `frontend/sections/CtaBand/**`
- Modify: `frontend/sections/StickyMobileCta/**`

- [ ] Match the reference’s card spacing, quote typography, accordion treatment, contact hierarchy, social/footer layout, CTA placement, and mobile action behavior.
- [ ] Remove any missing-copy gaps visible in the reference while retaining the existing no-placeholder and no-hardcode checks.
- [ ] Verify no horizontal overflow at 375px.

### Task 6: Run focused checks and live comparison

**Files:**
- Create: `design/actual/editorial-home/` screenshots as required by the repository definition of done

- [ ] Run `npm.cmd run typecheck`.
- [ ] Run the relevant lint command for changed files, then `npm.cmd run check:all`.
- [ ] Request `http://ashish.localhost:3000/` and confirm the expected headings, copy, section order, and no runtime errors.
- [ ] Report any unrelated pre-existing check failure without weakening checks.

### Task 7: Final diff and handoff

**Files:**
- Read: all changed files

- [ ] Run `git diff --check`.
- [ ] Confirm frozen paths and unrelated user changes were not modified.
- [ ] Summarize exact files changed, verification evidence, and any remaining fidelity gap.
