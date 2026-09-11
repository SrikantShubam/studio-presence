# Platform policies

This document is the implementation contract for platform work that crosses the
backend, dashboard, authentication, migrations, or public integrations. It is
deliberately separate from the product specification and does not change the
configuration contract.

If this document conflicts with `AGENTS.md`, `docs/product/SPEC.md`, or an
approved ticket, stop and escalate the conflict. Do not edit a frozen path to
make an implementation fit.

## Database and migration policy

Use the repository's Supabase migration history as the authoritative schema
history. Before writing SQL, inspect every migration and its dependencies.
Existing migrations, including `0028` and `0030` through `0035`, take
precedence over stale plan names; never invent a number or reuse a filename.

Each migration must:

- contain one coherent, reviewable schema change;
- preserve tenant isolation with appropriate RLS, policies, function grants,
  and safe view settings;
- use transactions where PostgreSQL permits them and call out locks, backfills,
  long-running work, or destructive operations in the PR;
- be safe to apply once and explicit about any intentionally non-idempotent
  operation; and
- include migration-list output, SQL/schema review, and hosted read-back
  evidence before merge when it affects a database.

During development, iterate against a disposable database. Do not repeatedly
apply an unfinished migration under the final filename. Once the design is
settled, create the single final migration, verify it from a clean database,
and commit it with its application code. Never use `service_role` from a
browser or treat client-side auth metadata as authorization.

## Demo handover and lifecycle

Demo access is operator-initiated. A visitor cannot self-claim a real demo by
being the first person to open a route. The intended recipient is bound to the
handover record by verified identity, normally an email invitation followed by
authentication; possession of an email string alone is not authorization.

The normal lifecycle is `queued`, `sent`, `active`, `expired`, `revoked`, or
`converted` as applicable to the implementation. The default seven-day window
starts at the recorded send/handover timestamp, not at row creation, first
visit, or an arbitrary deployment time. Staff may extend or revoke a demo only
through an authorized server action. Extension, handover, claim, expiry, and
revocation must be auditable and idempotent.

Manual staff review remains part of the operating procedure. Expiry automation
is a safety net, not proof that a prospect was reviewed. A super-admin can
revoke ownership and restore access; sales staff can manage the prospect and
handover but cannot silently remove an owner or perform privileged platform
administration.

## Roles and sensitive actions

Authorization is enforced on the server for every mutation and checked against
the selected tenant. The intended role boundary is:

| Role | Allowed scope |
| --- | --- |
| Super-admin | All tenants, migrations, deployment/activation, role changes, revocation, and reauthentication-sensitive actions |
| Sales staff | Create/update demos, record handover, grant limited access, and manage prospect workflow; privileged revoke/kick requires super-admin authorization |
| Owner | Edit and publish the assigned tenant site and invite secondary users |
| Secondary/staff | Content editing within the assigned tenant; no ownership, billing, migration, or platform administration |
| Viewer | Read-only access where explicitly granted |

Sensitive actions require a recent reauthentication check where supported,
explicit tenant and role authorization, an audit event, and safe error
handling. “Hidden in the UI” is not an authorization control. Database
functions use least privilege and do not accept an arbitrary tenant identifier
without validating the caller's membership and allowed scope.

## Authentication callback security

Callback routes are security boundaries, not generic redirect proxies.

- Build the redirect origin from a canonical configured origin or a validated
  tenant-domain map. Accept forwarded host headers only when they come from a
  trusted proxy; otherwise reject unknown hosts. Never reflect an arbitrary
  `Host`, `X-Forwarded-Host`, `next`, or redirect query value into a Location
  header.
- Validate the tenant slug against the generated tenant map and bind it to the
  authenticated session, invitation, or state value. A query-string tenant
  must not be able to select another tenant for a write.
- Use the provider's one-time code/token exchange and PKCE/state protections.
  Reject missing, expired, replayed, or mismatched state and codes.
- Keep provider errors generic to the browser, do not log raw codes, tokens,
  cookies, email links, or authorization headers, and use secure, scoped,
  HttpOnly cookies for sessions.
- Test canonical host, approved tenant host, local development host, unknown
  host, mismatched tenant, replayed callback, and malicious redirect cases.

## Revisions and publication

Content edits produce immutable revisions. A write identifies the expected
revision and returns a conflict when the current revision has changed; it must
not silently overwrite another editor. Publication is a separate authorized
transition from staging to live, with an idempotency key and an audit record.

Workers must be retry-safe and must not publish an unreviewed or partially
assembled revision. A later deployment, if requested, must identify the exact
reviewed commit and report local, hosted, browser, and production evidence
separately.

## Enquiries and notifications

All public and dashboard request bodies are parsed with the shared runtime
schemas (currently including the Zod lead input schema). TypeScript types alone
are not validation. Reject unknown or malformed input, enforce tenant scope on
the server, redact sensitive fields from logs, and keep provider credentials
server-side.

Enquiries and notification delivery use explicit states, durable outbox
records, bounded retries, and idempotency keys. A delivery failure must remain
observable without duplicating a lead or exposing its contents. Disposable
credentials and isolated test data are required before service-backed checks
become required CI gates.

## Completion gate for platform changes

A platform PR is ready for human review only when all of the following are
true:

- no frozen path is changed and every changed file has an owner and destination;
- migration order, contracts, RLS, and rollback/forward implications are
  documented;
- focused deterministic tests cover authorization, tenant isolation,
  idempotency, and failure paths;
- `npm run check:all` passes, or baseline failures are reported separately;
- database-affecting work includes migration-list and hosted read-back
  evidence;
- callback work includes the hostile-host and redirect cases above; and
- AI review is advisory: a human reviews findings, CI results, and the actual
  diff before merge.

