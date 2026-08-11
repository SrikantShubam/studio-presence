export type UmamiVisitStats = {
  thisMonth: number
  lastMonth: number
}

export type UmamiProjectPath = {
  path: string
  views: number
}

export type UmamiClient = {
  visitStats(): Promise<UmamiVisitStats>
  topProjectPaths(): Promise<UmamiProjectPath[]>
}

type UmamiStatsResponse = {
  visitors?: unknown
}

type UmamiMetricResponse = Array<{
  x?: unknown
  y?: unknown
}>

type MonthWindow = {
  start: Date
  end: Date
}

const TIMEZONE = 'Asia/Kolkata'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}

function monthWindow(monthOffset: number, now = new Date()): MonthWindow {
  const shifted = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1))
  return {
    start: shifted,
    end: new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 1)),
  }
}

function integer(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function projectPath(slug: string): string {
  return `/portfolio/${slug}`
}

function endpoint(baseUrl: string, siteId: string, resource: 'stats' | 'metrics', window: MonthWindow): URL {
  const url = new URL(`/api/websites/${siteId}/${resource}`, baseUrl)
  url.searchParams.set('startAt', String(window.start.getTime()))
  url.searchParams.set('endAt', String(window.end.getTime()))
  url.searchParams.set('unit', 'month')
  url.searchParams.set('timezone', TIMEZONE)
  return url
}

async function fetchJson<T>(url: URL, apiKey: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!response.ok) throw new Error(`Umami returned ${response.status}`)
  return (await response.json()) as T
}

export function createUmamiClient(siteId: string, now = new Date()): UmamiClient {
  const baseUrl = requireEnv('UMAMI_API_URL')
  const apiKey = requireEnv('UMAMI_API_KEY')

  return {
    async visitStats() {
      const [current, previous] = await Promise.all([
        fetchJson<UmamiStatsResponse>(endpoint(baseUrl, siteId, 'stats', monthWindow(0, now)), apiKey),
        fetchJson<UmamiStatsResponse>(endpoint(baseUrl, siteId, 'stats', monthWindow(-1, now)), apiKey),
      ])

      return {
        thisMonth: integer(current.visitors),
        lastMonth: integer(previous.visitors),
      }
    },

    async topProjectPaths() {
      const url = endpoint(baseUrl, siteId, 'metrics', monthWindow(0, now))
      url.searchParams.set('type', 'path')

      const metrics = await fetchJson<UmamiMetricResponse>(url, apiKey)
      return metrics
        .filter((item): item is { x: string; y: number } => typeof item.x === 'string' && typeof item.y === 'number')
        .filter((item) => item.x.startsWith(projectPath('')))
        .map((item) => ({ path: item.x, views: item.y }))
        .sort((a, b) => b.views - a.views)
    },
  }
}
