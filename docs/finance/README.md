# Finance

| Document | Contents |
|---|---|
| `pricing-and-negotiation.md` | Tier pricing, concession ladder, payment mechanics, unit economics, intern commission |
| `../ops/compliance-calendar.md` | Filing dates, TDS routine, reverse-charge routine |

---

## Tax structure — handled in a separate session

Structural tax decisions are being worked through separately and are **not settled here**. Nothing
in this folder should be treated as a decided tax position until that comes back confirmed.

### Open questions
1. **Section 44AD (6% deemed profit) vs 44ADA (50%)** for productized website delivery. Sources
   genuinely conflict on whether web design is a "specified profession." 44AD appears both more
   defensible and far cheaper — needs a CA's written position before the first filing.
2. **§10(2A) treatment under 44AD** — is a partner's full share of firm profit exempt when actual
   profit substantially exceeds the 6% deemed figure? **This assumption carries the entire
   structure.** Confirm once, in writing.
3. **Intern classification** — §194H (commission, 2% above ₹20,000/yr) vs §192 (salary). Depends on
   how the working relationship actually operates.
4. **SAC code** — 998314 (IT design and development) vs 998391 (specialty design). Both 18%, so
   rate risk is nil; wrong code invites classification queries.
5. **Two-state operation** — does operating from both Karnataka and Bihar trigger GST registration
   in both?
6. **Declaring above the 6% floor** at a ~90% real margin, as scrutiny insurance.

### Working assumptions (unconfirmed)
These shape the current plan and change if the answers come back differently:

- Partnership firm, **not LLP** — LLPs cannot use 44AD or 44ADA at all
- 70/30 profit share between the partners
- **Nil partner remuneration**, everything taken as exempt profit share — because ₹6L of rental
  income already uses ₹4.2L of the ₹12L §87A rebate headroom, so salary would create personal tax
  where there currently is none
- §194T (partner remuneration TDS) therefore doesn't apply
- QRMP scheme for quarterly GST filing
- GST composition scheme **declined** — it blocks inter-state supply, which is fatal for a remote
  B2B service

### Settled and not in dispute
- **The firm must file ITR-5 every year regardless of income, including nil.** There is no exemption
  slab for firms; flat 30% + 4% cess from the first rupee. ₹20L is the *GST* threshold and has
  nothing to do with income tax filing.
- Foreign SaaS (Vercel, LLM APIs) attracts 18% IGST under reverse charge, self-assessed and paid in
  cash, then reclaimed as ITC.
- A partnership firm must deduct TDS regardless of tax-audit status — the audit-based exemption
  applies only to individuals and HUFs.

Update this file when the CA confirms, and propagate anything that changes into
`../legal/partnership-deed-checklist.md` and `../ops/compliance-calendar.md`.
