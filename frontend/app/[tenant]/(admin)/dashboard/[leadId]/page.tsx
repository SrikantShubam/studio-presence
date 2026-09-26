import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ArrowLeft, ChevronDown, Phone } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { canAccessDashboard, getWorkspacePreferences, leads, listWorkspaceActivity, listWorkspaceMembers, leadStatusSchema, requireTenant, WORKSPACE_ROLE_LABELS, type Lead, type WorkspaceMember } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { LeadTimeline } from '../components/LeadDetailTabs'
import { StatusBadge } from '../components/primitives'

const STATUS_LABELS: Record<Lead['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
}
const SOURCE_LABELS: Record<Lead['source'], string> = {
  estimate: 'Estimate calculator',
  form: 'Website form',
  whatsapp: 'WhatsApp',
  call: 'Walk-in or call',
  other: 'Other',
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
  const currentAvatar = [
    context.profileMetadata?.avatar_url,
    context.profileMetadata?.picture,
    context.profileMetadata?.avatarUrl,
    context.profileMetadata?.photoURL,
    context.profileMetadata?.image,
  ].find((value): value is string => typeof value === 'string' && value.length > 0) ?? null
  const currentDisplayName = [
    context.profileMetadata?.full_name,
    context.profileMetadata?.name,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? WORKSPACE_ROLE_LABELS[role]
  let timeline = [] as Awaited<ReturnType<typeof listWorkspaceActivity>>['events']
  try {
    timeline = (await listWorkspaceActivity(context.db, context.tenant.id, {
      limit: 10,
      leadId: lead.id,
      currentActor: {
        userId: context.user.id,
        displayName: currentDisplayName,
        email: context.user.email,
        avatarUrl: currentAvatar,
      },
    })).events
  } catch {
    timeline = []
  }
  let timezone = 'Asia/Kolkata'
  try {
    timezone = (await getWorkspacePreferences(context.db, context.tenant.id)).timezone
  } catch {
    timezone = 'Asia/Kolkata'
  }
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
    redirect('/' + tenantSlug + '/dashboard/' + leadId)
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
    redirect('/' + tenantSlug + '/dashboard/' + leadId)
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
    redirect('/' + tenantSlug + '/dashboard/' + leadId)
  }

  const whatsappHref = 'https://wa.me/' + lead.phone.replace(/\D/g, '')
  const estimateRows = [
    ['Project type', lead.project_type],
    ['Budget band', lead.source === 'estimate' ? lead.budget_band : null],
    ['Timeline', lead.timeline],
  ].filter((row): row is [string, string] => typeof row[1] === 'string' && row[1].length > 0)
  const assignee = members.find((member) => member.user_id === lead.assigned_to)
  const phoneDigits = lead.phone.replace(/\D/g, '')
  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 pb-28 sm:px-6 lg:py-8 lg:pb-10">
      <Link href={'/' + tenantSlug + '/dashboard/enquiries'} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 text-sm font-semibold text-admin-ink hover:bg-admin-raised">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to enquiries
      </Link>

      <header className="rounded-xl border border-admin-border bg-admin-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Enquiry details</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="break-words text-2xl font-semibold tracking-tight text-admin-ink sm:text-3xl">{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-2 text-sm text-admin-muted">{lead.locality || 'Locality not supplied'} · Received {dateFormatter.format(new Date(lead.created_at))}</p>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <a href={whatsappHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary">
              <FontAwesomeIcon aria-hidden="true" icon={faWhatsapp} className="size-4" />WhatsApp
            </a>
            <a href={'tel:+' + phoneDigits} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-admin-border bg-admin-bg px-4 text-sm font-semibold text-admin-ink hover:bg-admin-raised">
              <Phone aria-hidden="true" className="size-4" />Call
            </a>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <main className="grid min-w-0 content-start gap-5">
          <section className="rounded-xl border border-admin-border bg-admin-surface p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Client brief</p>
            <h2 className="mt-1 text-base font-semibold text-admin-ink">What they need</h2>
            <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-admin-ink">{lead.message || 'No project brief was included with this enquiry.'}</p>
            {estimateRows.length > 0 && (
              <dl className="mt-6 grid gap-4 border-t border-admin-border pt-5 sm:grid-cols-3">
                {estimateRows.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}
              </dl>
            )}
          </section>

          <section className="rounded-xl border border-admin-border bg-admin-surface p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Contact and source</p>
            <h2 className="mt-1 text-base font-semibold text-admin-ink">Enquiry record</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Phone" value={phoneDigits ? `+${phoneDigits}` : null} />
              <DetailRow label="Email" value={lead.email} />
              <DetailRow label="Source" value={SOURCE_LABELS[lead.source]} />
              <DetailRow label="Source page" value={lead.source_page} />
              <DetailRow label="Received" value={dateFormatter.format(new Date(lead.created_at))} />
              <DetailRow label="First contacted" value={lead.contacted_at ? dateFormatter.format(new Date(lead.contacted_at)) : null} />
            </dl>
          </section>

          <LeadTimeline timeline={timeline} timezone={timezone} />
        </main>

        <aside className="grid content-start gap-5 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-xl border border-admin-border bg-admin-surface p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Workflow</p>
            <h2 className="mt-1 text-base font-semibold text-admin-ink">Move the enquiry forward</h2>

            <form action={saveStatus} className="mt-5 grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium text-admin-ink">
                Lead status
                <div className="relative flex items-center">
                  <select
                    name="status"
                    defaultValue={lead.status}
                    disabled={!canUpdateWork}
                    className="min-h-12 w-full cursor-pointer appearance-none rounded-xl border border-admin-border bg-admin-bg pl-3 pr-10 text-base font-normal text-admin-ink outline-none focus:border-admin-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-admin-muted" />
                </div>
              </label>
              <button type="submit" disabled={!canUpdateWork} className="min-h-12 rounded-xl bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary disabled:cursor-not-allowed disabled:opacity-50">Save status</button>
            </form>

            <div className="mt-6 border-t border-admin-border pt-5">
              <h3 className="text-sm font-semibold text-admin-ink">Assignee</h3>
              {canAssign ? (
                <form action={saveAssignment} className="mt-3 grid gap-3">
                  <label className="grid gap-1.5 text-sm font-medium text-admin-ink">
                    Owner or content manager
                    <div className="relative flex items-center">
                      <select
                        name="userId"
                        defaultValue={lead.assigned_to ?? ''}
                        className="min-h-12 w-full cursor-pointer appearance-none rounded-xl border border-admin-border bg-admin-bg pl-3 pr-10 text-base font-normal text-admin-ink outline-none focus:border-admin-primary"
                      >
                        {assignableMembers.map((member) => <option key={member.user_id} value={member.user_id}>{member.display_name || member.email || member.role}</option>)}
                      </select>
                      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-admin-muted" />
                    </div>
                  </label>
                  <button type="submit" className="min-h-12 rounded-xl border border-admin-border bg-admin-bg px-4 text-sm font-semibold text-admin-ink hover:bg-admin-raised">Save assignment</button>
                </form>
              ) : (
                <p className="mt-2 text-sm leading-6 text-admin-muted">{assignee?.display_name || assignee?.email || 'Unassigned'} · Only the workspace owner can reassign enquiries.</p>
              )}
            </div>
            {!canUpdateWork && <p className="mt-5 border-t border-admin-border pt-4 text-xs leading-5 text-admin-muted">Only the lead coordinator, assigned content manager, or workspace owner can update status and notes.</p>}
          </section>

          <section id="lead-notes" className="rounded-xl border border-admin-border bg-admin-surface p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Private workspace</p>
            <h2 className="mt-1 text-base font-semibold text-admin-ink">Studio notes</h2>
            <form action={saveNote} className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium text-admin-ink">
                Next step and context
                <textarea name="notes" defaultValue={lead.notes ?? ''} disabled={!canUpdateWork} rows={7} className="min-h-40 rounded-xl border border-admin-border bg-admin-bg px-3 py-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary disabled:cursor-not-allowed disabled:opacity-50" />
              </label>
              <button type="submit" disabled={!canUpdateWork} className="min-h-12 rounded-xl bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary disabled:cursor-not-allowed disabled:opacity-50">Save notes</button>
            </form>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-admin-border bg-admin-surface p-3 sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <a href={whatsappHref} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-admin-primary px-3 text-sm font-semibold text-admin-on-primary"><FontAwesomeIcon aria-hidden="true" icon={faWhatsapp} className="size-4" />WhatsApp</a>
          <a href={'tel:+' + phoneDigits} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-admin-border bg-admin-bg px-3 text-sm font-semibold text-admin-ink"><Phone aria-hidden="true" className="size-4" />Call</a>
        </div>
      </div>
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
  return {
    ...tenantContext,
    profileMetadata: {
      ...(user.user_metadata ?? {}),
      ...(user.identities?.[0]?.identity_data ?? {}),
    } as Record<string, unknown>,
  }
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return <div><dt className="text-sm font-medium text-admin-muted">{label}</dt><dd className="mt-1 break-words text-base text-admin-ink">{value}</dd></div>
}
