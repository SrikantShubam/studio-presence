# Generates qa/Studio_Presence_QA_Workbook.xlsx
# Re-run after adding routes: python qa/generate_workbook.py
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter
from pathlib import Path

SCREENSHOT_DIR = Path("qa/screenshots")   # drop PNGs here, named per Read me

WB = openpyxl.Workbook()

HDR_FILL = PatternFill("solid", fgColor="141414")
HDR_FONT = Font(color="FFFFFF", bold=True, size=11)
SUB_FILL = PatternFill("solid", fgColor="D9BC72")
GROUP_FILL = PatternFill("solid", fgColor="EFE9DD")
THIN = Side(style="thin", color="CCCCCC")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(vertical="top", wrap_text=True)

STATUS = '"Pass,Fail,N/A,Blocked"'
STATUS_DV = DataValidation(type="list", formula1=STATUS, allow_blank=True)


def style_header(ws, ncols, row=1):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = HDR_FILL
        cell.font = HDR_FONT
        cell.alignment = Alignment(vertical="center", wrap_text=True)
    ws.freeze_panes = ws.cell(row=row + 1, column=1)


def set_widths(ws, widths):
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


def add_status_dv(ws, col_letters, first_row):
    for letter in col_letters:
        dv = DataValidation(type="list", formula1=STATUS, allow_blank=True)
        ws.add_data_validation(dv)
        dv.add(f"{letter}{first_row}:{letter}5000")


# ---------------------------------------------------------------- Read me
ws = WB.active
ws.title = "Read me"
set_widths(ws, [110])
rows = [
    ("Studio Presence - manual QA workbook", True),
    ("", False),
    ("How to use this workbook:", False),
    ("1. Start the dev server (npm run dev) and test against the one unit built so far (fixture: ashish-interiors). When a second client goes live, duplicate sheet '1 Page QA' per client and change the Fixture column.", False),
    ("2. Sheet '1 Page QA': one row per page per language per viewport. Mark Status and write findings in Comments. Language column tells you which tree to walk; check Hindi pages for stray English and vice versa.", False),
    ("3. Sheet '2 Buttons & CTAs': verify every interactive element fires the right action with the right config data, on both languages and both key viewports.", False),
    ("4. Sheet '3 Nav & Footer': header navigation and footer inventory per fixture.", False),
    ("5. Sheet '4 Home sections': section-by-section render checks including the off states (disabled / empty / absent).", False),
    ("6. Sheet '5 Workflow tests': end-to-end scripts W1-W16. Full detail lives in qa/manual-workflow-tests.md.", False),
    ("7. Every Fail gets a row in sheet '6 Defect log' plus a screenshot. Save screenshots in qa/screenshots/ and the generator embeds them into the sheet automatically:", False),
    ("   - Page QA rows: name the file page-<row number>.png (row number = column A), e.g. page-12.png", False),
    ("   - Defect log: defect-<Defect ID>.png, e.g. defect-DEF-001.png", False),
    ("   - Or type any file name from qa/screenshots/ directly into that row's screenshot column.", False),
    ("   The file path stays visible as text too, so an LLM or script can find the original PNG without opening the workbook.", False),
    ("", False),
    ("Status values: Pass / Fail / N/A (page does not exist at this tier or language) / Blocked (cannot test, say why).", False),
    ("Viewports: Mobile 375 (thumb reach + no horizontal scroll), Tablet 768, Laptop 1440.", False),
    ("Reference docs: docs/product/SPEC.md (spec of record), qa/doc-vs-implementation-report.md (doc vs code gaps).", False),
]
for i, (text, bold) in enumerate(rows, start=1):
    c = ws.cell(row=i, column=1, value=text)
    c.alignment = WRAP
    if bold:
        c.font = Font(bold=True, size=14)
ws["A2"].font = Font(size=11)

# ---------------------------------------------------------------- 1 Page QA
ws = WB.create_sheet("1 Page QA")
headers = ["#", "Fixture client", "Group", "Page", "Language",
           "Viewport", "Layout", "Content", "Hindi/English purity",
           "Buttons work", "No horiz. scroll @375", "Signature devices (>=2)",
           "Status", "Screenshot (file name)", "Comments (describe problem in depth)"]
ws.append(headers)
style_header(ws, len(headers))
set_widths(ws, [5, 18, 12, 34, 10, 11, 10, 10, 16, 11, 13, 15, 9, 24, 60])

EN_PAGES = [
    ("/", "Home"),
    ("/about", "Extra vs spec (report A4)"),
    ("/portfolio", "Index - extra vs spec (A3)"),
    ("/portfolio/{slug}", "Project detail (use one real slug)"),
    ("/projects", "Index - extra vs spec (A3)"),
    ("/projects/{category}", "Category page"),
    ("/services/{slug}", "Service detail"),
    ("/areas/{locality}", "Area page (if config enables)"),
    ("/team", "Team index (t3)"),
    ("/team/{slug}", "Team member (t3)"),
    ("/journal", "Journal index (t3)"),
    ("/journal/{slug}", "Journal post (t3)"),
    ("/news", "News index (t3)"),
    ("/news/{slug}", "News article (t3)"),
    ("/careers", "Careers (t3)"),
    ("/locations", "Index - extra vs spec (A3)"),
    ("/locations/{office}", "Office page (t3)"),
    ("/estimate", "Estimate calculator (t2+)"),
    ("/thank-you", "Post-lead thank-you"),
    ("/privacy", "Legal"),
    ("/terms", "Legal"),
    ("404 page", "Visit an unknown URL"),
]
HI_PAGES = [
    ("/hi", "Home (Hindi)"),
    ("/hi/about", ""),
    ("/hi/portfolio", ""),
    ("/hi/portfolio/{slug}", ""),
    ("/hi/projects/{category}", ""),
    ("/hi/services/{slug}", ""),
    ("/hi/team", ""),
    ("/hi/estimate", ""),
    ("/hi/locations", ""),
    ("UNTRANSLATED ROUTE e.g. /hi/journal, /hi/careers, /hi/news, /hi/team/{slug}, /hi/privacy", "Report finding B1: record actual behaviour (404 / redirect / English fallback)"),
]
ADMIN_PAGES = [
    ("/login", "Shared login (spec says /panel/login and /dashboard/login - report A5)"),
    ("/panel", "Owner self-edit panel"),
    ("/dashboard", "Lead list (spec said NOT built yet - report A1)"),
    ("/dashboard/analytics", ""),
    ("/dashboard/enquiries", ""),
    ("/dashboard/content", ""),
    ("/dashboard/settings", ""),
    ("/dashboard/{leadId}", "Lead detail"),
    ("/admin", "Undocumented admin surface (report A2)"),
    ("/super", "Undocumented super-admin surface (report A2)"),
]

FIXTURE = "ashish-interiors"   # the one unit built so far; change if needed
VIEWPORTS = ["Mobile 375", "Tablet 768", "Laptop 1440"]
r = 2
n = 1


def page_rows(fixture, group, page, lang):
    global r, n
    vps = VIEWPORTS if group == "Public" else ["Laptop 1440"]
    for vp in vps:
        ws.append([n, fixture, group, page, lang, vp] + [""] * 8)
        for c in range(1, len(headers) + 1):
            ws.cell(row=r, column=c).border = BORDER
            ws.cell(row=r, column=c).alignment = WRAP
        r += 1
        n += 1


# fixture header row
ws.append(["", f"FIXTURE: {FIXTURE} (the one unit built so far)"] + [""] * 12)
for c in range(1, len(headers) + 1):
    ws.cell(row=r, column=c).fill = SUB_FILL
    ws.cell(row=r, column=c).font = Font(bold=True)
r += 1
for p, note in EN_PAGES:
    page_rows(FIXTURE, "Public", f"{p}   ({note})" if note else p, "EN")
for p, note in HI_PAGES:
    page_rows(FIXTURE, "Public-HI", f"{p}   ({note})" if note else p, "HI")
for p, note in ADMIN_PAGES:
    page_rows(FIXTURE, "Admin", f"{p}   ({note})" if note else p, "EN")
for p in ["sitemap.xml", "robots.txt", "opengraph-image", "manifest.webmanifest"]:
    page_rows(FIXTURE, "System", p, "EN")

add_status_dv(ws, ["M"], 2)
ws.auto_filter.ref = f"A1:N{r-1}"

# ---------------------------------------------------------------- 2 Buttons & CTAs
ws = WB.create_sheet("2 Buttons & CTAs")
headers = ["#", "Location", "Element", "Expected behaviour (from client JSON)", "EN status", "HI status", "Laptop status", "Mobile status", "Comments (problem in depth)"]
ws.append(headers)
style_header(ws, len(headers))
set_widths(ws, [5, 22, 30, 52, 10, 10, 12, 12, 55])

CTAS = [
    ("Hero", "Primary CTA button", "Sand-gold (#D9BC72 token) fill only here; correct label; links to contact/WhatsApp from config"),
    ("Hero", "Secondary CTA (if variant has one)", "Ghost/outline style, correct target"),
    ("Quick actions row", "WhatsApp tile", "wa.me link, prefilled message includes studio name, opens new tab"),
    ("Quick actions row", "Call tile", "tel: number matches clients/*.json exactly"),
    ("Quick actions row", "Directions tile", "Google Maps query matches configured address"),
    ("Quick actions row", "Instagram tile", "Configured profile URL, new tab, rel=noopener"),
    ("Sticky mobile CTA", "Sticky bar button", "[375 only] appears on scroll, tap works, hides over contact form"),
    ("Nav", "Every nav item", "Scrolls to existing anchor; no dead links after tier downgrade"),
    ("Nav", "Logo", "Returns to / (or /hi on Hindi tree)"),
    ("CtaBand", "Band CTA button", "Mid-page and pre-footer placements both fire"),
    ("Contact section", "Form submit", "Validates empty input inline; success goes to /thank-you"),
    ("Footer", "Inquiry form submit", "Same validation + lead captured in dashboard/panel"),
    ("Footer", "Phone / email links", "tel:/mailto: match config"),
    ("Footer", "Social icons", "Correct URLs, new tab"),
    ("Footer", "Privacy & Terms links", "Resolve to rendered legal pages"),
    ("Portfolio cards", "Project card click", "Navigates to /portfolio/{slug}; whole card clickable"),
    ("Project detail", "Gallery controls", "Swipe at 375; arrows on desktop"),
    ("Project detail", "Enquiry CTA", "Present without scrolling past gallery"),
    ("Estimate", "Calculate / result CTA", "Shows a RANGE labelled indicative; CTA captures lead"),
    ("Journal/News cards", "Read-more links", "Correct slug, no mixed-language title"),
    ("Team cards", "Member card click", "Navigates to /team/{slug}"),
    ("Thank-you page", "Back / WhatsApp action", "Returns user to site or opens chat"),
    ("Panel/Dashboard", "Save buttons", "Persist and reflect on public site after reload"),
    ("Panel/Dashboard", "Sign out", "Ends session; back button shows no cached private data"),
    ("Login", "Submit", "Wrong password rejected cleanly; success lands on panel/dashboard"),
]
for i, (loc, el, exp) in enumerate(CTAS, start=1):
    ws.append([i, loc, el, exp, "", "", "", "", ""])
add_status_dv(ws, ["E", "F", "G", "H"], 2)

# ---------------------------------------------------------------- 3 Nav & Footer
ws = WB.create_sheet("3 Nav & Footer")
headers = ["#", "Fixture", "Area", "Check item", "Status", "Comments"]
ws.append(headers)
style_header(ws, len(headers))
set_widths(ws, [5, 20, 10, 70, 10, 55])

NF = [
    ("Nav", "Links match sections actually enabled for this tier (no anchors to removed sections)"),
    ("Nav", "Active-link highlight follows scroll position"),
    ("Nav", "All-caps heading treatment matches Editorial identity"),
    ("Nav", "[375] hamburger toggles; menu scrollable; body scroll locked while open"),
    ("Nav", "Language switcher (if present) swaps EN<->HI on the SAME page, not just to home"),
    ("Footer", "Column structure matches expanded vs compact variant chosen by config"),
    ("Footer", "Business name, phone, email, address all match clients/*.json"),
    ("Footer", "Every link resolves (crawl them once per fixture)"),
    ("Footer", "Social links point at configured handles, not placeholders"),
    ("Footer", "Copyright line: business name + current year"),
    ("Footer", "Hairline rule uses warm brown accent token"),
    ("Footer", "Demo watermark visible (demo/sold builds) at all three viewports"),
    ("Footer", "Hindi footer fully translated, no English leftovers"),
    ("Footer", "noindex meta present in source on demo build"),
]
r = 2
n = 1
for area, item in NF:
    ws.append([n, FIXTURE, area, item, "", ""])
    for c in range(1, 7):
        ws.cell(row=r, column=c).border = BORDER
        ws.cell(row=r, column=c).alignment = WRAP
    r += 1
    n += 1
add_status_dv(ws, ["E"], 2)

# ---------------------------------------------------------------- 4 Home sections
ws = WB.create_sheet("4 Home sections")
headers = ["#", "Section (config key)", "Variants to try", "On-state check", "enabled:false", "empty content []", "block deleted", "Comments"]
ws.append(headers)
style_header(ws, len(headers))
set_widths(ws, [5, 24, 26, 46, 12, 13, 13, 50])

SECTIONS = [
    ("hero", "standard / full-bleed / video / split", "Headline, eyebrow device, primary CTA; scrim only behind text-on-photo"),
    ("quickActions", "-", "Four tiles directly under hero, big tap targets"),
    ("trustBar", "-", "Three stats from config.stats"),
    ("services", "compact / detailed", "Items from config.items; no lorem"),
    ("portfolio", "grid / carousel", "Six projects linking to detail pages"),
    ("about", "-", "Body text + owner photo"),
    ("team", "-", "Members from config.members (t3)"),
    ("process", "-", "Four steps with timelines"),
    ("testimonials", "cards / carousel", "Demo builds must read as obviously sample content"),
    ("instagram", "-", "Six hand-picked embeds, horizontal scroll, profile link"),
    ("faq", "-", "Questions render; FAQPage JSON-LD in source"),
    ("contact", "-", "Form + details from config"),
    ("map", "-", "Embed loads, pin matches address"),
    ("ctaBand", "mid-page / pre-footer", "Both placements switchable from config"),
    ("stickyMobileCta", "-", "See W6"),
    ("footer", "expanded / compact", "See sheet 3"),
]
r = 2
n = 1
for key, variants, oncheck in SECTIONS:
    ws.append([n, key, variants, oncheck, "", "", "", ""])
    for c in range(1, 9):
        ws.cell(row=r, column=c).border = BORDER
        ws.cell(row=r, column=c).alignment = WRAP
    r += 1
    n += 1
add_status_dv(ws, ["E", "F", "G"], 2)
ws.cell(row=r + 1, column=1, value="Off-state rule (SPEC section 4): every one of these three off-states renders NOTHING - no empty shell, no layout gap. Run on minimal too.").alignment = WRAP

# ---------------------------------------------------------------- 5 Workflow tests
ws = WB.create_sheet("5 Workflow tests")
headers = ["ID", "Test", "Steps summary (full script in qa/manual-workflow-tests.md)", "Result", "Date", "Tester", "Defect IDs", "Notes"]
ws.append(headers)
style_header(ws, len(headers))
set_widths(ws, [6, 30, 80, 10, 12, 12, 12, 40])

WF = [
    ("W1", "Demo lifecycle & payment gate", "Watermark+noindex on demo; custom domain 404; archived 410; live clears both"),
    ("W2", "Config-only tier switch", "t3 -> t1 -> t3 and template swap with zero code edits; identical restore"),
    ("W3", "Render-null per section", "For each home section: disabled / empty / absent all render nothing"),
    ("W4", "Lead capture end-to-end", "Validation, submit, /thank-you, lead visible in dashboard; repeat HI"),
    ("W5", "Quick actions", "WhatsApp prefilled msg, tel:, Maps directions, Instagram; both languages, 375px"),
    ("W6", "Sticky mobile CTA", "Appears on scroll, tap works, yields to contact form"),
    ("W7", "Navigation & anchors", "Anchor targets, active state, logo home, hamburger at 375"),
    ("W8", "Footer inventory", "Per fixture per language: links resolve, details match JSON, watermark"),
    ("W9", "Estimate calculator", "Range not figure, indicative label, lead capture, config toggle kills it"),
    ("W10", "Portfolio & project detail", "Cards->detail, gallery swipe, unknown slug -> styled 404, index pages verdict"),
    ("W11", "Journal/news/careers/team (t3)", "Indexes, articles, member pages; record /hi/* behaviour on missing routes"),
    ("W12", "Panel owner edit", "Login, edit hero headline, public reflects, logout protects, no cached private data"),
    ("W13", "Tenant isolation", "Tenant A cannot read tenant B leads; /admin & /super unreachable as owner; run test:rls after"),
    ("W14", "SEO surface", "sitemap matches tier URLs, robots, LocalBusiness + FAQPage JSON-LD, hreflang pairs, OG images"),
    ("W15", "Hindi audit", "No English leftovers, Devanagari font renders cleanly, grep proves no hardcoded Hindi in components"),
    ("W16", "Responsive sweep", "375/768/1440 on each page: no h-scroll, alt text, thumb reach, Editorial rules (square/shadow/gradient)"),
]
RESULT_DV = DataValidation(type="list", formula1='"Pass,Fail,Partial,Blocked,Not run"', allow_blank=True)
ws.add_data_validation(RESULT_DV)
for i, (tid, name, steps) in enumerate(WF, start=2):
    ws.append([tid, name, steps, "Not run", "", "", "", ""])
    RESULT_DV.add(f"D{i}")
    for c in range(1, 9):
        ws.cell(row=i, column=c).alignment = WRAP

# ---------------------------------------------------------------- md sheets
import re

def add_md_sheet(title, path):
    ws = WB.create_sheet(title)
    r = 1
    maxc = 1
    lines = open(path, encoding="utf-8").read().splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        # pipe table -> real cells
        if line.lstrip().startswith("|"):
            tbl = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                row = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", c) for c in row if c):
                    tbl.append(row)
                i += 1
            for ri, row in enumerate(tbl):
                for ci, val in enumerate(row):
                    cell = ws.cell(row=r, column=ci + 1, value=val.replace("**", ""))
                    cell.alignment = WRAP
                    cell.border = BORDER
                    if ri == 0:
                        cell.fill = HDR_FILL
                        cell.font = HDR_FONT
                maxc = max(maxc, len(row))
                r += 1
            r += 1  # blank row after table
            continue
        m = re.match(r"^(#{1,4})\s+(.*)", line)
        if m:
            level = len(m.group(1))
            cell = ws.cell(row=r, column=1, value=m.group(2))
            cell.font = Font(bold=True, size={1: 16, 2: 13, 3: 12, 4: 11}[level])
            if level <= 2:
                for c in range(1, max(2, maxc) + 1):
                    ws.cell(row=r, column=c).fill = SUB_FILL if level == 2 else GROUP_FILL
            r += 1
        elif line.strip().startswith("-") or re.match(r"^\d+\.", line.strip()):
            cell = ws.cell(row=r, column=1, value=line.strip())
            cell.alignment = WRAP
            r += 1
        elif line.strip().startswith("```"):
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                cell = ws.cell(row=r, column=1, value=lines[i])
                cell.font = Font(name="Consolas", size=10)
                cell.alignment = WRAP
                r += 1
                i += 1
        elif line.strip():
            cell = ws.cell(row=r, column=1, value=line.replace("**", ""))
            cell.alignment = WRAP
            r += 1
        else:
            r += 1
        i += 1
    ws.column_dimensions["A"].width = 60
    from string import ascii_uppercase
    for idx in range(2, maxc + 1):
        ws.column_dimensions[ascii_uppercase[idx - 1]].width = 34
    ws.freeze_panes = "A2"
    return ws

add_md_sheet("7 Doc-vs-impl report", "qa/doc-vs-implementation-report.md")
add_md_sheet("8 Workflow tests (full)", "qa/manual-workflow-tests.md")

# ---------------------------------------------------------------- 6 Defect log
ws = WB.create_sheet("6 Defect log")
headers = ["Defect ID", "Date found", "Found via (sheet/test)", "Fixture client", "URL/page", "Language", "Viewport", "Severity", "Summary", "Deep description", "Embedded image", "Related report finding", "Status", "Fixed date"]
ws.append(headers)
style_header(ws, len(headers))
set_widths(ws, [10, 12, 16, 18, 26, 9, 9, 10, 36, 60, 30, 20, 10, 12])
SEV_DV = DataValidation(type="list", formula1='"Blocker,Critical,Major,Minor,Polish"', allow_blank=True)
ST_DV = DataValidation(type="list", formula1='"Open,In progress,Fixed,Wont fix"', allow_blank=True)
ws.add_data_validation(SEV_DV)
ws.add_data_validation(ST_DV)
SEV_DV.add("H2:H500")
ST_DV.add("M2:M500")

# ---------------------------------------------------------------- image embedding
# Convention: save screenshots in qa/screenshots/
#   Page QA:    page-<row number>.png   (row number = column A)  e.g. page-12.png
#   Defect log: defect-<DefectID>.png   e.g. DEF-001.png -> defect-DEF-001.png
# Or type any file name from qa/screenshots/ into the row's screenshot column.
from openpyxl.drawing.image import Image as XLImage


def embed_screenshots(ws, id_col, name_col, prefix):
    if not SCREENSHOT_DIR.exists():
        return 0
    count = 0
    for row in range(2, ws.max_row + 1):
        row_id = ws.cell(row=row, column=id_col).value
        if row_id is None:
            continue
        candidates = []
        typed = ws.cell(row=row, column=name_col).value
        if typed:
            candidates.append(SCREENSHOT_DIR / str(typed))
        for ext in ("png", "jpg", "jpeg"):
            candidates.append(SCREENSHOT_DIR / f"{prefix}-{row_id}.{ext}")
        path = next((c for c in candidates if c.is_file()), None)
        if not path:
            continue
        img = XLImage(str(path))
        scale = min(1.0, 220 / img.width)
        img.width = int(img.width * scale)
        img.height = int(img.height * scale)
        ws.add_image(img, f"{get_column_letter(name_col)}{row}")
        ws.row_dimensions[row].height = max(ws.row_dimensions[row].height or 15, img.height + 6)
        ws.cell(row=row, column=name_col).value = path.name
        count += 1
    return count


n_page_imgs = embed_screenshots(WB["1 Page QA"], 1, 14, "page")
n_def_imgs = embed_screenshots(WB["6 Defect log"], 1, 11, "defect")

# move defect log after the report sheets so it stays last
WB.move_sheet("6 Defect log", offset=len(WB.sheetnames))

# ---------------------------------------------------------------- merge previous user input
# The generator owns structure; the human owns Status/Comment cells.
# Re-apply whatever was typed into a previous copy so regenerating
# never wipes QA work again.
MERGE = {
    "1 Page QA":        (1, range(7, 16)),   # key col A; keep cols G..O
    "2 Buttons & CTAs": (1, range(5, 10)),   # E..I
    "3 Nav & Footer":   (1, range(5, 7)),    # E..F
    "4 Home sections":  (1, range(5, 9)),    # E..H
    "5 Workflow tests": (1, range(4, 9)),    # D..H
}

path_prev = "qa/Studio_Presence_QA_Workbook_v2.xlsx"
prev = {}
defect_rows = []
try:
    old = openpyxl.load_workbook(path_prev)
    for sheet, (key_col, val_cols) in MERGE.items():
        if sheet not in old.sheetnames:
            continue
        rows = {}
        for row in old[sheet].iter_rows(min_row=2):
            key = row[key_col - 1].value
            if key is None:
                continue
            vals = {c: row[c - 1].value for c in val_cols}
            if any(v not in (None, "") for v in vals.values()):
                rows[key] = vals
        prev[sheet] = rows
    if "6 Defect log" in old.sheetnames:
        for row in old["6 Defect log"].iter_rows(min_row=2):
            if any(c.value not in (None, "") for c in row):
                defect_rows.append([c.value for c in row])
except FileNotFoundError:
    pass

restored = 0
for sheet, (key_col, val_cols) in MERGE.items():
    rows = prev.get(sheet, {})
    if not rows:
        continue
    ws = WB[sheet]
    for row in ws.iter_rows(min_row=2):
        key = row[key_col - 1].value
        if key in rows:
            for c, v in rows[key].items():
                if v not in (None, ""):
                    ws.cell(row=row[0].row, column=c).value = v
            restored += 1
if defect_rows:
    ws = WB["6 Defect log"]
    r0 = 2
    while any(ws.cell(row=r0, column=c).value not in (None, "") for c in range(1, 15)):
        r0 += 1
    for i, vals in enumerate(defect_rows):
        for c, v in enumerate(vals, start=1):
            ws.cell(row=r0 + i, column=c).value = v
    restored += len(defect_rows)

wb_path = path_prev
WB.save(wb_path)
print(f"saved {wb_path}")
print(f"embedded images: page QA={n_page_imgs}, defect log={n_def_imgs}")
print(f"restored user-input rows: {restored}")
print(f"page QA rows: {r-2}")
