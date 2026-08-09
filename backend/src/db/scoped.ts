import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * The RLS-scoped client. Every request path uses this one.
 *
 * It carries the signed-in user's access token, so Postgres applies the row-level
 * policies in `supabase/migrations/0001_init.sql` and isolation happens in the
 * database rather than in a `WHERE` clause somebody has to remember to write.
 *
 * The distinction matters because the failure mode is silent: an application that
 * filters by tenant correctly returns exactly the same rows as one protected by
 * RLS. Nothing in testing tells you which of the two you have — you find out when
 * a refactor drops the filter and one studio starts seeing another's enquiries.
 *
 * `check:tenant-isolation` fails the build if the service-role client is reachable
 * from anything under `frontend/app/**`.
 */

export type Db = SupabaseClient<Database>

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill in the Supabase values from ` +
        `Project Settings → API.`,
    )
  }
  return v
}

/**
 * A client acting as the signed-in user.
 *
 * @param accessToken the user's Supabase access token, from the session
 */
export function createScopedClient(accessToken: string): Db {
  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
}

/**
 * An anonymous client. Public site visitors, and the only thing they can reach is
 * `submit_lead()` — every table policy is scoped to `authenticated`.
 */
export function createAnonClient(): Db {
  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
