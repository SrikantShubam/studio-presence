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
  const body = await request.json() as { tenantId?: string; demoId?: string; baseRevision?: string; patch?: unknown }
  if (!body.tenantId || !body.baseRevision) return NextResponse.json({ error: 'tenantId and baseRevision are required' }, { status: 400 })
  const draftId = await demoDrafts.importPaidDraft(db, { tenantId: body.tenantId, demoId: body.demoId, baseRevision: body.baseRevision, patch: body.patch })
  return NextResponse.json({ draftId }, { status: 201 })
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = createScopedClient(session.access_token)
  const { data: allowed } = await db.rpc('is_operator')
  if (!allowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { data, error } = await db.from('paid_content_drafts').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Could not load paid drafts.' }, { status: 502 })
  return NextResponse.json({ drafts: data ?? [] })
}
