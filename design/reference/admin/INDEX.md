# Admin screen reference — captured from Stitch

Project `11494193391856868910` ("Vector Veda - Admin Universal"), captured here because nothing in
this repo referenced it before — tickets 10-12 were written and delegated against
`docs/product/prompts/admin-universal/*.md` alone.

## Layout reference only — do not copy the colours or font

Stitch generated its own design system for this project: primary green `#10b981`/`#006c49`, Inter
font. `docs/product/prompts/admin-universal/00-universal-system.md` specifies a different palette
(`#2F6F4E` primary, system font stack) and that's what `frontend/app/globals.css`'s `--a-*` tokens
already implement. **The written spec and the existing `admin-*` Tailwind classes win.** These
screenshots are useful for structure, density, card grouping and information hierarchy — not for
hex values. This was a known, anticipated conflict (see the plan note from early in this build) and
was never an open question, just never actually captured until now.

## Screens

| File | Shows | Relevant ticket |
|---|---|---|
| `dashboard-leads-548568e5.png` | Leads list: summary row (new/total/not-contacted), filter chips, cards with WhatsApp/Call buttons | 11 |
| `dashboard-analytics-5f9092cb.png` | Headline enquiry figure, 6-month bar trend, source ranking, top projects, interpretation line | 12 |
| `client-panel-overview-27191186.png` | Panel with Projects card expanded — thumbnail grid, edit/delete, inline empty-state preview | 10 |
| `client-panel-overview-d9eb7911.png` | Same panel, all cards collapsed to one-line summaries + a separate empty-state example panel | 10 |
| `client-panel-edit-project-75340c80.png` | The add/edit project form: title, location, room type, budget, duration, photos, description, client quote | 10 |
| `content-editor-list-ace239f1.png` | Alternate panel layout — chevron-expand rows instead of accordion cards, same field set | 10 (alternate take, not authoritative) |
| `login-sign-in-e50cf331.png`, `login-sign-in-dae2b2ad.png` | Magic-link sign-in — already built (B10), kept for completeness | — |
| `login-sent-state-3eb9a2d7.png`, `login-sent-state-0b223b6c.png` | Post-submit "check your email" state — already built (B10) | — |

## Verified against the text spec

Cross-checked `dashboard-leads` and `dashboard-analytics` screenshots against
`docs/product/prompts/admin-universal/03-dashboard-leads.md` and `04-dashboard-analytics.md` — both
translated accurately (same summary figures, same "four things" on the analytics screen, same
card-not-table leads list). No corrections needed to those two ticket files.
