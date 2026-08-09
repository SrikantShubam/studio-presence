import { NextResponse, type NextRequest } from 'next/server'

/**
 * Multi-tenancy and the go-live gate.
 *
 * Every request arrives on one of two shapes of host:
 *
 *   ashish.vectorveda.online   demo subdomain, always available
 *   ashishinteriors.in         the client's own domain, only once status is live
 *
 * Both resolve to a tenant slug and rewrite to `/[tenant]/...`, so route handlers
 * and pages never parse a hostname.
 *
 * The second job is the payment gate. `demo` and `sold` sites must not be indexed
 * and must not answer on a custom domain — that is what makes the commercial rule
 * structural rather than something somebody has to remember at deploy time. It is
 * enforced here rather than in a page because a header set at the edge covers
 * every route, including ones nobody has written yet.
 *
 * Config is NOT read here. Middleware runs on the edge runtime, and the config
 * loader touches the filesystem. The tenant map is generated at build instead —
 * see `scripts/gen-tenant-map.ts`.
 */

import { TENANT_MAP, type TenantEntry } from './lib/tenant-map'

/** Hosts that are ours, not a client's. */
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vectorveda.online'

/** Paths that are never tenant-scoped. */
const PASSTHROUGH = /^\/(?:_next|api\/health|favicon\.ico|robots\.txt$)/

function resolveTenant(host: string): { entry: TenantEntry; viaCustomDomain: boolean } | null {
  const hostname = host.split(':')[0]?.toLowerCase() ?? ''

  // Local development: ashish.localhost:3000
  if (hostname.endsWith('.localhost') || hostname === 'localhost') {
    const sub = hostname.replace(/\.?localhost$/, '')
    const entry = sub ? TENANT_MAP.bySubdomain[sub] : undefined
    return entry ? { entry, viaCustomDomain: false } : null
  }

  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1))
    const entry = TENANT_MAP.bySubdomain[sub]
    return entry ? { entry, viaCustomDomain: false } : null
  }

  const entry = TENANT_MAP.byCustomDomain[hostname]
  return entry ? { entry, viaCustomDomain: true } : null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PASSTHROUGH.test(pathname)) return NextResponse.next()

  const host = request.headers.get('host') ?? ''
  const resolved = resolveTenant(host)

  // Unknown host. Not a 404 page — there is no tenant whose 404 this would be.
  if (!resolved) {
    return new NextResponse('No site is configured for this address.', {
      status: 404,
      headers: { 'x-robots-tag': 'noindex, nofollow' },
    })
  }

  const { entry, viaCustomDomain } = resolved

  // THE PAYMENT GATE.
  //
  // A custom domain answers only at status `live`. Deploy tooling is supposed to
  // refuse to attach one earlier; this is the backstop for when a domain was
  // pointed at us manually, which is exactly how it happens in practice. Serving
  // it anyway would hand over the finished product before the balance cleared.
  if (viaCustomDomain && entry.status !== 'live') {
    return new NextResponse('This site is not live yet.', {
      status: 404,
      headers: { 'x-robots-tag': 'noindex, nofollow' },
    })
  }

  if (entry.status === 'archived') {
    return new NextResponse('This site is no longer available.', {
      status: 410,
      headers: { 'x-robots-tag': 'noindex, nofollow' },
    })
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${entry.slug}${pathname}`

  const response = NextResponse.rewrite(url)
  response.headers.set('x-tenant', entry.slug)

  // Belt and braces with `seo.noindex` in the config. A demo indexed under the
  // client's own name is hard to undo, and a header applies to routes the page
  // layer might miss.
  if (entry.status !== 'live') {
    response.headers.set('x-robots-tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
