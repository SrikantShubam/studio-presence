# Cold-Call Demo Gate Clarification

Date: 2026-09-17
Status: Clarifies the onboarding/demo distinction in the same-day database decision record

This document adds the clarified behavior to
`2026-09-17-onboarding-demo-database-decisions.md`. Earlier documents remain
unchanged.

## Correct user journey

Cold-call and organic users do not have different onboarding systems.

The difference is what happens before the prospect chooses to authenticate.

```text
Cold-call link or organic visit
        |
        v
Public demo website
        |
        | no dashboard shown here
        v
Prospect decides whether to continue
        |
        v
Login / registration
        |
        v
Email confirmation
        |
        v
Simple onboarding
        |
        v
Tenant creation + membership + user-specific demo workspace
        |
        v
Dashboard/editor access
```

## Product rules

- A cold-call recipient first sees the public website/demo, not the dashboard.
- The public demo is intended to communicate the product without requiring the
  prospect to understand the admin system.
- The prospect may choose Login when they want to inspect or edit more deeply.
- Once authenticated and onboarded, a cold-call prospect follows exactly the
  same tenant, dashboard, and editing flow as an organic user.
- Completing onboarding is the trigger for tenant creation.
- Abandoning signup or onboarding does not create a tenant or membership.
- After onboarding, the user can edit their demo according to the same demo
  rules as an organic user.
- Authentication protects dashboard/editor/workspace access; it does not make
  the public demo itself private.

## Previous contradiction resolved

The earlier wording that cold-call users should remain browser-only and never
receive a dashboard was incorrect. Browser-only edits apply to the public demo
before authenticated onboarding. A cold-call prospect who deliberately logs in
and completes onboarding becomes an ordinary authenticated demo user.

The acquisition source may still be retained for sales analytics, but it must
not be used as an authorization rule or as a reason to deny the user the
onboarding/dashboard flow after they authenticate.

## Remaining implementation questions

These are the only material questions still open:

1. When a cold-call prospect completes onboarding, should the generated public
   demo be copied into the new tenant as the initial baseline, including the
   prospect-specific AI content?

2. If the cold-call demo already has a public hostname, should onboarding:

   - keep that hostname and associate it with the new tenant; or
   - issue the new onboarding hostname based on the studio name and redirect or
     retire the original cold-call hostname?

3. If an already-authenticated user opens a cold-call demo link, should they
   still see the public demo first, or may the application take them directly to
   their authenticated workspace?

Until these are answered, no hostname reassignment or demo-to-tenant copy
operation should be implemented.
