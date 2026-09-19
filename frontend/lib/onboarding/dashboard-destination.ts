export type DashboardRouting = 'host' | 'path'

export function dashboardDestination({
  requestUrl,
  tenantSlug,
  tenantHostname,
  routing,
}: {
  requestUrl: string
  tenantSlug: string
  tenantHostname: string
  routing: DashboardRouting
}): string {
  if (routing === 'path') return '/' + encodeURIComponent(tenantSlug) + '/dashboard'

  const url = new URL(requestUrl)
  const currentHostname = url.hostname.toLowerCase()
  const isLocal = currentHostname === 'localhost' || currentHostname === '127.0.0.1' || currentHostname.endsWith('.localhost')

  if (isLocal) {
    url.hostname = tenantSlug + '.localhost'
  } else {
    url.protocol = 'https:'
    url.hostname = tenantHostname.split(':')[0] ?? tenantHostname
    url.port = ''
  }

  url.pathname = '/dashboard'
  url.search = ''
  url.hash = ''
  return url.toString()
}