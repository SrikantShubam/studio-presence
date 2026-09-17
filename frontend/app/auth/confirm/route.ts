import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { authOriginFromRequest, routeAuthenticatedSession } from '@/lib/auth-callback'
import { confirmationRequest } from '@/lib/auth-confirmation'
import { safeAuthNextPath } from '@/lib/auth-policy'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function routingFromEnv(): 'host' | 'path' {
  return process.env.NEXT_PUBLIC_TENANT_ROUTING === 'host' ? 'host' : 'path'
}

export async function GET(request: NextRequest) {
  const origin = authOriginFromRequest(request)
  if (!origin) return NextResponse.json({ error: 'invalid-origin' }, { status: 400 })

  const params = request.nextUrl.searchParams
  const supabase = await createSupabaseServerClient()
  const confirmation = confirmationRequest(params)
  let session = (await supabase.auth.getSession()).data.session ?? null

  if (confirmation.kind === 'code') {
    const { data, error } = await supabase.auth.exchangeCodeForSession(confirmation.code)
    if (error || !data.session) {
      return NextResponse.redirect(`${origin}/login?error=${error ? 'link-expired' : 'auth-invalid'}`)
    }
    session = data.session
  } else if (confirmation.kind === 'token_hash') {
    const { data, error } = await supabase.auth.verifyOtp({
      type: confirmation.type,
      token_hash: confirmation.tokenHash,
    })
    if (error || !data.session) {
      return NextResponse.redirect(`${origin}/login?error=${error ? 'link-expired' : 'auth-invalid'}`)
    }
    session = data.session
  }

  if (!session) {
    return NextResponse.redirect(`${origin}/login?error=auth-invalid`)
  }

  return routeAuthenticatedSession(
    origin,
    session,
    params.get('tenant') ?? undefined,
    safeAuthNextPath(params.get('next') ?? undefined),
    routingFromEnv(),
  )
}
