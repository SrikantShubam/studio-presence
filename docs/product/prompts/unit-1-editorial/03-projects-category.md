# Unit 1 — Editorial — Projects, organised by category

Attach: `devun/03`, `apex`

Reference: [BAMO](https://bamo.com/) groups its work into *Private Residences · Hotels & Resorts ·
Branded Residences* rather than one flat grid. A single grid stops working somewhere past 15
projects — and a firm doing five projects a month passes that inside a year.

Paste `00-identity-system.md` first, then this:

```
Design the PROJECTS page — the full portfolio, organised by category.

NAV — per Global Chrome, white background, not overlaid.

STRUCTURE:
- Two-tone heading "OUR / PORTFOLIO", with a one-line intro beneath
- Category filter row across the top, as text links with counts, not dropdown menus:
  "All (48) · Residential (22) · Commercial (14) · Hospitality (8) · Retail (4)"
  The active category is marked with a warm-brown underline
- Beneath it, projects in an asymmetric mosaic — mixed tile sizes, ghost numerals marking
  category breaks when viewing "All"
- Each tile: cover photo, project name overlaid, and a metadata line —
  "Boring Road, Patna · 45 days · ₹8–10 lakh"
- Design for FORTY-EIGHT projects, not six. Show how the mosaic holds its rhythm at that
  volume — pagination or lazy-load, your call, but justify it
- A category header block when a single category is selected: the category name as a two-tone
  heading plus two lines describing the firm's work in that space

ALSO SHOW the category-filtered state — "Hospitality (8)" selected, eight projects only.

REQUIRED: at least 2 signature devices.

ANTI-GOALS: same as the home page. Additionally — no dropdown filter menus, no sidebar filter
panel, no sort-by control, no view-toggle (grid/list). Filtering is one row of text links and
nothing more. A firm with 48 projects needs to browse them, not query them.
```
