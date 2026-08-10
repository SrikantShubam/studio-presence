# Tier 2 — escalation

For **gpt-5.6-sol via Codex**, on a ticket that failed `check:all` twice at tier 1. Substitute
`<TICKET>` and paste the failing agent's report where indicated.

```
A weaker model attempted the ticket below twice and could not get `npm run check:all` to pass. Its
work is on the current branch. Your job is to finish it.

READ FIRST:
1. AGENTS.md — the rules, absolute
2. docs/build/tasks/<TICKET>.md — the ticket
3. backend/src/config/schema.ts — the contract block this ticket uses
4. frontend/sections/Hero/ — the worked example. Match it
5. `git diff` — what the previous attempt actually did

WHAT THE PREVIOUS ATTEMPT REPORTED:
<PASTE THE FAILING AGENT'S REPORT>

BEFORE YOU FIX ANYTHING
Run `npm run check:all` yourself and read the real failure. The previous agent's account of what
went wrong is a hypothesis, not evidence — it failed twice, which is some indication its model of
the problem was wrong. Treat its diff the same way: partly useful, partly the reason you are here.

You may discard its work entirely and start from the reference HTML if that is cleaner. Salvaging a
confused implementation is often more expensive than redoing it, and nobody is attached to it.

THE ONE OUTCOME THAT IS NOT A FAILURE
If the ticket genuinely cannot be done without editing backend/src/config/**, frontend/sections/registry.ts or
docs/product/SPEC.md — say so and stop. Those are frozen. A ticket that turns out to need a contract
change has found a real gap in the contract, which is useful information. Working around it by
loosening a type or hardcoding a value destroys that information and leaves a defect behind.

Never disable or weaken a check to make the work pass.

DONE MEANS
Everything in the ticket's own acceptance section, plus `npm run check:all` exiting 0 against all
three fixtures.

Start by running the checks and telling me what is actually broken.
```
