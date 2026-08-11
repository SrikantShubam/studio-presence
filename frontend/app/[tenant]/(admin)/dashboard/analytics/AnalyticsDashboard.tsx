'use client'

import { useEffect, useMemo, useState } from 'react'

type EnquiryStats = {
  thisMonth: number
  lastMonth: number
}

type TrendPoint = {
  month: string
  count: number
}

type SourceItem = {
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
const TRAFFIC_UNAVAILABLE = 'Visitor data is not available right now'
const PROJECTS_UNAVAILABLE = 'Project view data is not available right now'

export function AnalyticsDashboard({ tenant }: { tenant: string }) {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadAnalytics() {
      setError(null)
      const response = await fetch(`/api/${tenant}/analytics`, { cache: 'no-store' })

      if (!response.ok) {
        throw new Error('Analytics could not be loaded')
      }

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
  }, [tenant])

  const trend = useMemo(() => lastSixMonths(data?.monthlyTrend ?? []), [data?.monthlyTrend])

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:py-8">
        <section className="rounded-lg border border-admin-border bg-admin-surface p-5">
          <h1 className="text-lg font-semibold text-admin-ink">Analytics unavailable</h1>
          <p className="mt-2 text-base text-admin-muted">{error}</p>
        </section>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:py-8">
        <section className="rounded-lg border border-admin-border bg-admin-surface p-5">
          <h1 className="text-lg font-semibold text-admin-ink">Loading analytics</h1>
        </section>
      </div>
    )
  }

  if (isEmptyAnalytics(data, trend)) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:py-8">
        <section className="rounded-lg border border-admin-border bg-admin-surface p-5">
          <h1 className="text-lg font-semibold text-admin-ink">{EMPTY_STATE}</h1>
        </section>
      </div>
    )
  }

  const topSource = data.sourceBreakdown[0]

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 pb-8 sm:px-6 lg:py-8">
      <section className="rounded-lg border border-admin-border bg-admin-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Total enquiries</p>
        <h1 className="mt-3 text-5xl font-semibold leading-none text-admin-ink">
          {data.enquiryStats.thisMonth}
        </h1>
        <p className="mt-2 text-base text-admin-ink">enquiries this month</p>
        <p className="mt-2 text-sm text-admin-muted">{data.enquiryStats.lastMonth} last month</p>
        <div className="mt-5 border-t border-admin-border pt-4">
          {data.visitStats ? (
            <>
              <p className="text-xl font-semibold text-admin-ink">{data.visitStats.thisMonth} visitors this month</p>
              <p className="mt-1 text-sm text-admin-muted">{data.visitStats.lastMonth} last month</p>
            </>
          ) : (
            <p className="text-base text-admin-muted">{TRAFFIC_UNAVAILABLE}</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-admin-border bg-admin-surface p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-admin-muted">6-month trend</h2>
        <div className="mt-5 flex h-32 items-end gap-3">
          {trend.map((point) => (
            <div key={point.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end">
                <div
                  className={`w-full rounded-t-lg bg-admin-primary ${barHeightClass(point.count, trend)}`}
                />
              </div>
              <span className="text-xs text-admin-muted">{monthLabel(point.month)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-admin-border bg-admin-surface p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Enquiry sources</h2>
        {data.sourceBreakdown.length > 0 ? (
          <ol className="mt-4 flex flex-col gap-3">
            {data.sourceBreakdown.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-admin-ink">{item.label}</span>
                <span className="font-semibold text-admin-ink">{item.count}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-base text-admin-muted">Enquiry sources will appear once people contact you.</p>
        )}
      </section>

      <section className="rounded-lg border border-admin-border bg-admin-surface p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Top projects</h2>
        {data.visitStats === null ? (
          <p className="mt-4 text-base text-admin-muted">{PROJECTS_UNAVAILABLE}</p>
        ) : data.topProjects.length > 0 ? (
          <ol className="mt-4 flex flex-col gap-3">
            {data.topProjects.slice(0, 3).map((project) => (
              <li key={project.slug} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 font-medium text-admin-ink">{project.title}</span>
                <span className="shrink-0 text-admin-muted">{project.views} views</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-base text-admin-muted">Project views will appear once visitors browse your work.</p>
        )}
      </section>

      <p className="rounded-lg border border-admin-border bg-admin-surface p-4 text-sm text-admin-ink">
        {interpret(data, topSource)}
      </p>
    </div>
  )
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

function barHeightClass(count: number, points: TrendPoint[]): string {
  const max = Math.max(...points.map((point) => point.count), 0)
  if (max === 0 || count === 0) return 'h-1'

  const ratio = count / max
  if (ratio >= 0.84) return 'h-full'
  if (ratio >= 0.67) return 'h-20'
  if (ratio >= 0.5) return 'h-16'
  if (ratio >= 0.34) return 'h-12'
  if (ratio >= 0.17) return 'h-8'
  return 'h-4'
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

function interpret(data: AnalyticsPayload, topSource: SourceItem | undefined): string {
  if (topSource) {
    return `Most enquiries this month came from ${topSource.label.toLowerCase()}.`
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
