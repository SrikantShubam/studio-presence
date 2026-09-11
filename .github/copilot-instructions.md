# Studio Presence review instructions

When reviewing this repository:

- Treat `AGENTS.md`, `docs/product/SPEC.md`, and `docs/product/OWNER-WORKFLOWS.md` as the governing product and engineering rules.
- Flag changes to frozen paths: `backend/src/config/**`, `frontend/sections/registry.ts`, `docs/product/SPEC.md`, and `clients/*.json`.
- Require tenant isolation, config-driven content, explicit authorization, and Zod validation at request boundaries.
- Check that disabled or empty sections render nothing and that no business copy, phone number, image path, or colour is hardcoded in components.
- Treat local test results, source assertions, and plans as different from hosted, browser, deployment, or production evidence.
- Review migrations for ordering, rollback safety, expand/contract compatibility, RLS, idempotency, and cross-tenant access.
- Treat Copilot findings as advisory comments. Do not infer that a passing CI check or Copilot comment proves production readiness.
