'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@studio/backend'

/**
 * Supabase client for Client Components — the login form, specifically.
 *
 * Only the anon key, same as any browser would have. This is what actually
 * sends the magic-link email (`signInWithOtp`); the redirect it triggers lands
 * on `(admin)/auth/callback/route.ts`, which is where a session first exists.
 *
 * The env reads below MUST be the literal, static `process.env.NEXT_PUBLIC_X`
 * member expression — not a wrapper function taking the name as a variable.
 * Verified the hard way: routing both through a shared `requireEnv(name)` that
 * did `process.env[name]` compiled cleanly and looked fine in server-rendered
 * HTML, but every real browser session threw "is not set" on sign-in. Next's
 * client-bundle inlining for `NEXT_PUBLIC_*` is static analysis over literal
 * `process.env.NEXT_PUBLIC_X` expressions; a dynamic key defeats it silently —
 * no build warning, no type error, just `undefined` at runtime in the browser
 * while the exact same code path works in Node. `backend/src/db/scoped.ts` can
 * still use the dynamic helper because it only ever runs server-side.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Run `npm run sync:env` ' +
        'from the repo root, then restart `next dev` — Next only inlines these into the browser ' +
        'bundle for routes compiled after the value existed.',
    )
  }

  return createBrowserClient<Database>(url, key)
}
