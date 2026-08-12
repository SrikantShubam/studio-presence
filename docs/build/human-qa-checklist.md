# Human QA checklist — tickets 01-12

How to use this: go through each line, check it against the real running site (not the code), and
mark ✅ / ❌ / ❓(couldn't tell). Anything ❌ or ❓ becomes a ticket you write yourself afterward. This
covers every ticket built so far — nothing here has been human-verified in a browser yet, only
verified by automated checks (`check:all`) and by me reading the code.

Setup once, before starting:

```bash
npm run dev
npm run provision:qa-owner -- <your-email>
```

Then sign in at the `qa-owner` tenant (t3, so it has both `/panel` and `/dashboard`) plus spot-check
`ashish-interiors` (also t3, real content) for the public-facing site. `minimal` and `stress` are
fixtures for edge cases (t0 and a deliberately overloaded t3), not accounts to sign into.

---

## Public site (tickets 01-06)

### Quick Actions (01)
- [ ] On `ashish-interiors`, exactly 3 buttons show (WhatsApp, Call, Directions)
- [ ] Tapping WhatsApp opens a real WhatsApp chat with the right number pre-filled
- [ ] Tapping Call actually dials on mobile
- [ ] Tapping Directions opens maps at the right address
- [ ] On `minimal`, this row doesn't appear at all
- [ ] At phone width, every button is a real thumb target — nothing feels fiddly to tap

### Trust bar (02)
- [ ] Stats show correctly on `ashish-interiors` — numbers/labels read right, no typos
- [ ] Nothing here on `minimal`
- [ ] No layout break at phone width

### Services (03)
- [ ] All services listed for `ashish-interiors` show correct names/descriptions
- [ ] Numbering reads 01, 02, 03... not broken
- [ ] Nothing here on `minimal`

### Portfolio (04)
- [ ] Projects show with real photos, not broken images
- [ ] "View all" link works and goes somewhere real
- [ ] Carousel (if this variant is live) actually swipes on a phone

### About (05)
- [ ] Studio bio text reads correctly, no placeholder/lorem text anywhere
- [ ] Layout looks right with or without a photo

### Testimonials (06)
- [ ] Real client quotes show, attributed correctly
- [ ] No broken avatar icons
- [ ] Carousel dots/dashes (whichever variant) work by tapping/swiping

### General public-site checks
- [ ] Visit the site on your actual phone, not just resized desktop browser — does it *feel* fast
      and native, or janky?
- [ ] Every image actually loads (no broken-image icons anywhere on the page)
- [ ] No dev-only leftovers: no "Lorem ipsum", no "TODO", no placeholder phone numbers

---

## Lead capture (ticket 07)

- [ ] Submit a real test enquiry through the site's actual form
- [ ] It shows up in `/dashboard` (or wherever leads land) within a minute
- [ ] You (or the studio owner) get a real email notification for it
- [ ] Submit again with the WhatsApp button / Call button — confirm those count as "leads" too if
      that's how the product is supposed to track them, or confirm they're intentionally NOT tracked
      as leads if that's the design (worth deciding, not assuming)

---

## Panel — content editor (tickets 09-10)

Log into `/panel` as the `qa-owner` tenant.

- [ ] You can change the phone number, save, and see it actually change on the live public page
      within about a minute (not instantly — that's expected, just confirm it does eventually)
- [ ] You can change WhatsApp number, email, business hours, address — each one round-trips
- [ ] You can add/edit/remove a portfolio project (with photo)
- [ ] You can edit the About heading/body text
- [ ] You can edit a services item
- [ ] You can add/edit testimonials
- [ ] You can pick which Instagram posts show (if that's live)
- [ ] Nowhere in the panel can you change: the template/theme, the tier, colours, or turn a whole
      section on/off — try to find such a control; if you can't, that's correct
- [ ] Try to save something obviously wrong (blank required field, garbage phone number) — does it
      show you a real, understandable error, or does it silently fail / show a raw error string?
- [ ] On your phone, is the panel actually usable, or does anything feel cramped/broken at that width?
- [ ] With 40 projects (this is what the `stress` fixture simulates — ask me how to preview it if you
      want to see it without touching real data), does the project list stay usable or turn into an
      unstyled wall?

---

## Dashboard — leads (ticket 11)

Log into `/dashboard` as `qa-owner` (T3-tier only — confirm a lower-tier account gets redirected to
`/panel` instead, doesn't error or show a blank page).

- [ ] With no leads yet, the empty state reads like real guidance ("put your website link in your
      Instagram bio..."), not "No data"
- [ ] With real leads in there, the summary numbers at top look correct by hand-counting
- [ ] Filter chips (by status, by source) actually filter the list
- [ ] Clicking WhatsApp/Call on a lead's card opens the right chat/dialer
- [ ] Opening a lead's detail view and changing its status (e.g. New → Contacted) persists — go back
      to the list, confirm it stuck
- [ ] A lead that didn't use the estimate calculator doesn't show a blank/broken budget line — it
      should just not have one
- [ ] Cards, not a table, on phone — and nothing scrolls sideways

---

## Dashboard — analytics (ticket 12, just built)

Same login, the "Analytics" tab next to "Leads".

- [ ] With no traffic/lead history yet: "We'll show this once your site has been live for a few
      weeks." — not a broken chart or a wall of zeros
- [ ] Once there's real data: enquiries this month/last month number is correct by hand-counting
      against the leads list
- [ ] Visitor count beneath it shows real numbers (this depends on the Umami tunnel being up — see
      the note below)
- [ ] Six bars for six months, even months with zero enquiries still show as a (very short) bar, not
      a missing one
- [ ] "Where enquiries came from" list is ranked highest to lowest, never a pie chart
- [ ] Top 3 projects by views — check the numbers roughly match what you'd expect from Umami's own
      dashboard if you have access
- [ ] The one-line interpretation sentence at the bottom actually changes if you change the
      underlying lead data — it shouldn't read the same canned sentence regardless of what happened
      that month
- [ ] None of these appear anywhere on this screen (if any do, that's a real bug, not a nice-to-have):
      bounce rate, session duration, page-load time, a map, device breakdown, a pie/donut chart, a
      date-range picker, an export button, a live visitor counter
- [ ] If you temporarily kill the Cloudflare tunnel on the laptop (or just wait until it's down for
      another reason) — reload the analytics screen. The enquiry numbers should still show correctly;
      only the visitor/project-view numbers should show an honest "not available" message, and the
      page shouldn't crash or blank out

---

## Cross-cutting things worth checking once, not per-ticket

- [ ] **Tenant isolation, the paranoid way**: while logged in as `ashish-interiors`, try changing the
      URL's tenant slug to `qa-owner` (or vice versa) — you should get bounced out, never see the
      other tenant's leads/panel/dashboard
- [ ] Sign out actually signs out — after it, hitting `/panel` or `/dashboard` directly redirects to
      login, doesn't show a cached page
- [ ] Magic-link login: request one, actually click the link from your real inbox, confirm it signs
      you in (this hasn't been tested through a real inbox yet, only scripted)
- [ ] Load the site on a slow connection (throttle to 3G in devtools, or just use real mobile data if
      you're somewhere with bad signal) — does anything hang or show a broken state instead of a
      loading state?

---

## Known gaps — not bugs, just not done yet (so you don't waste time reporting them)

- Google Places reviews: `GOOGLE_PLACES_API_KEY` isn't set yet — that section will be inactive
  wherever it's configured, this is expected
- Instagram embed: `META_APP_ID`/`META_APP_SECRET` aren't set yet — same, expected
- Only `ashish-interiors` has a `WEB3FORMS_<SLUG>` key configured — any other client relying on the
  form-fallback path won't have it working yet
- The Supabase DB password that briefly appeared in plaintext during debugging still needs rotating —
  that's on you, not something to test
- There's a harmless duplicate blank `UMAMI_API_URL=` line in `.env` (line 12) — cosmetic, not
  something to test, just something to clean up whenever
