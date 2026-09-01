/**
 * Studio Presence - QA workbook builder for Google Sheets.
 *
 * HOW TO USE
 * 1. Create a blank spreadsheet at https://sheets.new
 * 2. Extensions > Apps Script, delete whatever is there, paste this file in.
 * 3. Run the function `buildQaWorkbook`. Approve the permission prompt once.
 * 4. Done. Re-run any time: your Status/Comment entries are merged back in,
 *    never wiped (same rule as the local generator).
 */

const FIXTURE = 'ashish-interiors'; // the one unit built so far
const VIEWPORTS = ['Mobile 375', 'Tablet 768', 'Laptop 1440'];

// ---------------------------------------------------------------- page lists

const EN_PAGES = [
  ['/', 'Home'],
  ['/about', 'Extra vs spec (report A4)'],
  ['/portfolio', 'Index - extra vs spec (A3)'],
  ['/portfolio/{slug}', 'Project detail (use one real slug)'],
  ['/projects', 'Index - extra vs spec (A3)'],
  ['/projects/{category}', 'Category page'],
  ['/services/{slug}', 'Service detail'],
  ['/areas/{locality}', 'Area page (if config enables)'],
  ['/team', 'Team index (t3)'],
  ['/team/{slug}', 'Team member (t3)'],
  ['/journal', 'Journal index (t3)'],
  ['/journal/{slug}', 'Journal post (t3)'],
  ['/news', 'News index (t3)'],
  ['/news/{slug}', 'News article (t3)'],
  ['/careers', 'Careers (t3)'],
  ['/locations', 'Index - extra vs spec (A3)'],
  ['/locations/{office}', 'Office page (t3)'],
  ['/estimate', 'Estimate calculator (t2+)'],
  ['/thank-you', 'Post-lead thank-you'],
  ['/privacy', 'Legal'],
  ['/terms', 'Legal'],
  ['404 page', 'Visit an unknown URL'],
];

const HI_PAGES = [
  ['/hi', 'Home (Hindi)'],
  ['/hi/about', ''],
  ['/hi/portfolio', ''],
  ['/hi/portfolio/{slug}', ''],
  ['/hi/projects/{category}', ''],
  ['/hi/services/{slug}', ''],
  ['/hi/team', ''],
  ['/hi/estimate', ''],
  ['/hi/locations', ''],
  ['UNTRANSLATED ROUTE e.g. /hi/journal, /hi/careers, /hi/news, /hi/team/{slug}, /hi/privacy',
    'Report finding B1: record actual behaviour (404 / redirect / English fallback)'],
];

const ADMIN_PAGES = [
  ['/login', 'Shared login (spec says /panel/login and /dashboard/login - report A5)'],
  ['/panel', 'Owner self-edit panel'],
  ['/dashboard', 'Lead list (spec said NOT built yet - report A1)'],
  ['/dashboard/analytics', ''],
  ['/dashboard/enquiries', ''],
  ['/dashboard/content', ''],
  ['/dashboard/settings', ''],
  ['/dashboard/{leadId}', 'Lead detail'],
  ['/admin', 'Undocumented admin surface (report A2)'],
  ['/super', 'Undocumented super-admin surface (report A2)'],
];

const SYSTEM_PAGES = ['sitemap.xml', 'robots.txt', 'opengraph-image', 'manifest.webmanifest'];

const CTAS = [
  ['Hero', 'Primary CTA button', 'Sand-gold (#D9BC72 token) fill only here; correct label; links to contact/WhatsApp from config'],
  ['Hero', 'Secondary CTA (if variant has one)', 'Ghost/outline style, correct target'],
  ['Quick actions row', 'WhatsApp tile', 'wa.me link, prefilled message includes studio name, opens new tab'],
  ['Quick actions row', 'Call tile', 'tel: number matches clients/*.json exactly'],
  ['Quick actions row', 'Directions tile', 'Google Maps query matches configured address'],
  ['Quick actions row', 'Instagram tile', 'Configured profile URL, new tab, rel=noopener'],
  ['Sticky mobile CTA', 'Sticky bar button', '[Mobile 375 only] appears on scroll, tap works, hides over contact form'],
  ['Nav', 'Every nav item', 'Scrolls to existing anchor; no dead links after tier downgrade'],
  ['Nav', 'Logo', 'Returns to / (or /hi on Hindi tree)'],
  ['CtaBand', 'Band CTA button', 'Mid-page and pre-footer placements both fire'],
  ['Contact section', 'Form submit', 'Validates empty input inline; success goes to /thank-you'],
  ['Footer', 'Inquiry form submit', 'Same validation + lead captured in dashboard/panel'],
  ['Footer', 'Phone / email links', 'tel:/mailto: match config'],
  ['Footer', 'Social icons', 'Correct URLs, new tab'],
  ['Footer', 'Privacy & Terms links', 'Resolve to rendered legal pages'],
  ['Portfolio cards', 'Project card click', 'Navigates to /portfolio/{slug}; whole card clickable'],
  ['Project detail', 'Gallery controls', 'Swipe at 375; arrows on desktop'],
  ['Project detail', 'Enquiry CTA', 'Present without scrolling past gallery'],
  ['Estimate', 'Calculate / result CTA', 'Shows a RANGE labelled indicative; CTA captures lead'],
  ['Journal/News cards', 'Read-more links', 'Correct slug, no mixed-language title'],
  ['Team cards', 'Member card click', 'Navigates to /team/{slug}'],
  ['Thank-you page', 'Back / WhatsApp action', 'Returns user to site or opens chat'],
  ['Panel/Dashboard', 'Save buttons', 'Persist and reflect on public site after reload'],
  ['Panel/Dashboard', 'Sign out', 'Ends session; back button shows no cached private data'],
  ['Login', 'Submit', 'Wrong password rejected cleanly; success lands on panel/dashboard'],
];

const NAV_FOOTER = [
  ['Nav', 'Links match sections actually enabled for this tier (no anchors to removed sections)'],
  ['Nav', 'Active-link highlight follows scroll position'],
  ['Nav', 'All-caps heading treatment matches Editorial identity'],
  ['Nav', '[Mobile 375] hamburger toggles; menu scrollable; body scroll locked while open'],
  ['Nav', 'Language switcher (if present) swaps EN<->HI on the SAME page, not just to home'],
  ['Footer', 'Column structure matches expanded vs compact variant chosen by config'],
  ['Footer', 'Business name, phone, email, address all match clients/*.json'],
  ['Footer', 'Every link resolves (crawl them once)'],
  ['Footer', 'Social links point at configured handles, not placeholders'],
  ['Footer', 'Copyright line: business name + current year'],
  ['Footer', 'Hairline rule uses warm brown accent token'],
  ['Footer', 'Demo watermark visible (demo/sold builds) at all three viewports'],
  ['Footer', 'Hindi footer fully translated, no English leftovers'],
  ['Footer', 'noindex meta present in source on demo build'],
];

const HOME_SECTIONS = [
  ['hero', 'standard / full-bleed / video / split', 'Headline, eyebrow device, primary CTA; scrim only behind text-on-photo'],
  ['quickActions', '-', 'Four tiles directly under hero, big tap targets'],
  ['trustBar', '-', 'Three stats from config.stats'],
  ['services', 'compact / detailed', 'Items from config.items; no lorem'],
  ['portfolio', 'grid / carousel', 'Six projects linking to detail pages'],
  ['about', '-', 'Body text + owner photo'],
  ['team', '-', 'Members from config.members (t3)'],
  ['process', '-', 'Four steps with timelines'],
  ['testimonials', 'cards / carousel', 'Demo builds must read as obviously sample content'],
  ['instagram', '-', 'Six hand-picked embeds, horizontal scroll, profile link'],
  ['faq', '-', 'Questions render; FAQPage JSON-LD in source'],
  ['contact', '-', 'Form + details from config'],
  ['map', '-', 'Embed loads, pin matches address'],
  ['ctaBand', 'mid-page / pre-footer', 'Both placements switchable from config'],
  ['stickyMobileCta', '-', 'See test W6'],
  ['footer', 'expanded / compact', 'See Nav & Footer sheet'],
];

const WORKFLOWS = [
  ['W1', 'Demo lifecycle & payment gate',
    '1. Open the demo site. Renders with status demo.\n2. View source: noindex meta present.\n3. Watermark visible on every page, Mobile 375 too.\n4. Simulate custom-domain access: expect 404 + noindex header.\n5. Set status archived: expect 410. Revert.\n6. Set status live: watermark gone, noindex gone. Revert to demo.'],
  ['W2', 'Config-only tier switch (the acceptance test)',
    '1. Note which sections appear on home at t3.\n2. Change tier to t1 in client JSON. Reload. No code edits.\n3. T2/T3-only surfaces gone (/estimate, journal, news, careers).\n4. Restore t3. Identical rendering to step 1.\n5. Swap template identity. Sections re-render from tokens, no console errors.\nAny code change needed = automatic fail of the whole architecture.'],
  ['W3', 'Render-null per section',
    'For each home section: set enabled false, then empty its content array, then delete the block. All three states render NOTHING - no empty shell, no layout gap. Restore after each.'],
  ['W4', 'Lead capture end-to-end',
    '1. Submit empty form: inline validation, no request.\n2. Fill name + phone, submit: /thank-you or inline success, no console error.\n3. Repeat on /hi: labels, validation, thank-you copy all Hindi.\n4. Lead visible in dashboard/enquiries or panel.\n5. Mobile 375: fields full-width, submit thumb-reachable.'],
  ['W5', 'WhatsApp / call / directions quick actions',
    '1. WhatsApp opens wa.me/<number> with prefilled message containing studio name.\n2. Call opens tel:<number> matching client JSON exactly.\n3. Directions opens Google Maps query matching configured address.\n4. Instagram opens configured profile, new tab, rel=noopener.\n5. Repeat on /hi and at Mobile 375. Tap targets >= ~44px.'],
  ['W6', 'Sticky mobile CTA',
    'At Mobile 375: visible when scrolled halfway down home; does not cover footer content; hides over contact form (record actual behaviour); tap fires the right action.'],
  ['W7', 'Navigation & anchors',
    '1. Desktop: every nav item scrolls to the right section; active state follows scrolling.\n2. Logo returns to / (or /hi on the Hindi tree).\n3. After a t1 downgrade (see W2), no dead anchors remain.\n4. Mobile 375: hamburger opens/closes, body does not scroll behind the open menu.'],
  ['W8', 'Footer inventory',
    'Per language: every link resolves (no 404s) incl. legal + social; phone/email/address match client JSON; copyright year and business name correct; demo watermark present where expected.'],
  ['W9', 'Estimate calculator (t2/t3)',
    '1. Enter carpet area + home type + finish. Range shown, never a single figure.\n2. Indicative label present. CTA captures a lead (verify like W4).\n3. Toggle estimate.enabled false in config: route 404s or disappears from links. Restore.'],
  ['W10', 'Portfolio & project detail',
    '1. Home featured projects: cards link to /portfolio/[slug].\n2. Detail: gallery swipes at 375, enquiry CTA present, related projects link back.\n3. Unknown slug renders the styled 404, not a crash.\n4. /portfolio and /projects index pages: do they render sanely? Record whether they should stay (report A3).'],
  ['W11', 'Journal / news / careers / team (t3)',
    '1. Index pages list items from config; empty config renders nothing (W3 rule).\n2. Article pages render with unique metadata per slug.\n3. /team cards link to /team/[slug]; member page shows bio + projects.\n4. Visit missing HI routes (/hi/journal etc.): record behaviour - 404, redirect, or English fallback. Decides report question E3.'],
  ['W12', 'Panel owner edit',
    '1. Login at /login with owner credentials; wrong password rejected cleanly.\n2. Edit hero headline, save, reload public site: change visible.\n3. Sign out: /panel and /dashboard redirect to login.\n4. Back button after logout shows no cached private data.'],
  ['W13', 'Tenant isolation',
    '1. Owner of tenant A cannot see tenant B leads (swap tenant slug in dashboard URLs): expect 403/404 or empty.\n2. /admin and /super unreachable as a normal owner.\n3. Afterwards run npm run check:tenant-isolation and npm run test:rls to back the manual pass.'],
  ['W14', 'SEO surface',
    '1. /sitemap.xml lists exactly the live public URLs for this tier (no T2+ routes at T1; no /hi unless i18n enabled).\n2. /robots.txt correct; demo builds disallow all.\n3. Home source has LocalBusiness JSON-LD; FAQ section emits FAQPage schema.\n4. /hi pages emit alternates.languages pairing en/hi; canonicals absolute.\n5. opengraph-image routes return valid images.'],
  ['W15', 'Hindi audit',
    '1. Walk the whole /hi tree noting English leftovers in UI chrome (buttons, labels, validation, dates).\n2. Devanagari renders cleanly: font loads, line-height not clipped, no overflow at 375.\n3. Prove no hardcoded Hindi in components: grep -rP "[\\x{0900}-\\x{097F}]" frontend/sections should return nothing outside i18n files.'],
  ['W16', 'Responsive sweep (every page pass)',
    'At 375 / 768 / 1440: no horizontal scroll; next/image loads with alt text; primary action thumb-reachable at 375; square corners, no shadows, no gradients except photo scrim (Editorial rules); at least two signature devices per page.'],
];

// Condensed doc-vs-implementation report. Full prose lives in qa/doc-vs-implementation-report.md.
const REPORT = [
  ['h', 'TL;DR'],
  ['sub', 'What matches the spec'],
  ['b', 'All 16 sections the spec calls built-now exist and are registered.'],
  ['b', 'Sections turn off from config alone (absent block, enabled:false, empty content all render nothing).'],
  ['b', 'The demo/sold/live/archived payment gate is enforced in middleware, not by anyone remembering.'],
  ['b', 'Colours flow through identity tokens; no hex codes in components.'],
  ['sub', 'What does not match'],
  ['b', 'Lead dashboard fully built. SPEC.md says not built; two other docs say do not build until a real prospect asks. Keep + update spec, or park behind a flag.'],
  ['b', '/admin and /super admin screens exist in zero documents.'],
  ['b', '/portfolio, /projects, /locations index pages ship though spec lists only their detail children.'],
  ['b', '/about is a standalone page; an earlier recorded decision said never build one.'],
  ['b', 'Login at /login; spec says /panel/login and /dashboard/login.'],
  ['b', 'Hindi ships as 9 hardcoded /hi routes no document describes. Careers, journal, news, team member pages, legal have no Hindi; fallback undefined.'],
  ['b', 'Schema contains tier t0. Every business document insists on exactly three tiers.'],
  ['b', 'Do first: decide the six open questions below, then run this workbook against the one built unit.'],
  ['h', 'A. Where implementation exceeds the documents'],
  ['p', 'A1 (HIGH). Dashboard built despite every document saying don\'t. SPEC.md section 1: not built. page-inventory.md and feature-tiers.md: do not build until a real prospect asks. Implementation: /dashboard plus analytics, content, enquiries, settings, lead detail. Spec allowed 3 layouts; code carries 6+. Either scope creep to reverse, or an unrecorded decision. Both unacceptable while SPEC.md is the file agents are told wins.'],
  ['p', 'A2 (MEDIUM). /admin and /super (SuperAdminConsole) appear in no product document. Undocumented privileged surfaces are what tenant-isolation audits miss. Need doc entry + explicit RLS coverage.'],
  ['p', 'A3 (MEDIUM). Index pages beyond spec: /portfolio, /projects, /locations. Spec counts only /[slug], /[category], /[office]. Changes the 27-layout arithmetic and adds unaccounted indexable URLs. Document them or cut them.'],
  ['p', 'A4 (LOW-MED). /about standalone contradicts the recorded decision to keep about/services/process/FAQ as home sections only. May be a good idea, but it is an unrecorded reversal - how this repo\'s doc rot started.'],
  ['p', 'A5 (LOW). Login at /login instead of /panel/login and /dashboard/login. Handover docs and support emails will quote wrong URLs until reconciled.'],
  ['h', 'B. Hindi matches no document (decision needed)'],
  ['p', 'page-inventory: custom, quoted separately. feature-tiers row 20: included at T3. SPEC: i18n is a config block under T3 built-later. Reality: hardcoded parallel /hi tree switched by i18n.locales - closest to feature-tiers, designed by nobody. Consequences: partial coverage (careers, journal, news, /team/[slug], /locations/[office], /areas, legal, thank-you missing in Hindi); hreflang pairing only confirmed on home; translation source undocumented; confirm no Devanagari literals pass check:hardcode.'],
  ['h', 'C. Schema/config divergences'],
  ['p', 'C1 (LOW). TIERS includes t0; docs insist on three tiers; minimal.json fixture uses it. If it means internal smoke fixture, write that beside the type. Otherwise the sub-10k tier the docs killed twice is back.'],
  ['p', 'C2. Registry carries exactly the 16 spec built-now sections. hasContent already anticipates unbuilt keys (awards, beforeAfter, journal, news, careers, caseStudy, locations) - harmless forward preparation, matches build-narrow-type-wide.'],
  ['p', 'C3. /demo-editor directory sits in the site route group with no page found; [...path] catch-all immediately notFound()s. Neither in docs. Confirm and delete or document. Catch-all behaviour itself is correct.'],
  ['h', 'D. Looks satisfied in code - verify at runtime anyway'],
  ['p', 'Payment gate in middleware (custom domain blocked unless live; archived 410; noindex headers; layout robots meta as belt-and-braces). Render-null centralised in renderableSections. Hardcode checks enforce no literals; sanctioned style attribute only in tenant layout. Variant resolution: explicit block.variant wins else identity default. Hero variants standard/full-bleed/video/split all exist.'],
  ['h', 'E. Open questions this exercise should close'],
  ['p', '1. Dashboard: keep (update SPEC section 1) or park (feature-flag off)? 2. What is t0 for, one written sentence? 3. Which pages must exist in Hindi, and fallback for the rest? 4. /portfolio, /projects, /locations indexes: wanted (document) or cut? 5. Where does the demo watermark render, every viewport? 6. Do /panel and /dashboard/content overlap? Two content-editing surfaces is one more than documented.'],
  ['h', 'F. Order of operations'],
  ['p', '1. Resolve E1-E6 with one-line decisions appended to SPEC Conflicts-resolved. 2. Run Page QA on ashish-interiors first (richest surface per hour). 3. Every Fail goes to Defect log with screenshot. 4. Close section E questions with evidence attached.'],
];

const READ_ME = [
  'Studio Presence - manual QA workbook (Google Sheets edition)',
  '',
  'How to use:',
  '1. Start the dev server (npm run dev) and test against the one unit built so far (fixture: ' + FIXTURE + '). When a second client goes live, duplicate the 1 Page QA tab per client.',
  '2. 1 Page QA: one row per page per language per viewport. Mark Status, describe findings in Comments. Check Hindi pages for stray English and vice versa.',
  '3. 2 Buttons & CTAs: every interactive element, both languages, laptop + mobile.',
  '4. 3 Nav & Footer: header navigation and footer inventory.',
  '5. 4 Home sections: section-by-section render checks including the three off-states.',
  '6. 5 Workflow tests: end-to-end scripts W1-W16, full steps in 8 Workflow tests (full).',
  '7. Screenshots: Insert > Image > Insert image in cell, straight into the Screenshot column of the failing row. Or upload to Drive and put =IMAGE("URL") in the cell.',
  '8. Every Fail gets a row in 6 Defect log.',
  '',
  'Status values: Pass / Fail / N/A (does not exist at this tier or language) / Blocked (cannot test, say why).',
  'Re-running this script is safe: your typed values are merged back in, never wiped.',
  'Reference: qa/doc-vs-implementation-report.md in the repo holds the full prose version of sheet 7.',
];

// ---------------------------------------------------------------- builders

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureSheet_(name) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function clearSheet_(sh) {
  sh.clear();
  sh.clearConditionalFormatRules();
  sh.setFrozenRows(0);
  sh.setFrozenColumns(0);
  if (sh.getMaxRows() > 1 && sh.getMaxColumns() > 0) {
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).clearDataValidations();
  }
}

function styleHeader_(sh, ncols) {
  const r = sh.getRange(1, 1, 1, ncols);
  r.setBackground('#141414').setFontColor('#ffffff').setFontWeight('bold')
    .setVerticalAlignment('middle').setWrap(true);
  sh.setFrozenRows(1);
}

function widths_(sh, ws_) {
  ws_.forEach(function(w, i) {
    if (w) sh.setColumnWidth(i + 1, w);
  });
}

function statusList_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pass', 'Fail', 'N/A', 'Blocked'], true)
    .setAllowInvalid(false).build();
}

function resultList_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(['Not run', 'Pass', 'Fail', 'Partial', 'Blocked'], true)
    .setAllowInvalid(false).build();
}

function severityList_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(['Blocker', 'Critical', 'Major', 'Minor', 'Polish'], true)
    .setAllowInvalid(false).build();
}

function defectStatusList_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(['Open', 'In progress', 'Fixed', "Won't fix"], true)
    .setAllowInvalid(false).build();
}

// ---------------------------------------------------------------- sheets

function buildReadMe_() {
  const sh = ensureSheet_('Read me');
  clearSheet_(sh);
  READ_ME.forEach(function(t, i) {
    sh.getRange(i + 1, 1).setValue(t);
  });
  sh.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  sh.setColumnWidth(1, 900);
  sh.getRange(3, 1, READ_ME.length - 2, 1).setWrap(true);
}

function buildPageQa_(prev) {
  const sh = ensureSheet_('1 Page QA');
  clearSheet_(sh);
  const hdr = ['#', 'Fixture client', 'Group', 'Page', 'Language', 'Viewport',
    'Layout', 'Content', 'Hindi/English purity', 'Buttons work',
    'No horiz. scroll @375', 'Signature devices (>=2)', 'Status',
    'Screenshot', 'Comments (describe problem in depth)'];
  sh.appendRow(hdr);
  let n = 1;
  const groups = [
    ['Public', EN_PAGES, 'EN', VIEWPORTS],
    ['Public-HI', HI_PAGES, 'HI', VIEWPORTS],
    ['Admin', ADMIN_PAGES, 'EN', ['Laptop 1440']],
    ['System', SYSTEM_PAGES.map(function(p) { return [p, '']; }), 'EN', ['Laptop 1440']],
  ];
  groups.forEach(function(g) {
    g[1].forEach(function(p) {
      g[3].forEach(function(vp) {
        sh.appendRow([n++, FIXTURE, g[0],
          p[0] + (p[1] ? '   (' + p[1] + ')' : ''), g[2], vp,
          '', '', '', '', '', '', '', '', '']);
      });
    });
  });
  styleHeader_(sh, hdr.length);
  widths_(sh, [30, 130, 80, 260, 70, 90, 70, 70, 120, 85, 110, 110, 70, 140, 420]);
  const last = sh.getLastRow();
  sh.getRange(2, 13, last - 1, 1).setDataValidation(statusList_());
  sh.getRange(2, 1, last - 1, hdr.length).setWrap(true).setVerticalAlignment('top');
  mergeBack_(prev, '1 Page QA', 1, [7, 8, 9, 10, 11, 12, 13, 14, 15], sh);
}

function buildButtons_(prev) {
  const sh = ensureSheet_('2 Buttons & CTAs');
  clearSheet_(sh);
  const hdr = ['#', 'Location', 'Element', 'Expected behaviour (from client JSON)',
    'EN status', 'HI status', 'Laptop status', 'Mobile status', 'Comments (problem in depth)'];
  sh.appendRow(hdr);
  CTAS.forEach(function(c, i) {
    sh.appendRow([i + 1, c[0], c[1], c[2], '', '', '', '', '']);
  });
  styleHeader_(sh, hdr.length);
  widths_(sh, [30, 150, 220, 400, 80, 80, 90, 90, 420]);
  const last = sh.getLastRow();
  sh.getRange(2, 5, last - 1, 4).setDataValidation(statusList_());
  sh.getRange(2, 1, last - 1, hdr.length).setWrap(true).setVerticalAlignment('top');
  mergeBack_(prev, '2 Buttons & CTAs', 1, [5, 6, 7, 8, 9], sh);
}

function buildNavFooter_(prev) {
  const sh = ensureSheet_('3 Nav & Footer');
  clearSheet_(sh);
  const hdr = ['#', 'Fixture', 'Area', 'Check item', 'Status', 'Comments'];
  sh.appendRow(hdr);
  let n = 1;
  NAV_FOOTER.forEach(function(f) {
    sh.appendRow([n++, FIXTURE, f[0], f[1], '', '']);
  });
  styleHeader_(sh, hdr.length);
  widths_(sh, [30, 140, 70, 520, 70, 420]);
  const last = sh.getLastRow();
  sh.getRange(2, 5, last - 1, 1).setDataValidation(statusList_());
  sh.getRange(2, 1, last - 1, hdr.length).setWrap(true).setVerticalAlignment('top');
  mergeBack_(prev, '3 Nav & Footer', 1, [5, 6], sh);
}

function buildHomeSections_(prev) {
  const sh = ensureSheet_('4 Home sections');
  clearSheet_(sh);
  const hdr = ['#', 'Section (config key)', 'Variants to try', 'On-state check',
    'enabled:false', 'empty content []', 'block deleted', 'Comments'];
  sh.appendRow(hdr);
  HOME_SECTIONS.forEach(function(s, i) {
    sh.appendRow([i + 1, s[0], s[1], s[2], '', '', '', '']);
  });
  styleHeader_(sh, hdr.length);
  widths_(sh, [30, 160, 200, 380, 100, 110, 100, 380]);
  const last = sh.getLastRow();
  sh.getRange(2, 5, last - 1, 3).setDataValidation(statusList_());
  sh.getRange(2, 1, last - 1, hdr.length).setWrap(true).setVerticalAlignment('top');
  sh.getRange(last + 2, 1).setValue(
    'Off-state rule (SPEC section 4): all three off-states render NOTHING - no empty shell, no layout gap.')
    .setFontWeight('bold');
  mergeBack_(prev, '4 Home sections', 1, [5, 6, 7, 8], sh);
}

function buildWorkflows_(prev) {
  const sh = ensureSheet_('5 Workflow tests');
  clearSheet_(sh);
  const hdr = ['ID', 'Test', 'Steps summary', 'Result', 'Date', 'Tester', 'Defect IDs', 'Notes'];
  sh.appendRow(hdr);
  WORKFLOWS.forEach(function(w) {
    sh.appendRow([w[0], w[1], w[2], 'Not run', '', '', '', '']);
  });
  styleHeader_(sh, hdr.length);
  widths_(sh, [40, 220, 600, 80, 90, 90, 90, 300]);
  const last = sh.getLastRow();
  sh.getRange(2, 4, last - 1, 1).setDataValidation(resultList_());
  sh.getRange(2, 1, last - 1, hdr.length).setWrap(true).setVerticalAlignment('top');
  mergeBack_(prev, '5 Workflow tests', 1, [4, 5, 6, 7, 8], sh);
}

function buildWorkflowFull_() {
  const sh = ensureSheet_('8 Workflow tests (full)');
  clearSheet_(sh);
  let r = 1;
  WORKFLOWS.forEach(function(w) {
    sh.getRange(r, 1).setValue(w[0]).setFontWeight('bold');
    sh.getRange(r, 2).setValue(w[1]).setFontWeight('bold');
    r++;
    sh.getRange(r, 2).setValue(w[2]).setWrap(true);
    sh.setRowHeightsForced(r, r, 20 + 14 * w[2].split('\n').length);
    r += 2;
  });
  widths_(sh, [60, 900]);
}

function buildReport_() {
  const sh = ensureSheet_('7 Doc-vs-impl report');
  clearSheet_(sh);
  let r = 1;
  REPORT.forEach(function(item) {
    const kind = item[0], text = item[1];
    const cell = sh.getRange(r, 1).setValue(text);
    if (kind === 'h') {
      cell.setFontWeight('bold').setFontSize(13).setBackground('#d9bc72');
      sh.setRowHeightsForced(r, r, 28);
      r += 2;
    } else if (kind === 'sub') {
      cell.setFontWeight('bold').setBackground('#efe9dd');
      r++;
    } else if (kind === 'b') {
      cell.setValue('- ' + text).setWrap(true);
      r++;
    } else {
      cell.setWrap(true);
      r += 2;
    }
  });
  widths_(sh, [1000]);
}

function buildDefectLog_(prevDefects) {
  const sh = ensureSheet_('6 Defect log');
  clearSheet_(sh);
  const hdr = ['Defect ID', 'Date found', 'Found via (sheet/test)', 'Fixture client',
    'URL/page', 'Language', 'Viewport', 'Severity', 'Summary', 'Deep description',
    'Screenshot', 'Related report finding', 'Status', 'Fixed date'];
  sh.appendRow(hdr);
  styleHeader_(sh, hdr.length);
  widths_(sh, [80, 90, 120, 130, 160, 70, 90, 80, 250, 450, 140, 140, 80, 90]);
  sh.getRange(2, 8, 500, 1).setDataValidation(severityList_());
  sh.getRange(2, 13, 500, 1).setDataValidation(defectStatusList_());
  sh.getRange(2, 1, 500, hdr.length).setWrap(true).setVerticalAlignment('top');
  (prevDefects || []).forEach(function(row) {
    sh.appendRow(row);
  });
  sh.setTabColor('#c0392b');
}

// ---------------------------------------------------------------- merge

// Reads user-entered values from the CURRENT state of the workbook before
// any sheet is rebuilt, keyed by column-A value, so a re-run never wipes QA work.
function capturePrev_() {
  const ss = ss_();
  const prev = {};
  Object.keys(MERGE_MAP_).forEach(function(name) {
    const sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return;
    const conf = MERGE_MAP_[name];
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, Math.max.apply(null, conf.keep)).getValues();
    const rows = {};
    vals.forEach(function(v) {
      const key = v[0];
      if (key === '' || key === null) return;
      const picked = {};
      conf.keep.forEach(function(c) {
        const val = v[c - 1];
        if (val !== '' && val !== null) picked[c] = val;
      });
      if (Object.keys(picked).length) rows[String(key)] = picked;
    });
    prev[name] = rows;
  });
  const dsh = ss.getSheetByName('6 Defect log');
  const defects = [];
  if (dsh && dsh.getLastRow() > 1) {
    const dv = dsh.getRange(2, 1, dsh.getLastRow() - 1, 14).getValues();
    dv.forEach(function(v) {
      if (v.join('') !== '') defects.push(v);
    });
  }
  return { prev: prev, defects: defects };
}

const MERGE_MAP_ = {
  '1 Page QA':        { keep: [7, 8, 9, 10, 11, 12, 13, 14, 15] },
  '2 Buttons & CTAs': { keep: [5, 6, 7, 8, 9] },
  '3 Nav & Footer':   { keep: [5, 6] },
  '4 Home sections':  { keep: [5, 6, 7, 8] },
  '5 Workflow tests': { keep: [4, 5, 6, 7, 8] },
};

function mergeBack_(captured, name, keyCol, keepCols, sh) {
  const rows = (captured && captured[name]) || {};
  if (!Object.keys(rows).length) return;
  const last = sh.getLastRow();
  const ids = sh.getRange(2, keyCol, last - 1, 1).getValues();
  let restored = 0;
  ids.forEach(function(idRow, i) {
    const picked = rows[String(idRow[0])];
    if (!picked) return;
    keepCols.forEach(function(c) {
      if (picked[c] !== undefined) {
        sh.getRange(i + 2, c).setValue(picked[c]);
      }
    });
    restored++;
  });
}

// ---------------------------------------------------------------- entry point

function buildQaWorkbook() {
  const captured = capturePrev_();

  // First run creates tabs in call order; later runs reuse existing tabs,
  // so the order below is also the final tab order.
  buildReadMe_();
  buildPageQa_(captured.prev);
  buildButtons_(captured.prev);
  buildNavFooter_(captured.prev);
  buildHomeSections_(captured.prev);
  buildWorkflows_(captured.prev);
  buildReport_();
  buildWorkflowFull_();
  buildDefectLog_(captured.defects);

  const ss = ss_();
  ss.setActiveSheet(ss.getSheetByName('Read me'));
  SpreadsheetApp.getActive().toast('QA workbook rebuilt. Your previous entries were merged back in.');
}
