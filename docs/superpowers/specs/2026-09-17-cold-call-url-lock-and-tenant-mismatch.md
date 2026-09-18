# Cold-Call URL Lock and Tenant Mismatch Policy

Date: 2026-09-17
Status: Conversation clarification and recommended default

This document follows the onboarding and cold-call demo records dated
2026-09-17. Older documents remain unchanged.

## Cold-call URL policy

A cold-call URL is a locked public sales asset.

- It opens the generated public demo website.
- It does not expose the dashboard by default.
- The prospect cannot rewrite the public demo through the URL.
- Public content changes are handled by Studio Presence/sales personnel or by
  the paid activation flow.
- A prospect who logs in may enter the normal onboarding flow and receive a
  tenant workspace, but that does not make the original cold-call URL an
  editable public dashboard.

The cold-call URL should therefore be treated as a read-only sales snapshot,
not as the customer's final content-management URL.

## Authenticated user opening another tenant's public demo

Recommended behavior for the rare mismatch case:

1. The public demo remains viewable because it is a public sales page.
2. The existing Supabase session does not grant access to that demo's
   dashboard, editor, leads, drafts, or tenant APIs.
3. Protected requests resolve the hostname to tenant A and independently verify
   that the authenticated user has membership in tenant A.
4. If the user belongs to tenant B instead, the protected request is denied.
5. The page may offer an explicit `Open your workspace` action leading to tenant
   B. It should not silently rewrite the public demo into tenant B.
6. If the authenticated user has no tenant, the protected action goes to the
   onboarding state rather than selecting a tenant from the URL.

This keeps the public-demo experience stable while preserving tenant isolation.
The session identifies the person; `tenant_members` authorizes the workspace.

## Why this is the default

Automatically redirecting every authenticated visitor away from a public demo
would make a sales link behave differently depending on stale browser state.
Keeping the public page visible avoids that confusion. Authorization is still
fail-closed at the dashboard and API boundary.

## Remaining URL decision

The product decision is now clear that the cold-call URL itself remains locked.
One implementation detail remains to be selected later: after onboarding, the
new tenant may either receive a separate tenant hostname or reuse the same host
for authenticated workspace routes. The public cold-call content must not be
silently replaced by user edits before paid/service activation.
