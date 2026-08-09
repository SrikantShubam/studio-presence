import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@studio/backend'

/**
 * Supabase client for server components and route handlers, backed by the
 * request's cookies.
 *
 * This is NOT the RLS-scoped `createScopedClient` from `@studio/backend` —
 * that one takes an access token directly and is used once we already know who
 * the caller is. This one's job is figuring that out: it reads the session
 * Supabase's auth helpers stored in cookies after the magic-link redirect, so
 * `auth.getUser()` and `auth.getSession()` work without the caller passing a
 * token by hand.
 *
 * It still uses the anon key — same public key the browser gets — so anything
 * unscoped it does is still subject to RLS. It bypasses nothing.
 *
 * `setAll` is wrapped in try/catch because Server Components cannot set
 * cookies at all; only middleware and Route Handlers can. Middleware refreshes
 * the session on every request, so a Server Component failing to write here is
 * expected, not an error to surface.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Called from a Server Component — middleware already refreshes
            // the session on every request, so this is a no-op, not a bug.
          }
        },
      },
    },
  )
}

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
