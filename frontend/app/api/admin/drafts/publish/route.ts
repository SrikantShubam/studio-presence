import { NextResponse } from 'next/server'
import { createScopedClient, demoDrafts } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = createScopedClient(session.access_token)
  const { data: allowed } = await db.rpc('is_operator')
  if (!allowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await request.json() as { draftId?: string }
  if (!body.draftId) return NextResponse.json({ error: 'draftId is required' }, { status: 400 })
  await demoDrafts.publishPaidDraft(db, body.draftId)
  return NextResponse.json({ ok: true })
}
