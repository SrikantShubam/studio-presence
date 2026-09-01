'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AdminCard, AdminChip, AdminShell } from '../../components'

type EnquiryStats = {
  thisMonth: number
  lastMonth: number
}

type TrendPoint = {
  month: string
  count: number
}

type SourceItem = {
  source?: string
  label: string
  count: number
}

type VisitStats = {
  thisMonth: number
  lastMonth: number
}

type TopProject = {
  slug: string
  title: string
  views: number
}

type AnalyticsPayload = {
  enquiryStats: EnquiryStats
  monthlyTrend: TrendPoint[]
  sourceBreakdown: SourceItem[]
  visitStats: VisitStats | null
  topProjects: TopProject[]
}

const EMPTY_STATE = "We'll show this once your site has been live for a few weeks."
const PROJECTS_UNAVAILABLE = 'Project view data is not available right now'

export function AnalyticsDashboard({
  tenant,
  initialData = null,
  mode = 'paid',
}: {
  tenant: string
  initialData?: AnalyticsPayload | null
  mode?: 'paid' | 'demo' | 'unavailable'
}) {
  const [data, setData] = useState<AnalyticsPayload | null>(initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'demo' || mode === 'unavailable') return

    let active = true

    async function loadAnalytics() {
      setError(null)
      const response = await fetch(`/api/${tenant}/analytics`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Analytics could not be loaded')
      const payload = (await response.json()) as AnalyticsPayload
      if (active) setData(payload)
    }

    loadAnalytics().catch((e: unknown) => {
      if (!active) return
      setError(e instanceof Error ? e.message : 'Analytics could not be loaded')
    })

    return () => {
      active = false
    }
  }, [mode, tenant])

  const trend = useMemo(() => lastSixMonths(data?.monthlyTrend ?? []), [data?.monthlyTrend])

  if (mode === 'unavailable') {
    return (
      <Shell>
        <AdminCard className="border-admin-alert bg-admin-alert-soft p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-admin-ink">Analytics unavailable</h1>
              <p className="mt-2 text-base text-admin-muted">Sample data is off, but this login is not connected to this tenant or Umami is not reachable for live analytics.</p>
            </div>
            <a href="/dashboard/analytics?demo=1" className="inline-flex min-h-11 items-center justify-center rounded border border-admin-primary px-4 text-sm font-semibold text-admin-primary">
              Turn sample data on
            </a>
          </div>
        </AdminCard>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <Card>
          <h1 className="text-lg font-semibold text-admin-ink">Analytics unavailable</h1>
          <p className="mt-2 text-base text-admin-muted">{error}</p>
        </Card>
      </Shell>
    )
  }

  if (!data) {
    return (
      <Shell>
        <Card>
          <p className="text-base text-admin-muted">Loading analytics</p>
        </Card>
      </Shell>
    )
  }

  if (isEmptyAnalytics(data, trend)) {
    return (
      <Shell>
        <Card>
          <h1 className="text-lg font-semibold text-admin-ink">{EMPTY_STATE}</h1>
        </Card>
      </Shell>
    )
  }

  const maxBar = Math.max(...trend.map((point) => point.count), 0)
  const topSource = data.sourceBreakdown[0]
  const topProject = data.topProjects[0]

  return (
    <Shell>
      <AdminCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Analytics</p>
              <h1 className="mt-1 text-2xl font-semibold text-admin-ink">Business signals, not vanity graphs</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
              {mode === 'demo'
                ? 'Sample analytics show how the paid dashboard behaves. These numbers are read-only and not connected to your database.'
                : interpret(data, topSource)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === 'demo' && <AdminChip tone="alert">sample data</AdminChip>}
            {mode === 'demo' && (
              <a href="/dashboard/analytics" className="inline-flex min-h-7 items-center rounded border border-admin-primary px-2 text-xs font-semibold uppercase tracking-wide text-admin-primary">
                Turn sample data off
              </a>
            )}
            <AdminChip tone={data.enquiryStats.thisMonth >= data.enquiryStats.lastMonth ? 'primary' : 'neutral'}>
              {monthDelta(data.enquiryStats.thisMonth, data.enquiryStats.lastMonth)}
            </AdminChip>
          </div>
        </div>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <QuestionCard
          question="How many people visited?"
          answer={data.visitStats ? data.visitStats.thisMonth : 'Visitor data unavailable'}
          note={data.visitStats ? `${data.visitStats.lastMonth} last month` : 'Umami unavailable'}
          tone={data.visitStats ? 'primary' : 'alert'}
        />
        <QuestionCard
          question="How many people contacted you?"
          answer={data.enquiryStats.thisMonth}
          note={`${data.enquiryStats.lastMonth} last month`}
          tone="primary"
        />
        <QuestionCard
          question="Which pages got attention?"
          answer={topProject ? topProject.title : PROJECTS_UNAVAILABLE}
          note={topProject ? `${topProject.views} views` : 'Project views will appear once Umami has data.'}
        />
        <QuestionCard
          question="Where did enquiries come from?"
          answer={topSource ? topSource.label : 'No source yet'}
          note={topSource ? `${topSource.count} enquiries` : 'Sources appear after leads arrive.'}
        />
      </div>

      <AdminCard className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-admin-ink">What should I follow up on?</h2>
            <p className="mt-1 text-sm text-admin-muted">Use this as the plain next action, not a graph-reading exercise.</p>
          </div>
          <AdminChip tone={data.enquiryStats.thisMonth > 0 ? 'primary' : 'neutral'}>{data.enquiryStats.thisMonth} this month</AdminChip>
        </div>
        <p className="mt-4 text-base leading-7 text-admin-ink">{followUpAction(data, topSource, topProject)}</p>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankedCard title="Source count" empty="Enquiry sources will appear once people contact you.">
          {data.sourceBreakdown.map((item) => (
            <RankedRow key={item.label} label={item.label} value={item.count} />
          ))}
        </RankedCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-admin-ink">Enquiry trend</h2>
            <span className="text-sm text-admin-muted">last 6 months</span>
          </div>
          <div className="mt-5 grid gap-2">
            {trend.map((point) => (
              <div key={point.month} className="grid grid-cols-[3.5rem_minmax(0,1fr)_3rem] items-center gap-3">
                <span className="text-xs text-admin-muted">{monthLabel(point.month)}</span>
                <div className="h-2 rounded bg-admin-raised">
                  <div className={`h-2 rounded bg-admin-primary ${barWidthClass(point.count, maxBar)}`} />
                </div>
                <span className="text-right text-sm font-semibold tabular-nums text-admin-ink">{point.count}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}

function Card({ children }: { children: ReactNode }) {
  return <AdminCard className="p-5">{children}</AdminCard>
}

function lastSixMonths(points: TrendPoint[]): TrendPoint[] {
  const byMonth = new Map(points.map((point) => [point.month, point.count]))
  const now = new Date()

  return [-5, -4, -3, -2, -1, 0].map((offset) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1))
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    return { month, count: byMonth.get(month) ?? 0 }
  })
}

function barWidthClass(count: number, max: number): string {
  if (max === 0 || count === 0) return 'w-0'
  const ratio = count / max
  if (ratio >= 0.9) return 'w-full'
  if (ratio >= 0.75) return 'w-10/12'
  if (ratio >= 0.6) return 'w-8/12'
  if (ratio >= 0.45) return 'w-6/12'
  if (ratio >= 0.3) return 'w-4/12'
  if (ratio >= 0.15) return 'w-2/12'
  return 'w-1/12'
}

function monthLabel(month: string): string {
  const [year, value] = month.split('-').map(Number)
  if (!year || !value) return month
  return new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(Date.UTC(year, value - 1, 1)))
}

function isEmptyAnalytics(data: AnalyticsPayload, trend: TrendPoint[]): boolean {
  const hasEnquiries =
    data.enquiryStats.thisMonth > 0 ||
    data.enquiryStats.lastMonth > 0 ||
    trend.some((point) => point.count > 0) ||
    data.sourceBreakdown.length > 0
  const hasTraffic =
    (data.visitStats !== null && (data.visitStats.thisMonth > 0 || data.visitStats.lastMonth > 0)) ||
    data.topProjects.length > 0

  return !hasEnquiries && !hasTraffic
}

function sourceTapPhrase(item: SourceItem): string {
  const key = item.source ?? item.label
  if (key === 'whatsapp' || /whatsapp/i.test(item.label)) return 'WhatsApp'
  if (key === 'estimate' || /estimate/i.test(item.label)) return 'the estimate calculator'
  if (key === 'form' || /form/i.test(item.label)) return 'the enquiry form'
  if (key === 'call' || /call/i.test(item.label)) return 'Call'
  return item.label
}

function interpret(data: AnalyticsPayload, topSource: SourceItem | undefined): string {
  if (topSource) {
    return `Most people who contact you tap ${sourceTapPhrase(topSource)} after looking at two or three projects.`
  }

  const topProject = data.topProjects[0]
  if (topProject) {
    return `${topProject.title} has the most project views this month.`
  }

  if (data.enquiryStats.thisMonth > data.enquiryStats.lastMonth) {
    return 'Enquiries are ahead of last month.'
  }

  return 'Keep sharing the website link so this month has enough signal.'
}

function followUpAction(data: AnalyticsPayload, topSource: SourceItem | undefined, topProject: TopProject | undefined): string {
  if (data.enquiryStats.thisMonth === 0) return 'No enquiries yet. Put the website link back into Instagram, WhatsApp replies, and your Google Business Profile.'
  if (topSource) return `Most enquiries came from ${topSource.label}. Check those conversations first and reply before adding more content.`
  if (topProject) return `${topProject.title} is getting attention. Make sure that project has strong photos, location, and service links.`
  return 'Follow up on new enquiries first, then review whether project pages need clearer CTAs.'
}

function QuestionCard({
  question,
  answer,
  note,
  tone = 'neutral',
}: {
  question: string
  answer: ReactNode
  note: string
  tone?: 'neutral' | 'primary' | 'alert'
}) {
  const toneClass =
    tone === 'alert'
      ? 'border-admin-alert bg-admin-alert-soft'
      : tone === 'primary'
        ? 'border-admin-primary bg-admin-primary-soft'
        : ''

  return (
    <AdminCard className={`p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">{question}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-admin-ink">{answer}</p>
      <p className="mt-2 text-sm text-admin-muted">{note}</p>
    </AdminCard>
  )
}

function monthDelta(current: number, previous: number): string {
  if (previous === 0 && current > 0) return 'new signal'
  if (current === previous) return 'flat'
  return current > previous ? 'up' : 'down'
}

function RankedCard({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return (
    <AdminCard className="overflow-hidden">
      <div className="border-b border-admin-border px-5 py-4">
        <h2 className="text-base font-semibold text-admin-ink">{title}</h2>
      </div>
      {hasChildren ? <ol className="flex flex-col">{children}</ol> : <p className="p-5 text-base text-admin-muted">{empty}</p>}
    </AdminCard>
  )
}

function RankedRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <li className="flex min-h-12 items-center justify-between gap-3 border-b border-admin-border px-5 py-3 last:border-b-0">
      <span className="min-w-0 text-sm font-medium text-admin-ink">{label}</span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-admin-muted">{value}</span>
    </li>
  )
}
