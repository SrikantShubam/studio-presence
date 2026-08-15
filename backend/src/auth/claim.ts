import { createScopedClient } from '../db/scoped'

/**
 * Claim an unowned demo site for the signed-in user.
 *
 * Wraps `claim_demo_tenant()` (migration 0003). The database holds every rule
 * worth holding — demo status only, no existing members, and always for
 * `auth.uid()` rather than a caller-supplied id — so there is nothing to enforce
 * here and nothing a bug in this file could loosen. It is a scoped client, not
 * the service role, on purpose: this runs in a request path.
 *
 * Never throws. A failed claim is an ordinary outcome, not an error: the site is
 * already owned, or it is live, or the slug is wrong. Every one of those means
 * the same thing to the caller — you are signed in and this site is not yours —
 * and the caller already renders that state.
 */
export async function claimDemoTenant(accessToken: string, slug: string): Promise<boolean> {
  const db = createScopedClient(accessToken)
  const { data, error } = await db.rpc('claim_demo_tenant', { p_slug: slug })

  if (error) {
    console.error('Demo-tenant claim failed', { slug, error: error.message })
    return false
  }

  return data === true
}
