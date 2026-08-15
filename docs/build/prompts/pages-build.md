# Prompt — build the remaining pages (for Grok)

Paste everything inside the fence. Nothing outside it is part of the prompt.

The home page is already built and is the pattern; this is about the pages that
still fall through to a generic stub. If Grok fails `check:all` twice on the same
page, stop and hand that page to Codex with the review prompt in
`pages-review.md` — do not let it keep guessing.

```
You are working in an existing Next.js 15 / TypeScript / Tailwind v4 monorepo at
C:\work\studio presence. It is a multi-tenant website product for interior design studios in India.
One real client site is being built: Ashish Interiors, an "editorial" visual identity, tier t3.

Your job: build the remaining PAGES from the designs that already exist on disk. The home page is
done — it is your reference for how everything here is supposed to work. Do not redesign anything.
Do not invent content. You are converting finished HTML designs into React components that read from
config.

READ THESE FIRST, IN THIS ORDER
1. AGENTS.md — the rules. Absolute. If anything below contradicts it, AGENTS.md wins.
2. frontend/sections/Hero/ and frontend/sections/Portfolio/ — the worked examples. Match their
   SHAPE, not just their rules: how they take config, how they use tokens, how they render nothing
   when their content is absent.
3. frontend/app/[tenant]/(site)/page.tsx — how the home page composes sections.
4. backend/src/config/schema.ts — the config contract. READ ONLY. You may not edit it.
5. frontend/app/globals.css — the token system.

Do not read the ~70 other markdown files in docs/. They are superseded and will mislead you.

WHAT ALREADY EXISTS, SO YOU DO NOT REBUILD IT
- 16 section components in frontend/sections/ (Hero, TrustBar, Services, Portfolio, About, Process,
  Testimonials, FAQ, Contact, Map, Instagram, CtaBand, StickyMobileCta, Footer, Team, QuickActions).
  REUSE THESE. If a page needs a band that already exists as a section, import it, do not fork it.
- All 15 photographs, already extracted, at frontend/public/clients/ashish-interiors/editorial/
  (hero.jpg, portfolio-01..04.jpg, service-01..02.jpg, trust-01..03.jpg, instagram-01..04.jpg,
  testimonial-01.jpg). Reference them through config, never as a literal path in a component.
- The design token system: text-ink, bg-surface, text-accent, bg-cta, border-hairline, text-muted,
  font-display, font-body. These map to per-client CSS variables at runtime.

THE DESIGNS
Every page you are building has a finished HTML design in design/reference/editorial/. They use
inline styles with literal hex values and literal copy — that is the DESIGN, not the target code.
Your job is to reproduce the same visual result using tokens and config.

Build these, in this order. Stop after each one and run `npm run check:all`.

| Design file                        | Route to build                                   |
|------------------------------------|--------------------------------------------------|
| project-detail-page.html           | app/[tenant]/(site)/portfolio/[slug]/page.tsx     |
| projects-category.html             | app/[tenant]/(site)/projects/[category]/page.tsx  |
| team.html                          | app/[tenant]/(site)/team/page.tsx                 |
| estimate-calculator.html           | app/[tenant]/(site)/estimate/page.tsx             |
| journal.md.html                    | app/[tenant]/(site)/journal/page.tsx              |
| news-press.html                    | app/[tenant]/(site)/news/page.tsx                 |
| careers.html                       | app/[tenant]/(site)/careers/page.tsx              |
| locations.html                     | app/[tenant]/(site)/locations/page.tsx            |
| privacy-policy.html                | app/[tenant]/(site)/privacy/page.tsx AND /terms   |
| 404.html                           | app/[tenant]/(site)/not-found.tsx                 |

There is currently a catch-all at app/[tenant]/(site)/[...path]/page.tsx that renders a generic stub
for all of these. As you build each real route, that route takes precedence automatically — but
check the catch-all afterwards and remove any branch that is now dead. Do not delete the file
outright until every page above exists.

THE RULES THAT WILL FAIL YOUR WORK IF YOU BREAK THEM
- NOTHING HARDCODED IN A COMPONENT. No hex codes, no phone numbers, no business names, no client
  copy. If it varies per client, it comes from config. `npm run check:hardcode` is the arbiter, not
  your judgement. This includes Tailwind arbitrary values: bg-[#141414] is a hardcoded colour and
  will fail. Structural copy that is the same for every client (a "Back to portfolio" link, a form's
  "Email" label) is fine as a literal.
- TAILWIND CLASSES ONLY. No inline style attributes, no new .css files. The only exception in the
  whole codebase is app/[tenant]/(site)/layout.tsx, which injects the token variables and is not
  yours to edit.
- A SECTION RENDERS NOTHING WHEN IT HAS NO CONTENT. Absent config block, enabled:false, or an empty
  content array — all three mean render null. An empty shell is a bug.
- SQUARE CORNERS, NO SHADOWS, NO GRADIENTS for this identity. The one allowed exception is a dark
  scrim behind text sitting on a photo.

FROZEN — you may not edit these, for any reason:
  backend/src/config/**        the contract
  frontend/sections/registry.ts  the section interface
  docs/product/SPEC.md
  clients/*.json               client data
If your code needs a change in one of them, your work on that page STOPS and you report why. Do not
add a field, do not loosen a type, do not work around it. A schema edited to make code compile is
how this codebase stops being checkable.

If a page needs a config field that does not exist yet, that is exactly this case: stop, name the
field you would need and what it is for, and move to the next page.

DONE MEANS
- `npm run check:all` exits 0
- The page renders against clients/ashish-interiors.json
- At 375px: no horizontal scroll, tap targets at least 44px
- It visually matches its design file — same type scale, same spacing rhythm, same layout structure.
  The design uses clamp() for fluid type; use the same clamp values.
- Every colour is a token utility

WHEN YOU GET STUCK
Two failed attempts at `check:all` on the same page: STOP. Do not keep iterating, do not guess, do
not disable or weaken a check. Report what failed, what you tried, and move on. Escalation is normal
and costs far less than a plausible-looking wrong answer.

Start by reading the files listed above, then tell me in four sentences what you are about to build
and which design file you are starting from.
```
