import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { canAccessDashboard, leads, leadStatusSchema, panel, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { loadPublicTenantConfig, loadTenantWorkspaceConfig } from '@/lib/tenant-config'
import { DashboardWorkspace } from './components/DashboardShell'
import { DEMO_ENQUIRIES } from './components/demo-data'
import { applyConfigPatch, dashboardMode, normalizeIndianPhone, type ActionResult, type Enquiry, type LeadAction, type WorkspaceConfig } from './components/types'

const leadInput = z.object({
  name: z.string().trim().min(1).max(120), phone: z.string().max(30),
  locality: z.string().trim().max(160), projectType: z.string().trim().max(160),
  budgetBand: z.string().trim().max(100), timeline: z.string().trim().max(160),
  message: z.string().trim().max(3000),
})
const mutation = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('create'), values: leadInput }),
  z.object({ kind: z.literal('update'), id: z.string().uuid(), status: leadStatusSchema, notes: z.string().max(2000) }),
])

async function authenticatedContext(expectedTenant: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  if (!user?.email || !session) return null
  const context = await requireTenant({ id: user.id, email: user.email, accessToken: session.access_token })
  if (context.tenant.slug !== expectedTenant || context.tenant.status === 'archived') throw new Error('Workspace access denied.')
  return context
}

export default async function DashboardPage({ params, searchParams }: {
  params: Promise<{ tenant: string }>
  searchParams?: Promise<{ demo?: string; tab?: string }>
}) {
  const { tenant } = await params
  const query = await searchParams
  const context = await authenticatedContext(tenant)
  const base = context
    ? await loadTenantWorkspaceConfig(tenant, context.tenant.id, context.user.accessToken)
    : await loadPublicTenantConfig(tenant)
  if (!context && (base.status !== 'demo' || query?.demo === '0')) redirect(`/login?next=${encodeURIComponent(`/${tenant}/dashboard`)}`)
  const eligible = Boolean(context && canAccessDashboard(context.tenant) && context.tenant.status !== 'demo')
  const mode = dashboardMode(query?.demo, eligible)
  let config: WorkspaceConfig = { business: base.business, sections: base.sections, integrations: base.integrations, status: base.status }
  if (context) {
    const editable = await panel.getEditableConfig(context.db, context.tenant)
    config = applyConfigPatch(config, Object.fromEntries(Object.entries(editable.current).filter(([key, value]) => value !== undefined && (key.startsWith('business.') || key.startsWith('sections.')))))
  }
  let items: Enquiry[] = mode === 'demo' ? DEMO_ENQUIRIES : []
  let leadError: string | undefined
  if (mode === 'live' && context) {
    try { items = await leads.list(context.db) }
    catch { leadError = 'Live enquiries could not be loaded. Refresh to try again.' }
  }

  async function mutateLead(input: Parameters<LeadAction>[0]): Promise<ActionResult<Enquiry>> {
    'use server'
    if (mode !== 'live') return { ok: false, error: 'Sample and unavailable workspaces cannot change live enquiries.' }
    const parsed = mutation.safeParse(input)
    if (!parsed.success) return { ok: false, error: 'Check the lead details. Notes must be under 2,000 characters.' }
    try {
      const current = await authenticatedContext(tenant)
      if (!current || !canAccessDashboard(current.tenant) || current.tenant.status === 'demo') return { ok: false, error: 'You do not have access to this enquiry desk.' }
      let row: Enquiry
      if (parsed.data.kind === 'create') {
        if (current.tenant.status !== 'live') return { ok: false, error: 'Lead capture is available after the studio goes live.' }
        const phone = normalizeIndianPhone(parsed.data.values.phone)
        if (!phone) return { ok: false, error: 'Enter a valid 10-digit Indian mobile number.' }
        const result = await leads.create({ ...parsed.data.values, phone: `+${phone}`, tenantSlug: tenant, source: 'other', sourcePage: `/${tenant}/dashboard#walk-in` })
        const created = await leads.get(current.db, result.leadId)
        if (!created) return { ok: false, error: 'The lead was submitted but could not be reloaded. Refresh before trying again.' }
        row = created
      } else {
        const { data, error } = await current.db.from('leads').update({ status: parsed.data.status, notes: parsed.data.notes.trim() }).eq('id', parsed.data.id).eq('tenant_id', current.tenant.id).select('*').single()
        if (error || !data) return { ok: false, error: 'The enquiry could not be saved. Refresh and try again.' }
        row = data
      }
      revalidatePath(`/${tenant}/dashboard`)
      return { ok: true, data: row }
    } catch { return { ok: false, error: 'The enquiry could not be saved. Check your access and try again.' } }
  }

  return <DashboardWorkspace key={`${tenant}:${mode}`} initialData={{ tenant, mode, config, enquiries: items, canEdit: mode === 'demo' || Boolean(context && context.tenant.status !== 'demo'), canCreate: mode === 'demo' || Boolean(eligible && context?.tenant.status === 'live'), leadError }} leadAction={mutateLead} />
}
