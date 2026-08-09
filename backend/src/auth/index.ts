import { createScopedClient, type Db } from '../db/scoped'
import type { Tenant } from '../db/types'

/**
 * Auth.
 *
 * Magic link only. No passwords, no social sign-in, no self-service account
 * creation — owners are provisioned by us at handover. The user is a
 * non-technical studio owner on an Android phone who signs in a handful of times
 * a month; a password is something they will lose, and a reset flow is a support
 * ticket we would rather not have.
 *
 * Sessions are Supabase's. This module only adds the bit Supabase cannot know:
 * which tenant a user belongs to, and therefore where to send them.
 */

export type SessionUser = {
  id: string
  email: string
  accessToken: string
}

export type TenantContext = {
  user: SessionUser
  tenant: Tenant
  db: Db
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'no-session' | 'no-tenant' | 'wrong-tenant',
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Resolve the tenant for a signed-in user, and hand back a client scoped to them.
 *
 * Every dashboard and panel request starts here. The returned `db` is RLS-scoped,
 * so even a downstream query that forgets to filter by tenant cannot cross the
 * boundary — which is the point of doing isolation in the database.
 */
export async function requireTenant(user: SessionUser): Promise<TenantContext> {
  const db = createScopedClient(user.accessToken)

  // RLS on `tenants` already restricts this to the user's own tenants, so there
  // is no filter to forget here.
  const { data, error } = await db.from('tenants').select('*').limit(2)

  if (error) throw new AuthError(`Could not resolve tenant: ${error.message}`, 'no-tenant')

  const tenants = (data ?? []) as Tenant[]
  const tenant = tenants[0]

  if (!tenant) {
    throw new AuthError(
      `${user.email} is signed in but belongs to no tenant. Owners are provisioned at handover — ` +
        `add a tenant_members row for this user.`,
      'no-tenant',
    )
  }

  if (tenants.length > 1) {
    // Not supported yet, and failing loudly beats silently picking the first —
    // showing an owner the wrong studio's enquiries is the worst outcome here.
    throw new AuthError(
      `${user.email} belongs to more than one tenant. Multi-tenant owners need a picker, which ` +
        `does not exist yet.`,
      'wrong-tenant',
    )
  }

  return { user, tenant, db }
}

/**
 * Where to send someone after sign-in.
 *
 * One login screen serves both routes; the tier decides the destination. The
 * dashboard is t3 only — it is what justifies the price difference — so everyone
 * else lands on the panel.
 */
export function destinationForTenant(tenant: Tenant): '/panel' | '/dashboard' {
  return tenant.tier === 't3' ? '/dashboard' : '/panel'
}

/** Whether this tenant may see the leads dashboard at all. */
export function canAccessDashboard(tenant: Tenant): boolean {
  return tenant.tier === 't3'
}
