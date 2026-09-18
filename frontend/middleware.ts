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
const AUTH_ORIGIN_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_AUTH_ORIGIN ?? '').hostname.toLowerCase()
  } catch {
    return ''
  }
})()
function envHostname(value: string | undefined): string {
  if (!value) return ''
  try {
    return new URL(value.startsWith('http') ? value : `https://${value}`).hostname.toLowerCase()
  } catch {
    return ''
  }
}

const CANDIDATE_DOMAIN = 'candidate.srikantshubams-projects.vercel.app'
const PREVIEW_DOMAIN = 'preview.srikantshubams-projects.vercel.app'

const VERCEL_HOSTS = new Set(
  [
    envHostname(process.env.VERCEL_URL),
    envHostname(process.env.VERCEL_BRANCH_URL),
    envHostname(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    CANDIDATE_DOMAIN,
    PREVIEW_DOMAIN,
  ].filter(Boolean),
)
const ROOT_PLATFORM_PATHS = new Set([
  '/',
  '/auth/callback',
  '/auth/confirm',
  '/auth/recovery',
  '/demo',
  '/login',
  '/onboarding',
  '/reset-password',
])
const ROOT_TENANT_PATHS = new Set(['auth', 'dashboard', 'login', 'panel'])
const TENANT_COOKIE = 'sp_route_tenant'
const AUTH_PLATFORM_PASSTHROUGH = new Set(['/auth/confirm', '/auth/recovery', '/reset-password'])
const RETIRED_TENANT_HOSTS = new Set([['qa', 'owner'].join('-')])

/**
 * Paths that are never tenant-scoped — served as-is, not rewritten.
 *
 * `clients/` is where every uploaded client asset lives (logos, portfolio
 * photos, company-profile PDFs — see the `assetPath` convention in
 * `backend/src/config/schema.ts`, all rooted at `/clients/<slug>/...`) and it
 * has to stay off the rewrite path or Next's static file handler never sees the
 * request: `/clients/ashish-interiors/p1.jpg` becomes
 * `/ashish-interiors/clients/ashish-interiors/p1.jpg`, which matches no route
 * and 404s. Same for `/fonts/...` — those are global static files, not a
 * tenant slug. Caught by hitting a real asset URL against a running server —
 * `check:config` proves the path is *referenced* correctly, nothing catches
 * whether it's *servable*.
 *
 * `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, `opengraph-image` and
 * `favicon.ico` stay OUT of this list on purpose — SPEC.md §5 has them as
 * dynamic, per-tenant routes (`app/[tenant]/sitemap.ts` etc.), so they need the
 * rewrite like any other page.
 *
 * Passing one of them through is not harmless: `NextResponse.next()` means "keep
 * routing without a rewrite", and with no static file behind it the request
 * falls through to the only top-level dynamic segment, `/[tenant]`. The slug
 * then resolves to the literal string `favicon.ico`, the config loader throws,
 * and a browser's automatic favicon request 500s the page. `robots.txt` was in
 * this list against the paragraph above and had the identical bug.
 */
const PASSTHROUGH = /^\/(?:_next|api\/|clients\/|fonts\/|images\/|about-iteration-|contact-iteration-|locations-iteration-|locations-index|locations-showcase|contact-concepts\/|brand\/|favicon\.(?:ico|svg)|icon\.svg|apple-icon\.svg)/

function parseHostname(host: string): string {
  const trimmed = host.trim().toLowerCase()
  if (trimmed.startsWith('[')) {
    const closeIdx = trimmed.indexOf(']')
    if (closeIdx !== -1) return trimmed.slice(1, closeIdx)
  }
  return trimmed.split(':')[0] ?? ''
}

function isDevLoopbackOrLan(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')
  ) {
    return true
  }
  // Private IPv4 LAN ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  if (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  ) {
    return true
  }
  return false
}

function resolveTenant(host: string): { entry: TenantEntry; viaCustomDomain: boolean } | null {
  const hostname = parseHostname(host)

  // Local development: ashish.localhost:3000, 127.0.0.1, [::1], or local LAN IP
  if (isDevLoopbackOrLan(hostname)) {
    const sub = hostname.endsWith('.localhost') ? hostname.slice(0, -'.localhost'.length) : ''
    const entry = sub ? TENANT_MAP.bySubdomain[sub] : undefined
    if (entry) return { entry, viaCustomDomain: false }

    // Bare localhost, loopback, and LAN IPs are platform hosts, not tenant hosts.
    // Never silently assign them to the first tenant: that is how a retired route
    // or a stale auth callback can expose the wrong site locally.
    return null
  }

  if (
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}` ||
    hostname === CANDIDATE_DOMAIN ||
    hostname === PREVIEW_DOMAIN
  ) return null

  const platformDomain = [ROOT_DOMAIN, CANDIDATE_DOMAIN, PREVIEW_DOMAIN].find((d) => hostname.endsWith(`.${d}`))
  if (platformDomain) {
    const sub = hostname.slice(0, -(platformDomain.length + 1))
    if (RETIRED_TENANT_HOSTS.has(sub)) return null
    const entry = TENANT_MAP.bySubdomain[sub]
    if (entry) return { entry, viaCustomDomain: false }

    // Onboarded tenants are persisted in Supabase and therefore cannot be
    // compiled into the edge bundle. The page loader verifies this candidate
    // against tenant_hostnames and falls back to the fixture loader for older
    // static sites; this placeholder only lets the request reach that loader.
    if (/^[a-z0-9-]+$/.test(sub)) {
      return {
        entry: { slug: sub, status: 'demo', tier: 't0', template: 'editorial' },
        viaCustomDomain: false,
      }
    }

    return null
  }

  const entry = TENANT_MAP.byCustomDomain[hostname]
  return entry ? { entry, viaCustomDomain: true } : null
}

function usesPathTenants(): boolean {
  return process.env.NEXT_PUBLIC_TENANT_ROUTING === 'path'
}

function isRootHost(host: string): boolean {
  const hostname = parseHostname(host)
  return hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}` || hostname === AUTH_ORIGIN_HOST || VERCEL_HOSTS.has(hostname)
}

function isBareDevHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  )
}

function tenantForPathSegment(segment: string | undefined): TenantEntry | undefined {
  if (!segment) return undefined
  return TENANT_MAP.bySubdomain[segment] ?? Object.values(TENANT_MAP.bySubdomain).find((entry) => entry.slug === segment)
}

function rootPathResponse(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname
  if (ROOT_PLATFORM_PATHS.has(pathname)) return NextResponse.next()

  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  const pathTenant = tenantForPathSegment(first)

  // If the first segment is explicitly in RETIRED_TENANT_HOSTS, redirect to retired-tenant.
  if (first && RETIRED_TENANT_HOSTS.has(first)) {
    const url = new URL('/login', request.url)
    url.searchParams.set('error', 'retired-tenant')
    return NextResponse.redirect(url)
  }

  // A dynamic database tenant on root domain (e.g. /[slug]/panel or /[slug]/dashboard)
  if (!pathTenant && first && /^[a-z0-9-]+$/.test(first) && segments[1] && ROOT_TENANT_PATHS.has(segments[1])) {
    const response = NextResponse.next()
    response.cookies.set(TENANT_COOKIE, first, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    })
    response.headers.set('x-tenant', first)
    return response
  }

  if (first && ROOT_TENANT_PATHS.has(first)) {
    const tenant = request.cookies.get(TENANT_COOKIE)?.value
    if (tenant && (Object.values(TENANT_MAP.bySubdomain).some((entry) => entry.slug === tenant) || /^[a-z0-9-]+$/.test(tenant))) {
      const url = request.nextUrl.clone()
      url.pathname = `/${tenant}${pathname}`
      return NextResponse.redirect(url)
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!usesPathTenants()) return null

  if (pathTenant) {
    if (pathTenant.status === 'archived') {
      return new NextResponse('This site is no longer available.', {
        status: 410,
        headers: { 'x-robots-tag': 'noindex, nofollow' },
      })
    }

    const tenantSuffix = first?.length ? pathname.slice(first.length + 1) : ''
    const canonicalPath = `/${pathTenant.slug}${tenantSuffix}`
    if (pathname !== canonicalPath) {
      const url = request.nextUrl.clone()
      url.pathname = canonicalPath
      const response = NextResponse.redirect(url)
      response.cookies.set(TENANT_COOKIE, pathTenant.slug, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
      })
      return response
    }

    const response = NextResponse.next()
    response.cookies.set(TENANT_COOKIE, pathTenant.slug, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    })
    response.headers.set('x-tenant', pathTenant.slug)
    if (pathTenant.status !== 'live') response.headers.set('x-robots-tag', 'noindex, nofollow')
    return response
  }

  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Keep every Next development and production asset out of tenant routing.
  // The matcher is the first filter, but an explicit guard prevents a hot-update
  // request from ever falling through to the dynamic `[tenant]` route.
  if (pathname === '/_next' || pathname.startsWith('/_next/')) return NextResponse.next()

  if (PASSTHROUGH.test(pathname)) return NextResponse.next()

  // Confirmation, recovery, and reset are platform callbacks. They must stay
  // on their exact browser origin even when the email was opened on a tenant
  // host; the handlers establish the session before membership routing.
  if (AUTH_PLATFORM_PASSTHROUGH.has(pathname)) return NextResponse.next()

  const host = request.headers.get('host') ?? ''
  const hostname = parseHostname(host)

  // Redirect raw Vercel deployment hash URLs to the named canonical domain
  if (
    hostname.endsWith('.vercel.app') &&
    hostname !== CANDIDATE_DOMAIN &&
    hostname !== PREVIEW_DOMAIN &&
    !hostname.endsWith(`.${CANDIDATE_DOMAIN}`) &&
    !hostname.endsWith(`.${PREVIEW_DOMAIN}`)
  ) {
    const isPreviewBuild = process.env.VERCEL_GIT_COMMIT_REF === 'preview' || host.includes('preview')
    const targetDomain = isPreviewBuild ? PREVIEW_DOMAIN : CANDIDATE_DOMAIN
    const canonicalUrl = request.nextUrl.clone()
    canonicalUrl.hostname = targetDomain
    canonicalUrl.port = ''
    canonicalUrl.protocol = 'https'
    return NextResponse.redirect(canonicalUrl, 308)
  }

  const isRootHostRequest =
    isRootHost(host) ||
    (process.env.NODE_ENV !== 'production' && isBareDevHost(hostname))

  // Platform pages live on the root domain and must never be rewritten to a
  // tenant. Keep this allowlist narrow so an unknown root-domain path still
  // fails closed instead of exposing tenant routing.
  if (isRootHostRequest && (pathname === '/studio-presence' || pathname.startsWith('/studio-presence/'))) {
    return NextResponse.next()
  }

  if (isRootHostRequest) {
    const rootResponse = rootPathResponse(request)
    if (rootResponse) return rootResponse
  }

  const resolved = resolveTenant(host)

  // Unknown host. Not a 404 page — there is no tenant whose 404 this would be.
  //
  // In development this is almost always someone opening `localhost:3000`
  // straight after `npm run dev`, which resolves to no tenant because every
  // site is a subdomain. A bare refusal is a dead end, so point to the primary
  // local site. In production the message stays opaque on purpose: an unknown
  // host is a stranger, and the client roster is not theirs to enumerate.
  if (!resolved) {
    const primarySubdomain = Object.keys(TENANT_MAP.bySubdomain)[0]
    const body =
      process.env.NODE_ENV === 'production'
        ? 'No site is configured for this address.'
        : 'No site is configured for this address.\n\n' +
          'Every site is a tenant, resolved by subdomain. Try:\n' +
          `  http://${primarySubdomain}.localhost:${request.nextUrl.port || '3000'}/` +
          '\n'

    return new NextResponse(body, {
      status: 404,
      headers: { 'x-robots-tag': 'noindex, nofollow' },
    })
  }

  const { entry, viaCustomDomain } = resolved

  // Auth emails sometimes land on `/` or `/admin` with `?code=` / `token_hash`
  // instead of `/auth/callback`. Send them through the callback so the session
  // is exchanged instead of dropping the user on the public site unsigned-in.
  const authToken =
    request.nextUrl.searchParams.get('code') ||
    request.nextUrl.searchParams.get('token_hash') ||
    request.nextUrl.searchParams.get('token')
  if (
    authToken &&
    !pathname.includes('/auth/callback') &&
    !pathname.includes('/auth/confirm') &&
    !pathname.includes('/auth/recovery')
  ) {
    const dest = request.nextUrl.clone()
    dest.pathname = '/auth/callback'
    return NextResponse.redirect(dest)
  }

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

  // File-based metadata lives under `app/[tenant]/...`, so Next emits
  // `/<slug>/opengraph-image` (and hashed `/<slug>/opengraph-image-<id>`).
  // Prefixing again would send those to `/<slug>/<slug>/...` and the
  // catch-all 404s them — WhatsApp/iMessage then show no share card.
  const alreadyTenantPrefixed =
    pathname === `/${entry.slug}` || pathname.startsWith(`/${entry.slug}/`)

  const url = request.nextUrl.clone()
  if (!alreadyTenantPrefixed) {
    url.pathname = `/${entry.slug}${pathname}`
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-site-host', host)
  requestHeaders.set('x-forwarded-host', host)

  const response = alreadyTenantPrefixed
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : NextResponse.rewrite(url, { request: { headers: requestHeaders } })
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
  matcher: ['/((?!_next/).*)'],
}
