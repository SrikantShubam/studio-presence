import { safeAuthNextPath } from './auth-policy'

export type TenantRouting = 'host' | 'path'

type AuthCallbackOptions = {
  tenant?: string
  next?: string
  path?: '/auth/callback' | '/auth/confirm' | '/auth/recovery'
}

export function canonicalAuthOrigin(currentOrigin: string, configuredOrigin?: string): string {
  const value = configuredOrigin?.trim() || currentOrigin.trim()
  return new URL(value).origin
}

export function authCallbackUrl(
  currentOrigin: string,
  options: AuthCallbackOptions = {},
): string {
  // Supabase's browser client stores the PKCE verifier on the origin that
  // starts the OAuth flow. Returning to a configured/canonical origin when it
  // differs from the current browser origin loses that verifier and produces
  // the misleading "different browser or device" error. The callback must
  // therefore stay on the origin where sign-in began; Vercel preview URLs are
  // valid origins in their own right.
  const callback = new URL(options.path ?? '/auth/callback', currentOrigin)
  if (options.tenant) callback.searchParams.set('tenant', options.tenant)
  if (options.next) callback.searchParams.set('next', safeAuthNextPath(options.next))
  return callback.toString()
}

const TENANT_ADMIN_PREFIXES = ['/admin', '/dashboard', '/panel']

export function tenantAuthNextPath(next: string | undefined, expectedTenantSlug?: string): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/dashboard'

  const [pathOnly, queryOrHash] = next.split(/([?#].*)/, 2)
  const path = pathOnly ?? next
  const suffix = queryOrHash ?? ''

  if (TENANT_ADMIN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return next
  }

  const tenantMatch = path.match(/^\/([a-z0-9-]+)(\/(?:admin|dashboard|panel)(?:\/.*)?)$/)
  if (tenantMatch) {
    const slug = tenantMatch[1]
    const innerPath = tenantMatch[2]
    if (!expectedTenantSlug || slug === expectedTenantSlug) {
      return `${innerPath}${suffix}`
    }
  }

  return '/dashboard'
}

export function tenantDestinationUrl(
  origin: string,
  tenantSlug: string,
  path: string,
  routing: TenantRouting,
): string {
  const base = canonicalAuthOrigin(origin)
  const encodedSlug = encodeURIComponent(tenantSlug)
  const alreadyPrefixed = path === `/${encodedSlug}` || path.startsWith(`/${encodedSlug}/`) || path === `/${tenantSlug}` || path.startsWith(`/${tenantSlug}/`)
  const tenantPrefix = routing === 'path' && !alreadyPrefixed ? `/${encodedSlug}` : ''
  return `${base}${tenantPrefix}${path.startsWith('/') ? path : `/${path}`}`
}
