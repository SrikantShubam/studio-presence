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
 * The project URL is the bare origin. supabase-js appends `/rest/v1` and
 * `/auth/v1` itself.
 *
 * Worth guarding because the Supabase dashboard surfaces the *REST* URL
 * (`…supabase.co/rest/v1/`) in several places, and pasting that produces a
 * request to `/rest/v1//rest/v1/…`. The resulting error is
 * `PGRST125 Invalid path specified in request URL`, which says nothing about the
 * actual cause and cost an hour once already.
 */
function projectUrl(): string {
  const raw = requireEnv('NEXT_PUBLIC_SUPABASE_URL').trim()
  const url = new URL(raw)

  if (url.pathname !== '/' && url.pathname !== '') {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL should be the bare project origin, not a path. ` +
        `Got "${url.origin}${url.pathname}" — use "${url.origin}". ` +
        `supabase-js adds /rest/v1 and /auth/v1 on its own.`,
    )
  }

  return url.origin
}

/**
 * A client acting as the signed-in user.
 *
 * @param accessToken the user's Supabase access token, from the session
 */
export function createScopedClient(accessToken: string): Db {
  return createClient<Database>(
    projectUrl(),
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
    projectUrl(),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
