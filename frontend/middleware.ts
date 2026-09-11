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
const PASSTHROUGH = /^\/(?:_next|api\/|clients\/|fonts\/|about-iteration-|contact-iteration-|contact-concepts\/|brand\/|favicon\.(?:ico|svg)|icon\.svg|apple-icon\.svg)/

function primaryDevTenant(): TenantEntry | undefined {
  const sub = Object.keys(TENANT_MAP.bySubdomain)[0]
  return sub ? TENANT_MAP.bySubdomain[sub] : undefined
}

function resolveTenant(host: string): { entry: TenantEntry; viaCustomDomain: boolean } | null {
  const hostname = host.split(':')[0]?.toLowerCase() ?? ''

  // Local development: ashish.localhost:3000
  if (hostname.endsWith('.localhost') || hostname === 'localhost' || hostname === '127.0.0.1') {
    const sub = hostname.replace(/\.?localhost$/, '')
    const entry = sub ? TENANT_MAP.bySubdomain[sub] : undefined
    if (entry) return { entry, viaCustomDomain: false }

    // Bare localhost (no subdomain). Supabase "Confirm your email" uses the
    // project Site URL, which is almost always http://localhost:3000 — that
    // host is not a tenant, so the click used to die here. In development,
    // treat it as the primary local site so the auth callback can run.
    if (
      process.env.NODE_ENV !== 'production' &&
      (hostname === 'localhost' || hostname === '127.0.0.1')
    ) {
      const primary = primaryDevTenant()
      return primary ? { entry: primary, viaCustomDomain: false } : null
    }

    return null
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

  // Keep every Next development and production asset out of tenant routing.
  // The matcher is the first filter, but an explicit guard prevents a hot-update
  // request from ever falling through to the dynamic `[tenant]` route.
  if (pathname === '/_next' || pathname.startsWith('/_next/')) return NextResponse.next()

  if (PASSTHROUGH.test(pathname)) return NextResponse.next()

  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]?.toLowerCase() ?? ''
  const isRootHost =
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}` ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'

  // Platform pages live on the root domain and must never be rewritten to a
  // tenant. Keep this allowlist narrow so an unknown root-domain path still
  // fails closed instead of exposing tenant routing.
  if (isRootHost && (pathname === '/studio-presence' || pathname.startsWith('/studio-presence/'))) {
    return NextResponse.next()
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
  if (authToken && !pathname.includes('/auth/callback') && !pathname.includes('/auth/confirm')) {
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
