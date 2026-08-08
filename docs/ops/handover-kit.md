# Handover kit

What the client gets at go-live, and what they get if they leave. Built once, reused every time.

The single highest-leverage deliverable at handover is a **recorded walkthrough**, not a written
manual. Nobody reads the manual. Everybody watches the 4-minute video.

---

## Part 1 — Go-live handover pack

Sent the day the site goes live on their domain.

### Contents
1. Live site URL
2. Loom walkthrough video (script below)
3. Self-serve panel link + login
4. Domain email details (`hello@theirdomain.in`)
5. Lighthouse/PageSpeed PDF
6. GST invoice
7. One-page "what happens next"

### The message
> Hi [Name] — you're live: [URL]
>
> Quick 4-minute video walking you through everything, including how to update your own photos and
> details: [Loom link]
>
> Your email is set up: hello@[domain]. Login details below.
>
> Your site scored [X]/100 on Google PageSpeed — attached. For context, most interior design sites
> in [city] score under 50.
>
> Invoice attached. Anything at all, just message me here.

---

## Part 2 — Loom walkthrough script

Record **once, generic**, with a 20-second personalised intro per client. 4 minutes total. No face,
no mic needed — screen recording with captions or TTS works.

### Structure

**0:00–0:20 — Personalised intro** *(re-record per client)*
> Hi [Name], your site is live at [URL]. Quick tour of what's there and how to update it yourself.

**0:20–1:20 — The site tour** *(generic)*
Scroll through on a phone view. Point out: hero, services, portfolio, testimonials, map.
> Notice this button follows you down the page — that's the WhatsApp button. When someone taps it,
> a message opens on their phone already written, and it lands on yours. That's the main thing this
> site is for.

**1:20–2:30 — Updating your own content** *(generic)*
Open the self-serve panel. Show only the four things they'll actually touch:
- Changing the phone number
- Swapping the main photo
- Adding a project to the portfolio
- Editing the About text

> Change it, hit save, and it's live in about a minute. That's everything most people ever need.

**2:30–3:20 — What we handle** *(generic)*
> Your Google Business Profile is set up — that's what makes you show up on Maps. Your domain and
> email are registered in your name. We keep an eye on whether the site is up.
>
> Layout or design changes come to us — message me and I'll quote it.

**3:20–4:00 — Close** *(generic)*
> Two things worth doing: put this link in your Instagram bio, and send it to anyone who asks for
> your work. That's where most of the traffic will come from early on.
>
> Anything at all, message me. I'll check in in a few weeks.

---

## Part 3 — What the client can and can't change

Set this expectation at handover, not the first time they ask.

| They can change themselves | Comes to us (quoted) |
|---|---|
| Phone / WhatsApp number | Layout or section order |
| Hero photo | Colours, fonts, overall look |
| Portfolio projects — add, remove, reorder | New pages |
| Project photos and captions | Navigation structure |
| About text | New features |
| Services list | Anything not in their package |
| Business hours | |
| Testimonials | |

The line is: **content is theirs, structure is ours.** It's easy to explain and easy to hold.

---

## Part 4 — Exit handover (if they leave)

Flat fee **₹5,000–8,000**, priced in advance so it's never negotiated under pressure.

### What they get
- Complete export of site code as configured for them
- All their content: text, images, project data
- Their domain (already in their name — nothing to transfer)
- A plain-English note on what they'd need to host it elsewhere

### What they don't get
- Our accounts or credentials
- Backend, CMS admin, or deployment access
- The underlying template or component library — our IP, per §5 of the agreement

### Process
1. They request handover in writing
2. Invoice the flat fee, wait for clearance
3. Export code + content to a zip, share via Drive
4. Confirm domain is in their name and note the expiry date
5. Remove them from our Vercel project, uptime monitor, Umami
6. Mark `status: "archived"` in config, keep the record
7. Send a genuinely warm closing message — they may come back, and they talk to other designers

Never make an exit difficult. A client who leaves cleanly says good things; a client who has to
fight for their content tells every designer in the city.

---

## Part 5 — Post-launch schedule

| When | Action |
|---|---|
| Day 7 | "Everything working? Any questions on updating it?" |
| **Day 90** | **Case study + testimonial + referral ask.** By now there are real results to point at, which makes both the ask and the answer credible. Asking at delivery gets a polite generic quote; asking at 90 days gets a usable one |
| Month 6 | Retainer conversation, framed as funnel education |
| Month 11 | Renewal notice for domain + hosting |

### The Day 90 message
> Hi [Name] — it's been about three months. How's it going, are you getting enquiries through the
> site?
>
> Two things if you have a minute:
> 1. Would you be up for a couple of lines I could use as a testimonial?
> 2. If you know another designer who could use this, we do ₹2,000 off your next work for a referral.

---

## Part 6 — Referral mechanic

Start once 3–5 clients are live and happy. Designers in the same city know each other, and a warm
referral converts many times better than any cold outreach.

- **₹2,000 off** their next piece of work, or off their annual renewal
- Ask at Day 90, when they're happiest and have results
- Track referral source in the tracker — if it becomes the main channel, that changes the whole
  go-to-market and is worth knowing early
