# Invitation-Specific Signup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a new workspace invitee create a confirmed account and enter the workspace after one invitation email, without sending a second Supabase confirmation email.

**Architecture:** Keep normal email signup unchanged. Add one Supabase Edge Function as the only trusted boundary that handles invitation-specific account creation. The function validates the bearer invitation token and email, creates an email-confirmed user with the submitted password, signs that user in server-side, and accepts the invitation through the existing authenticated RPC. The browser then signs in normally and redirects to the invitation result. The service-role key never enters the Next.js bundle or browser. This architecture requires an explicit exception to the repository rule that currently restricts service-role use to migrations and deploy scripts; implementation is blocked until that exception is approved and recorded.

**Tech Stack:** Next.js App Router, Supabase Auth, Supabase Edge Functions, `@supabase/supabase-js`, Brevo invitations, TypeScript, Deno-compatible Edge Function code.

---

## Constraints and Decisions

- Keep global Supabase email confirmation enabled for ordinary signups.
- The invitation email remains the only email for a new invitee.
- Existing accounts continue through Google or normal password sign-in.
- The submitted invitation email must match `tenant_invitations.email_lower`.
- Existing migration `0020_harden_invitation_acceptance.sql` is already applied and supplies truthful errors plus idempotent reopening.
- Do not put `SUPABASE_SERVICE_ROLE_KEY` in Next.js request handlers, client code, or public environment variables.
- A Supabase Edge Function is still a request path. The coding agent must not implement this plan until the project owner explicitly authorizes the narrow exception: service-role use only inside the Supabase-managed Edge Function, never in Next.js or browser code.
- Supabase Free includes Edge Functions. Keep this to one function and one invocation per invitation signup attempt. Official limits to verify during deployment: 500,000 invocations/month, 100 functions/project, 256 MB memory, 150 seconds wall time.
- Do not commit secrets. The human or Supabase agent must set production function secrets.

## Files and Ownership

### Create

- `supabase/functions/invitation-signup/index.ts` — trusted invitation signup endpoint.
- `frontend/lib/invitation-signup.ts` — typed browser client for invoking the function.
- `scripts/test-invitation-signup.ts` — non-secret contract tests for validation and response mapping, plus an opt-in integration path.

### Modify

- `frontend/app/[tenant]/(admin)/login/LoginForm.tsx` — route invitation account creation through the function and preserve normal signup behavior elsewhere.
- `frontend/app/invite/[token]/page.tsx` — keep the existing post-auth acceptance and redirect handling; update only if the new response contract needs a distinct error state.
- `scripts/test-platform-auth.ts` — assert invitation signup no longer uses `signUp()` for the invitation path and still uses normal signup for non-invitation paths.
- `package.json` — add only the targeted test script if needed.

### Supabase-agent / human-owned

- Deploy `invitation-signup` to project `ujlmztnfngotxvgdlcry`.
- Configure function secrets and allowed origins.
- Verify the deployed function and run the live membership tests.
- Do not edit existing migrations unless a new database change is proven necessary.

## Architecture Review Gate

The independent review returned **NO-GO under the current repository rules**. Supabase Free supports Edge Functions, but the proposed trusted admin client is still privileged request-path code. The reviewer found no non-service-role design that both skips the second email and preserves global email confirmation. Therefore:

- Do not implement Tasks 1–4 yet.
- First obtain explicit approval for the narrow Edge Function exception.
- If approval is denied, revert to the current confirmation-email flow or choose the globally-disabled-confirmation policy as a separate decision.
- After approval, record the exception in the project policy before implementation and rerun the review.

## Task 1: Define the Function Contract First

**Files:**
- Create: `frontend/lib/invitation-signup.ts`
- Test: `scripts/test-invitation-signup.ts`

- [ ] Define the request shape:

```ts
export type InvitationSignupInput = {
  token: string
  email: string
  password: string
}
```

- [ ] Define stable response codes:

```ts
export type InvitationSignupErrorCode =
  | 'invalid_invitation'
  | 'expired_invitation'
  | 'revoked_invitation'
  | 'wrong_email'
  | 'account_exists'
  | 'invalid_password'
  | 'rate_limited'
  | 'unavailable'
```

- [ ] Define the browser helper to POST JSON to the configured Supabase Edge Function URL without exposing any privileged key.
- [ ] Add tests for request serialization, success response parsing, and each error-code-to-message mapping.
- [ ] Run the focused test and confirm it fails before the helper exists.
- [ ] Commit the contract separately.

## Task 2: Implement the Supabase Edge Function

**File:**
- Create: `supabase/functions/invitation-signup/index.ts`

- [ ] Handle `OPTIONS` with an allowlist-based CORS response. Allow the configured candidate and production roots plus their tenant subdomains. Reject unknown origins.
- [ ] Accept only `POST` with `{ token, email, password }`.
- [ ] Normalize the email with trim and lowercase. Enforce the existing 12-character password policy before touching Auth.
- [ ] Hash the raw invitation token with Web Crypto SHA-256. Never log the raw token, email-plus-password body, or service-role client responses.
- [ ] Use a server-only admin client to load the invitation row by `token_hash` and validate in this order:
  1. token exists
  2. not revoked
  3. not accepted, unless this request is an idempotent retry by the same user, which is handled after sign-in
  4. expiry is in the future
  5. normalized email matches `email_lower`
- [ ] Call `auth.admin.createUser({ email, password, email_confirm: true })`.
- [ ] Map an existing email to `account_exists` without revealing whether unrelated accounts exist.
- [ ] Use a non-admin Supabase client inside the function to sign in the newly-created user with the password. Do not return an Auth session from the function.
- [ ] Use the resulting access token to call `accept_tenant_invitation` through the authenticated client. This preserves `auth.uid()`, RLS boundaries, role assignment, audit events, and migration-0020 idempotency.
- [ ] Return `{ ok: true }` only after invitation acceptance succeeds.
- [ ] If acceptance fails after user creation, return a generic unavailable response and log only a request correlation ID. Do not log the password or token.
- [ ] Add a simple per-request body size limit and rely on Supabase Auth rate limits. Do not add a paid dependency or a database queue.
- [ ] Run the function's local typecheck and unit tests.
- [ ] Commit the function separately.

## Task 3: Connect the Invitation Login UI

**File:**
- Modify: `frontend/app/[tenant]/(admin)/login/LoginForm.tsx`

- [ ] Keep the current invitation default of `Create account`.
- [ ] When `isInvite && intent === 'signup'`, call `invitationSignup({ token, email, password })` instead of `supabase.auth.signUp`.
- [ ] Derive the token only from the validated invitation `nextPath`. Do not accept an arbitrary token field from the user.
- [ ] On `{ ok: true }`, call the browser's `signInWithPassword` with the same email and password, then redirect through the existing `authCallbackUrl` to the invitation path with `auth=1`.
- [ ] On `account_exists`, tell the user to switch to `Sign in` rather than showing an account-creation failure.
- [ ] On wrong email, expired, revoked, or invalid invitation responses, show the matching invitation error and keep the user on the invitation flow.
- [ ] Keep the existing confirmation-email state for ordinary non-invitation signup.
- [ ] Keep Google OAuth unchanged.
- [ ] Add platform-auth assertions proving ordinary signup still calls `signUp` and invitation signup calls the Edge Function path.
- [ ] Verify the password is never included in URLs, logs, analytics, or error messages.

## Task 4: Verify the End-to-End Behavior

**Files:**
- Modify: `scripts/test-platform-auth.ts`
- Create or modify: `scripts/test-invitation-signup.ts`

- [ ] Add a unit-level test for every function error code.
- [ ] Add an opt-in integration test requiring explicit test credentials. It must:
  - create a fresh invitation;
  - submit the invitation signup request;
  - sign in with the created email and password;
  - confirm workspace membership and assigned role;
  - reopen the same invitation and confirm idempotent success;
  - confirm wrong-email, expired, revoked, and duplicate-account cases fail safely;
  - delete test users and tenants in cleanup.
- [ ] Run:

```bash
npm run test:platform-auth
npm run test:team-membership
npm run test:authorization
npm run typecheck
npm run lint
npm run check:hardcode
```

- [ ] Manually verify at 375px that the new account form has no horizontal overflow and the primary action remains reachable.
- [ ] Capture a screenshot of the invitation signup state and successful redirect if the repository's screenshot tooling is available.

## Supabase Agent Prompt

Send this to the Supabase-capable agent after the code is ready:

```text
Deploy and verify the invitation-specific signup function for project ujlmztnfngotxvgdlcry.

Context:
- Supabase Free tier is required. Use one Edge Function only.
- Existing migration 0020_harden_invitation_acceptance.sql is already applied.
- Do not alter existing tables or disable global email confirmation.
- The function must be named invitation-signup.
- It must validate token hash, expiry, revoked_at, accepted_at, and email_lower.
- It may use the trusted Edge Function service-role/admin client only inside the function.
- It must create a confirmed user with email_confirm=true, sign in that user server-side, then call the authenticated accept_tenant_invitation RPC.
- Never print or return service-role keys, passwords, raw invite tokens, or full request bodies.

Before deployment:
1. Confirm the function uses only Free-tier-supported APIs.
2. Confirm required secrets are available without exposing values.
3. Confirm CORS is restricted to the configured app origins.
4. Confirm duplicate email, wrong email, expired, revoked, invalid, and already-accepted cases map to stable error codes.

Deploy the function, then return:
- function name and deployment status;
- configured origin names, without secret values;
- endpoint health result;
- exact curl shape with redacted placeholders only;
- any blockers requiring the human.
Do not change unrelated database objects.
```

## Human-Only Instructions

The human must perform these dashboard or credential actions because the agent must not receive or print privileged credentials:

1. In Supabase Dashboard, open **Edge Functions** for project `ujlmztnfngotxvgdlcry`.
2. Confirm the Free plan has function deployment available and review the current invocation quota.
3. Set the function's allowed-origin configuration to the candidate URL and production URL roots. The function allows those roots and their tenant subdomains. Do not paste secrets into chat.
4. If the function does not receive the platform-injected admin secret automatically, add the service-role secret through the Supabase secret manager. Never add it to Git or a `NEXT_PUBLIC_` variable.
5. Confirm the function is deployed and returns a non-sensitive health response.
6. Send one fresh invitation to a test address and complete the new single-email flow.
7. Verify ordinary non-invitation signup still sends the normal confirmation email.

## Rollback

- Disable the `invitation-signup` function or remove its frontend feature flag.
- Restore invitation signup to the existing `supabase.auth.signUp` path.
- Do not disable global email confirmation as a rollback.
- Existing accounts and accepted invitations remain valid.

## Definition of Done

- New invitee receives one invitation email, sets a password, and reaches the workspace without a second confirmation email.
- Existing-account invitees can sign in or use Google and accept the invitation.
- Wrong-email, expired, revoked, invalid, duplicate, and already-accepted cases have truthful messages.
- Ordinary email signup still requires Supabase confirmation.
- No service-role secret reaches browser code or Next.js bundles.
- Supabase Free-tier limits are respected.
- All listed tests pass and the candidate deployment is READY.
