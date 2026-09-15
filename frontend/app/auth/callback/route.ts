import { NextResponse, type NextRequest } from 'next/server'
import { AuthError, destinationForTenant, requireTenant } from '@studio/backend'
import { tenantOriginFor } from '@/lib/platform-domain'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function originFrom(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')
  return `${proto}://${host}`
}

export async function GET(request: NextRequest) {
  const origin = originFrom(request)
  const code = request.nextUrl.searchParams.get('code')

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
    return NextResponse.redirect(`${origin}/login?error=no-email`)
  }

  try {
    const { tenant } = await requireTenant({
      id: user.id,
      email: user.email,
      accessToken: access_token,
    })
    return NextResponse.redirect(`${tenantOriginFor(tenant)}${destinationForTenant(tenant)}`)
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.redirect(`${origin}/login?error=${e.code}`)
    }
    throw e
  }
}
