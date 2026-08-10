# Sonnet 5 — writing tickets 07+

Only run this after tickets 01–06 exist and at least two have been completed by a tier-1 agent. A
ticket format that has never survived contact with a cheap model is a template for repeating a
mistake.

Substitute the list of sections to write tickets for.

```
Write build tickets for a multi-tenant Next.js product. The tickets are read by a cheap model
(DeepSeek v4-flash or Gemini 3.6) working alone, in a fresh session, with no conversation history.
Everything it needs must be in the ticket or in a file the ticket names.

READ FIRST:
1. AGENTS.md — the rules every ticket inherits and none should restate
2. docs/build/tasks/01-*.md through 06-*.md — the templates. Match their shape exactly
3. backend/src/config/schema.ts — the contract. Every ticket names the config block its section reads
4. docs/product/SPEC.md §4 — the section list, with each section's variants
5. design/reference/editorial/ — the HTML fragments tickets point at

WRITE TICKETS FOR: <SECTIONS>

EACH TICKET CONTAINS
- Scope: one section, what it is, where it sits in the page flow
- Config: the exact block from backend/src/config/schema.ts it reads, quoted, plus every variant it must
  support
- Reference: the exact HTML fragment path
- Files it may create: exhaustive. Normally just sections/<Name>/**. This list is what keeps two
  parallel agents from colliding, so it has to be complete and it has to not overlap any other open
  ticket
- Acceptance: the command, plus anything specific to this section beyond the standard three-fixture
  render
- Do not touch: the frozen paths, plus anything specific

TWO THINGS THAT MAKE A TICKET FAIL IN PRACTICE

Ambiguity about empty states. Every ticket says explicitly what the section does when its content
array is empty, when its block is absent, and when enabled is false. "Renders nothing" is not
enough — say whether surrounding spacing collapses too.

Assumed context. If a ticket says "same as the others" or "follow the usual pattern", the agent has
no others and no usual. Name the file to match.

DO NOT
- Restate AGENTS.md rules inside a ticket. They are inherited. Duplicating them means they drift
- Invent config fields. If a section needs a field the schema lacks, do not add it to the ticket —
  list it separately as a contract gap for Opus to decide on. That distinction is the whole point of
  freezing the contract
- Write tickets for sections whose reference HTML does not exist yet. Say which are missing

Start by listing which sections you can write tickets for and which are blocked, and why.
```
