import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * BYPASSES ROW-LEVEL SECURITY.
 *
 * Legitimate uses, and there are only three:
 *   - migrations
 *   - the deploy script, provisioning a tenant
 *   - the RLS isolation test, which needs to set up two tenants to then prove
 *     they cannot see each other
 *
 * Never a route handler. Never anything that serves a signed-in user. Note that
 * lead submission — the one place you might reach for this, since enquiries come
 * from anonymous visitors — does not need it either: `submit_lead()` is a narrow
 * SECURITY DEFINER function that can insert a lead and cannot read one back.
 *
 * `check:tenant-isolation` fails the build if this module is imported from
 * `frontend/app/**`, `frontend/middleware.ts` or `backend/src/services/**`.
 */

export function createServiceRoleClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the ' +
        'service-role client. It is meant for migrations and scripts — if you are ' +
        'hitting this from application code, use createScopedClient instead.',
    )
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
