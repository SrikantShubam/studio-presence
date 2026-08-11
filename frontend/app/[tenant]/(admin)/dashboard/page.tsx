import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canAccessDashboard, leads, requireTenant, type Lead, type LeadStatus } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>
}) {
  const activeFilter = filterFrom((await searchParams)?.filter)
  const allLeads = await loadLeads()
  const visibleLeads = filterLeads(allLeads, activeFilter)
  const notContacted = allLeads.filter(isNotContacted).length
  const newThisWeek = allLeads.filter((lead) => isAfter(lead.created_at, daysAgo(7))).length

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 pb-8 sm:px-6 lg:py-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="new this week" value={newThisWeek} />
        <SummaryCard label="total" value={allLeads.length} />
        <SummaryCard label="not contacted yet" value={notContacted} alert={notContacted > 0} />
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === 'all' ? '/dashboard' : `/dashboard?filter=${filter.value}`}
            className={`flex min-h-12 shrink-0 items-center rounded-lg border px-4 text-sm font-medium ${
              activeFilter === filter.value
                ? 'border-admin-primary bg-admin-primary text-admin-surface'
                : 'border-admin-border bg-admin-surface text-admin-ink'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {visibleLeads.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="flex flex-col gap-3">
          {visibleLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </section>
      )}
    </div>
  )
}

async function loadLeads(): Promise<Lead[]> {
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

  const { tenant, db } = await requireTenant({
    id: user.id,
    email: user.email,
    accessToken: session.access_token,
  })

  if (!canAccessDashboard(tenant)) {
    redirect('/panel')
  }

  return leads.list(db)
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

function isAfter(value: string, date: Date): boolean {
  return new Date(value).getTime() >= date.getTime()
}

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function SummaryCard({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface p-4">
      <p className={`text-2xl font-semibold ${alert ? 'text-admin-alert' : 'text-admin-ink'}`}>{value}</p>
      <p className={`mt-1 text-sm font-medium ${alert ? 'text-admin-alert' : 'text-admin-muted'}`}>{label}</p>
    </div>
  )
}

function LeadCard({ lead }: { lead: Lead }) {
  const whatsappHref = `https://wa.me/${lead.phone.replace(/\D/g, '')}`
  const detailLines = [lead.project_type, lead.locality].filter(Boolean).join(' - ')
  const budget = lead.source === 'estimate' ? lead.budget_band : null

  return (
    <article className="rounded-lg border border-admin-border bg-admin-surface p-4">
      <Link href={`/dashboard/${lead.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-admin-ink">{lead.name}</h2>
            {lead.locality && <p className="mt-1 text-sm text-admin-muted">{lead.locality}</p>}
          </div>
          <StatusPill status={lead.status} />
        </div>

        {detailLines && <p className="mt-3 text-sm font-medium text-admin-ink">{detailLines}</p>}
        {budget && <p className="mt-1 text-sm text-admin-muted">{budget}</p>}
        <p className="mt-2 text-sm text-admin-muted">{relativeTime(lead.created_at)}</p>
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={whatsappHref}
          className="flex min-h-12 items-center justify-center rounded-lg bg-admin-primary px-3 text-base font-semibold text-admin-surface"
        >
          WhatsApp
        </a>
        <a
          href={`tel:${lead.phone}`}
          className="flex min-h-12 items-center justify-center rounded-lg border border-admin-border px-3 text-base font-semibold text-admin-ink"
        >
          Call
        </a>
      </div>
    </article>
  )
}

function StatusPill({ status }: { status: LeadStatus }) {
  const isNew = status === 'new'
  return (
    <span
      className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-semibold ${
        isNew
          ? 'border-admin-primary bg-admin-primary text-admin-surface'
          : 'border-admin-border bg-admin-bg text-admin-muted'
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
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

function EmptyState() {
  return (
    <section className="rounded-lg border border-admin-border bg-admin-surface p-5">
      <h1 className="text-lg font-semibold text-admin-ink">No enquiries yet.</h1>
      <p className="mt-2 text-base text-admin-muted">
        Put your website link in your Instagram bio and send it to anyone who asks for your work.
      </p>
    </section>
  )
}
