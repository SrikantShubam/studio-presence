# Client onboarding SOP

The fixed sequence from first "yes" to live site. **Follow the order exactly, every time.**

The one operational discipline that separates productized agencies that scale from ones that
stall is a fixed delivery order with no exceptions. Letting a client bounce between stages —
"actually can we change the photos while you're doing the copy" — is precisely where scope creep
enters. The order is not a suggestion.

---

## The gate: nothing starts before this

**No build work begins until the signed contract and the cleared 50% are both in hand.**

This includes "just a quick mockup so they can see it." The only thing that exists pre-payment is
the **templated demo** — config + name + logo, ~30 minutes, watermarked, on a subdomain. That is
marketing collateral, not delivery work.

If you find yourself doing bespoke work to win a deal, the deal is not won.

---

## Stage 0 — Demo (pre-payment, intern-triggered)

Purpose: get them to react to something real.

1. Intern collects the **four minimum fields** (see below) plus one photo.
2. Generate config JSON → spin demo to `<slug>.vectorveda.online`.
3. `status: "demo"`, watermark on, `noindex` on.
4. Capture Lighthouse PDF.
5. Send: Loom walkthrough + watermarked link + PageSpeed score.

**Never build a demo on guessed data.** Wrong locality, wrong service list, or a made-up project
name reads as careless — it kills the trust argument that is the entire pitch. If the four fields
aren't available, the demo doesn't get built.

### Minimum four fields
1. Business name (exact spelling they'd want displayed)
2. Locality + city
3. What they actually do (one line)
4. Contact number for enquiries

Plus at least one real photo. Logo if they have one.

---

## Stage 1 — Contract and payment

1. Send services agreement (`../legal/services-agreement.md`) via Aadhaar eSign.
2. Send Razorpay payment link for 50%.
3. **Wait for the money to clear.** Not "payment initiated." Cleared.
4. Set `status: "sold"` in config.
5. Only now does Stage 2 begin.

---

## Stage 2 — Content collection (locked before anything else)

Send the intake form immediately after payment clears. One pass, not piecemeal over WhatsApp
for three weeks.

### Full intake
| # | Field | Required |
|---|---|---|
| 1 | Business name, exact | Yes |
| 2 | Owner/contact name | Yes |
| 3 | Locality, city, full address, pincode | Yes |
| 4 | Phone + WhatsApp number for enquiries | Yes |
| 5 | Email | Yes |
| 6 | Year founded | Yes |
| 7 | Services offered (3–6 items, one line each) | Yes |
| 8 | Service areas / localities covered | Yes |
| 9 | Working hours | Yes |
| 10 | 3–6 completed projects: title, location, 3–8 photos each | Yes |
| 11 | Owner/team photo | T1+ |
| 12 | About paragraph, or bullet points we'll write from | Yes |
| 13 | 2–3 client testimonials with name + area | T1+ |
| 14 | Logo file (or we generate one) | Optional |
| 15 | Instagram handle | Optional |
| 16 | Google Business Profile link, or "none" | T1+ |
| 17 | Before/After photo pairs | T2 |
| 18 | Awards, press, certifications | T2 |
| 19 | Anything a visitor should see first | Optional |

**Deadline: 7 days.** After 7 days with no content, the project pauses and the timeline resets
when they return. This is in the contract. State it warmly once at kickoff so it isn't a surprise.

### Photo guidance (send this verbatim)
> Phone photos are completely fine — here's how to make them work:
> - Shoot in daylight. Open the curtains, turn off the yellow tube lights.
> - Stand in a corner and shoot wide — corners make rooms look bigger.
> - Clear the clutter. Remove wires, bags, laundry, cleaning supplies.
> - Hold the phone level, straight, not tilted.
> - Send the originals, not WhatsApp-compressed forwards. Use Google Drive or email.
> - 6–10 photos per project is plenty. Quality beats quantity.

---

## Stage 3 — Build (fixed order, no bouncing)

**3a. Lock the config.** Run intake through the LLM step → generate config JSON → human review
every field. Copy is locked here. No copy changes after this point without a change order.

**3b. Lock and process the photos.** Run the Sharp CLI (crop, compress, **strip EXIF/GPS**) then
Real-ESRGAN for anything under-lit or low-resolution. Photos are locked here.

**3c. Generate the site.** Deploy to subdomain. Should take minutes, not hours.

If a client asks to change something from 3a while you're in 3b, the answer is: "noted, I'll fold
it into the review round at staging." Then actually do that. One review round, batched.

---

## Stage 4 — Staging review and balance payment

1. Send the staging link (still the subdomain, still watermarked, still `noindex`).
2. Client reviews. **One consolidated round of changes**, within scope.
3. Send balance 50% payment link.
4. **Wait for clearance.**

Never go live before the balance clears. Never, not once, not as a gesture of good faith. It is
the only real leverage in the entire arrangement, and waiving it once teaches every future client
that it can be waived.

---

## Stage 5 — Go live

Pre-launch QA checklist — 15 minutes, prevents an embarrassing bug on a client's real domain:

- [ ] Mobile view on a real phone, not just devtools
- [ ] WhatsApp CTA fires and prefills the correct contextual message
- [ ] Call button dials the correct number
- [ ] Inquiry form submits and the notification actually arrives (T2+)
- [ ] All images load; none broken; alt text present
- [ ] No placeholder text anywhere (`Lorem`, `TODO`, `{{`)
- [ ] Map pin is the actual business location
- [ ] Privacy policy and T&C pages exist and link correctly
- [ ] `LocalBusiness` schema validates in Google Rich Results Test
- [ ] Lighthouse mobile ≥90 performance, ≥95 SEO
- [ ] **`noindex` removed** and `status` set to `live`
- [ ] Watermark removed
- [ ] SSL active on the custom domain
- [ ] Uptime monitor added

Then:
1. Set `status: "live"`, attach custom domain.
2. Set up domain email (Zoho free tier).
3. GBP setup/optimisation — they add us as Manager.
4. Send the handover kit (`handover-kit.md`).
5. Send the GST invoice.

---

## Stage 6 — Post-launch

| When | Action |
|---|---|
| Day 7 | "Everything working? Any questions on updating it yourself?" |
| **Day 90** | **Case study + testimonial + referral ask.** Not at delivery — at 90 days there are real results to point at, which makes the ask easy and the testimonial credible |
| Month 11 | Renewal notice for domain + hosting |
| Ongoing | Retainer conversation, framed as funnel education — not "maintenance" |

### The retainer pitch (do not call it maintenance)
> "The website is one stage. Someone searches, finds you, and messages you — three separate steps.
> The site handles the middle one. What we do monthly is the other two: keeping your Google profile
> active so people find you, and tuning what happens after they land."

Tier 2-3 owners often don't have a mental model of a funnel. The education *is* the sale.

---

## Escalate to founder immediately
- Any request touching layout, structure, or navigation → change order, quoted separately
- Any request to go live before final payment → no, always
- Any request for credentials or backend access → no, handover package only
- Client wants to pay below the ₹12,000 floor → decline. There is no cheaper tier by design
- Client goes silent >7 days post-payment → pause, log, reset timeline
