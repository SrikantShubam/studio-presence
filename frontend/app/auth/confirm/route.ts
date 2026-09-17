import type { EmailOtpType } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { authOriginFromRequest, routeAuthenticatedSession } from '@/lib/auth-callback'
import { safeAuthNextPath } from '@/lib/auth-policy'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const CONFIRMATION_TYPES = new Set<EmailOtpType>(['signup', 'email', 'email_change'])

function routingFromEnv(): 'host' | 'path' {
  return process.env.NEXT_PUBLIC_TENANT_ROUTING === 'host' ? 'host' : 'path'
}

export async function GET(request: NextRequest) {
  const origin = authOriginFromRequest(request)
  if (!origin) return NextResponse.json({ error: 'invalid-origin' }, { status: 400 })

  const params = request.nextUrl.searchParams
  const tokenHash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null
  if (!tokenHash || !type || !CONFIRMATION_TYPES.has(type)) {
    return NextResponse.redirect(`${origin}/login?error=auth-invalid`)
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=${error ? 'link-expired' : 'auth-invalid'}`)
  }

  return routeAuthenticatedSession(
    origin,
    data.session,
    params.get('tenant') ?? undefined,
    safeAuthNextPath(params.get('next') ?? undefined),
    routingFromEnv(),
  )
}
