export type TenantRouting = 'host' | 'path'

type AuthCallbackOptions = {
  tenant?: string
  next?: string
}

export function canonicalAuthOrigin(currentOrigin: string, configuredOrigin?: string): string {
  const value = configuredOrigin?.trim() || currentOrigin.trim()
  return new URL(value).origin
}

export function authCallbackUrl(
  currentOrigin: string,
  configuredOrigin: string | undefined,
  options: AuthCallbackOptions = {},
): string {
  const callback = new URL('/auth/callback', canonicalAuthOrigin(currentOrigin, configuredOrigin))
  if (options.tenant) callback.searchParams.set('tenant', options.tenant)
  if (options.next) callback.searchParams.set('next', options.next)
  return callback.toString()
}

export function tenantDestinationUrl(
  origin: string,
  tenantSlug: string,
  path: string,
  routing: TenantRouting,
): string {
  const base = canonicalAuthOrigin(origin)
  const tenantPrefix = routing === 'path' ? `/${encodeURIComponent(tenantSlug)}` : ''
  return `${base}${tenantPrefix}${path.startsWith('/') ? path : `/${path}`}`
}
