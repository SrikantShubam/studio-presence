import type { Db } from '../db/scoped'

export async function recordDemoContact(db: Db, tenantSlug: string): Promise<void> {
  const { error } = await db.rpc('record_demo_contact', { p_tenant_slug: tenantSlug })
  if (error) throw new Error('Could not record demo contact.')
}

export async function claimPendingAccess(db: Db): Promise<void> {
  const { error } = await db.rpc('claim_pending_tenant_access')
  if (error) throw new Error('Could not claim pending access.')
}

export async function claimOperatorAccess(db: Db): Promise<void> {
  const { error } = await db.rpc('claim_operator_access')
  if (error) throw new Error('Could not claim operator access.')
}

export async function getDemoWindow(db: Db, tenantSlug: string) {
  const { data, error } = await db.rpc('get_demo_window', { p_tenant_slug: tenantSlug })
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Demo window unavailable in development; using the seed revision.', { tenantSlug, error: error.message })
      return { available: true, base_revision: `${tenantSlug}:seed`, expires_at: null }
    }
    throw new Error('Could not load demo availability.')
  }
  return data?.[0] ?? null
}

export const demoAccess = { recordDemoContact, claimPendingAccess, claimOperatorAccess, getDemoWindow }
