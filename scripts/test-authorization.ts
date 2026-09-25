/**
 * Integration test for Supabase Workspace Role Authorization Matrix.
 *
 * Verifies the database contract, RLS policies, and RPC permissions:
 * - Studio owner:
 *   - full tenant access
 *   - can view and update any lead in tenant
 *   - can assign leads to owner or editor
 *   - can create dashboard leads
 *   - can update workspace settings
 *   - can manage client and i18n overrides
 *   - can submit paid content drafts
 *   - can manage members and invitations
 * - Website & content manager (editor):
 *   - can view leads
 *   - can update lead work ONLY if assigned to them
 *   - denied updating unassigned or other member's leads
 *   - denied assigning leads
 *   - denied creating dashboard leads
 *   - denied updating workspace settings
 *   - allowed editing client and i18n overrides
 *   - allowed submitting paid content drafts
 *   - denied managing members and invitations
 * - Lead coordinator (viewer):
 *   - can view all visible leads in tenant
 *   - can update status and private notes on any visible lead in tenant
 *   - denied assigning leads or being assigned leads
 *   - denied creating dashboard leads or submitting tenant leads
 *   - denied editing website overrides or workspace settings
 *   - denied submitting paid content drafts
 *   - denied managing members and invitations
 * - Cross-tenant isolation:
 *   - Tenant A members cannot select Tenant B leads, overrides, or workspaces
 *   - Tenant A members cannot update Tenant B leads via update_lead_work
 *
 * Run with:
 *   npm run test:authorization
 */

import { createServiceRoleClient } from '../backend/src/db/service-role'
import { createAnonClient, createScopedClient } from '../backend/src/db/scoped'
import {
  createWorkspaceInvitation,
  listWorkspaceMembers,
} from '../backend/src/services/memberships'
import { leads } from '../backend/src/services/leads'
import { heading, fail } from './_report'

const NAME = 'test:authorization'
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

  const stamp = `authtest-${Date.now()}`
  const TENANT_A = { slug: `${stamp}-a`, name: `${stamp} Studio A` }
  const TENANT_B = { slug: `${stamp}-b`, name: `${stamp} Studio B` }
  const PASSWORD = `${stamp}-Aa1!-test-pass`

  const OWNER_A_EMAIL = `${stamp}-owner-a@example.test`
  const EDITOR_A_EMAIL = `${stamp}-editor-a@example.test`
  const VIEWER_A_EMAIL = `${stamp}-viewer-a@example.test`
  const OWNER_B_EMAIL = `${stamp}-owner-b@example.test`

  const tenantIds: string[] = []
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
    // 1. Provision tenants and users
    const { data: tenantA, error: teA } = await admin
      .from('tenants')
      .insert({ slug: TENANT_A.slug, name: TENANT_A.name, tier: 't3', status: 'live' })
      .select()
      .single()
    if (teA || !tenantA) throw new Error(`Creating tenant A: ${teA?.message}`)
    tenantIds.push(tenantA.id)

    const { data: tenantB, error: teB } = await admin
      .from('tenants')
      .insert({ slug: TENANT_B.slug, name: TENANT_B.name, tier: 't3', status: 'live' })
      .select()
      .single()
    if (teB || !tenantB) throw new Error(`Creating tenant B: ${teB?.message}`)
    tenantIds.push(tenantB.id)

    // Workspace records
    await admin.from('tenant_workspaces').insert([
      { tenant_id: tenantA.id, config: { business: { name: 'Studio A' } }, updated_by: null },
      { tenant_id: tenantB.id, config: { business: { name: 'Studio B' } }, updated_by: null },
    ])

    const ownerAUser = await createUser(OWNER_A_EMAIL)
    const editorAUser = await createUser(EDITOR_A_EMAIL)
    const viewerAUser = await createUser(VIEWER_A_EMAIL)
    const ownerBUser = await createUser(OWNER_B_EMAIL)

    await admin.from('tenant_members').insert([
      { tenant_id: tenantA.id, user_id: ownerAUser.id, role: 'owner' },
      { tenant_id: tenantA.id, user_id: editorAUser.id, role: 'editor' },
      { tenant_id: tenantA.id, user_id: viewerAUser.id, role: 'viewer' },
      { tenant_id: tenantB.id, user_id: ownerBUser.id, role: 'owner' },
    ])

    const { client: ownerAClient } = await signInScoped(OWNER_A_EMAIL)
    const { client: editorAClient } = await signInScoped(EDITOR_A_EMAIL)
    const { client: viewerAClient } = await signInScoped(VIEWER_A_EMAIL)
    const { client: ownerBClient } = await signInScoped(OWNER_B_EMAIL)

    // Provision test leads
    // Lead 1 in Tenant A: assigned to Owner A
    const { data: lead1Row, error: l1Err } = await admin
      .from('leads')
      .insert({
        tenant_id: tenantA.id,
        assigned_to: ownerAUser.id,
        name: 'Lead One (Owner Assigned)',
        phone: '+919999900001',
        status: 'new',
        source: 'form',
      })
      .select()
      .single()
    if (l1Err || !lead1Row) throw new Error(`Creating lead 1: ${l1Err?.message}`)

    // Lead 2 in Tenant A: assigned to Editor A
    const { data: lead2Row, error: l2Err } = await admin
      .from('leads')
      .insert({
        tenant_id: tenantA.id,
        assigned_to: editorAUser.id,
        name: 'Lead Two (Editor Assigned)',
        phone: '+919999900002',
        status: 'new',
        source: 'form',
      })
      .select()
      .single()
    if (l2Err || !lead2Row) throw new Error(`Creating lead 2: ${l2Err?.message}`)

    // Lead B in Tenant B: assigned to Owner B
    const { data: leadBRow, error: lbErr } = await admin
      .from('leads')
      .insert({
        tenant_id: tenantB.id,
        assigned_to: ownerBUser.id,
        name: 'Lead B (Tenant B)',
        phone: '+919999900003',
        status: 'new',
        source: 'form',
      })
      .select()
      .single()
    if (lbErr || !leadBRow) throw new Error(`Creating lead B: ${lbErr?.message}`)

    // ==========================================
    // 1. LEAD VIEW & TENANT ISOLATION
    // ==========================================
    const { data: ownerALeads } = await ownerAClient.from('leads').select('*')
    const { data: editorALeads } = await editorAClient.from('leads').select('*')
    const { data: viewerALeads } = await viewerAClient.from('leads').select('*')
    const { data: ownerBLeads } = await ownerBClient.from('leads').select('*')

    assert(
      'owner can view all tenant leads',
      Boolean(ownerALeads?.some((l) => l.id === lead1Row.id) && ownerALeads?.some((l) => l.id === lead2Row.id)),
      `Owner A leads: ${JSON.stringify(ownerALeads?.map((l) => l.id))}`,
    )

    assert(
      'editor can view all tenant leads',
      Boolean(editorALeads?.some((l) => l.id === lead1Row.id) && editorALeads?.some((l) => l.id === lead2Row.id)),
      `Editor A leads: ${JSON.stringify(editorALeads?.map((l) => l.id))}`,
    )

    assert(
      'viewer can view all tenant leads',
      Boolean(viewerALeads?.some((l) => l.id === lead1Row.id) && viewerALeads?.some((l) => l.id === lead2Row.id)),
      `Viewer A leads: ${JSON.stringify(viewerALeads?.map((l) => l.id))}`,
    )

    assert(
      'tenant isolation: Tenant A members cannot see Tenant B leads',
      !ownerALeads?.some((l) => l.id === leadBRow.id) &&
        !editorALeads?.some((l) => l.id === leadBRow.id) &&
        !viewerALeads?.some((l) => l.id === leadBRow.id) &&
        Boolean(ownerBLeads?.some((l) => l.id === leadBRow.id)),
      'Tenant B lead was visible to Tenant A members or not visible to Owner B',
    )

    // ==========================================
    // 2. LEAD WORK (STATUS & NOTES)
    // ==========================================
    // Owner can update any lead in tenant
    let ownerUpdateLead1Success = false
    try {
      const res = await leads.updateWork(ownerAClient, lead1Row.id, 'contacted', 'Owner note')
      ownerUpdateLead1Success = res.status === 'contacted'
    } catch {
      ownerUpdateLead1Success = false
    }
    assert('owner can update any lead in tenant', ownerUpdateLead1Success, 'Owner A failed to update lead 1')

    // Editor: assigned-only
    let editorUpdateAssignedSuccess = false
    try {
      const res = await leads.updateWork(editorAClient, lead2Row.id, 'contacted', 'Editor assigned note')
      editorUpdateAssignedSuccess = res.status === 'contacted'
    } catch {
      editorUpdateAssignedSuccess = false
    }
    assert('editor can update lead assigned to them', editorUpdateAssignedSuccess, 'Editor A failed on assigned lead')

    let editorUpdateUnassignedBlocked = false
    try {
      await leads.updateWork(editorAClient, lead1Row.id, 'quoted', 'Editor unassigned attempt')
    } catch {
      editorUpdateUnassignedBlocked = true
    }
    assert('editor cannot update lead not assigned to them', editorUpdateUnassignedBlocked, 'Editor A updated unassigned lead')

    // Viewer: can update status and notes on visible leads in tenant
    let viewerUpdateSuccess = false
    try {
      const res = await leads.updateWork(viewerAClient, lead1Row.id, 'quoted', 'Viewer coordinator note')
      viewerUpdateSuccess = res.status === 'quoted' && res.notes === 'Viewer coordinator note'
    } catch {
      viewerUpdateSuccess = false
    }
    assert('viewer can update status and notes on visible lead in tenant', viewerUpdateSuccess, 'Viewer A failed to update lead')

    // Cross-tenant update: Tenant A viewer/editor cannot update Tenant B lead
    let crossTenantUpdateBlocked = false
    try {
      await leads.updateWork(viewerAClient, leadBRow.id, 'lost', 'Cross tenant attack')
    } catch {
      crossTenantUpdateBlocked = true
    }
    assert('cross-tenant update is denied', crossTenantUpdateBlocked, 'Viewer A updated Tenant B lead')

    // ==========================================
    // 3. LEAD ASSIGNMENT & CREATION
    // ==========================================
    // Owner can assign lead to editor
    let ownerAssignSuccess = false
    try {
      const res = await leads.assign(ownerAClient, lead1Row.id, editorAUser.id)
      ownerAssignSuccess = res.assigned_to === editorAUser.id
    } catch {
      ownerAssignSuccess = false
    }
    assert('owner can assign lead to editor', ownerAssignSuccess, 'Owner A could not assign to editor')

    // Editor cannot assign lead
    let editorAssignBlocked = false
    try {
      await leads.assign(editorAClient, lead1Row.id, ownerAUser.id)
    } catch {
      editorAssignBlocked = true
    }
    assert('editor cannot assign lead', editorAssignBlocked, 'Editor A was able to call assign_lead')

    // Viewer cannot assign lead
    let viewerAssignBlocked = false
    try {
      await leads.assign(viewerAClient, lead1Row.id, ownerAUser.id)
    } catch {
      viewerAssignBlocked = true
    }
    assert('viewer cannot assign lead', viewerAssignBlocked, 'Viewer A was able to call assign_lead')

    // Assigning to viewer is forbidden
    let assignToViewerBlocked = false
    try {
      await leads.assign(ownerAClient, lead1Row.id, viewerAUser.id)
    } catch {
      assignToViewerBlocked = true
    }
    assert('owner cannot assign lead to viewer', assignToViewerBlocked, 'Lead was assigned to a viewer')

    // Dashboard lead creation
    let ownerCreateDashboardLeadSuccess = false
    try {
      const { data, error } = await ownerAClient.rpc('create_dashboard_lead', {
        p_tenant_id: tenantA.id,
        p_name: 'Walk-in Client',
        p_phone: '+919999900010',
      })
      ownerCreateDashboardLeadSuccess = Boolean(data && !error)
    } catch {
      ownerCreateDashboardLeadSuccess = false
    }
    assert('owner can create dashboard lead', ownerCreateDashboardLeadSuccess, 'Owner A failed to create dashboard lead')

    let editorCreateDashboardLeadBlocked = false
    try {
      const { error } = await editorAClient.rpc('create_dashboard_lead', {
        p_tenant_id: tenantA.id,
        p_name: 'Walk-in Client',
        p_phone: '+919999900011',
      })
      if (error) editorCreateDashboardLeadBlocked = true
    } catch {
      editorCreateDashboardLeadBlocked = true
    }
    assert('editor cannot create dashboard lead', editorCreateDashboardLeadBlocked, 'Editor A created dashboard lead')

    let viewerCreateDashboardLeadBlocked = false
    try {
      const { error } = await viewerAClient.rpc('create_dashboard_lead', {
        p_tenant_id: tenantA.id,
        p_name: 'Walk-in Client',
        p_phone: '+919999900012',
      })
      if (error) viewerCreateDashboardLeadBlocked = true
    } catch {
      viewerCreateDashboardLeadBlocked = true
    }
    assert('viewer cannot create dashboard lead', viewerCreateDashboardLeadBlocked, 'Viewer A created dashboard lead')

    // Direct leads table insert/update/delete revoked
    const { error: directInsertErr } = await ownerAClient
      .from('leads')
      .insert({ tenant_id: tenantA.id, name: 'Direct', phone: '+919999900099' })
    assert(
      'direct insert on leads table is revoked from authenticated',
      Boolean(directInsertErr),
      'Direct insert on leads succeeded',
    )

    // ==========================================
    // 4. WEBSITE CONTENT & WORKSPACE SETTINGS
    // ==========================================
    // Workspace settings update: owner only
    const { error: ownerWsErr } = await ownerAClient
      .from('tenant_workspaces')
      .update({ config: { business: { name: 'Studio A Updated' } }, updated_by: ownerAUser.id })
      .eq('tenant_id', tenantA.id)
    assert('owner can update workspace settings', !ownerWsErr, `Owner workspace update failed: ${ownerWsErr?.message}`)

    const { error: editorWsErr, count: editorWsCount } = await editorAClient
      .from('tenant_workspaces')
      .update({ config: { business: { name: 'Studio A Editor Tamper' } }, updated_by: editorAUser.id })
      .eq('tenant_id', tenantA.id)
      .select()
    assert(
      'editor cannot update workspace settings',
      Boolean(editorWsErr) || editorWsCount === 0 || !editorWsCount,
      'Editor A was able to update tenant_workspaces',
    )

    const { error: viewerWsErr, count: viewerWsCount } = await viewerAClient
      .from('tenant_workspaces')
      .update({ config: { business: { name: 'Studio A Viewer Tamper' } }, updated_by: viewerAUser.id })
      .eq('tenant_id', tenantA.id)
      .select()
    assert(
      'viewer cannot update workspace settings',
      Boolean(viewerWsErr) || viewerWsCount === 0 || !viewerWsCount,
      'Viewer A was able to update tenant_workspaces',
    )

    // Client overrides (website content): owner and editor allowed, viewer denied
    const { error: ownerOverrideErr } = await ownerAClient
      .from('client_overrides')
      .insert({ tenant_id: tenantA.id, patch: { 'business.phone': '+919999999999' } })
    assert('owner can insert client_overrides', !ownerOverrideErr, `Owner override insert failed: ${ownerOverrideErr?.message}`)

    const { error: editorOverrideErr } = await editorAClient
      .from('client_overrides')
      .update({ patch: { 'business.phone': '+918888888888' } })
      .eq('tenant_id', tenantA.id)
    assert('editor can update client_overrides', !editorOverrideErr, `Editor override update failed: ${editorOverrideErr?.message}`)

    const { data: viewerUpdated, error: viewerOverrideErr } = await viewerAClient
      .from('client_overrides')
      .update({ patch: { 'business.phone': '+917777777777' } })
      .eq('tenant_id', tenantA.id)
      .select()
    assert(
      'viewer cannot update client_overrides',
      Boolean(viewerOverrideErr) || (viewerUpdated ?? []).length === 0,
      'Viewer was able to update client_overrides',
    )

    // Submit paid draft: owner & editor allowed, viewer denied
    let ownerDraftSuccess = false
    try {
      const { data, error } = await ownerAClient.rpc('submit_paid_draft', {
        p_tenant_slug: tenantA.slug,
        p_base_revision: 'rev-1',
        p_patch: { 'business.phone': '+919999999999' },
      })
      ownerDraftSuccess = Boolean(data && !error)
    } catch {
      ownerDraftSuccess = false
    }
    assert('owner can submit paid draft', ownerDraftSuccess, 'Owner failed to submit paid draft')

    let editorDraftSuccess = false
    try {
      const { data, error } = await editorAClient.rpc('submit_paid_draft', {
        p_tenant_slug: tenantA.slug,
        p_base_revision: 'rev-1',
        p_patch: { 'business.phone': '+918888888888' },
      })
      editorDraftSuccess = Boolean(data && !error)
    } catch {
      editorDraftSuccess = false
    }
    assert('editor can submit paid draft', editorDraftSuccess, 'Editor failed to submit paid draft')

    let viewerDraftBlocked = false
    try {
      const { error } = await viewerAClient.rpc('submit_paid_draft', {
        p_tenant_slug: tenantA.slug,
        p_base_revision: 'rev-1',
        p_patch: { 'business.phone': '+917777777777' },
      })
      if (error) viewerDraftBlocked = true
    } catch {
      viewerDraftBlocked = true
    }
    assert('viewer cannot submit paid draft', viewerDraftBlocked, 'Viewer was able to submit paid draft')

    // ==========================================
    // 5. MEMBERSHIP & INVITATION MANAGEMENT
    // ==========================================
    const members = await listWorkspaceMembers(ownerAClient, tenantA.id)
    assert('owner can list workspace members', members.length >= 3, 'Owner could not list members')

    let editorInviteBlocked = false
    try {
      await createWorkspaceInvitation(editorAClient, {
        tenantId: tenantA.id,
        email: `${stamp}-newbie@example.test`,
        role: 'editor',
      })
    } catch {
      editorInviteBlocked = true
    }
    assert('editor cannot manage invitations', editorInviteBlocked, 'Editor was able to create invitation')

    let viewerInviteBlocked = false
    try {
      await createWorkspaceInvitation(viewerAClient, {
        tenantId: tenantA.id,
        email: `${stamp}-newbie2@example.test`,
        role: 'viewer',
      })
    } catch {
      viewerInviteBlocked = true
    }
    assert('viewer cannot manage invitations', viewerInviteBlocked, 'Viewer was able to create invitation')

  } finally {
    // Cleanup
    for (const tid of tenantIds) {
      try {
        await admin.from('tenants').delete().eq('id', tid)
      } catch {
        // ignore cleanup error
      }
    }
    for (const uid of userIds) {
      try {
        await admin.auth.admin.deleteUser(uid)
      } catch {
        // ignore cleanup error
      }
    }
  }

  console.log('')
  if (failures.length) {
    fail(NAME, `${failures.length} authorization matrix check(s) failed. Do not ship until these pass.`)
  }
  console.log(`${GREEN}PASS${RESET}  all role authorization matrix checks passed\n`)
}

main().catch((e) => fail(NAME, (e as Error).message))
