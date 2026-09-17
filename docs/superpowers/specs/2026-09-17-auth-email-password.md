# Authentication Decision: Google plus Email and Password

Date: 2026-09-17

## Decision

Studio Presence uses Google OAuth as the primary sign-in method and email/password as the fallback. Email/password includes signup, confirmation email, password login, forgot-password recovery, and password reset. This supersedes the earlier magic-link-only authentication behavior.

Signup creates only a Supabase Auth user. It does not create a tenant, membership, workspace, or operator role. After confirmation or sign-in, the existing membership and operator routing remains authoritative: operators go to `/super`, members go only to their own workspace, and users without membership go to the existing `/onboarding` contract.

## Security boundary

Google PKCE, confirmation, and recovery callbacks remain same-origin and use separate token handlers. Recovery is allowed to create a session only from a recovery token and can redirect only to `/reset-password`. URL parameters and cookies are hints, never authorization. The existing pre-provisioned operator-email allowlist and database RLS remain the only sources of elevated or tenant access.

The old magic-link path is not a normal sign-in option. Existing magic-link-only users use Forgot password once to set an initial password. A twelve-character minimum, generic credential/recovery responses, a 30-second resend cooldown, and configured Supabase Auth rate limits apply.

Onboarding is intentionally not implemented or modified by this decision.
