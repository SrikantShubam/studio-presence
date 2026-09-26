import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ChevronDown } from 'lucide-react'
import { canAccessDashboard, leads, listWorkspaceActivity, listWorkspaceMembers, leadStatusSchema, requireTenant, type Lead, type WorkspaceMember } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { LeadDetailTabs } from '../components/LeadDetailTabs'

const STATUS_LABELS: Record<Lead['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
}
const noteSchema = z.string().max(2000)
const userIdSchema = z.string().uuid()

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; leadId: string }>
}) {
  const { tenant: tenantSlug, leadId } = await params
  const { lead, context, members, role } = await loadLead(tenantSlug, leadId)
  const timeline = (await listWorkspaceActivity(context.db, context.tenant.id, { limit: 10, leadId: lead.id })).events
  const preferences = await context.db.from('workspace_preferences').select('timezone').eq('tenant_id', context.tenant.id).maybeSingle()
  const timezone = preferences.data?.timezone || 'Asia/Kolkata'
  const canUpdateWork = role === 'owner' || role === 'viewer' || (role === 'editor' && lead.assigned_to === context.user.id)
  const canAssign = role === 'owner'
  const assignableMembers = members.filter((member) => member.role === 'owner' || member.role === 'editor')

  async function saveStatus(formData: FormData) {
    'use server'
    const status = leadStatusSchema.parse(formData.get('status'))
    const current = await requireDashboardContext(tenantSlug)
    const actor = await workspaceActor(current)
    const currentLead = await leads.get(current.db, leadId)
    if (!currentLead || (actor.role !== 'owner' && actor.role !== 'viewer' && !(actor.role === 'editor' && currentLead.assigned_to === current.user.id))) redirect('/' + tenantSlug + '/dashboard/enquiries')
    await leads.updateWork(current.db, leadId, status, currentLead.notes ?? '')
    revalidatePath('/' + tenantSlug + '/dashboard')
    revalidatePath('/' + tenantSlug + '/dashboard/' + leadId)
  }

  async function saveNote(formData: FormData) {
    'use server'
    const note = noteSchema.parse(formData.get('notes'))
    const current = await requireDashboardContext(tenantSlug)
    const actor = await workspaceActor(current)
    const currentLead = await leads.get(current.db, leadId)
    if (!currentLead || (actor.role !== 'owner' && actor.role !== 'viewer' && !(actor.role === 'editor' && currentLead.assigned_to === current.user.id))) redirect('/' + tenantSlug + '/dashboard/enquiries')
    await leads.updateWork(current.db, leadId, currentLead.status, note.trim())
    revalidatePath('/' + tenantSlug + '/dashboard')
    revalidatePath('/' + tenantSlug + '/dashboard/' + leadId)
  }

  async function saveAssignment(formData: FormData) {
    'use server'
    const userId = userIdSchema.parse(formData.get('userId'))
    const current = await requireDashboardContext(tenantSlug)
    const actor = await workspaceActor(current)
    if (actor.role !== 'owner') redirect('/' + tenantSlug + '/dashboard/' + leadId)
    const assignee = (await listWorkspaceMembers(current.db, current.tenant.id)).find((member) => member.user_id === userId)
    if (!assignee || (assignee.role !== 'owner' && assignee.role !== 'editor')) redirect('/' + tenantSlug + '/dashboard/' + leadId)
    await leads.assign(current.db, leadId, userId)
    revalidatePath('/' + tenantSlug + '/dashboard')
    revalidatePath('/' + tenantSlug + '/dashboard/' + leadId)
  }

  const whatsappHref = 'https://wa.me/' + lead.phone.replace(/\D/g, '')
  const estimateRows = [
    ['Project type', lead.project_type],
    ['Budget band', lead.source === 'estimate' ? lead.budget_band : null],
    ['Timeline', lead.timeline],
  ].filter((row): row is [string, string] => typeof row[1] === 'string' && row[1].length > 0)
  const assignee = members.find((member) => member.user_id === lead.assigned_to)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5 pb-28 sm:px-6 lg:py-8">
      <Link href={'/' + tenantSlug + '/dashboard/enquiries'} className="flex min-h-12 items-center text-sm font-medium text-admin-primary">Back to enquiries</Link>
      <section className="rounded-xl border border-admin-border bg-admin-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><h1 className="truncate text-xl font-semibold text-admin-ink">{lead.name}</h1>{lead.locality && <p className="mt-1 text-base text-admin-muted">{lead.locality}</p>}</div>
          <span className="rounded-xl border border-admin-border bg-admin-bg px-2 py-1 text-xs font-semibold text-admin-muted">{STATUS_LABELS[lead.status].toUpperCase()}</span>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <DetailRow label="Phone" value={lead.phone} /><DetailRow label="Email" value={lead.email} /><DetailRow label="Source" value={lead.source} /><DetailRow label="Source page" value={lead.source_page} /><DetailRow label="Arrived" value={new Date(lead.created_at).toLocaleString('en-IN')} /><DetailRow label="Contacted" value={lead.contacted_at ? new Date(lead.contacted_at).toLocaleString('en-IN') : null} />
        </dl>
      </section>
      <LeadDetailTabs
        notes={<a href="#lead-notes" className="text-sm text-admin-primary hover:underline">Jump to the private notes panel below.</a>}
        booklet={<a href="#lead-booklet" className="text-sm text-admin-primary hover:underline">Jump to the lead booklet details below.</a>}
        timeline={timeline}
        timezone={timezone}
      />
      <section id="lead-booklet" className="rounded-xl border border-admin-border bg-admin-surface p-4"><h2 className="text-base font-semibold text-admin-ink">Message</h2><p className="mt-3 whitespace-pre-wrap text-base text-admin-ink">{lead.message || 'No message was included with this enquiry.'}</p></section>
      {estimateRows.length > 0 && <section className="rounded-xl border border-admin-border bg-admin-surface p-4"><h2 className="text-base font-semibold text-admin-ink">Estimate details</h2><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">{estimateRows.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}</dl></section>}
      <section className="rounded-xl border border-admin-border bg-admin-surface p-4">
        <h2 className="text-base font-semibold text-admin-ink">Assignee</h2>
        {canAssign ? (
          <form action={saveAssignment} className="mt-3 flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-admin-ink">
              Assign to active owner or editor
              <div className="relative flex items-center">
                <select
                  name="userId"
                  defaultValue={lead.assigned_to ?? ''}
                  className="min-h-12 w-full appearance-none rounded-xl border border-admin-border bg-admin-surface pl-3 pr-9 text-base font-normal text-admin-ink outline-none focus:border-admin-primary cursor-pointer"
                >
                  {assignableMembers.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.display_name || member.email || member.role}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-admin-muted" />
              </div>
            </label>
            <button type="submit" className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-on-primary sm:self-end">Save assignment</button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-admin-muted">{assignee?.display_name || assignee?.email || 'Unassigned'} · Only the workspace owner can reassign enquiries.</p>
        )}
      </section>
      <section className="rounded-xl border border-admin-border bg-admin-surface p-4">
        <h2 className="text-base font-semibold text-admin-ink">Status</h2>
        <form action={saveStatus} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-admin-ink">
            Lead status
            <div className="relative flex items-center">
              <select
                name="status"
                defaultValue={lead.status}
                disabled={!canUpdateWork}
                className="min-h-12 w-full appearance-none rounded-xl border border-admin-border bg-admin-surface pl-3 pr-9 text-base font-normal text-admin-ink outline-none focus:border-admin-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-admin-muted" />
            </div>
          </label>
          <button type="submit" disabled={!canUpdateWork} className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-on-primary disabled:cursor-not-allowed disabled:opacity-50 sm:self-end">Save status</button>
        </form>
        {!canUpdateWork && <p className="mt-3 text-xs text-admin-muted">Only the lead coordinator, assigned content manager, or workspace owner can update status and notes.</p>}
      </section>
      <section id="lead-notes" className="rounded-xl border border-admin-border bg-admin-surface p-4"><h2 className="text-base font-semibold text-admin-ink">Notes</h2><form action={saveNote} className="mt-3 flex flex-col gap-3"><label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">Private note<textarea name="notes" defaultValue={lead.notes ?? ''} disabled={!canUpdateWork} rows={6} className="min-h-36 rounded-xl border border-admin-border bg-admin-surface px-3 py-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary" /></label><button type="submit" disabled={!canUpdateWork} className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-on-primary disabled:cursor-not-allowed disabled:opacity-50">Save note</button></form></section>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-admin-border bg-admin-surface p-3 rounded-xl"><div className="mx-auto grid max-w-3xl grid-cols-2 gap-2"><a href={whatsappHref} className="flex min-h-12 items-center justify-center rounded-lg bg-admin-primary px-3 text-base font-semibold text-admin-on-primary">WhatsApp</a><a href={'tel:' + lead.phone} className="flex min-h-12 items-center justify-center rounded-xl border border-admin-border px-3 text-base font-semibold text-admin-ink">Call</a></div></div>
    </div>
  )
}

async function loadLead(tenantSlug: string, leadId: string): Promise<{ lead: Lead; context: Awaited<ReturnType<typeof requireDashboardContext>>; members: WorkspaceMember[]; role: WorkspaceMember['role'] }> {
  const context = await requireDashboardContext(tenantSlug)
  const lead = await leads.get(context.db, leadId)
  if (!lead) notFound()
  const members = await listWorkspaceMembers(context.db, context.tenant.id)
  const role = members.find((member) => member.user_id === context.user.id)?.role ?? 'viewer'
  return { lead, context, members, role }
}

async function workspaceActor(context: Awaited<ReturnType<typeof requireDashboardContext>>) {
  const member = (await listWorkspaceMembers(context.db, context.tenant.id)).find((item) => item.user_id === context.user.id)
  if (!member) redirect('/' + context.tenant.slug + '/dashboard/enquiries')
  return member
}

async function requireDashboardContext(expectedTenantSlug?: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  if (!user?.email || !session) redirect('/login?next=/' + encodeURIComponent(expectedTenantSlug ?? '') + '/dashboard/enquiries')
  const tenantContext = await requireTenant({ id: user.id, email: user.email, accessToken: session.access_token })
  if (expectedTenantSlug && tenantContext.tenant.slug !== expectedTenantSlug) redirect('/' + tenantContext.tenant.slug + '/dashboard/enquiries')
  if (!canAccessDashboard(tenantContext.tenant)) redirect('/' + tenantContext.tenant.slug + '/dashboard/enquiries')
  return tenantContext
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return <div><dt className="text-sm font-medium text-admin-muted">{label}</dt><dd className="mt-1 break-words text-base text-admin-ink">{value}</dd></div>
}
