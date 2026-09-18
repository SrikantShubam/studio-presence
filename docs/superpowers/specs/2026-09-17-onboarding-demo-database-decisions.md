# Onboarding, Demo, and Database Decisions

Date: 2026-09-17
Status: Conversation decisions recorded; implementation alignment still required

This document records the decisions clarified after the original demo-first
platform documents. The older documents remain unchanged because they contain
useful historical design context and implementation detail.

## Canonical domain language

- **User**: a Supabase Auth identity.
- **Public demo**: a temporary sales preview generated from the Ashish Interiors
  seed and adapted with prospect/business data. A public demo is not a tenant
  and does not grant tenant membership.
- **Tenant**: the commercial workspace created after a user completes the
  onboarding flow.
- **Tenant membership**: the authorization relationship that allows a user to
  access a tenant workspace. Hostnames, cookies, query parameters, and email
  addresses do not replace this authorization boundary.
- **Cold-call demo**: a generated public demo used by sales. Prospect edits are
  browser/device-local and the prospect is expected to contact Studio Presence
  for changes or activation rather than receiving a customer dashboard by
  default.
- **Organic demo**: a demo started by a user who comes through the platform,
  registers, confirms email, completes onboarding, and receives the
  user-specific demo experience with temporary Supabase-backed content.

## Decisions confirmed in conversation

1. Production's final platform domain is out of scope and remains TBD.

2. Preview validation uses the current Vercel preview deployment. User-facing
   tenant URLs should use a hostname/subdomain shape, not a tenant path.

3. Cold-call and organic visitors use the same authentication and onboarding
   system if they register. There is no separate pre-onboarding account flow.

4. A tenant is created only after onboarding. Signup and email confirmation by
   themselves do not create a tenant.

5. Onboarding supplies the studio name and primary location. The desired
   hostname is based on the studio name. If the name is already taken, add the
   primary-location suffix, and continue disambiguating if necessary.

6. Paid users may eventually change their studio name/slug, subject to the
   paid-account access and authorization rules. This is not a demo capability.

7. Generated demo content is based on the existing Ashish Interiors unit and
   is adapted by AI using prospect-provided or otherwise approved business data.
   Generated content must be validated before it is public.

8. The platform uses Supabase for authenticated/product content persistence and
   RLS remains the tenant-isolation boundary. The service-role key must not be
   exposed to browser or ordinary request paths.

9. Demo editor changes are local-only. They survive refresh on the same browser
   and device, but may disappear when storage is cleared, incognito is used, or
   the user changes device. Demo edits are not silently published.

10. A seven-day demo is the baseline, not an immutable business rule. Operators
    may expire, extend, or remove a demo according to sales and support needs.

11. Expiration removes public demo/content access. Umami analytics and the
    minimum operational metadata needed for business metrics, audit, abuse
    control, and reporting are retained according to the retention policy.

12. No invitation link is required for the ordinary user flow. A hostname may
    identify the public demo, but authentication and tenant membership still
    control dashboard/workspace access.

13. Cold-call demo volume is variable and may range from tens to thousands.
    The data model must support high-volume generated temporary demos without
    creating a tenant or membership for every generated demo.

14. Analytics are collected through Umami rather than duplicating page-view
    data as tenant content. The current backend contract describes two Supabase
    clients (scoped and service-role), not two independent Supabase projects.

## Intended lifecycle

```text
AI generates public demo
        |
        | cold-call path: temporary public demo, browser-local edits
        v
User registers and confirms email
        |
        v
Onboarding collects studio name and primary location
        |
        v
Create tenant + validated user-specific demo content
        |
        v
Grant authenticated workspace access through tenant membership/RLS
        |
        v
Demo expires, is extended, removed, or is activated according to operator state
```

The public demo record and tenant record are separate concepts. A generated
cold-call demo must not require a tenant merely to exist publicly.

## Contradictions requiring implementation reconciliation

These are not silently resolved in this document.

### 1. Current schema requires a tenant too early

`backend/supabase/migrations/0005_demo_first_admin_platform.sql` currently
defines `prospect_demos.tenant_id` as `not null`. That conflicts with the
decision that generated cold-call demos exist before onboarding and must not
create a tenant.

The implementation must either make the relationship nullable or introduce a
separate temporary public-demo record that can later be linked to a tenant.
No migration has been made here.

### 2. Existing demo design says all baselines are immutable/local-only

The 2026-08-21 demo design describes an immutable generated baseline and
browser-only edits for demos. The latest conversation additionally requires
organic users to receive temporary Supabase-backed user-specific demo content.

The likely reconciliation is:

- cold-call: temporary generated baseline plus local browser edits;
- organic: tenant created after onboarding, with temporary server-side demo
  content and the same local editor semantics for unsubmitted edits;
- paid: explicit server-side draft/publish flow.

This must be implemented as an explicit acquisition-channel/content-retention
rule, not inferred from the URL.

### 3. Existing auth documentation is stale for the current product decision

`backend/SPEC.md` currently says magic-link-only authentication with no
passwords, social sign-in, or account creation. The current product decision is
Google OAuth plus normal email/password signup/sign-in, with email confirmation
and password recovery. The auth specification and implementation must be
updated in a future dated revision; the frozen old document is not silently
rewritten here.

### 4. Existing callback behavior is not yet the onboarding lifecycle

The current generic callback routes users without a tenant to the generic demo
path. The clarified lifecycle requires onboarding before tenant creation.
Authentication success, onboarding completion, tenant creation, and membership
granting must become separate states.

### 5. Domain storage is missing from the current model

The existing model uses tenant slugs and committed client fixtures. It does not
yet provide a database-owned hostname/domain registry for dynamically generated
demo hosts, preview hosts, and later paid custom domains. Hostname resolution
must be database-backed and must still verify tenant membership for protected
workspace access.

### 6. Cold-call registration boundary remains ambiguous

The conversation says that a registered cold-call user should see the same
onboarding flow as an organic user, but also says cold-call users should remain
browser-only and contact Studio Presence rather than receiving a dashboard.

Before implementation, decide whether completing onboarding converts a
cold-call visitor into the organic tenant flow, or whether the acquisition
channel continues to block tenant/dashboard persistence until manual activation.

## Free preview-domain note

DigitalPlat is the relevant free-domain option found during this review. It
offers free namespaces such as `qzz.io`, `dpdns.org`, `us.kg`, `xx.kg`, and
`qd.je`, and supports external nameservers. This matches Vercel's wildcard
requirement better than ordinary dynamic-DNS providers.

The previous `srikantsubham.qd.je` attempt retained DigitalPlat nameservers and
added a wildcard CNAME. The correct Vercel wildcard flow is to add the wildcard
domain to Vercel and delegate the domain's authoritative nameservers to the
nameservers Vercel supplies.

## Do not infer from this record

- This record does not authorize production-domain changes.
- This record does not authorize deletion of existing Supabase data.
- This record does not make cold-call demos tenant accounts.
- This record does not make a hostname an authorization credential.
- This record does not change the frozen product contract or client fixtures.
