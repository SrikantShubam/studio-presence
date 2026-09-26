# Workspace activity types and cursor contract

## Scope

Ticket 1 defines the normalized activity interface. It does not add storage,
write paths, UI, or duplicate existing event rows.

## Normalized event types

| Normalized type | Source | Existing/source event names |
| --- | --- | --- |
| `lead_created` | `lead_events` | `created` |
| `lead_assigned` | `lead_events` | `assigned` |
| `lead_reassigned` | `lead_events` | `reassigned` |
| `lead_status_changed` | `lead_events` | `status_changed` |
| `lead_note_updated` | `lead_events` | `note_added`, `note_updated` |
| `member_invitation_created` | `tenant_membership_events` | `invitation_created` |
| `member_invitation_accepted` | `tenant_membership_events` | `invitation_accepted` |
| `member_invitation_revoked` | `tenant_membership_events` | `invitation_revoked` |
| `member_role_changed` | `tenant_membership_events` | `member_role_changed` |
| `member_removed` | `tenant_membership_events` | `member_removed` |
| `content_published` | `workspace_activity_events` | new storage event |
| `analytics_monthly_summary` | `workspace_activity_events` | new storage event |

Unknown source event names are ignored by the adapter rather than exposed as
untyped customer activity.

## Actor formatting

The normalized actor contains `userId`, display `name`, `initials`, and an
optional `avatarUrl`. Display name wins over email. Initials use the first and
last display-name words, or the first two characters for a single word. Missing
identity is represented as `Workspace member` with initials `WM`.

The normalized feed does not expose actor email as a display field.

## Ordering and cursor

The feed is latest-first. Events are ordered by:

1. `createdAt` descending
2. source rank ascending: `lead_events`, `tenant_membership_events`, `workspace_activity_events`
3. event UUID ascending

The opaque cursor is base64url-encoded JSON containing:

```ts
{ version: 1; source: ActivitySource; eventId: string; createdAt: string }
```

A next page contains only events older than the cursor according to the same
comparison. Invalid cursors are rejected before querying storage.

## Source ownership

Existing `lead_events` and `tenant_membership_events` remain their own sources
of truth. `workspace_activity_events` is reserved for publishing events and
completed-month analytics summaries. The normalized reader merges these sources
without copying rows between them. Operator audit events are never included.
