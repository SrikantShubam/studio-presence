import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthError, canAccessDashboard, getI18nStatus, leads, requireTenant, type Lead, type LeadStatus } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminCard, AdminChip, AdminMetric, AdminShell } from '../components'
import { DEMO_LEADS } from '../demo-data'

type Filter = 'all' | 'new' | 'not-contacted' | 'this-month'

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'NEW',
  contacted: 'CONTACTED',
  quoted: 'QUOTED',
  won: 'WON',
  lost: 'LOST',
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams?: Promise<{ filter?: string; demo?: string }>
}) {
  const { tenant } = await params
  const query = await searchParams
  const activeFilter = filterFrom(query?.filter)
  const forceDemo = query?.demo === '1'
  const { leads: allLeads, mode, displayName } = await loadLeads(tenant, forceDemo)
  const hindiStatus = await getI18nStatus(tenant)
  const visibleLeads = filterLeads(allLeads, activeFilter)
  const won = allLeads.filter((lead) => lead.status === 'won').length
  const notContacted = allLeads.filter(isNotContacted).length
  const qualified = allLeads.filter((lead) => lead.status === 'quoted' || lead.status === 'won').length
  const sampleMode = mode === 'demo'
  const unavailableMode = mode === 'unavailable'
  const recentLeads = visibleLeads.slice(0, 4)
  const previewHref = `/${tenant}`

  return (
    <AdminShell>
      <AdminCard className={`p-4 ${sampleMode ? 'border-admin-alert bg-admin-alert-soft' : 'border-admin-primary bg-admin-primary-soft'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-admin-ink">{sampleMode ? 'Sample data is on' : unavailableMode ? 'Live data unavailable' : 'Live customer data'}</p>
            <p className="mt-1 text-sm text-admin-muted">
              {sampleMode
                ? 'Numbers and enquiries here are demo-only. Website edits stay local until access is granted or saved from a live tenant.'
                : unavailableMode
                  ? 'Sample data is off, but this signed-in account is not connected to this tenant dashboard. Ask an operator to grant tenant access, or turn sample data back on for a demo preview.'
                : 'This view is connected to the tenant account. Saved website edits publish through the override store.'}
            </p>
          </div>
          <Link
            href={sampleMode ? '/dashboard' : '/dashboard?demo=1'}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded border border-admin-primary px-4 text-sm font-semibold text-admin-primary"
          >
            {sampleMode ? 'Turn sample data off' : unavailableMode ? 'Turn sample data on' : 'Turn sample data on'}
          </Link>
        </div>
      </AdminCard>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <AdminCard className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Overview</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-admin-ink">Hello, {displayName}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
                  Follow up enquiries, update website content, check analytics, and manage conversion settings from one place.
                </p>
              </div>
              <Link href="/" target="_blank" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
                View public site
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <AdminMetric label="enquiries" value={allLeads.length} note={unavailableMode ? 'live unavailable' : 'total loaded'} tone="primary" />
              <AdminMetric label="not contacted" value={notContacted} note="needs action" tone={notContacted > 0 ? 'alert' : 'neutral'} />
              <AdminMetric label="qualified" value={qualified} note="quoted or won" />
              <AdminMetric label="won" value={won} note="closed jobs" />
            </div>
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-admin-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Live website preview</p>
                <h2 className="mt-1 text-xl font-semibold text-admin-ink">See the current public site here</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
                  This is the saved public page, shown inside the dashboard. Content edits still save through Website Content.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={previewHref} target="_blank" className="inline-flex min-h-11 items-center justify-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
                  Open site
                </Link>
                <Link href={`/${tenant}/hi`} target="_blank" className="inline-flex min-h-11 items-center justify-center rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary">
                  Hindi
                </Link>
              </div>
            </div>
            <div className="bg-admin-bg p-3">
              <iframe
                title="Live website preview"
                src={previewHref}
                className="h-[34rem] w-full rounded-lg border border-admin-border bg-admin-surface"
              />
            </div>
          </AdminCard>

          <section id="enquiries" className="scroll-mt-24">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Enquiries</p>
              <h2 className="mt-1 text-xl font-semibold text-admin-ink">Recent people waiting for a reply</h2>
              </div>
              <Link href={sampleMode ? '/dashboard/enquiries?demo=1' : '/dashboard/enquiries'} className="inline-flex min-h-11 items-center justify-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
                Open all enquiries
              </Link>
            </div>
            {recentLeads.length === 0 ? <EmptyState unavailable={unavailableMode} /> : <AdminCard className="overflow-hidden">{recentLeads.map((lead) => <LeadCard key={lead.id} lead={lead} demo={sampleMode} />)}</AdminCard>}
          </section>
        </div>

        <aside className="grid content-start gap-5">
          <AdminCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Website content</p>
                <h2 className="mt-1 text-lg font-semibold text-admin-ink">Edit the pages customers see</h2>
              </div>
              <AdminChip tone="primary">editable</AdminChip>
            </div>
            <p className="mt-4 text-sm text-admin-muted">Change copy, projects, services, CTAs, socials, Hindi translations, and estimate settings for the pages this tenant has.</p>
            <Link href="/dashboard/content" className="mt-4 inline-flex min-h-11 items-center rounded border border-admin-border px-3 text-sm font-semibold text-admin-ink">
              Open content manager
            </Link>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Hindi</p>
                <h2 className="mt-1 text-lg font-semibold text-admin-ink">{hindiStatus.translated} fields translated</h2>
              </div>
              <AdminChip tone={hindiStatus.status === 'published' ? 'primary' : 'alert'}>{hindiStatus.status}</AdminChip>
            </div>
            <p className="mt-4 text-sm text-admin-muted">Use the language switcher inside Website Content to edit English and Hindi without raw JSON.</p>
            <Link href="/dashboard/content" className="mt-4 inline-flex min-h-11 items-center rounded border border-admin-border px-3 text-sm font-semibold text-admin-ink">
              Edit translations
            </Link>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Analytics</p>
                <h2 className="mt-1 text-lg font-semibold text-admin-ink">What visitors did</h2>
              </div>
              <AdminChip tone={sampleMode ? 'alert' : 'neutral'}>{sampleMode ? 'sample' : 'live'}</AdminChip>
            </div>
            <p className="mt-4 text-sm text-admin-muted">Visitor data comes from Umami when configured. If it is unavailable, the analytics screen says so instead of inventing numbers.</p>
            <Link href="/dashboard/analytics" className="mt-4 inline-flex min-h-11 items-center rounded border border-admin-border px-3 text-sm font-semibold text-admin-ink">
              Open analytics
            </Link>
          </AdminCard>
        </aside>
      </section>

    </AdminShell>
  )
}

async function loadLeads(tenantSlug: string, forceDemo: boolean): Promise<{ leads: Lead[]; mode: 'paid' | 'demo' | 'unavailable'; displayName: string }> {
  if (forceDemo) return { leads: DEMO_LEADS, mode: 'demo', displayName: 'Demo user' }
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user?.email || !session) {
    redirect('/login')
  }
  const displayName = profileName(user.email, user.user_metadata)

  try {
    const tenantContext = await requireTenant({
      id: user.id,
      email: user.email,
      accessToken: session.access_token,
    })

    if (tenantContext.tenant.slug !== tenantSlug || !canAccessDashboard(tenantContext.tenant)) {
      return { leads: [], mode: 'unavailable', displayName }
    }

    return { leads: await leads.list(tenantContext.db), mode: 'paid', displayName }
  } catch (e) {
    if (e instanceof AuthError && (e.code === 'no-tenant' || e.code === 'wrong-tenant')) {
      return { leads: [], mode: 'unavailable', displayName }
    }
    throw e
  }
}

function profileName(email: string, metadata: Record<string, unknown> | null | undefined): string {
  const name = stringFrom(metadata?.full_name) ?? stringFrom(metadata?.name)
  return name ?? email.split('@')[0] ?? 'there'
}

function stringFrom(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
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

function LeadCard({ lead, demo }: { lead: Lead; demo: boolean }) {
  const whatsappHref = `https://wa.me/${lead.phone.replace(/\D/g, '')}`
  const detailLines = [lead.project_type, lead.locality].filter(Boolean).join(' - ')
  const budget = lead.source === 'estimate' ? lead.budget_band : null
  const content = (
    <div className="min-w-0">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-admin-raised text-sm font-semibold text-admin-ink">
          {lead.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-admin-ink">{lead.name}</h2>
            <StatusPill status={lead.status} />
          </div>
          {detailLines && <p className="mt-1 text-sm font-medium text-admin-ink">{detailLines}</p>}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-admin-muted">
            {budget && <span>{budget}</span>}
            <span>{relativeTime(lead.created_at)}</span>
            {lead.source && <span>{lead.source}</span>}
            {demo && <span>read-only sample</span>}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <article className="grid gap-3 border-b border-admin-border p-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
      {demo ? content : <Link href={`/dashboard/${lead.id}`}>{content}</Link>}

      <div className="grid grid-cols-2 gap-2 sm:w-48">
        <a
          href={whatsappHref}
          className="flex min-h-11 items-center justify-center rounded bg-admin-primary px-3 text-sm font-semibold text-admin-on-primary"
        >
          WhatsApp
        </a>
        <a
          href={`tel:${lead.phone}`}
          className="flex min-h-11 items-center justify-center rounded border border-admin-border px-3 text-sm font-semibold text-admin-ink"
        >
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
          ? 'This confirms sample data is off. Connect this login to the tenant to load real enquiries.'
          : 'Put your website link in your Instagram bio and send it to anyone who asks for your work.'}
      </p>
    </AdminCard>
  )
}
