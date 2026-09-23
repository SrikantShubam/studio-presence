import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthError, canAccessDashboard, leads, listWorkspaceMembers, requireTenant, type Lead, type LeadStatus, type WorkspaceMember } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminCard, AdminChip, AdminLinkButton, AdminMetric, AdminPageHeader, AdminShell } from '../../components'
import { DEMO_LEADS } from '../../demo-data'
import { DEMO_WORKSPACE_MEMBERS } from '../components/demo-data'

type Filter = 'all' | 'new' | 'not-contacted' | 'this-month'

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'not-contacted', label: 'Not contacted' },
  { value: 'this-month', label: 'This month' },
]

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'NEW',
  contacted: 'CONTACTED',
  quoted: 'QUOTED',
  won: 'WON',
  lost: 'LOST',
}

export default async function EnquiriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams?: Promise<{ filter?: string; demo?: string }>
}) {
  const { tenant } = await params
  const query = await searchParams
  const activeFilter = filterFrom(query?.filter)
  const baseDashboard = `/${tenant}/dashboard`
  const { leads: allLeads, mode, members } = await loadLeads(tenant, query?.demo)
  const visibleLeads = filterLeads(allLeads, activeFilter)
  const sampleMode = mode === 'demo'
  const unavailableMode = mode === 'unavailable'
  const notContacted = allLeads.filter(isNotContacted).length
  const thisMonth = allLeads.filter((lead) => isThisMonth(lead.created_at)).length

  return (
    <AdminShell>
      <AdminCard className={`p-4 ${sampleMode ? 'border-admin-alert bg-admin-alert-soft' : unavailableMode ? 'border-admin-alert bg-admin-alert-soft' : 'border-admin-primary bg-admin-primary-soft'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-admin-ink">{sampleMode ? 'Sample enquiries' : unavailableMode ? 'Live enquiries unavailable' : 'Live enquiries'}</p>
            <p className="mt-1 text-sm text-admin-muted">
              {sampleMode
                ? 'These are seeded examples for testing the owner workflow.'
                : unavailableMode
                  ? 'Sample data is off, but this login is not connected to this tenant. No fake enquiries are shown.'
                  : 'All enquiries submitted through the website are listed here.'}
            </p>
          </div>
          <Link href={sampleMode ? `${baseDashboard}/enquiries?demo=0` : `${baseDashboard}/enquiries?demo=1`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-admin-primary px-4 text-sm font-semibold text-admin-primary">
            {sampleMode ? 'Turn sample data off' : 'Turn sample data on'}
          </Link>
        </div>
      </AdminCard>

      <AdminCard className="p-5 sm:p-6">
        <AdminPageHeader
          eyebrow="Enquiries"
          title="All customer enquiries"
          description="This is the separate owner sheet for every lead captured by WhatsApp, estimate, form, call, or other source."
          action={<AdminLinkButton href={baseDashboard}>Back to overview</AdminLinkButton>}
        />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AdminMetric label="total enquiries" value={allLeads.length} tone="primary" />
          <AdminMetric label="this month" value={thisMonth} />
          <AdminMetric label="not contacted" value={notContacted} tone={notContacted > 0 ? 'alert' : 'neutral'} />
          <AdminMetric label="shown now" value={visibleLeads.length} />
        </div>
      </AdminCard>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === 'all' ? (sampleMode ? `${baseDashboard}/enquiries?demo=1` : `${baseDashboard}/enquiries`) : `${baseDashboard}/enquiries?${sampleMode ? 'demo=1&' : ''}filter=${filter.value}`}
            className={`flex min-h-11 shrink-0 items-center rounded border px-4 text-sm font-semibold ${
              activeFilter === filter.value ? 'border-admin-primary bg-admin-primary-soft text-admin-primary' : 'border-admin-border bg-admin-surface text-admin-ink'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {visibleLeads.length === 0 ? <EmptyState unavailable={unavailableMode} /> : <AdminCard className="overflow-hidden">{visibleLeads.map((lead) => <LeadRow key={lead.id} lead={lead} demo={sampleMode} members={members} />)}</AdminCard>}
    </AdminShell>
  )
}

async function loadLeads(tenantSlug: string, demoParam: string | undefined): Promise<{ leads: Lead[]; mode: 'paid' | 'demo' | 'unavailable'; members: WorkspaceMember[] }> {
  if (demoParam === '1') return { leads: DEMO_LEADS, mode: 'demo', members: DEMO_WORKSPACE_MEMBERS }
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user?.email || !session) {
    if (demoParam === '0') redirect(`/login?next=/${encodeURIComponent(tenantSlug)}/dashboard/enquiries`)
    return { leads: DEMO_LEADS, mode: 'demo', members: DEMO_WORKSPACE_MEMBERS }
  }

  try {
    const tenantContext = await requireTenant({
      id: user.id,
      email: user.email,
      accessToken: session.access_token,
    })

    if (tenantContext.tenant.slug !== tenantSlug) return { leads: [], mode: 'unavailable', members: [] }
    if (demoParam === '0') return { leads: [], mode: 'unavailable', members: [] }
    if (canAccessDashboard(tenantContext.tenant)) return { leads: await leads.list(tenantContext.db), mode: 'paid', members: await listWorkspaceMembers(tenantContext.db, tenantContext.tenant.id) }
    return { leads: DEMO_LEADS, mode: 'demo', members: DEMO_WORKSPACE_MEMBERS }
  } catch (e) {
    if (e instanceof AuthError && (e.code === 'no-tenant' || e.code === 'wrong-tenant')) return { leads: [], mode: 'unavailable', members: [] }
    throw e
  }
}

function filterFrom(value: string | undefined): Filter {
  if (value === 'new' || value === 'not-contacted' || value === 'this-month') return value
  return 'all'
}

function filterLeads(items: Lead[], filter: Filter): Lead[] {
  if (filter === 'new') return items.filter((lead) => lead.status === 'new')
  if (filter === 'not-contacted') return items.filter(isNotContacted)
  if (filter === 'this-month') return items.filter((lead) => isThisMonth(lead.created_at))
  return items
}

function isNotContacted(lead: Lead): boolean {
  return lead.status === 'new' && lead.contacted_at === null
}

function isThisMonth(value: string): boolean {
  const date = new Date(value)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

function LeadRow({ lead, demo, members }: { lead: Lead; demo: boolean; members: WorkspaceMember[] }) {
  const whatsappHref = `https://wa.me/${lead.phone.replace(/\D/g, '')}`
  const detailLines = [lead.project_type, lead.locality, lead.timeline].filter(Boolean).join(' - ')
  const budget = lead.source === 'estimate' ? lead.budget_band : null

  return (
    <article className="grid gap-3 border-b border-admin-border p-4 last:border-b-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-base font-semibold text-admin-ink">{lead.name}</h2>
          <StatusPill status={lead.status} />
        </div>
        {detailLines && <p className="mt-1 text-sm text-admin-muted">{detailLines}</p>}
        {lead.message && <p className="mt-2 line-clamp-2 text-sm leading-6 text-admin-ink">{lead.message}</p>}
      </div>
      <div className="grid gap-1 text-sm text-admin-muted">
        <span>{lead.phone}</span>
        {lead.email && <span>{lead.email}</span>}
        {budget && <span>{budget}</span>}
        <span>{relativeTime(lead.created_at)} · {lead.source}</span>
        <span>Assigned to: {members.find((member) => member.user_id === lead.assigned_to)?.display_name || members.find((member) => member.user_id === lead.assigned_to)?.email || 'Unassigned'}</span>
        {demo && <span>read-only sample</span>}
      </div>
      <div className="grid grid-cols-2 gap-2 lg:w-48">
        <a href={whatsappHref} className="flex min-h-11 items-center justify-center rounded-md bg-admin-primary px-3 text-sm font-semibold text-admin-on-primary">
          WhatsApp
        </a>
        <a href={`tel:${lead.phone}`} className="flex min-h-11 items-center justify-center rounded-md border border-admin-border px-3 text-sm font-semibold text-admin-ink">
          Call
        </a>
      </div>
    </article>
  )
}

function StatusPill({ status }: { status: LeadStatus }) {
  const tone = status === 'new' ? 'primary' : status === 'lost' ? 'alert' : 'neutral'
  return <AdminChip tone={tone}>{STATUS_LABELS[status]}</AdminChip>
}

function relativeTime(value: string): string {
  const then = new Date(value).getTime()
  const now = Date.now()
  const diffSeconds = Math.round((then - now) / 1000)
  const absSeconds = Math.abs(diffSeconds)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (absSeconds < 60) return 'just now'
  if (absSeconds < 3600) return formatter.format(Math.round(diffSeconds / 60), 'minute')
  if (absSeconds < 86400) return formatter.format(Math.round(diffSeconds / 3600), 'hour')
  return formatter.format(Math.round(diffSeconds / 86400), 'day')
}

function EmptyState({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <AdminCard className="p-5">
      <h1 className="text-lg font-semibold text-admin-ink">{unavailable ? 'Live enquiries unavailable.' : 'No enquiries yet.'}</h1>
      <p className="mt-2 text-base text-admin-muted">
        {unavailable
          ? 'This confirms sample data is off. Connect this login to the tenant to load the real enquiry sheet.'
          : 'Put your website link in your Instagram bio and send it to anyone who asks for your work.'}
      </p>
    </AdminCard>
  )
}
