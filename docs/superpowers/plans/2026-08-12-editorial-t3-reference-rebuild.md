# Editorial T3 Reference Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make the config-driven Editorial T3 site reproduce the supplied reference compositions across the public pages, then verify and close confirmed backend/admin gaps.

**Architecture:** Extract the HTML references into focused React/Tailwind sections and route templates. Keep all client copy, images, links, and enabled state in the existing validated config; use the registry and route resolution as the only composition switch points. Shared Editorial chrome owns navigation, footer, signature devices, CTA treatment, responsive menu, and restrained motion.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4, Zod config contract, `next/image`, existing backend services, Playwright/browser screenshots.

---

## Execution constraints

- Work in a dedicated branch/worktree when Git metadata is writable. In the current environment `.git` is read-only, so implementation must preserve the existing analytics-ticket changes in-place and avoid their files.
- Do not edit frozen contract files, `frontend/sections/registry.ts`, `docs/product/SPEC.md`, or client fixtures unless the repository owner explicitly changes ticket ownership. If the existing schema cannot express a reference, stop at that boundary and report the exact missing field.
- Implementation subtasks try `opencode/deepseek-v4-flash-free` first. If unavailable, failed, or incomplete, retry that bounded implementation task with a GPT model. Visual decisions, synthesis, and final verification stay with the primary agent.
- Follow the repo hardcode/null-rendering/Tailwind/editorial rules. No inline styles in sections, no new CSS files, no literal client data, no empty shells, no gradients/shadows/rounded corners for Editorial.

## Task 1: Reference and contract map

**Files:** Create `docs/superpowers/plans/2026-08-12-editorial-t3-reference-rebuild.md`; create a working checklist outside tracked code if needed.

- [ ] Inventory every reference page and section, including hero standard/full-bleed/video/split, services compact/detailed, portfolio grid/carousel, testimonials cards/carousel, footer expanded/compact, and all T3 route references.
- [ ] Map each visual content requirement to `backend/src/config/schema.ts`, `backend/src/config/types.ts`, and the Ashish/stress fixtures. Record missing fields rather than inventing bindings.
- [ ] Map current routes, registered sections, public assets, backend APIs, and admin screens. Keep the current analytics ticket files out of scope.
- [ ] Establish a baseline with the repo’s existing check command(s); record pre-existing failures before implementation.

## Task 2: Shared Editorial chrome and home foundation

**Files:** Add focused files under `frontend/components/editorial/` only if permitted by the active ticket; add/modify the home-owned section directories when ownership is granted. Do not edit the frozen registry from an unowned ticket.

- [ ] Add shared navigation, mobile menu, wordmark, section heading/signature devices, CTA link/button, image frame, and footer primitives using token utilities.
- [ ] Reproduce the home reference shell and hero variants from their HTML composition, including responsive crops, overlays, nav states, aside labels, CTA geometry, and `prefers-reduced-motion` behavior.
- [ ] Render the hero against absent, disabled, empty, and all four variant configurations; ensure long stress-fixture copy does not overflow at 375px.
- [ ] Capture desktop and 375px screenshots and compare against `design/reference/editorial/home-sections/hero.html` and the hero variant files before continuing.

## Task 3: Complete home section library

**Files:** Add one focused directory per owned section under `frontend/sections/` and its tests/fixtures under the ticket-owned test location.

- [ ] Implement quick actions, trust bar, services, portfolio, about, process, testimonials, Instagram, FAQ, contact, map, CTA band, team, and footer using the matching reference files.
- [ ] Preserve config-only variant switching for compact/detailed, grid/carousel, cards/carousel, and expanded/compact compositions.
- [ ] Reuse existing portfolio/services/testimonial helpers where they match; split oversized components only when needed to keep each variant independently testable.
- [ ] Verify every section returns `null` for absent/disabled/empty content and that no component contains client-specific copy, phone numbers, colors, or paths.
- [ ] Capture `design/actual/<section>/` screenshots at desktop and 375px for all variants named by the spec.

## Task 4: Public T3 routes

**Files:** Add route groups under `frontend/app/[tenant]/(site)/`; add route-local view components under owned directories; reuse shared Editorial chrome.

- [ ] Implement route shells for project detail/category, service detail, area detail, team/team member, locations, careers, news/news article, journal/journal post, estimate calculator, privacy, terms, 404, manifest/robots/sitemap, and Open Graph output where the existing schema and route contracts support them.
- [ ] Resolve route slugs from validated config and existing project/service/team/post collections. Return `notFound()` for missing slugs rather than rendering invented fallback content.
- [ ] Keep page-level layout decisions in route templates and section-level decisions in components; do not duplicate navigation/footer markup.
- [ ] Verify T1/T2 tenants are gated or redirected according to the spec, while Ashish and stress T3 fixtures render without crashes or horizontal overflow.

## Task 5: Backend and admin closure

**Files:** Inspect and, only where owned, modify `backend/src/services/**`, `frontend/app/[tenant]/(admin)/**`, and API routes.

- [ ] Verify lead capture, panel read/write, analytics, Umami-degraded behavior, tenant scoping, authentication, and T3 gating using existing service contracts.
- [ ] Compare login, client panel overview/edit-project, leads, and analytics screens with the admin reference screenshots; close confirmed layout, density, responsive, state, and data-contract gaps while retaining existing `admin-*` tokens.
- [ ] Test empty, degraded, unauthorized, and tenant-isolated states. Do not add excluded analytics metrics or fabricated insight copy.

## Task 6: Acceptance and handoff

- [ ] Run `npm run check:all` from the implementation checkout and stop after two failed attempts as required by `AGENTS.md`.
- [ ] Run focused route/config matrix checks for minimal, Ashish, and stress fixtures, including absent/disabled/empty section states.
- [ ] Run 375px browser checks for horizontal scroll, thumb-reachable primary CTA, mobile menu, carousels, calculator, forms, and admin screens.
- [ ] Verify screenshot artifacts exist under `design/actual/<section>/` and inspect them visually against the supplied references.
- [ ] Report exact changed files, checks run, remaining blockers, and whether the real rendered end state—not just local code—matches the references.

## Acceptance criteria

- `npm run check:all` exits 0.
- Home and every implemented T3 reference route render from config alone for Ashish and stress fixtures.
- Every named home/hero/footer variant is switchable without code edits.
- No horizontal scroll at 375px; primary action is thumb-reachable.
- No hardcoded client data or forbidden Editorial styling; all disabled/empty sections render `null`.
- Backend/admin flows are tenant-scoped, honest in degraded states, and visually aligned with the admin references.
- Screenshots in `design/actual/<section>/` provide fresh evidence for the completed visual work.
