# Startup prompts

One file per role. Paste the fenced block as the first message in a fresh session, substituting the
`<>` placeholders. Every prompt points the agent at files rather than restating context — that is
what keeps them short and what keeps the repo, not a chat history, as the source of truth.

Not to be confused with `docs/product/prompts/`, which holds the *design* prompts used to generate
the mockups.

| File | Model | Used for |
|---|---|---|
| `tier1-section.md` | DeepSeek v4-flash (OpenCode) · Gemini 3.6 (Antigravity) | One section ticket, HTML → React |
| `tier2-escalation.md` | gpt-5.6-sol (Codex) | A ticket that failed `check:all` twice at tier 1 |
| `codex-backend.md` | gpt-5.5 (Codex CLI), gpt-5.6-luna for follow-up fixes | Dashboard CRUD, API routes, analytics queries |
| `codex-pages.md` | gpt-5.5 (Codex CLI), gpt-5.6-luna for follow-up fixes | Assembling built sections into a page layout |
| `sonnet-batch-review.md` | Sonnet 5 | Gate 3, every ~5 merged tickets |
| `sonnet-tickets.md` | Sonnet 5 | Writing tickets 07+ from the 01–06 templates |

## Rules that apply to all of them

- Start a **fresh session per ticket.** Carrying context between tickets is how drift spreads: an
  agent that saw a shortcut accepted in ticket 03 will reuse it in ticket 09
- The agent reads `AGENTS.md` first, always. It is not restated in these prompts
- Nothing here grants permission to edit a frozen path. That restriction lives in `AGENTS.md` and
  no ticket overrides it
