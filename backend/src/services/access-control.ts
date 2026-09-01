import type { Db } from '../db/scoped'

export async function grantOwner(db: Db, tenantId: string, userId: string): Promise<void> {
  const { error } = await db.rpc('operator_grant_owner', { p_tenant_id: tenantId, p_user_id: userId })
  if (error) throw new Error('Could not grant owner access.')
}

export async function revokeOwner(db: Db, tenantId: string, userId: string): Promise<void> {
  const { error } = await db.rpc('operator_revoke_owner', { p_tenant_id: tenantId, p_user_id: userId })
  if (error) throw new Error('Could not revoke owner access.')
}

export async function grantEmail(db: Db, tenantId: string, email: string): Promise<void> {
  const { error } = await db.rpc('operator_grant_email', { p_tenant_id: tenantId, p_email: email })
  if (error) throw new Error('Could not grant email access.')
}

export async function grantEmailBySlug(db: Db, tenantSlug: string, email: string): Promise<void> {
  const { error } = await db.rpc('operator_grant_email_by_slug', { p_tenant_slug: tenantSlug, p_email: email })
  if (error) throw new Error('Could not grant email access.')
}

export async function revokeEmail(db: Db, tenantId: string, email: string): Promise<void> {
  const { error } = await db.rpc('operator_revoke_email', { p_tenant_id: tenantId, p_email: email })
  if (error) throw new Error('Could not revoke email access.')
}

export async function revokeEmailBySlug(db: Db, tenantSlug: string, email: string): Promise<void> {
  const { error } = await db.rpc('operator_revoke_email_by_slug', { p_tenant_slug: tenantSlug, p_email: email })
  if (error) throw new Error('Could not revoke email access.')
}

export const accessControl = { grantOwner, revokeOwner, grantEmail, revokeEmail, grantEmailBySlug, revokeEmailBySlug }
