import { createHash, randomBytes } from 'node:crypto'
import { z } from 'zod'
import type { Db } from '../db/index'
import type { TenantInvitation, TenantMemberRole } from '../db/types'

export const workspaceRoleSchema = z.enum(['editor', 'viewer'])
export type WorkspaceMemberRole = z.infer<typeof workspaceRoleSchema>

export type WorkspaceMember = {
  user_id: string
  tenant_id: string
  role: TenantMemberRole
  created_at: string
  email: string | null
  display_name: string | null
}

export type WorkspaceInvitation = Omit<TenantInvitation, 'token_hash'>

const INVITATION_TTL_MS = 24 * 60 * 60 * 1000

export function normalizeInviteEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function hashInvitationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function makeInvitationToken(): string {
  return randomBytes(32).toString('base64url')
}

export async function listWorkspaceMembers(db: Db, tenantId: string): Promise<WorkspaceMember[]> {
  const { data, error } = await db.rpc('list_tenant_members', { p_tenant_id: tenantId })
  if (error) throw new Error(`Could not load workspace members: ${error.message}`)
  return (data ?? []) as WorkspaceMember[]
}

export async function listWorkspaceInvitations(db: Db, tenantId: string): Promise<WorkspaceInvitation[]> {
  const { data, error } = await db
    .from('tenant_invitations')
    .select('id, tenant_id, email_lower, email_display, role, expires_at, accepted_at, revoked_at, invited_by, created_at')
    .eq('tenant_id', tenantId)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Could not load invitations: ${error.message}`)
  return (data ?? []) as WorkspaceInvitation[]
}

export async function createWorkspaceInvitation(
  db: Db,
  input: { tenantId: string; email: string; role: WorkspaceMemberRole },
): Promise<{ invitationId: string; token: string; expiresAt: string }> {
  const email = z.string().email().parse(normalizeInviteEmail(input.email))
  const token = makeInvitationToken()
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS).toISOString()
  const { data, error } = await db.rpc('create_tenant_invitation', {
    p_tenant_id: input.tenantId,
    p_email_lower: email,
    p_email_display: input.email.trim(),
    p_role: input.role,
    p_token_hash: hashInvitationToken(token),
    p_expires_at: expiresAt,
  })
  if (error) throw new Error(error.message)
  return { invitationId: data, token, expiresAt }
}

export async function revokeWorkspaceInvitation(db: Db, invitationId: string): Promise<void> {
  const { error } = await db.rpc('revoke_tenant_invitation', { p_invitation_id: invitationId })
  if (error) throw new Error(error.message)
}

export async function changeWorkspaceMemberRole(
  db: Db,
  input: { tenantId: string; userId: string; role: WorkspaceMemberRole },
): Promise<void> {
  const { error } = await db.rpc('change_tenant_member_role', {
    p_tenant_id: input.tenantId,
    p_user_id: input.userId,
    p_role: input.role,
  })
  if (error) throw new Error(error.message)
}

export async function removeWorkspaceMember(db: Db, tenantId: string, userId: string): Promise<void> {
  const { error } = await db.rpc('remove_tenant_member', { p_tenant_id: tenantId, p_user_id: userId })
  if (error) throw new Error(error.message)
}

export async function acceptWorkspaceInvitation(db: Db, token: string): Promise<{ tenantId: string; role: WorkspaceMemberRole }> {
  const { data, error } = await db.rpc('accept_tenant_invitation', { p_token_hash: hashInvitationToken(token) })
  if (error) throw new Error(error.message)
  const accepted = data?.[0]
  if (!accepted) throw new Error('Invitation could not be accepted.')
  return { tenantId: accepted.tenant_id, role: accepted.role }
}

export async function sendWorkspaceInvitation(input: {
  to: string
  studioName: string
  inviterName: string
  role: WorkspaceMemberRole
  inviteUrl: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  const from = process.env.RESEND_FROM_EMAIL ?? 'Studio Presence <onboarding@resend.dev>'
  if (/@(gmail|googlemail|yahoo|hotmail|outlook|icloud)\./i.test(from)) {
    throw new Error('RESEND_FROM_EMAIL must use a verified sending domain, not a personal mailbox address.')
  }
  const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  const logoUrl = new URL('/brand/studio-presence-logo.svg', input.inviteUrl).toString()
  const inviter = input.inviterName || 'your workspace owner'
  const text = [
    `${inviter} has invited you to join ${input.studioName} on Studio Presence.`,
    '',
    `Role: ${input.role}`,
    `Invited by: ${inviter}`,
    '',
    `This invitation expires in 24 hours. Open the link to accept:`,
    input.inviteUrl,
  ].join('\n')
  const html = `<!doctype html><html><body style="margin:0;background:#f4f3ef;color:#171717;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #deddd8"><tr><td style="padding:28px 32px;border-bottom:1px solid #deddd8"><img src="${logoUrl}" width="48" height="48" alt="Studio Presence" style="display:block;margin-bottom:16px"><div style="font-size:18px;font-weight:700">Studio Presence</div><div style="margin-top:4px;color:#686862;font-size:12px">by Vector Veda</div></td></tr><tr><td style="padding:32px"><div style="color:#686862;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Workspace invitation</div><h1 style="margin:12px 0 16px;font-size:28px;line-height:1.2">Join ${escapeHtml(input.studioName)} on Studio Presence</h1><p style="font-size:16px;line-height:1.6">${escapeHtml(inviter)} has invited you to join the workspace as a <strong>${escapeHtml(input.role)}</strong>.</p><p style="font-size:14px;line-height:1.6;color:#686862">Use the button below to sign in or create an account with this invited email address. Your access will be connected to the workspace after you accept.</p><p style="margin:28px 0"><a href="${escapeHtml(input.inviteUrl)}" style="display:inline-block;background:#171717;color:#fff;text-decoration:none;padding:14px 20px;font-size:14px;font-weight:700">Accept invite</a></p><p style="font-size:12px;line-height:1.5;color:#686862">This invitation expires in 24 hours. If you were not expecting it, you can ignore this message.</p></td></tr></table></td></tr></table></body></html>`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: input.to, subject: `Join ${input.studioName}`, text, html }),
  })
  if (!response.ok) {
    let providerMessage = ''
    try {
      const payload = (await response.json()) as { message?: string; name?: string }
      providerMessage = payload.message || payload.name || ''
    } catch {
      // Keep the status when the provider does not return JSON.
    }
    throw new Error(`Resend rejected the invitation email (${response.status})${providerMessage ? `: ${providerMessage}` : ''}`)
  }
}