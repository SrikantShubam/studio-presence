# Ticket 09 — Panel write-back service (B13)

## Scope

Backend only. The `panel` service: reading a tenant's editable config and writing owner edits back,
through the `client_overrides` table. Read `backend/SPEC.md` §4.1 in full before starting — it is
short and it is the entire design this ticket implements.

## The scope rule, and why this ticket exists to enforce it

`docs/product/prompts/admin-universal/02-client-panel.md` states it for the UI; this ticket states it
for the API, which is where it actually has to hold: **content is theirs, structure is ours.** An
owner can change what the site says. They cannot change layout, colours, template, tier, or which
sections exist. The panel UI (ticket 10) can hide every other control, but the API is the real
boundary — if it accepts an arbitrary JSON patch, a browser devtools session bypasses whatever the UI
hides. **The allowlist below is enforced here, server-side, not trusted to the frontend.**

## The mechanism (already decided, read `backend/SPEC.md` §4.1)

```
load = clients/<slug>.json  →  merge client_overrides.patch  →  resolve tier  →  validate
```

`clients/<slug>.json` is git-committed and Vercel's filesystem is read-only at runtime — the panel
cannot write the file. The database holds the diff instead.

**Already built:** `backend/src/config/load.ts` accepts an `override` option and merges it via
`mergePatch()` — the merge mechanics exist and are not yours to touch.

**Not yet built, and part of this ticket:** nothing currently fetches a tenant's `client_overrides`
row and passes it as that `override`. `grep -rn "loadClientConfig(" frontend` shows every call site
(`(site)/layout.tsx`, `(site)/page.tsx`, `(admin)/panel/layout.tsx`, `(admin)/login/page.tsx`) calling
it with no override at all — panel edits, once saved, currently have nowhere to reach the live site.
Add a small helper, e.g. `fetchOverride(db, tenantId): Promise<unknown>`, and wire it into the
**public site's** `loadClientConfig()` calls in `(site)/layout.tsx` and `(site)/page.tsx` — those are
the pages the SPEC's "takes effect on revalidation, in about a minute" promise is actually about.
This touches files outside `backend/`, which is why it's called out explicitly rather than left
implicit: it is real scope, not a shortcut you're taking.

Leave `(admin)/panel/layout.tsx` and `(admin)/login/page.tsx` as they are — they only need branding
(logo, name), not the full merged config, and changing them is not this ticket's job.

## The allowlist

Exactly the fields `backend/SPEC.md` §4.1 names: phone, WhatsApp, email, hours, hero image, projects,
about, services, testimonials, Instagram picks. Map these to their actual paths in
`backend/src/config/schema.ts` (e.g. `business.phone`, `business.whatsapp`, `business.email`,
`business.hours`, `sections.hero.image`, `sections.portfolio.projects`, `sections.about.body`,
`sections.services.items`, `sections.testimonials.items`, `sections.instagram.embedPostUrls` — verify
each against the actual schema, don't assume these paths are exactly right without checking).

**Anything outside that list is rejected by the service, not filtered silently.** A caller that tries
to patch `template` or `tier` or a colour token gets a clear 4xx naming the rejected field, not a
200 that quietly dropped it. Silent filtering looks like success in a test and like a support ticket
three weeks later when the owner insists they saved a change that never took.

## Build

### `backend/src/services/panel.ts`

```ts
getEditableConfig(db, tenantId): Promise<{ current: <allowlisted fields>; patch: Record<string, unknown> }>
  // "current" is the resolved value (base config + existing override applied) for
  // each allowlisted field, so the panel UI has something to pre-fill. "patch" is
  // the raw override row, in case the frontend ticket needs to distinguish
  // "never edited" from "edited back to the original value."

saveEditableConfig(db, tenantId, updatedBy, patch): Promise<{ patch: Record<string, unknown> }>
  // 1. Reject any key in `patch` not on the allowlist — a single bad key fails
  //    the whole call, it does not save the good keys and drop the bad one.
  // 2. Validate each field's value against the *same* Zod shape schema.ts uses
  //    for that field (a phone stays a phone, projects stay well-formed project
  //    objects) — this is what stops a malformed patch from reaching
  //    resolve.ts and breaking the live site on next revalidation.
  // 3. Upsert into client_overrides (merge into the existing patch — a save of
  //    just the phone number must not wipe out a previously-saved project
  //    edit). Scoped client — the client_overrides_upsert/_update RLS policies
  //    already restrict this to the caller's own tenant.
  // 4. Trigger revalidation for that tenant's pages (check how loadClientConfig
  //    is invoked/cached in the app — this may be a `revalidatePath` /
  //    `revalidateTag` call, or nothing extra if the loader already reads
  //    fresh on every request; confirm which before assuming).
```

### `frontend/app/api/[tenant]/panel/route.ts`

`GET` returns `getEditableConfig()`'s result. `PATCH` accepts a partial patch object and calls
`saveEditableConfig()`. Both behind `requireTenant()` — available at every tier, unlike the dashboard
routes, so no `canAccessDashboard()` check here.

## Files you may create

```
backend/src/services/panel.ts
frontend/app/api/[tenant]/panel/route.ts
```

Plus the same one-line export addition as tickets 07/08, and the two edits to `(site)/layout.tsx` /
`(site)/page.tsx` described above — fetch the override, pass it to `loadClientConfig()`. Nothing else
outside `backend/` and those two named files.

## Acceptance

- `npm run check:all` exits 0, including `check:tenant-isolation`
- Saving `business.phone` succeeds and `getEditableConfig()` afterward reflects the new value
- Saving `template` (or any non-allowlisted field) is rejected with a clear error naming the field —
  test this explicitly, it's the ticket's actual point
- Saving a malformed value for an allowlisted field (e.g. a phone number that fails the schema's
  phone validator) is rejected before it reaches the database
- Two separate saves — one to `business.phone`, a later one to `sections.about.body` — both persist;
  the second save does not overwrite the first (tests the merge-not-replace behaviour on the patch)
- **Isolation test, direct against the database**: tenant A's scoped client cannot read or write
  tenant B's `client_overrides` row — same pattern as tickets 07 and 08
- A signed-in owner of any tier (not just t3) can call this successfully — the panel is universal,
  confirm the route has no tier gate
- Save `business.phone` through the API, then load the tenant's public home page (`(site)/page.tsx`'s
  route) and confirm the new phone number actually appears — this is the end-to-end proof the wiring
  in `(site)/layout.tsx`/`(site)/page.tsx` works, not just that the database row changed

## Do not touch

`backend/src/config/schema.ts`, `backend/src/config/load.ts`, `backend/src/config/resolve.ts`,
`backend/supabase/migrations/**`, `frontend/sections/**`, `docs/product/SPEC.md`, `clients/*.json`,
and every `frontend/app/[tenant]/**` file except the two named above
(`(site)/layout.tsx`, `(site)/page.tsx`).
