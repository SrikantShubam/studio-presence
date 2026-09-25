# Workspace settings propagation

## Problem

Workspace Settings saves website edits to `client_overrides`, and the dashboard applies those edits to its local content state. The dashboard shell still receives the original server-rendered studio name and owner values, so the sidebar and account chrome can remain stale until a full reload. Notification checkboxes are local React state and are not persisted.

The same settings also need an explicit propagation contract so future edits do not update one surface while leaving another surface on old data.

## Goals

- Make every visible Workspace Settings field durable.
- Update the open dashboard immediately after a successful save.
- Keep public pages and other server-rendered surfaces correct on their next request or refresh.
- Keep client website content in the existing `client_overrides` flow.
- Persist notification preferences separately from the frozen client website schema.
- Document and test where each setting appears.
- Preserve tenant isolation and existing authorization boundaries.

## Non-goals

- Realtime synchronization across already-open browser tabs.
- Changing tenant slugs, domains, tiers, templates, palettes, or section structure.
- Adding new notification delivery infrastructure.
- Changing the frozen client config schema, client fixtures, public section registry, or product spec.

## Current findings

- `SettingsTab` sends studio details through `DashboardWorkspace.saveConfig`.
- `DashboardWorkspace` updates `data.config`, which updates child dashboard tabs.
- `DashboardShell` renders `studioName`, `ownerName`, and `ownerEmail` from initial server props.
- The existing branding context only updates the logo, not the name or owner values.
- `business.ownerName` is saved, but dashboard layout currently prefers the authenticated profile name over that workspace value.
- Public website loaders already merge `client_overrides` on request.
- The tenant admin login route still uses synchronous seed-config loading and can miss saved overrides.
- Public lead notification delivery and the authenticated analytics route also read the seed config directly, so saved email and project-title edits can be stale there.
- Invitation and unauthenticated dashboard branding must use the merged tenant loader, not the base workspace loader.
- Generated icon and manifest responses need no-store caching so identity edits appear on the next request.
- `newLeadAlerts` and `weeklyDigest` are local checkbox state with no persistence or consumer.

## Design

### 1. Keep website settings in the existing override channel

Continue using `panel.saveEditableConfig` for:

- `business.name`
- `brand.logo` and derived logo fields
- `business.tagline`
- `business.phone`
- `business.whatsapp`
- `business.email`
- `business.address`
- `business.serviceAreas`
- `business.hours`
- `business.ownerName`

The existing allowlist, Zod validation, merge semantics, and tenant-scoped RLS remain the source of truth. No new config fields are added to `schema.ts`.

### 2. Add a dashboard identity state bridge

`DashboardShell` will own current session values for:

- studio name
- studio logo URL
- workspace owner name
- owner email display value

It will initialize from server props and synchronize when server props change. The existing branding context will expose setters for the values that nested dashboard components can change.

After `DashboardWorkspace.saveConfig` succeeds:

1. Apply the patch to `data.config` as it does now.
2. Update the identity bridge from the changed `business.name`, `brand.logo`, and `business.ownerName` fields.
3. Keep the desktop sidebar, mobile sidebar, account fallback, settings preview, digital card, and website editor on the same updated state.

The workspace owner name from `business.ownerName` takes precedence in workspace chrome when it is present. The authenticated profile remains the fallback.

### 3. Persist notification preferences in a separate table

Add a tenant-scoped `workspace_preferences` table with:

- `tenant_id` primary key and foreign key to the tenant
- `new_lead_alerts` boolean, default `true`
- `weekly_digest` boolean, default `true`
- `updated_at`
- `updated_by`

Enable RLS. Select and update policies must require membership in the current tenant. The service layer will expose read and update functions that accept the already-scoped database client and tenant ID.

The dashboard page will load preferences with the existing tenant context. The settings save path will update preferences separately from the website config patch. A failed preference save must report an error and must not claim that all settings were saved.

`new_lead_alerts` will control the existing dashboard alert for new enquiries. `weekly_digest` will be stored and returned for future digest delivery, but no email digest will be invented in this change because no digest sender exists yet.

### 4. Normalize server-side consumers

Use the merged public config for server-rendered tenant branding wherever an owner-editable value is displayed:

- public site sections and page routes
- page metadata, Open Graph metadata, favicon, manifest, and generated icon
- public contact and lead delivery paths
- invitation branding
- tenant login branding
- dashboard layout branding
- legacy admin chrome, where still reachable

The tenant admin login route will use the async public loader so saved overrides are visible there. Lead delivery will use the same merged loader, and authenticated analytics will load the merged workspace config. Existing public loaders already merge overrides and will remain request-based. Other open pages update on navigation or refresh, not through polling.

### 5. Save behavior

The recommended behavior is:

- The active dashboard updates immediately after a successful save.
- Other dashboard pages and server-rendered surfaces update on navigation or refresh.
- The public website uses saved values on its next request.
- Owner email changes keep the existing Supabase confirmation flow. The UI continues to distinguish a pending email confirmation from a completed account email change.

## Propagation matrix

| Setting | Durable source | Immediate dashboard consumers | Next-request consumers |
|---|---|---|---|
| Studio name | `client_overrides.business.name` | desktop/mobile sidebar, account fallback, settings, digital card, website editor, enquiry dialog | public pages, metadata, manifest/icon, login, invite, admin chrome |
| Studio logo | `client_overrides.brand.logo` and derivatives | desktop/mobile sidebar, settings, website editor, digital card | login, invite, metadata/favicon where applicable |
| Tagline | `client_overrides.business.tagline` | settings, digital card, website editor | any public surface that reads tagline |
| Phone | `client_overrides.business.phone` | settings, digital card, website editor | hero/nav, contact, footer, map/location pages, lead/contact flows |
| WhatsApp | `client_overrides.business.whatsapp` | settings, digital card, integrations status, website editor | quick actions, contact, footer, lead/contact flows |
| Public email | `client_overrides.business.email` | settings, digital card, website editor | contact, footer, careers/legal pages, lead delivery |
| Primary city/address | `client_overrides.business.address` | settings, website editor | hero, contact, map, location and area pages |
| Service areas | `client_overrides.business.serviceAreas` | settings, website editor | area-related copy and pages that read service coverage |
| Opening hours | `client_overrides.business.hours` | settings, website editor | contact, footer, estimate and location pages |
| Owner name | `client_overrides.business.ownerName` | sidebar owner label, account fallback, settings | server-rendered dashboard chrome |
| Owner email | Supabase auth user email | account menu after a confirmed change, settings status | authenticated session and account flows after confirmation |
| New enquiry alerts | `workspace_preferences.new_lead_alerts` | dashboard alert visibility | future notification consumers |
| Weekly digest | `workspace_preferences.weekly_digest` | settings checked state | future digest consumer |

The matrix distinguishes fields that already have public consumers from fields that currently only appear in admin surfaces. The implementation must not claim a consumer exists where the repository has none.

## Error handling

- Website field validation continues through `panel.validateEditablePatch`.
- Unsupported website fields remain rejected by the existing panel allowlist.
- Preference reads and writes return tenant-scoped errors without leaking another tenant's data.
- A save response reports website and preference failures clearly.
- Owner email confirmation errors preserve the existing Supabase error message handling.
- Empty or malformed values remain rejected by the existing schema validators.

## Verification

Add or update tests for:

1. Studio name updates the dashboard shell state, including desktop and mobile branding.
2. Owner name updates workspace chrome instead of remaining behind the profile metadata value.
3. Logo updates continue to update the sidebar and all dashboard previews.
4. Website settings persist through the override row and survive a reload.
5. Public config loaders return the saved values.
6. The tenant admin login uses the merged config.
7. Notification preferences persist, reload, and remain tenant-isolated.
8. New enquiry alert visibility follows `new_lead_alerts`.
9. Lead delivery and analytics use the merged workspace config.
10. Generated identity routes are not served from a stale one-hour cache.
11. Owner email changes retain the confirmation-required behavior.
12. Existing `npm run check:all` remains green.

Manual verification will use the existing minimal, Ashish Interiors, and stress fixtures where applicable, plus an authenticated workspace for database-backed settings. The final response will include a field-by-field propagation checklist and the verification commands run.
