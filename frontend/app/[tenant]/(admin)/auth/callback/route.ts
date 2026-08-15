import { NextResponse, type NextRequest } from 'next/server'
import { AuthError, claimDemoTenant, destinationForTenant, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Where the magic link lands.
 *
 * Supabase redirects here with a `code` query param (PKCE flow — the matching
 * verifier is in a cookie the browser client set when it called
 * `signInWithOtp`). Exchanging it establishes the session; everything after
 * that is `requireTenant()` deciding whose site this is and where they belong.
 *
 * Redirects target the tenant's actual host on purpose. This runs inside the
 * [tenant] route group, and middleware.ts rewrites every request on that host
 * regardless of path, so a relative redirect scopes itself to the right tenant
 * for free — PROVIDED the origin is built correctly. It is not safe to read
 * `request.nextUrl.origin` here: verified against a running server, a Route
 * Handler reached via middleware's rewrite gets `nextUrl.origin` resolved
 * against the server's bind address, not the original Host header — a request
 * to `ashish.localhost:3111` produced redirects to bare `localhost:3111`,
 * which resolves to no tenant. middleware.ts doesn't have this problem because
 * it reads `request.headers.get('host')` directly rather than going through
 * `nextUrl`; this file does the same for the same reason.
 */

function originFrom(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')
  return `${proto}://${host}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const origin = originFrom(request)
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing-code`)
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=link-expired`)
  }

  const { user, access_token } = data.session

  if (!user.email) {
    // Should not happen for an email-magic-link session, but requireTenant's
    // error reporting depends on having an email to name, so fail explicitly
    // rather than passing an empty string forward.
    return NextResponse.redirect(`${origin}/login?error=no-email`)
  }

  const sessionUser = { id: user.id, email: user.email, accessToken: access_token }

  try {
    const { tenant } = await requireTenant(sessionUser)
    return NextResponse.redirect(`${origin}${destinationForTenant(tenant)}`)
  } catch (e) {
    if (!(e instanceof AuthError)) throw e

    // Signed in, but this account belongs to no tenant. If the site they signed
    // in ON is a demo nobody owns yet, that is not a failure — it is the moment
    // it becomes theirs. Everything that makes this safe lives in the database
    // (migration 0003): demo status only, no existing members, always for
    // auth.uid(). If any of that does not hold, the claim quietly returns false
    // and we fall through to the same error screen as before.
    if (e.code === 'no-tenant') {
      const { tenant: tenantSlug } = await params

      if (await claimDemoTenant(access_token, tenantSlug)) {
        const { tenant } = await requireTenant(sessionUser)
        return NextResponse.redirect(`${origin}${destinationForTenant(tenant)}`)
      }
    }

    return NextResponse.redirect(`${origin}/login?error=${e.code}`)
  }
}
