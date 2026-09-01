import { NextResponse, type NextRequest } from 'next/server'
import { AuthError, claimOperatorAccess, claimPendingAccess, createScopedClient, destinationForTenant, recordDemoContact, requireTenant } from '@studio/backend'
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

function authFailureTarget(
  origin: string,
  error: { code?: string; status?: number; message?: string } | null | undefined,
): string {
  const message = (error?.message ?? '').toLowerCase()
  const providerCode = (error?.code ?? '').toLowerCase()
  let code = 'auth-invalid'

  if (message.includes('fetch failed') || message.includes('network') || error?.status === 503) {
    code = 'auth-unreachable'
  } else if (
    providerCode.includes('expired') ||
    providerCode.includes('otp') && providerCode.includes('invalid') ||
    message.includes('expired') ||
    message.includes('already been used') ||
    message.includes('token has been used')
  ) {
    code = 'link-expired'
  } else if (
    message.includes('code verifier') ||
    message.includes('pkce') ||
    message.includes('exchange the code')
  ) {
    code = 'auth-pkce'
  }

  return `${origin}/login?error=${code}`
}

function providerErrorTarget(origin: string, searchParams: URLSearchParams): string | null {
  const providerError = searchParams.get('error')
  const providerCode = searchParams.get('error_code')
  const providerDescription = searchParams.get('error_description')
  if (!providerError && !providerCode && !providerDescription) return null

  console.error('[auth/callback] provider returned auth error', {
    error: providerError,
    code: providerCode,
  })

  return authFailureTarget(origin, {
    code: providerCode ?? providerError ?? undefined,
    message: providerDescription ?? providerError ?? undefined,
  })
}

export async function GET(request: NextRequest) {
  const origin = originFrom(request)
  const { searchParams } = request.nextUrl
  const providerFailure = providerErrorTarget(origin, searchParams)
  if (providerFailure) return NextResponse.redirect(providerFailure)

  const code = searchParams.get('code')
  // Supabase's PKCE flow uses `code`. Branded email templates should send
  // `token_hash`; local/operator test links may send a plain OTP `token` with
  // `email`, which verifies through the same Supabase Auth endpoint.
  const tokenHash = searchParams.get('token_hash')
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const otpType = searchParams.get('type')
  const tenantSlug = searchParams.get('tenant')

  const supabase = await createSupabaseServerClient()

  let session =
    (await supabase.auth.getSession()).data.session ??
    null

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.session) {
      console.error('[auth/callback] code exchange failed', {
        code: error?.code ?? null,
        status: error?.status ?? null,
      })
      return NextResponse.redirect(authFailureTarget(origin, error))
    }
    session = data.session
  } else if (tokenHash) {
    const type =
      otpType === 'recovery' || otpType === 'email' || otpType === 'signup' ? otpType : 'email'
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (error || !data.session) {
      console.error('[auth/callback] token verification failed', {
        code: error?.code ?? null,
        status: error?.status ?? null,
      })
      return NextResponse.redirect(authFailureTarget(origin, error))
    }
    session = data.session
  } else if (token && email) {
    const { data, error } = await supabase.auth.verifyOtp({ type: 'email', email, token })
    if (error || !data.session) {
      console.error('[auth/callback] email token verification failed', {
        code: error?.code ?? null,
        status: error?.status ?? null,
      })
      return NextResponse.redirect(authFailureTarget(origin, error))
    }
    session = data.session
  } else if (!session) {
    return NextResponse.redirect(`${origin}/login?error=missing-code`)
  }

  const { user, access_token } = session

  if (!user.email) {
    // Should not happen for an email-magic-link session, but requireTenant's
    // error reporting depends on having an email to name, so fail explicitly
    // rather than passing an empty string forward.
    return NextResponse.redirect(`${origin}/login?error=no-email`)
  }

  const sessionUser = { id: user.id, email: user.email, accessToken: access_token }
  const db = createScopedClient(access_token)

  await claimOperatorAccess(db)
  const { data: isOperator } = await db.rpc('is_operator')
  if (isOperator) return NextResponse.redirect(`${origin}/super`)
  if (tenantSlug) {
    await claimPendingAccess(db)
    await recordDemoContact(db, tenantSlug)
  }

  try {
    const { tenant } = await requireTenant(sessionUser)
    if (tenantSlug && tenant.slug !== tenantSlug) {
      return NextResponse.redirect(`${origin}/dashboard?demo=1`)
    }
    return NextResponse.redirect(`${origin}${destinationForTenant(tenant)}`)
  } catch (e) {
    if (!(e instanceof AuthError)) throw e

    // Signed in, but not yet granted customer access. Keep the visitor in the
    // same panel UI, where the page will run local-only persistence.
    if (e.code === 'no-tenant') return NextResponse.redirect(`${origin}/dashboard?demo=1`)
    return NextResponse.redirect(`${origin}/login?error=${e.code}`)
  }
}
