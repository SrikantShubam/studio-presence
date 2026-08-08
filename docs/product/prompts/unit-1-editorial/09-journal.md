# Unit 1 — Editorial — Journal index + post

Attach: none required

Covers `/journal` and `/journal/[slug]` — two layouts, one prompt.

Reference: [Tredi Interiors](https://www.trediinteriors.com/blog/minimalist-architecture-for-modern-homes/)
runs a working blog with real SEO articles. This is the page type I previously argued against —
wrongly. I based that on the median small studio rather than the target firm. Firms at this level
publish, and it's how they get found for "minimalist interior design [city]" rather than only their
own name.

**Config-gated, not omitted.** The template ships with the capability; `journal: false` turns it off
for a client who won't publish. A dead blog with two posts from 2026 is worse than no blog — but
that's a config decision per client, not a reason to leave the capability unbuilt.

Paste `00-identity-system.md` first, then this:

```
Design TWO pages: the JOURNAL INDEX and a JOURNAL POST.

--- PAGE 1: JOURNAL INDEX ---

NAV — per Global Chrome, white background.

- Two-tone heading "JOURNAL", short intro line beneath
- A FEATURED post at the top, given real width: large image with offset outline frame, headline,
  2-line excerpt, date, reading context
- Below it, a grid of 9 posts: image, ghost-numbered, headline, date, 1-line excerpt
- Topic filter as text links: "All · Design · Materials · Process · Living in Patna"
- Pagination at the bottom, plain numbered links

Design for a journal with 40+ posts, not four.

--- PAGE 2: JOURNAL POST ---

This is a reading page. Typography does the work, not decoration.

- Two-tone headline, date, topic label
- Lead image, full width, offset outline frame
- Body copy at a genuine reading measure — 65–75 characters per line, not full-page-width
- Proper hierarchy: H2 section headings in the two-tone treatment, body, pull-quotes,
  in-line images with captions, bulleted lists
- 800–1,500 words of realistic body content, not lorem ipsum
- An author block at the end: portrait, name, role, link to their team page
- A related-projects block — 2 project cards, if the post references real work
- Gold CTA before the footer: "Planning something similar? Message us on WhatsApp"
- Previous / next post
- FOOTER per Global Chrome

REQUIRED: at least 2 signature devices on each page.

ANTI-GOALS: same as the home page. Additionally on the post page — no sidebar, no social share
bar following the scroll, no newsletter popup, no comment section, no tag cloud, no
"trending posts" widget. The reading measure is the single most important thing here; a full-width
paragraph of 140 characters per line is unreadable regardless of how good the type is.
```
