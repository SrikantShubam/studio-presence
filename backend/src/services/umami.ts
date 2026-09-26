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

const DEFAULT_TIMEZONE = 'Asia/Kolkata'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}

/**
 * Self-hosted Umami has no permanent API key — that's a Cloud-only feature.
 * The only auth path is POST /api/auth/login with username/password, which
 * returns a session token of unknown lifetime. So this client logs in lazily,
 * caches the token for reuse across calls in the same request, and re-logs-in
 * once if a call comes back 401 (token expired mid-request). Discovered by
 * actually running this against a real self-hosted instance — the "API Keys"
 * settings page this was originally written against doesn't exist there.
 */
type UmamiAuthResponse = { token?: unknown }

async function login(baseUrl: string, username: string, password: string): Promise<string> {
  const response = await fetch(new URL('/api/auth/login', baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) throw new Error(`Umami login failed: ${response.status}`)

  const data = (await response.json()) as UmamiAuthResponse
  if (typeof data.token !== 'string' || !data.token) {
    throw new Error('Umami login response had no token')
  }
  return data.token
}

function localParts(now: Date, timeZone: string): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric' }).formatToParts(now)
  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
  }
}

function zonedMidnightUtc(year: number, month: number, timeZone: string): Date {
  const target = Date.UTC(year, month - 1, 1)
  let guess = target
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = formatter.formatToParts(new Date(guess))
    const asUtc = Date.UTC(
      Number(parts.find((part) => part.type === 'year')?.value),
      Number(parts.find((part) => part.type === 'month')?.value) - 1,
      Number(parts.find((part) => part.type === 'day')?.value),
      Number(parts.find((part) => part.type === 'hour')?.value),
      Number(parts.find((part) => part.type === 'minute')?.value),
      Number(parts.find((part) => part.type === 'second')?.value),
    )
    guess += target - asUtc
  }
  return new Date(guess)
}

function monthWindow(monthOffset: number, now = new Date(), timeZone = DEFAULT_TIMEZONE): MonthWindow {
  const local = localParts(now, timeZone)
  const shifted = new Date(Date.UTC(local.year, local.month - 1 + monthOffset, 1))
  const start = zonedMidnightUtc(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, timeZone)
  const next = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 1))
  return {
    start,
    end: zonedMidnightUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, timeZone),
  }
}

function integer(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function projectPath(slug: string): string {
  return `/portfolio/${slug}`
}

function endpoint(baseUrl: string, siteId: string, resource: 'stats' | 'metrics', window: MonthWindow, timeZone: string): URL {
  const url = new URL(`/api/websites/${siteId}/${resource}`, baseUrl)
  url.searchParams.set('startAt', String(window.start.getTime()))
  url.searchParams.set('endAt', String(window.end.getTime()))
  url.searchParams.set('unit', 'month')
  url.searchParams.set('timezone', timeZone)
  return url
}

async function fetchWithToken(url: URL, token: string): Promise<Response> {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
}

export function createUmamiClient(siteId: string, now = new Date(), timeZone = DEFAULT_TIMEZONE): UmamiClient {
  const baseUrl = requireEnv('UMAMI_API_URL')
  const username = requireEnv('UMAMI_USERNAME')
  const password = requireEnv('UMAMI_PASSWORD')

  let tokenPromise: Promise<string> | null = null

  function getToken(): Promise<string> {
    if (!tokenPromise) tokenPromise = login(baseUrl, username, password)
    return tokenPromise
  }

  /** One retry with a fresh login if the cached token turns out to be expired. */
  async function fetchJson<T>(url: URL): Promise<T> {
    let response = await fetchWithToken(url, await getToken())

    if (response.status === 401) {
      tokenPromise = null
      response = await fetchWithToken(url, await getToken())
    }

    if (!response.ok) throw new Error(`Umami returned ${response.status}`)
    return (await response.json()) as T
  }

  return {
    async visitStats() {
      const [current, previous] = await Promise.all([
        fetchJson<UmamiStatsResponse>(endpoint(baseUrl, siteId, 'stats', monthWindow(0, now, timeZone), timeZone)),
        fetchJson<UmamiStatsResponse>(endpoint(baseUrl, siteId, 'stats', monthWindow(-1, now, timeZone), timeZone)),
      ])

      return {
        thisMonth: integer(current.visitors),
        lastMonth: integer(previous.visitors),
      }
    },

    async topProjectPaths() {
      const url = endpoint(baseUrl, siteId, 'metrics', monthWindow(0, now, timeZone), timeZone)
      url.searchParams.set('type', 'path')

      const metrics = await fetchJson<UmamiMetricResponse>(url)
      return metrics
        .filter((item): item is { x: string; y: number } => typeof item.x === 'string' && typeof item.y === 'number')
        .filter((item) => item.x.startsWith(projectPath('')))
        .map((item) => ({ path: item.x, views: item.y }))
        .sort((a, b) => b.views - a.views)
    },
  }
}
