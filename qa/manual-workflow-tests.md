# Manual workflow tests

Companion to `qa/Studio_Presence_QA_Workbook.xlsx` (sheet "5 - Workflow tests") and
`qa/doc-vs-implementation-report.md`. Each test is a pass/fail script you run by hand in a
browser. Record the result and a comment in the workbook, not here.

## Setup

```bash
npm run dev            # frontend on localhost:3000 unless the port differs
```

Fixtures, in the order to test them:

| Order | Client | Tier | Why |
|---|---|---|---|
| 1 | `ashish-interiors` | t3 demo | Richest surface; most tests per hour |
| 2 | `minimal` | t0 demo | Proves sections render null when config is absent |
| 3 | `stress` | t3 demo | Variant coverage and odd-content edge cases |

Tenant URL shape: `http://localhost:3000/<slug>` (subdomain routing applies only on a real deploy).

Conventions: **[375]** = repeat at 375px wide viewport. **EN**/**HI** = run once per language where
the page exists in both.

---

## W1. Demo lifecycle and payment gate

1. Open `/ashish-interiors`. Site renders with `status: "demo"`.
2. View page source: `noindex` meta present.
3. Confirm the demo watermark is visible on every page you visit, at [375] too.
4. Attempt `?viaCustomDomain=1` or set a Host header simulating a custom domain: expect 404 with
   `x-robots-tag: noindex, nofollow`.
5. In `clients/ashish-interiors.json`, temporarily set `status: "archived"`, reload: expect 410.
   Revert.
6. Set `status: "live"`, reload: watermark gone, noindex gone. Revert to `demo`.

Fail if any step disagrees, especially watermark visibility at mobile width.

## W2. Config-only tier switch (the acceptance test)

1. With ashish-interiors rendering, note which sections appear on home.
2. Change `"tier": "t3"` to `"t1"` in the JSON. Reload. No code edits.
3. Expect T2/T3-only surfaces gone (`/estimate`, journal, news, careers, team detail routes),
   home reduced to the T1 section set.
4. Restore `t3`. Expect identical rendering to step 1.
5. Repeat switching `template` between available identities. Every section re-renders from tokens;
   no hex colours leak, no broken variant errors in console.

Any code change needed for either switch is an automatic fail of the whole architecture.

## W3. Render-null rule, one section at a time

For each of: hero, services, portfolio, testimonials, faq, process, trustBar, team, instagram,
contact, map:

1. Set its block `"enabled": false`. Reload: section gone, no empty shell, no layout gap.
2. Empty its content array (`[]`). Reload: same expectation.
3. Delete the block entirely. Reload: same expectation.
4. Restore.

Run on `minimal` as well - it exercises absent blocks natively.

## W4. Lead capture end-to-end

1. EN home, scroll to contact / footer inquiry form. Submit empty: inline validation, no request.
2. Fill name + phone, submit. Expect redirect to `/thank-you` (or inline success), no console error.
3. HI: repeat on `/hi`. Labels, validation messages, thank-you copy all Hindi, not mixed.
4. Verify the lead reached storage: open `/dashboard/enquiries` (or panel) and confirm the entry.
5. [375]: form fields full-width, submit button thumb-reachable without scrolling past the fold of
   the keyboard.

## W5. WhatsApp / call / directions quick actions

1. Under the hero, tap each quick action:
   - WhatsApp opens `wa.me/<number>` with the prefilled message text containing the studio name.
   - Call opens `tel:<number>` matching the client JSON exactly.
   - Directions opens a Google Maps link whose query matches the configured address.
   - Instagram opens the configured profile in a new tab (`rel="noopener"`).
2. Repeat on `/hi` and at [375]. Tap targets at least ~44px tall.
3. Cross-check the number against a second tenant fixture to prove it comes from config.

## W6. Sticky mobile CTA

1. [375], scroll halfway down home. Sticky CTA visible, does not cover the footer's final content,
   hides when the contact form is on screen (expected behaviour - confirm what that is and record
   it if it differs).
2. Tap it: correct WhatsApp/call action fires.

## W7. Navigation and anchors

1. Desktop: every nav item scrolls to the right section; active state updates while scrolling.
2. Logo click returns to `/`. On `/hi/*`, logo returns to `/hi`.
3. Nav shows only links whose target exists on this tier (after W2 downgrade, no dead anchors).
4. [375]: hamburger opens/closes, focus trap sane, body doesn't scroll behind the open menu.

## W8. Footer inventory

Per tenant, per language:

1. All footer links resolve (no 404s), including privacy, terms, social, and any journal/news links
   gated by tier.
2. Phone, email, address match client JSON.
3. Copyright year and business name correct.
4. Demo watermark present in footer area if that is where it lives.

## W9. Estimate calculator (t2/t3 fixtures)

1. `/estimate`: enter carpet area + home type + finish. Range shown, never a single figure.
2. "Indicative" label present. CTA captures a lead (repeat W4 steps 2 and 4).
3. Toggle `estimate.enabled: false` in config: route 404s or is hidden everywhere it was linked.
   Restore.

## W10. Portfolio and project detail

1. Home featured projects: 6 cards linking to `/portfolio/[slug]`.
2. Detail: gallery works (swipe at [375]), CTA present above the fold-ish, related projects link
   back.
3. Unknown slug renders the styled 404, not a crash.
4. `/portfolio` index and `/projects` index (routes that exist beyond spec): do they render sanely?
   Record whether they should stay (feeds report finding A3).

## W11. Journal / news / careers / team (t3)

1. Index pages list posts/articles/roles from config; empty config renders nothing (W3 rule).
2. Article pages render, metadata unique per slug.
3. `/team` cards link to `/team/[slug]`; member page renders bio and projects.
4. HI equivalents missing (per report B1): visit `/hi/journal` etc., record actual behaviour -
   404, redirect, or English fallback. This result decides finding E3.

## W12. Panel (owner self-edit)

1. `/login` with owner credentials; wrong password rejected cleanly.
2. Edit hero headline via panel, save, reload public site: change visible.
3. Sign out: protected routes (`/panel`, `/dashboard`) redirect to login.
4. Session expiry: after logout, back-button does not show cached private data.

## W13. Dashboard roles and tenant isolation

1. Owner A (tenant A) cannot see tenant B leads: swap tenant slug in dashboard URLs, expect 403/404
   or empty.
2. `/admin` and `/super` unreachable as a normal owner.
3. Run `npm run check:tenant-isolation` and `npm run test:rls` afterwards to back the manual pass.

## W14. SEO surface

1. `/sitemap.xml` lists exactly the live public URLs for this tier (no T2+ routes at T1, no hi
   routes unless i18n enabled).
2. `/robots.txt` correct; demo builds disallow all.
3. Home source contains LocalBusiness JSON-LD; FAQ section emits FAQPage schema.
4. `/hi` pages emit `alternates.languages` pairing en/hi; canonicals absolute.
5. Each opengraph-image route returns a valid image.

## W15. Language toggle and mixed-language audit

1. Walk the whole HI tree noting any English string left in UI chrome (buttons, labels, form
   validation, dates, numbers). The workbook's Page QA sheet has per-page columns for this.
2. Check Devanagari rendering: font loads (grotesque fallback can butcher Hindi), line-height not
   clipped, no overflow at [375].
3. Confirm no Hindi strings are hardcoded in components: `grep -rP "[\x{0900}-\x{097F}]" frontend/sections`
   should return nothing outside token/i18n files.

## W16. Responsive sweep (applies during every page pass)

At 375, 768, 1440 on each page:

1. No horizontal scroll.
2. Images load via `next/image`, no layout shift spikes, alt text present.
3. Primary action reachable by thumb at 375.
4. Square corners, no shadows, no gradients anywhere except the photo scrim (Editorial rules).
5. Two signature devices visible per page (two-tone headings, ghost numerals, offset frames, split
   eyebrows, vertical wordmark).

## Sign-off

A test is done when the workbook row carries Pass/Fail, a date, and (on Fail) a defect-log entry
plus screenshot path under `design/actual/<section>/`. When every row is filled, reconcile against
report section E so the open questions close with evidence attached.
