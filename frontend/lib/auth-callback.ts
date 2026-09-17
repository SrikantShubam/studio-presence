import { NextResponse, type NextRequest } from 'next/server'
import {
  AuthError,
  claimOperatorAccess,
  createScopedClient,
  destinationForTenant,
  requireTenant,
} from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { tenantAuthNextPath, tenantDestinationUrl } from '@/lib/platform-auth'

function originFrom(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')
  return `${proto}://${host}`
}

function failureCode(error: { code?: string; status?: number; message?: string } | null | undefined): string {
  const message = (error?.message ?? '').toLowerCase()
  const providerCode = (error?.code ?? '').toLowerCase()

  if (message.includes('fetch failed') || message.includes('network') || error?.status === 503) return 'auth-unreachable'
  if (
    providerCode.includes('expired') ||
    (providerCode.includes('otp') && providerCode.includes('invalid')) ||
    message.includes('expired') ||
    message.includes('already been used') ||
    message.includes('token has been used')
  ) return 'link-expired'
  if (message.includes('code verifier') || message.includes('pkce') || message.includes('exchange the code')) return 'auth-pkce'
  return 'auth-invalid'
}

function failureTarget(origin: string, error: { code?: string; status?: number; message?: string } | null | undefined) {
  return `${origin}/login?error=${failureCode(error)}`
}

function providerFailureTarget(origin: string, request: NextRequest): string | null {
  const params = request.nextUrl.searchParams
  const providerError = params.get('error')
  const providerCode = params.get('error_code')
  const providerDescription = params.get('error_description')
  if (!providerError && !providerCode && !providerDescription) return null

  console.error('[auth/callback] provider returned auth error', {
    error: providerError,
    code: providerCode,
  })

  return failureTarget(origin, {
    code: providerCode ?? providerError ?? undefined,
    message: providerDescription ?? providerError ?? undefined,
  })
}

function pathRouting(): 'host' | 'path' {
  return process.env.NEXT_PUBLIC_TENANT_ROUTING === 'host' ? 'host' : 'path'
}

export async function handleAuthCallback(
  request: NextRequest,
  requestedTenant?: string,
  routing: 'host' | 'path' = pathRouting(),
) {
  const origin = originFrom(request)
  const providerFailure = providerFailureTarget(origin, request)
  if (providerFailure) return NextResponse.redirect(providerFailure)

  const params = request.nextUrl.searchParams
  const code = params.get('code')
  const tokenHash = params.get('token_hash')
  const token = params.get('token')
  const email = params.get('email')
  const otpType = params.get('type')
  const hintedTenant = requestedTenant ?? params.get('tenant') ?? undefined
  const next = params.get('next')

  const supabase = await createSupabaseServerClient()
  let session = (await supabase.auth.getSession()).data.session ?? null

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.session) return NextResponse.redirect(failureTarget(origin, error))
    session = data.session
  } else if (tokenHash) {
    const type = otpType === 'recovery' || otpType === 'email' || otpType === 'signup' ? otpType : 'email'
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (error || !data.session) return NextResponse.redirect(failureTarget(origin, error))
    session = data.session
  } else if (token && email) {
    const { data, error } = await supabase.auth.verifyOtp({ type: 'email', email, token })
    if (error || !data.session) return NextResponse.redirect(failureTarget(origin, error))
    session = data.session
  } else if (!session) {
    return NextResponse.redirect(`${origin}/login?error=missing-code`)
  }

  const { user, access_token: accessToken } = session
  if (!user.email) return NextResponse.redirect(`${origin}/login?error=no-email`)

  const db = createScopedClient(accessToken)
  await claimOperatorAccess(db)
  const { data: isOperator } = await db.rpc('is_operator')
  if (isOperator) return NextResponse.redirect(`${origin}/super`)

  try {
    const { tenant } = await requireTenant({ id: user.id, email: user.email, accessToken })
    if (hintedTenant && tenant.slug !== hintedTenant) {
      return NextResponse.redirect(`${origin}/login?error=wrong-tenant`)
    }

    const destination = next ? tenantAuthNextPath(next) : destinationForTenant(tenant)
    return NextResponse.redirect(tenantDestinationUrl(origin, tenant.slug, destination, routing))
  } catch (error) {
    if (!(error instanceof AuthError)) throw error
    if (error.code === 'no-tenant') return NextResponse.redirect(`${origin}/onboarding`)
    return NextResponse.redirect(`${origin}/login?error=${error.code}`)
  }
}
