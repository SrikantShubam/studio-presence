# Pricing and negotiation

Commercial mechanics only. Tax structure is handled separately — see `README.md` in this folder.

---

## The ladder

| Tier | List | Floor | What it is |
|---|---|---|---|
*(Three tiers only. A sub-₹10k tier was considered and dropped — see
`../product/page-inventory.md` for why.)*

| **T1 — Presence** | ₹15,000 | ₹12,000 | The core product. Most clients buy this |
| **T2 — Presence Plus** | ₹25,000 | ₹20,000 | Reviews, before/after, blog, inquiry form |
| **T3 — Growth** | ₹45,000–55,000 | ₹45,000 | Lead dashboard. Only when a prospect asks unprompted |

**Recurring**
| Item | Price |
|---|---|
| Support retainer (opt-in) | ₹1,000/mo, or ₹10,000/yr |
| Domain + hosting renewal, year 2+ | ₹1,500–2,500/yr |
| Setup fee if client brings own domain/host | Small fee at T1; waived T2+ |
| Handover if they leave | Flat ₹5,000–8,000 |
| Layout / design / structural changes | Quoted per change order |

All prices exclusive of GST at 18%.

---

## Always show a number

Never "contact for pricing." This market has been conditioned by JustDial and agencies to expect
being sized up before being quoted, and it reads as untrustworthy. A visible "starting at ₹15,000"
on the landing page and in the first message filters out non-buyers before they cost time, and
signals you aren't pricing off their perceived wealth.

---

## The concession ladder

Indian SMB buyers will negotiate. That's not an objection to overcome, it's the normal shape of the
conversation. The mistake is discounting reflexively. **Every rupee comes out in trade.**

**1. Never discount the first quote.** Immediate capitulation proves the anchor was fake and invites
another round. Hold once, always.

**2. ₹15,000 → ₹13,500** if they pay **100% upfront** instead of 50/50.
> "I can do ₹13,500 if it's paid in full upfront — saves me the follow-up."

**3. ₹15,000 → ₹12,000** if they take **reduced scope** *and* sign **case-study consent**.
> "₹12,000 works if we keep it to the core pages, and you're happy for me to show it as an example
> of our work."

**4. ₹12,000 is the floor, and there is nothing below it.** There is no cheap tier to fall back on,
by design. Below ₹12,000 the answer is no.
> "₹12,000 is genuinely where this stops making sense for us. I'd rather be straight with you than
> agree and then cut corners. If the budget changes, I'm here."

Walking away is the hard part and it's the whole discipline. A discount travels — designers in one
city talk to each other, and the number you gave one becomes the number the next one expects.

**Why no downsell option exists:** a cheap tier doesn't win the prospects who'd have said no, it
discounts the ones who'd have said yes. Roughly 57% of agencies lose ₹1,000–5,000 a month to
unbilled scope, and it lands hardest at the bottom of the ladder.

### Other trades that aren't price
- Waive the setup fee instead of cutting the price
- Include the first year's retainer
- Include one extra project page
- Faster turnaround

Each costs little and preserves the number.

---

## Handling the price conversation

**"How much?"** — answer immediately and plainly. Hesitation reads as calculating.

**"Too expensive."**
> Fair enough. What were you expecting? — [listen] — For context, JustDial runs ₹6,000 to ₹50,000
> a year, every year. This is once. And your average project is ₹2–3 lakh, so two clients and it's
> paid for itself several times over.

**"Can you do ₹8,000?"**
> Honestly, no — ₹12,000 is where this stops making sense for us, and I'd rather say that than agree
> and cut corners on your site. If the budget changes later, I'm around.

**"My nephew can do it cheaper."**
> He probably can. What we hear a lot is that those sites get built and then nobody's around when
> something needs changing. We're a registered firm — contract, invoice, someone to call next year.
> That's what the difference in price is.

---

## The ROI frame

The whole business case in one line, and it should be said out loud on every call:

> **"If this brings you two clients in a year, it has paid for itself several times over."**

An interior project is ₹50,000 to ₹5 lakh+. At ₹15,000, the site needs to produce a fraction of one
project to justify itself. Let the prospect do the arithmetic aloud — people believe their own
numbers and dismiss yours.

---

## Payment mechanics

| Stage | Amount | Trigger |
|---|---|---|
| Advance | 50% | On signing. **No work starts before it clears** |
| Balance | 50% | On staging approval. **No go-live before it clears** |

- Razorpay/Cashfree payment links sent over WhatsApp. No checkout integration needed.
- UPI carries 0% MDR; gateway platform fees ~2% + GST apply on links.
- 14-day window on the staging link, then 2%/week late fee on the outstanding balance. This is a
  behavioural deterrent against drift, not a collections mechanism — never escalate to legal threats
  at this ticket size. It costs more in close rate than it protects in revenue.
- Once Udyam registration is done, the MSMED Act gives a genuine 45-day payment right with compound
  interest at 3× the RBI rate, enforceable through the Samadhaan portal. That's the real backstop.

**The gate is structural, not a matter of discipline.** The deploy pipeline refuses to attach a
custom domain unless the client config says `status: "live"`, and only a manual step sets that.

---

## Unit economics

| | Per client |
|---|---|
| Domain (.in ₹500–800 / .com ₹1,000–1,400) | ₹500–1,400 |
| LLM config + copy | ₹5–20 |
| Photo enhancement (~30 images) | ₹15 |
| Logo / favicon / OG | ₹10–50 |
| **Total COGS** | **₹600–1,500** |

Against ₹15,000 that's **~90% gross margin**. Fixed overhead is ₹5,000–8,000/month before the first
client, rising to ~₹7,200–10,200 once Vercel Pro triggers.

### Margin per founder-hour — the number that should drive the mix

| Tier | Price | Net after COGS + 33% commission | Founder hours | **Net per hour** |
|---|---:|---:|---:|---:|
| T1 | ₹15,000 | ₹9,250 | 2.5 | **₹3,700** |
| T2 | ₹25,000 | ₹15,950 | 5.5 | **₹2,900** |
| T3 | ₹50,000 | ₹32,000 | 30 | **₹1,067** |

**T1 is the best hourly rate in the ladder. T3 is 3.5× worse.** The big custom project feels like the
win and is the least efficient thing you can do with your time.

**Therefore:**
- **Build the business around T1 volume.** Easiest sell, highest return per founder-hour.
- **T2 is the natural upgrade, not the target.** Sell it where the client actually has the content
  to justify it — reviews, before/after photos, service detail.
- **T3 is taken selectively** — when the client is a strategic reference or genuinely low-friction.
  It is not the prize it looks like, and it's the hardest thing to hand off later.

**Breakeven is one Tier-1 sale per month.** Everything past that is margin. The binding constraint
on this business is founder time, never cost — which is why the 30-minute build target matters more
than any price decision on this page.

---

## Intern commission

33% of deal value, paid the month after the client's payment fully clears.

| Deal | Commission |
|---|---|
| ₹15,000 | ₹5,000 |
| ₹25,000 | ₹8,250 |
| ₹45,000 | ₹14,850 |

Plus ₹5,000/month base for process adherence — outreach volume, documented calls, accurate tracker.
Base is for the process; commission is for the outcome.

⚠️ TDS applies once cumulative payments cross ₹20,000 in a financial year — see
`../ops/compliance-calendar.md`.

---

## Review triggers

Revisit this document when any of these happen:

- **3 closes at full price** → the anchor is validated; consider raising T1
- **3 losses on price alone** → the anchor may be wrong, or the pitch isn't landing the ROI frame
- **Repeated losses at exactly ₹12,000** → the floor may be genuinely above market for this segment;
  revisit the floor rather than quietly breaking it deal by deal
- **First renewal cycle** → confirm clients actually pay the annual charge; that assumption carries
  the recurring-revenue plan
- **₹20L turnover approaching** → GST, structure, and capital-reserve questions all change at once
