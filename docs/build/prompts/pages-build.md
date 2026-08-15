# Prompt — build the remaining pages (for Grok)

Paste everything inside the fence. Nothing outside it is part of the prompt.

The home page is already built and is the pattern; this is about the pages that
still fall through to a generic stub.

**This is a per-page loop, not one long run.** Expect Grok to stop repeatedly —
that is the prompt working, not it giving up. Each page goes:

```
inventory → YOU approve → build → check:all + curl
   → YOU run Codex review (pages-review.md) → fixes → YOU look at it → next page
```

So per page you are involved three times: approving the component list before any
code exists, running the review, and looking at the result. Thirteen pages means
thirteen of those cycles. That is deliberate — every automated check here is
static analysis and none of it can see whether the page matches the design.

If Grok fails `check:all` twice on the same page, hand that page to Codex with
`pages-review.md` rather than letting it keep guessing.

```
You are working in an existing Next.js 15 / TypeScript / Tailwind v4 monorepo at
C:\work\studio presence. It is a multi-tenant website product for interior design studios in India.
One real client site is being built: Ashish Interiors, an "editorial" visual identity, tier t3.

Your job: build the remaining PAGES from the designs that already exist on disk, in
design/reference/editorial/. The home page is done — it is your reference for how everything here is
supposed to work.

THE BAR IS 100% IDENTICAL TO THE DESIGN. Not "close", not "in the spirit of". If you put the design
file and your page side by side at the same viewport width, the differences should be invisible:
same type sizes, same weights, same letter-spacing, same spacing rhythm, same layout structure, same
colours. You are not designing. You are not improving. You are not simplifying a layout because it
looked fiddly. You are reproducing a finished design exactly, using tokens and config instead of
literals.

Those two goals do not conflict, and this is the single most important thing to understand about
this codebase: THE TOKENS HOLD THE DESIGN'S EXACT HEX VALUES. `text-muted` resolves to #8B8377,
which is precisely what the designs use. So using tokens costs you nothing in fidelity — it is the
same colour, reached by a name. If you ever find a token whose value does NOT match what the design
specifies, that is a real bug worth reporting, not a licence to hardcode the hex.

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
- The design token system. Each maps to a per-client CSS variable at runtime, and for this client
  each resolves to exactly the hex the designs use:

    text-ink        #141414   headings, primary text
    text-body       #4A4A4A   paragraph copy
    text-muted      #8B8377   eyebrows, captions, meta (warm taupe, NOT grey)
    text-accent     #51372A   accent word in headings, rules
    bg-surface      #FFFFFF   default section background
    bg-panel        #FAF8F5   alternating section background
    bg-cta          #D9BC72   primary CTA buttons ONLY — never a heading or a border
    border-hairline #DCD7CE   thin dividers
    font-display / font-body  Archivo

  If a design uses one of those hexes, use the token. There is no case where you need the literal.

THE DESIGNS
Every page you are building has a finished HTML design in design/reference/editorial/. They use
inline styles with literal hex values and literal copy — that is the DESIGN, not the target code.
Your job is to reproduce the same visual result using tokens and config.

HOW YOU WORK: ONE PAGE AT A TIME, WITH GATES

This is the most important instruction in this prompt, and it overrides any instinct you have to be
helpful by doing more. You build ONE page, then you STOP and wait. Every time. There are thirteen
pages below; you are not building thirteen pages in one run.

The reason is specific, not bureaucratic. Everything automated in this repo is static analysis — it
checks types, lint, and that no literal hex sneaked into a component. NONE of it can see whether
your page looks like the design. Work has twice now passed every check, been declared done, and
turned out to have drifted in ways only a human looking at the screen caught. Thirteen pages built
before anyone looks is thirteen pages of rework.

For EACH page, in the table order:

STEP 1 — INVENTORY. Before you write a single line of code, read that page's design file and report:
  - the exact `data-screen-label` bands you found in the file, in order. If a board is marked below
    as splitting into two routes, say which bands you are taking for THIS route and which you are
    leaving for the other. If what you find does not match the band list below, STOP and say so —
    do not reconcile it by guessing
  - every section/component the page needs, in the order it appears down the page
  - for each one: does it REUSE a component that already exists in frontend/sections/, or does it
    need a NEW one? If new, say why the existing one does not fit. Reuse is strongly preferred;
    "it needs slightly different padding" is not a reason to fork a component
  - which of the 15 photos in frontend/public/clients/ashish-interiors/editorial/ it uses
  - any config field the page needs that backend/src/config/schema.ts does not already have
  Then STOP. End your turn. Wait for that list to be approved before building anything.

STEP 2 — BUILD. Only the page you just got approved. Only the components on the approved list.

STEP 3 — SELF-VERIFY. Run `npm run check:all` and report the real exit code. Then start the dev
  server and request the route, and report the real status code:
    curl -s -o /dev/null -w "%{http_code}" -H "Host: ashish.localhost:3000" http://127.0.0.1:3000/team
  Both must pass. Typechecking is not evidence a page renders — pages here have passed every static
  check and still returned 500.

STEP 4 — STOP FOR REVIEW. Say the page is ready and END YOUR TURN. A separate reviewer runs against
  it. Do not start the next page. Do not "get a head start".

STEP 5 — APPLY FINDINGS. When the review comes back, fix every BLOCKER and every DRIFT item. Report
  MINOR items and leave them alone unless told otherwise.

STEP 6 — STOP FOR FINAL REVIEW. State what changed since step 4 and END YOUR TURN.

STEP 7 — Only when explicitly told to continue do you begin the next page. Then back to step 1.

THREE RULES THAT MAKE THOSE GATES REAL
  - A STOP means END THE TURN. Do not acknowledge the checkpoint and then keep going in the same
    response. Do not do step 2 in the message where you presented step 1
  - Never work on two pages at once, even if the second looks trivial, and even if it shares
    components with the one you just finished
  - If a page is blocked — a config field that does not exist, a frozen path you would have to
    touch, or `check:all` failing twice — STOP and report it. Do not skip to an easier page to have
    something to show

ALL 22 DESIGN FILES, ACCOUNTED FOR

Before anything else: here is every file in design/reference/editorial/ and what it is. This has been
verified against the repo. You do not need to work out which file is a page and which is a variant —
that question is answered, and answering it again yourself is how this goes wrong.

  12 page boards   -> 16 routes to build   (listed next, with their bands)
   1 og-image.html -> image templates, LAST, ask first
   7 already built -> 6 section variants + the home page. DO NOT REBUILD
   1 not built     -> footer-compact-version.html, a section variant, AFTER the pages
   1 ignore        -> studio-design-1.html, a design-system sheet

That is 22. If you find yourself about to touch a file that is not in one of those buckets, stop —
you have misread something.

The count of ROUTES (16) is higher than the count of page boards (12) because four boards each hold
two pages. That is explained below and it is the single most common thing to get wrong here.

HOW TO READ A DESIGN FILE — THIS IS WHERE PEOPLE GO WRONG

Each design file is a BOARD, not a page. Inside it, every band carries a
`data-screen-label="..."` attribute. Those labels are the authoritative structure of that design:
they tell you what bands exist and in what order. Read them first, with:

    grep -o 'data-screen-label="[^"]*"' design/reference/editorial/<file>.html

SOME BOARDS CONTAIN TWO DIFFERENT PAGES. team.html is the team index AND the individual member page.
news-press.html is the news index AND a single article. journal.md.html is the journal index AND a
single post. Do not try to render one page containing all of it — split at the band listed below.
Getting this wrong is the single most likely way to waste a day.

Every board ends with a `Footer` band, and most have a `CTA` band. Those are the EXISTING Footer and
CtaBand section components. Do not rebuild them per page.

Below is the exact contents of each board, verified by reading the files. The band names are quoted
from the files themselves — if what you see does not match this, say so rather than improvising.

Build in this order, one at a time, following the STEP 1-7 loop above:

1. project-detail-page.html  ->  app/[tenant]/(site)/portfolio/[slug]/page.tsx
   Bands: Project title | Hero photo | Metadata | The brief | Photos — living | Approach |
          Photos — rooms | Outcome | Client quote | CTA | Prev next | Footer
   One page. Start here — it is T1, already in SPEC, and the portfolio data already exists in config.

2. projects-category.html  ->  app/[tenant]/(site)/projects/[category]/page.tsx
   Bands: Portfolio heading | Category filter | Category header | Project mosaic | Load more | CTA | Footer
   One page. "Project mosaic" is the existing Portfolio section's grid — reuse it.

3. service-detail.html  ->  app/[tenant]/(site)/services/[slug]/page.tsx
   Bands: Service heading | Kitchen photos | Whats included | Linked project | FAQ | CTA | Footer
   One page. "FAQ" is the existing FAQ section — reuse it.

4. areas-detail.html  ->  app/[tenant]/(site)/areas/[locality]/page.tsx
   Bands: Area heading | Projects in this area | Map and nearby | CTA | Footer
   One page. "Map and nearby" is the existing Map section — reuse it.

5. team.html  ->  TWO ROUTES, split this board:
     bands 1-5  (Studio heading | Principals | Wider team | Workshop | Hiring)
                -> app/[tenant]/(site)/team/page.tsx
     bands 6-8  (Member detail | Projects led | Prev next member)
                -> app/[tenant]/(site)/team/[slug]/page.tsx
   "Principals" and "Wider team" are the existing Team section — reuse it for the index.

6. careers.html  ->  app/[tenant]/(site)/careers/page.tsx
   Bands: Careers heading | Studio at work | What we look for | Open roles | Apply | Footer
   One page.

7. locations.html  ->  app/[tenant]/(site)/locations/[office]/page.tsx
   Bands: Studio heading | Studio photo | Contact block | About this office | Whos here |
          Projects from studio | Other studios | Visit CTA | Footer
   One page, and it is the DETAIL of a single office — not an index of all of them. Note it has its
   own "Visit CTA" band, which is not the shared CtaBand.

8. news-press.html  ->  TWO ROUTES, split this board:
     bands 1-3  (News heading | Press coverage | Studio news)
                -> app/[tenant]/(site)/news/page.tsx
     bands 4-8  (Article head | Article lead image | Article body | Related project | Prev next article)
                -> app/[tenant]/(site)/news/[slug]/page.tsx

9. journal.md.html  ->  TWO ROUTES, split this board:
     bands 1-5   (Journal heading | Topic filter | Featured post | Post grid | Pagination)
                 -> app/[tenant]/(site)/journal/page.tsx
     bands 6-12  (Post head | Post lead image | Post body | Author | Related projects | Post CTA |
                  Prev next post)
                 -> app/[tenant]/(site)/journal/[slug]/page.tsx

10. estimate-calculator.html  ->  app/[tenant]/(site)/estimate/page.tsx
    Bands: Calculator heading | Calculator | Whats included | Footer
    One page. The "Calculator" band is interactive — it is the only page here with real client-side
    state, so expect it to take longer than the others.

11. privacy-policy.html  ->  TWO ROUTES from one board:
    Bands: Policy heading | Policy switch | Policy body
    -> app/[tenant]/(site)/privacy/page.tsx AND app/[tenant]/(site)/terms/page.tsx
    "Policy switch" is the toggle between the two documents. They share a layout and differ only in
    body content — build one component, render it twice, do not fork it.

12. 404.html  ->  app/[tenant]/(site)/not-found.tsx
    Bands: 404. One screen, no footer.

13. og-image.html  ->  NOT A PAGE. It is three social-share image templates (OG home | OG project |
    OG calculator) plus a "Thumbnail check" band that is a proofing aid, not something to build.
    These become Next.js ImageResponse routes, not pages. LEAVE THIS ONE UNTIL LAST and ask before
    starting it — it is a different kind of work from everything above.

THE OTHER NINE FILES ARE NOT PAGES. DO NOT BUILD THEM AS PAGES.

design/reference/editorial/ holds 22 files. Twelve of them are the page boards listed above, plus
og-image.html. The remaining nine are section variants or reference material, and every one of them
has already been checked — this is verified, not a guess, so you do not need to go and work it out:

ALREADY BUILT — open the file only if you need it as a reference. Building any of these again is
duplicated work and will be rejected:

| Design file                          | What it is                  | Already exists as                        |
|--------------------------------------|-----------------------------|------------------------------------------|
| home.html                            | the home page               | app/[tenant]/(site)/page.tsx             |
| hero-standard-variant.html           | Hero variant "standard"     | frontend/sections/Hero/HeroStandard.tsx  |
| hero---split-format.html             | Hero variant "split"        | frontend/sections/Hero/HeroSplit.tsx     |
| hero-video-format.html               | Hero variant "video"        | frontend/sections/Hero/HeroVideo.tsx     |
| services---grid-compact.html         | Services variant "compact"  | frontend/sections/Services/ServicesCompact.tsx |
| featured-projects--carousel.html     | Portfolio variant "carousel"| frontend/sections/Portfolio/PortfolioCarousel.tsx |
| testimonials---carousel-variant.html | Testimonials variant "carousel" | frontend/sections/Testimonials/TestimonialsCarousel.tsx |

NOT BUILT — one variant is genuinely missing:

| footer-compact-version.html          | Footer variant "compact"    | frontend/sections/Footer/ has only index.tsx |

  Footer currently has no variant split at all, while `SectionVariants` in frontend/lib/tokens/
  types.ts declares footer: 'expanded' | 'compact'. Do this ONE AFTER ALL THE PAGES, not before, and
  follow the shape of Services/ or Testimonials/ when you do: a shared file, one component per
  variant, index.tsx picking between them. It is a section, not a route.

IGNORE ENTIRELY:

| studio-design-1.html                 | a design-system sheet — swatches and type specimens, not a screen |

A SECTION VARIANT IS NOT A PAGE. It is an alternative composition of a section that already exists,
chosen from config alone — `defaultVariants` in frontend/lib/tokens/editorial.ts sets the identity's
default, and a `variant` field on the section config overrides it per client. Nothing about a variant
gets its own route or its own directory under app/. If you catch yourself creating
app/[tenant]/(site)/hero-split/ or similar, you have misread this section.

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
- The page actually loads. Start the dev server and request it:
    curl -s -o /dev/null -w "%{http_code}" -H "Host: ashish.localhost:3000" http://127.0.0.1:3000/team
  200, not 404 and not 500. Typechecking is not evidence a page renders — pages in this repo have
  passed every static check and still 500'd at runtime
- At 375px: no horizontal scroll, tap targets at least 44px
- IT IS IDENTICAL TO THE DESIGN. Check it properly, do not eyeball it once:
    - open the design file in a browser at 1280px, open your page at 1280px, compare them directly
    - the designs size type with clamp(a, b, c) — use the SAME clamp values, do not substitute a
      fixed Tailwind size like text-5xl for clamp(44px,11vw,140px)
    - match font-weight, letter-spacing, line-height and text-transform exactly
    - match the layout structure. If the design is a 6-tile mosaic with varying row spans, a uniform
      3-column grid is WRONG even though it will pass every automated check in this repo
    - repeat at 375px
- Every colour is a token utility, and it is the RIGHT token — the one whose value equals the hex in
  the design. Using text-muted where the design says #4A4A4A is wrong; that is text-body.

WHEN YOU GET STUCK
Two failed attempts at `check:all` on the same page: STOP and END YOUR TURN. Do not keep iterating,
do not guess, do not disable or weaken a check, and do not move to the next page to have something
to show. Report what failed and what you tried. Escalation is normal and costs far less than a
plausible-looking wrong answer.

START HERE
Read the files listed above. Then do STEP 1 — and only step 1 — for the FIRST page in the table:
project-detail-page.html. Give me the component inventory for that one page and stop there. Do not
build it in the same response. Do not inventory the other twelve.
```
