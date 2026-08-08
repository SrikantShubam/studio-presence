# Compliance calendar

For: Vector Veda, partnership firm, GST-registered, QRMP scheme, Section 44AD presumptive.

> ⚠️ Structural tax questions — 44AD vs 44ADA classification, §10(2A) treatment, intern TDS section —
> are being settled separately with a CA. See `../finance/README.md`. This document is the operating
> calendar only.

---

## Recurring

| When | What | Notes |
|---|---|---|
| **7th of each month** | Deposit TDS deducted in the previous month | Late deposit costs 1.5%/month |
| **25th of each month** | GST payment challan | QRMP non-return months |
| **13th after quarter end** | GSTR-1 / IFF | |
| **22nd–24th after quarter end** | GSTR-3B | Date depends on state |
| **31 Jul / 31 Oct / 31 Jan / 31 May** | TDS return, Form 26Q | ₹200/day late fee, uncapped except at the quarter's TDS amount |
| Within 15 days of 26Q | Issue Form 16A to deductees | The intern gets this |
| **15 March** | Advance tax — single instalment | Presumptive taxpayers pay in one go |
| **31 July** | **ITR-5 — the firm's return** | **Mandatory every year, even nil.** No exemption slab for firms |
| 31 July | Personal ITR | Rental income exceeds basic exemption; rebate ≠ exemption from filing |
| Monthly, with GSTR-3B | **RCM self-assessment on foreign SaaS** | See below — the most commonly missed item |

**Not applicable yet:** GSTR-9 annual return (exempt below ₹2cr turnover) · e-invoicing (₹5cr
threshold) · tax audit (not required under 44AD).

---

## The reverse-charge routine

Vercel, Anthropic/OpenAI API, and any other foreign SaaS attract **18% IGST under reverse charge**.
The foreign supplier doesn't charge Indian GST — the obligation is ours.

Monthly, alongside GSTR-3B:
1. Total the month's foreign SaaS spend, converted at the transaction-date rate
2. Compute 18% IGST
3. **Generate a self-invoice** for it
4. **Pay the IGST in cash** — it cannot be offset against ITC
5. Claim it back as input tax credit in the same or next return

Net cash effect is roughly zero once ITC is claimed. Skipping it entirely — which is what most small
firms do — leaves interest and penalty exposure on audit.

Keep a running sheet: date, vendor, USD amount, INR converted, IGST computed, self-invoice number.

---

## Intern TDS

Commission to a non-employee falls under **§194H: 2% once aggregate payments cross ₹20,000 in a
financial year**. Not §194J's ₹50,000 — that threshold is for professional fees.

At ₹5,000/month base, the ₹20,000 threshold is crossed in month four. Commission accelerates it.

Sequence:
1. **Get a TAN before the first payout** (₹77, 3–15 days)
2. Track cumulative payments per financial year
3. From the rupee that crosses ₹20,000, deduct 2%
4. Deposit by the 7th of the following month
5. Report in Form 26Q quarterly
6. Issue Form 16A

⚠️ A partnership firm must deduct TDS regardless of tax-audit status — the audit-based exemption
applies only to individuals and HUFs. There is no "we're too small" carve-out here.

**Why this matters more than the amount suggests:** failing to deduct triggers §40(a)(ia), which
disallows **30% of the expense**. On ₹1L of commission that's ₹30,000 added back to taxable income —
on top of interest, the ₹200/day return fee, and a possible ₹10k–1L penalty. The exposure is wildly
asymmetric to the trivial effort of just deducting correctly.

⚠️ Confirm §194H vs §192 (salary) with the CA based on how the working relationship actually
operates. Fixed hours and supervision push it toward employment.

---

## Penalty reference

| Failure | Cost |
|---|---|
| Firm ITR not filed | §234F fee + §234A interest + **loss carry-forward forfeited** |
| TDS not deducted | 30% expense disallowed (§40(a)(ia)) + 1%/mo interest |
| TDS deducted, deposited late | 1.5%/month |
| TDS return late | ₹200/day (§234E) + ₹10k–1L (§271H) |
| GST registration late | ₹10,000 or 10% of tax, whichever is higher + 18% interest + no ITC for the gap |
| Advance tax short | 1%/month (§234B and §234C) |

---

## Annual rhythm

| Month | Focus |
|---|---|
| April | New FY. Reset TDS thresholds. Confirm 44AD continues |
| July | **ITR-5 (firm) + personal ITR.** Q1 TDS return |
| October | Q2 TDS return |
| January | Q3 TDS return |
| **March** | **Advance tax by the 15th.** Close the books |
| May | Q4 TDS return |

---

## One-time setup

In order — each step gates the next.

- [ ] Partnership deed executed
- [ ] **Firm PAN** — required before TAN, GST, and the current account
- [ ] Current account
- [ ] GST registration *(in process)*
- [ ] **TAN** — after firm PAN, before the first intern payout
- [x] **Udyam / MSME** — done ⚠️ *verify it's registered against the **firm's** PAN, not a
      proprietorship or personal PAN. MSMED's 45-day payment protection attaches to the registered
      entity, so the firm needs its own Udyam for the firm's invoices to be covered. Re-register
      once the firm PAN exists if it's currently under a different entity*
- [ ] Razorpay/Cashfree onboarding
- [ ] QRMP scheme opted
- [ ] 44AD position confirmed in writing by a CA
- [ ] Foreign-SaaS RCM tracking sheet started
- [ ] Professional tax — verify the Bihar slab
