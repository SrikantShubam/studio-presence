import type { Db, LeadSource } from '../db'
import type { UmamiClient, UmamiVisitStats } from './umami'

export type EnquiryStats = {
  thisMonth: number
  lastMonth: number
}

export type MonthlyTrendPoint = {
  month: string
  count: number
}

export type SourceBreakdownItem = {
  source: LeadSource
  label: string
  count: number
}

export type ProjectSummary = {
  slug: string
  title: string
}

export type TopProject = {
  slug: string
  title: string
  views: number
}

export type { UmamiClient }

const SOURCE_LABELS: Record<LeadSource, string> = {
  whatsapp: 'WhatsApp button',
  estimate: 'Estimate calculator',
  form: 'Enquiry form',
  call: 'Call button',
  other: 'Other',
}

type MonthWindow = {
  start: Date
  end: Date
}

type SourceCountRow = {
  source: LeadSource
  count: number
}

function monthStart(date: Date, offset: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1))
}

function monthWindow(now: Date, offset: number): MonthWindow {
  const start = monthStart(now, offset)
  return {
    start,
    end: monthStart(now, offset + 1),
  }
}

function monthKey(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

async function countLeads(db: Db, window: MonthWindow): Promise<number> {
  const { count, error } = await db
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', window.start.toISOString())
    .lt('created_at', window.end.toISOString())

  if (error) throw error
  return count ?? 0
}

export async function enquiryStats(db: Db, _tenantId: string, now = new Date()): Promise<EnquiryStats> {
  const [thisMonth, lastMonth] = await Promise.all([
    countLeads(db, monthWindow(now, 0)),
    countLeads(db, monthWindow(now, -1)),
  ])

  return { thisMonth, lastMonth }
}

export async function monthlyTrend(
  db: Db,
  _tenantId: string,
  now = new Date(),
): Promise<MonthlyTrendPoint[]> {
  const windows = [-5, -4, -3, -2, -1, 0].map((offset) => monthWindow(now, offset))
  const counts = await Promise.all(windows.map((window) => countLeads(db, window)))

  return windows.map((window, index) => ({
    month: monthKey(window.start),
    count: counts[index] ?? 0,
  }))
}

export async function sourceBreakdown(
  db: Db,
  _tenantId: string,
  now = new Date(),
): Promise<SourceBreakdownItem[]> {
  const window = monthWindow(now, 0)
  const { data, error } = await db
    .from('leads')
    .select('source,id.count()')
    .gte('created_at', window.start.toISOString())
    .lt('created_at', window.end.toISOString())
    .order('count', { ascending: false })

  if (error) throw error

  return ((data ?? []) as SourceCountRow[])
    .filter((row) => row.count > 0)
    .map((row) => ({
      source: row.source,
      label: SOURCE_LABELS[row.source],
      count: row.count,
    }))
}

export async function visitStats(umami: UmamiClient | null): Promise<UmamiVisitStats | null> {
  if (!umami) return null

  try {
    return await umami.visitStats()
  } catch {
    return null
  }
}

export async function topProjects(
  _db: Db,
  _tenantId: string,
  umami: UmamiClient | null,
  projects: ProjectSummary[],
): Promise<TopProject[]> {
  if (!umami) return []

  try {
    const bySlug = new Map(projects.map((project) => [project.slug, project.title]))
    const projectPaths = await umami.topProjectPaths()

    return projectPaths
      .map((item) => {
        const slug = item.path.replace(/^\/portfolio\//, '').split('/')[0] ?? ''
        const title = bySlug.get(slug)
        if (!title) return null
        return { slug, title, views: item.views }
      })
      .filter((item): item is TopProject => item !== null)
      .slice(0, 3)
  } catch {
    return []
  }
}
