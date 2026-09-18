# Cold-Call versus Organic Tenant Clarification

Date: 2026-09-17
Status: Conversation clarification

This document records the final distinction between a sales-generated
cold-call demo and an organically created demo. Earlier documents remain
unchanged.

## Two separate examples

### Ashish: sales-generated cold-call demo

1. Studio Presence/AI generates the Ashish demo from the available business
   facts and Ashish Interiors as the structural seed.
2. Ashish receives a public demo URL showing the website, not the dashboard.
3. The generated studio identity and preview hostname are assigned by Studio
   Presence. Ashish cannot change them directly.
4. The page may show a clear sales message that name/domain changes are
   available through the Studio Presence team or a paid service.
5. If Ashish chooses to log in, he follows the same authentication and minimal
   onboarding flow as any other user and can then access his isolated dashboard.
6. Ashish's dashboard and data are never the same tenant as another user's.

### Shrikant: organic demo

1. Shrikant arrives through the platform and registers.
2. After email confirmation, Shrikant completes the minimal onboarding flow.
3. He enters a studio name such as `GG Studio`.
4. The system creates his own tenant and assigns the corresponding preview
   hostname, for example `gg-studio.<preview-domain>`.
5. He receives his own isolated dashboard and demo content.
6. His preview lifecycle is the same seven-day baseline as Ashish's.

## What is the same

- Same login/authentication system.
- Same email-confirmation requirement.
- Same minimal onboarding concept.
- Same tenant isolation and RLS boundary.
- Same seven-day demo baseline, subject to operator control.
- Same separation between public website content and protected dashboard/API
  access.

## What is different

| Concern | Cold-call demo | Organic demo |
|---|---|---|
| Initial identity | Studio Presence/AI assigned | User supplies it in onboarding |
| Initial preview hostname | Assigned and locked to the sales demo | Generated from onboarding studio name |
| Name/domain edits | Sales/paid-service conversation | Onboarding and later product rules |
| Entry point | Public demo link | Platform landing page/login |
| Dashboard | Hidden until the user authenticates/onboards | Available after authentication/onboarding |

This is not a custom-domain distinction. Both examples initially use preview
subdomains. Custom domains remain a separate paid/live-domain capability.

## Authorization rule

The hostname identifies the candidate tenant, but it never grants access by
itself. Protected access requires both:

```text
authenticated Supabase user
        AND
tenant_members membership for the hostname's tenant
```

Therefore Ashish cannot see Shrikant's dashboard, and Shrikant cannot see
Ashish's dashboard, even if either person knows the other's public demo URL.
