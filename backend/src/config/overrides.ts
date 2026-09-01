import { createAnonClient } from '../db/scoped'

const reportedOverrideFailures = new Set<string>()

/**
 * Fetch a tenant's panel-edit patch for the public site to merge in.
 *
 * Goes through `get_client_overrides()`, a narrow `SECURITY DEFINER` function
 * (`backend/supabase/migrations/0002_public_overrides_read.sql`) rather than a
 * direct `select` on `client_overrides` — that table's RLS is deliberately
 * authenticated-tenant-member-only, same as every other tenant-scoped table, and
 * this function is the one narrow exception carved out for it, mirroring how
 * `submit_lead()` is the narrow exception for anonymous writes.
 *
 * A fetch failure degrades to no override rather than throwing — a client with a
 * broken overrides fetch should still serve its base `clients/<slug>.json`
 * content, not go down entirely because the panel-edit layer hiccuped.
 */
export async function fetchClientOverridePatch(slug: string): Promise<unknown> {
  const db = createAnonClient()
  const { data, error } = await db.rpc('get_client_overrides', { p_tenant_slug: slug })

  if (error) {
    if (!reportedOverrideFailures.has(slug)) {
      reportedOverrideFailures.add(slug)
      const message = `Client overrides unavailable for ${slug}: ${error.message || 'Supabase request failed'}`
      if (process.env.NODE_ENV === 'production') console.error(message)
      else console.warn(message)
    }
    return undefined
  }

  return data ?? undefined
}
