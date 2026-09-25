/**
 * Integration test for Workspace Team Membership and Lead Assignment.
 *
 * Verifies the database contract and RPC permissions:
 * - owner can list members
 * - editor can resolve workspace role
 * - invitation expiry is approximately 24 hours
 * - raw invitation token is not stored
 * - wrong email cannot accept
 * - matching email can accept
 * - accepted invitation can be reopened by the same user
 * - accepted invitation cannot be reopened by another user
 * - revoked invitation cannot be accepted
 * - expired invitation cannot be accepted
 * - owner can change a member role
 * - owner can assign to editor
 * - editor cannot reassign
 * - owner cannot assign to viewer
 * - assigned editor can update lead work
 * - viewer can update lead status and private notes
 * - assignment creates lead activity
 * - new leads default to owner
 * - removed editor loses lead access immediately
 *
 * Run with:
 *   npm run test:team-membership
 */

import { createServiceRoleClient } from '../backend/src/db/service-role'
import { createAnonClient, createScopedClient } from '../backend/src/db/scoped'
import {
  acceptWorkspaceInvitation,
  changeWorkspaceMemberRole,
  createWorkspaceInvitation,
  hashInvitationToken,
  listWorkspaceMembers,
  removeWorkspaceMember,
  revokeWorkspaceInvitation,
} from '../backend/src/services/memberships'
import { leads } from '../backend/src/services/leads'
import { heading, fail } from './_report'

const NAME = 'test:team-membership'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

const admin = createServiceRoleClient()
const failures: string[] = []

function assert(label: string, condition: boolean, detail: string): void {
  if (condition) {
    console.log(`  ${GREEN}ok${RESET}    ${label}`)
  } else {
    console.log(`  ${RED}FAIL${RESET}  ${label}`)
    console.log(`        ${detail}`)
    failures.push(label)
  }
}

async function main() {
  heading(NAME)
  console.log('')

  const stamp = `tmtest-${Date.now()}`
  const TENANT = { slug: `${stamp}-studio`, name: `${stamp} Studio` }
  const PASSWORD = `${stamp}-Aa1!-test-pass`
  const OWNER_EMAIL = `${stamp}-owner@example.test`
  const EDITOR_EMAIL = `${stamp}-editor@example.test`
  const VIEWER_EMAIL = `${stamp}-viewer@example.test`
  const STRANGER_EMAIL = `${stamp}-stranger@example.test`

  let tenantId: string | null = null
  const userIds: string[] = []

  async function createUser(email: string) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    })
    if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`)
    userIds.push(data.user.id)
    return data.user
  }

  async function signInScoped(email: string) {
    const anon = createAnonClient()
    const { data, error } = await anon.auth.signInWithPassword({
      email,
      password: PASSWORD,
    })
    if (error || !data.session) throw new Error(`signIn ${email}: ${error?.message}`)
    return {
      client: createScopedClient(data.session.access_token),
      user: data.user,
    }
  }

  try {
    // 1. Provision tenant and users
    const { data: tenant, error: te } = await admin
      .from('tenants')
      .insert({ slug: TENANT.slug, name: TENANT.name, tier: 't3', status: 'live' })
      .select()
      .single()
    if (te || !tenant) throw new Error(`Creating tenant: ${te?.message}`)
    tenantId = tenant.id

    const ownerUser = await createUser(OWNER_EMAIL)
    const editorUser = await createUser(EDITOR_EMAIL)
    const viewerUser = await createUser(VIEWER_EMAIL)
    await createUser(STRANGER_EMAIL)

    const { error: me } = await admin.from('tenant_members').insert({
      tenant_id: tenant.id,
      user_id: ownerUser.id,
      role: 'owner',
    })
    if (me) throw new Error(`Linking owner: ${me.message}`)

    const { client: ownerClient } = await signInScoped(OWNER_EMAIL)
    const { client: editorClient } = await signInScoped(EDITOR_EMAIL)
    const { client: viewerClient } = await signInScoped(VIEWER_EMAIL)
    const { client: strangerClient } = await signInScoped(STRANGER_EMAIL)

    // Test 1: owner can list members
    const members = await listWorkspaceMembers(ownerClient, tenant.id)
    assert(
      'owner can list members',
      members.length >= 1 && members.some((m) => m.user_id === ownerUser.id && m.role === 'owner'),
      `Expected owner in members list, got: ${JSON.stringify(members)}`,
    )

    // Test 3: invitation expiry is approximately 24 hours
    const inviteEditor = await createWorkspaceInvitation(ownerClient, {
      tenantId: tenant.id,
      email: EDITOR_EMAIL,
      role: 'editor',
    })
    const expiresTime = new Date(inviteEditor.expiresAt).getTime()
    const diffMs = expiresTime - Date.now()
    const expectedMs = 24 * 60 * 60 * 1000
    const isApprox24h = Math.abs(diffMs - expectedMs) < 60_000
    assert(
      'invitation expiry is approximately 24 hours',
      isApprox24h,
      `Expiry diff was ${diffMs}ms, expected ~${expectedMs}ms`,
    )

    // Test 4: raw invitation token is not stored
    const { data: invRow } = await admin
      .from('tenant_invitations')
      .select('*')
      .eq('id', inviteEditor.invitationId)
      .single()
    const rawNotStored =
      invRow &&
      invRow.token_hash === hashInvitationToken(inviteEditor.token) &&
      !JSON.stringify(invRow).includes(inviteEditor.token)
    assert(
      'raw invitation token is not stored',
      Boolean(rawNotStored),
      'Invitation row should store hash, not raw token.',
    )

    // Test 5: wrong email cannot accept
    let wrongEmailFailed = false
    try {
      await acceptWorkspaceInvitation(strangerClient, inviteEditor.token)
    } catch {
      wrongEmailFailed = true
    }
    assert(
      'wrong email cannot accept',
      wrongEmailFailed,
      'Stranger was able to accept an invitation meant for editor.',
    )

    // Test 6: matching email can accept
    const acceptedEditor = await acceptWorkspaceInvitation(editorClient, inviteEditor.token)
    assert(
      'matching email can accept',
      acceptedEditor.tenantId === tenant.id && acceptedEditor.role === 'editor',
      `Failed to accept editor invitation: ${JSON.stringify(acceptedEditor)}`,
    )

    // Test 2: editor can resolve workspace role
    const { data: editorRole } = await editorClient.rpc('current_tenant_role', {
      p_tenant_id: tenant.id,
    })
    assert(
      'editor can resolve workspace role',
      editorRole === 'editor',
      `Expected editor role, got: ${editorRole}`,
    )

    // Test 7: reopening an accepted invitation is idempotent for the same user
    let reopenedEditor: { tenantId: string; role: 'editor' | 'viewer' } | null = null
    let reopenEditorError = ''
    try {
      reopenedEditor = await acceptWorkspaceInvitation(editorClient, inviteEditor.token)
    } catch (error) {
      reopenEditorError = error instanceof Error ? error.message : String(error)
    }
    assert(
      'accepted invitation can be reopened by the same user',
      reopenedEditor?.tenantId === tenant.id && reopenedEditor?.role === 'editor',
      `Reopening the accepted invitation failed: ${reopenEditorError || JSON.stringify(reopenedEditor)}`,
    )

    let strangerReopenError = ''
    try {
      await acceptWorkspaceInvitation(strangerClient, inviteEditor.token)
    } catch (error) {
      strangerReopenError = error instanceof Error ? error.message : String(error)
    }
    assert(
      'accepted invitation cannot be reopened by another user',
      strangerReopenError.includes('already accepted'),
      `Expected an already-accepted error, got: ${strangerReopenError || 'no error'}`,
    )

    // Test 8: revoked invitation cannot be accepted
    const inviteRevoke = await createWorkspaceInvitation(ownerClient, {
      tenantId: tenant.id,
      email: VIEWER_EMAIL,
      role: 'viewer',
    })
    await revokeWorkspaceInvitation(ownerClient, inviteRevoke.invitationId)
    let acceptRevokedFailed = false
    try {
      await acceptWorkspaceInvitation(viewerClient, inviteRevoke.token)
    } catch {
      acceptRevokedFailed = true
    }
    assert(
      'revoked invitation cannot be accepted',
      acceptRevokedFailed,
      'Revoked invitation was successfully accepted.',
    )

    // Test 9: expired invitation cannot be accepted
    const inviteExpired = await createWorkspaceInvitation(ownerClient, {
      tenantId: tenant.id,
      email: VIEWER_EMAIL,
      role: 'viewer',
    })
    await admin
      .from('tenant_invitations')
      .update({ expires_at: new Date(Date.now() - 3600_000).toISOString() })
      .eq('id', inviteExpired.invitationId)
    let acceptExpiredFailed = false
    try {
      await acceptWorkspaceInvitation(viewerClient, inviteExpired.token)
    } catch {
      acceptExpiredFailed = true
    }
    assert(
      'expired invitation cannot be accepted',
      acceptExpiredFailed,
      'Expired invitation was accepted.',
    )

    // Accept valid invitation for viewer
    const inviteViewerValid = await createWorkspaceInvitation(ownerClient, {
      tenantId: tenant.id,
      email: VIEWER_EMAIL,
      role: 'viewer',
    })
    await acceptWorkspaceInvitation(viewerClient, inviteViewerValid.token)

    // Test 10: owner can change a member role
    await changeWorkspaceMemberRole(ownerClient, {
      tenantId: tenant.id,
      userId: viewerUser.id,
      role: 'editor',
    })
    const { data: viewerRoleAsEditor } = await viewerClient.rpc('current_tenant_role', {
      p_tenant_id: tenant.id,
    })
    await changeWorkspaceMemberRole(ownerClient, {
      tenantId: tenant.id,
      userId: viewerUser.id,
      role: 'viewer',
    })
    const { data: viewerRoleFinal } = await viewerClient.rpc('current_tenant_role', {
      p_tenant_id: tenant.id,
    })
    assert(
      'owner can change a member role',
      viewerRoleAsEditor === 'editor' && viewerRoleFinal === 'viewer',
      `Role change failed: intermediate=${viewerRoleAsEditor}, final=${viewerRoleFinal}`,
    )

    // Test 17: new leads default to owner
    const anon = createAnonClient()
    const { data: newLeadId, error: subErr } = await anon.rpc('submit_lead', {
      p_tenant_slug: tenant.slug,
      p_name: 'Lead One',
      p_phone: '+919876543210',
      p_source: 'form',
    })
    if (subErr || !newLeadId) throw new Error(`submit_lead failed: ${subErr?.message}`)
    const leadRow = await leads.get(ownerClient, newLeadId)
    assert(
      'new leads default to owner',
      leadRow?.assigned_to === ownerUser.id,
      `Expected new lead assigned_to = owner (${ownerUser.id}), got ${leadRow?.assigned_to}`,
    )

    // Test 11: owner can assign to editor
    const assignedLead = await leads.assign(ownerClient, newLeadId, editorUser.id)
    assert(
      'owner can assign to editor',
      assignedLead.assigned_to === editorUser.id,
      `Expected assigned_to to be editor (${editorUser.id}), got ${assignedLead.assigned_to}`,
    )

    // Test 12: editor cannot reassign
    let editorReassignFailed = false
    try {
      await leads.assign(editorClient, newLeadId, ownerUser.id)
    } catch {
      editorReassignFailed = true
    }
    assert(
      'editor cannot reassign',
      editorReassignFailed,
      'Editor was able to reassign the lead.',
    )

    // Test 13: owner cannot assign to viewer
    let assignViewerFailed = false
    try {
      await leads.assign(ownerClient, newLeadId, viewerUser.id)
    } catch {
      assignViewerFailed = true
    }
    assert(
      'owner cannot assign to viewer',
      assignViewerFailed,
      'Owner was able to assign a lead to a viewer.',
    )

    // Test 14: assigned editor can update lead work
    const updatedLead = await leads.updateWork(
      editorClient,
      newLeadId,
      'contacted',
      'Editor spoke to lead',
    )
    assert(
      'assigned editor can update lead work',
      updatedLead.status === 'contacted' && updatedLead.notes === 'Editor spoke to lead',
      `Expected status contacted and notes updated, got: ${JSON.stringify(updatedLead)}`,
    )

    // Test 15: viewer can update lead status and private notes
    let viewerUpdated: Awaited<ReturnType<typeof leads.updateWork>> | null = null
    try {
      viewerUpdated = await leads.updateWork(viewerClient, newLeadId, 'quoted', 'Lead coordinator follow-up')
    } catch {
      viewerUpdated = null
    }
    assert(
      'viewer can update lead status and private notes',
      viewerUpdated?.status === 'quoted' && viewerUpdated.notes === 'Lead coordinator follow-up',
      `Viewer could not update lead work: ${JSON.stringify(viewerUpdated)}`,
    )

    // Test 16: assignment creates lead activity
    const { data: events } = await admin
      .from('lead_events')
      .select('*')
      .eq('lead_id', newLeadId)
      .order('created_at', { ascending: true })
    const hasAssignEvent = (events ?? []).some(
      (ev) =>
        (ev.type === 'assigned' || ev.type === 'reassigned') &&
        ev.payload &&
        (ev.payload as Record<string, unknown>).to_user_id === editorUser.id,
    )
    assert(
      'assignment creates lead activity',
      Boolean(hasAssignEvent),
      `Expected assignment lead activity event, got: ${JSON.stringify(events)}`,
    )

    // Test 18: removed editor loses lead access immediately
    await removeWorkspaceMember(ownerClient, tenant.id, editorUser.id)
    const { data: editorLeads } = await editorClient.from('leads').select('*')
    const { data: editorRoleAfter } = await editorClient.rpc('current_tenant_role', {
      p_tenant_id: tenant.id,
    })
    let editorUpdateAfterRemovedFailed = false
    try {
      await leads.updateWork(editorClient, newLeadId, 'lost', 'After removal')
    } catch {
      editorUpdateAfterRemovedFailed = true
    }
    assert(
      'removed editor loses lead access immediately',
      (editorLeads ?? []).length === 0 &&
        editorRoleAfter === null &&
        editorUpdateAfterRemovedFailed,
      `Removed editor still had access: leads=${editorLeads?.length}, role=${editorRoleAfter}`,
    )
  } finally {
    // Cleanup
    if (tenantId) {
      await admin.from('tenants').delete().eq('id', tenantId)
    }
    for (const uid of userIds) {
      await admin.auth.admin.deleteUser(uid).catch(() => undefined)
    }
  }

  console.log('')
  if (failures.length) {
    fail(NAME, `${failures.length} team membership check(s) failed. Do not ship until these pass.`)
  }
  console.log(`${GREEN}PASS${RESET}  team membership and lead assignment hold\n`)
}

main().catch((e) => fail(NAME, (e as Error).message))
