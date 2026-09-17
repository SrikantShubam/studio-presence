# Authentication and Email-Password Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace magic-link fallback authentication with secure email/password signup, confirmation, password login, recovery, and reset flows on the archive release line while preserving Google PKCE, tenant isolation, operator access, and existing onboarding routing.

**Architecture:** Keep browser auth on the same origin that started it. Use one platform login UI for Google and email/password, a dedicated same-origin confirmation handler for signup/email-change tokens, and a separate recovery handler that accepts only recovery tokens and can redirect only to `/reset-password`. Continue resolving authorization from server-side membership/RLS and the existing operator allowlist; signup itself only creates a Supabase Auth user.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, React 19, `@supabase/ssr`, `@supabase/supabase-js`, Supabase Auth/Postgres RLS, Node `tsx` verification scripts, Vercel preview deployments.

---

### Task 1: Pin auth policy and pure security helpers

**Files:**
- Create: `docs/superpowers/specs/2026-09-17-auth-email-password.md`
- Create: `frontend/lib/auth-policy.ts`
- Modify: `frontend/lib/platform-auth.ts`
- Test: `scripts/test-platform-auth.ts`

- [ ] **Step 1: Write failing tests** for a 12-character minimum password, generic credential/recovery messages, safe same-origin callback creation, rejection of protocol-relative/external `next`, and allowlisted `/reset-password` recovery destination.
- [ ] **Step 2: Run `npm run test:platform-auth` and confirm the new assertions fail for missing helpers/old magic-link behavior.**
- [ ] **Step 3: Implement the pure helpers and the dated decision note.** The note must state that Google plus email/password supersedes magic-link-only authentication and explicitly leave onboarding unchanged.
- [ ] **Step 4: Run `npm run test:platform-auth` and confirm it passes.**
- [ ] **Step 5: Commit `test(auth): define email password security policy`.**

### Task 2: Split confirmation, recovery, and Google callback handling

**Files:**
- Create: `frontend/app/auth/confirm/route.ts`
- Create: `frontend/app/auth/recovery/route.ts`
- Create: `frontend/app/reset-password/page.tsx`
- Create: `frontend/app/reset-password/ResetPasswordForm.tsx`
- Modify: `frontend/lib/auth-callback.ts`
- Modify: `frontend/middleware.ts`
- Test: `scripts/test-platform-auth.ts`
- Test: `scripts/test-middleware.ts`

- [ ] **Step 1: Add failing route/helper tests** for Google `code` exchange, signup confirmation via `verifyOtp`, recovery-only token handling, expired/reused/malformed token errors, hostile hosts, hostile `next`, tenant mismatch, and recovery redirects that cannot select a tenant from query/cookie hints.
- [ ] **Step 2: Run `npm run test:platform-auth` and `npm run test:middleware`; confirm the old combined token path fails the new recovery and hostile-input assertions.**
- [ ] **Step 3: Implement exact-origin validation from the request host/protocol and configured allowlist. Google may call `exchangeCodeForSession` only for `code`; confirmation may call `verifyOtp` only for `signup`/`email`; recovery may call `verifyOtp` only for `recovery` and redirects only to `/reset-password`. Resolve operator, membership, or `/onboarding` only after a valid session is established.
- [ ] **Step 4: Implement reset-password submission with the 12-character policy, `updateUser({ password })`, session revocation through the supported Supabase Auth API, and normal operator/membership/onboarding routing.**
- [ ] **Step 5: Run both focused scripts and confirm they pass.**
- [ ] **Step 6: Commit `feat(auth): separate confirmation and recovery callbacks`.**

### Task 3: Replace the email-link UI with password signup/login/recovery

**Files:**
- Modify: `frontend/app/[tenant]/(admin)/login/LoginForm.tsx`
- Modify: `frontend/app/login/page.tsx`
- Modify: `frontend/app/[tenant]/(admin)/login/page.tsx`
- Modify: `frontend/lib/auth-messages.ts`
- Test: `scripts/test-platform-auth.ts`

- [ ] **Step 1: Add failing UI-contract assertions** for sign-in, create-account, forgot-password, confirmation-pending, invalid-credentials, unconfirmed-user, and generic recovery states; assert the 30-second resend cooldown remains client-side.
- [ ] **Step 2: Run the focused auth test and record the expected failures.**
- [ ] **Step 3: Implement `signUp`, `signInWithPassword`, and `resetPasswordForEmail` calls using the browser client. Signup must pass an allowlisted same-origin confirmation URL and must not call any tenant/membership/operator API. Password and recovery errors must use generic public messages.
- [ ] **Step 4: Implement the recovery form and confirmation-pending state with resend cooldown; remove the normal magic-link sign-in path and preserve Google as primary.**
- [ ] **Step 5: Run `npm run test:platform-auth` and `npm run typecheck`; confirm both pass.**
- [ ] **Step 6: Commit `feat(auth): add email password login and recovery UI`.**

### Task 4: Verify database authorization and configuration contracts

**Files:**
- Modify: `scripts/test-rls.ts`
- Modify: `scripts/test-platform-auth.ts`
- Create: `backend/supabase/templates/confirmation.html`
- Create: `backend/supabase/templates/recovery.html`
- Create: `backend/supabase/templates/email_change.html`
- Create: `docs/release/auth-provider-setup.md`

- [ ] **Step 1: Add failing RLS assertions** that an ordinary authenticated user cannot read another tenant, insert/update `tenant_members`, or reach operator access; add a signup contract assertion that no tenant or membership is created.
- [ ] **Step 2: Run `npm run test:rls` against the configured project and confirm the new checks are meaningful; do not replace them with service-role-only assertions.**
- [ ] **Step 3: Implement only the minimum migration/policy changes required by observed failures, using a new migration created by the Supabase CLI and reviewing advisors before commit.** Do not edit frozen schema/config files or add authorization based on user metadata.
- [ ] **Step 4: Add exact-copy confirmation, recovery, and email-change templates with click tracking disabled in the setup instructions. Record provider setup steps without secrets, tokens, or credentials.
- [ ] **Step 5: Run `npm run test:rls` again and commit `test(auth): prove email flow tenant boundaries`.**

### Task 5: Run release gates and prepare the draft PR

**Files:**
- Modify only files already listed above, plus required test fixtures under `scripts/`.

- [ ] **Step 1: Run `npm run typecheck`, focused auth tests, `npm run test:middleware`, `npm run test:platform-auth`, and `npm run test:rls`; capture exit codes and failure counts.
- [ ] **Step 2: Run `npm run check:all` once after focused checks are green. If it fails twice, stop and report the exact failures per `AGENTS.md`.**
- [ ] **Step 3: Start the app from this clean worktree, validate Google, confirmation, password login, recovery, reset, operator, member, no-tenant, wrong-tenant, mobile, dark mode, and the exact Vercel preview origin. Save screenshots under the permitted auth evidence path without credentials or tokens.
- [ ] **Step 4: Review the diff against `7c317aa43c38160dc5b1f474cf88918cb40ae9cc` on standards and spec axes.** The repo issue-tracker file is absent, so record that code-review automation cannot use the configured tracker until it is supplied.
- [ ] **Step 5: Push `codex/auth-email-password` and create a draft PR targeting `archive/pr15-mixed-2026-09-14`; include automated-check, provider-setup, and human-preview evidence separately.** Do not merge, delete the branch, or target `main` in this workstream.

## Self-review checklist

- [ ] Google code is exchanged only on the origin that started the flow.
- [ ] Signup confirmation and recovery use different handlers and token types.
- [ ] Recovery cannot redirect to a tenant chosen by URL or cookie.
- [ ] Signup creates only a Supabase Auth user; onboarding remains untouched.
- [ ] Operator access still comes only from the pre-provisioned allowlist/RPC.
- [ ] All public credential/recovery failures are generic.
- [ ] Passwords require at least 12 characters and resend cooldown is 30 seconds.
- [ ] No credentials, SMTP secrets, tokens, or keys are committed or printed.
- [ ] The exact Vercel preview origin and browser journeys are validated separately from local checks.
