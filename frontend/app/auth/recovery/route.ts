import type { EmailOtpType } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { authOriginFromRequest } from '@/lib/auth-callback'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const origin = authOriginFromRequest(request)
  if (!origin) return NextResponse.json({ error: 'invalid-origin' }, { status: 400 })

  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null
  if (!tokenHash || type !== 'recovery') {
    return NextResponse.redirect(`${origin}/login?error=auth-invalid`)
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash })
  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=link-expired`)
  }

  return NextResponse.redirect(`${origin}/reset-password`)
}
