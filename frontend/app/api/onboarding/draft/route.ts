import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createScopedClient } from '@studio/backend'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const [{ data: userData }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  if (!userData.user || !sessionData.session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const db = createScopedClient(sessionData.session.access_token)
  const { data, error } = await db
    .from('onboarding_drafts')
    .select('payload, completed_at')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    draft: data?.payload ?? null,
    completedAt: data?.completed_at ?? null,
  })
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient()
  const [{ data: userData }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  if (!userData.user || !sessionData.session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid draft payload.' }, { status: 400 })
  }

  const db = createScopedClient(sessionData.session.access_token)
  const { error } = await db.from('onboarding_drafts').upsert(
    {
      user_id: userData.user.id,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
