import { NextResponse } from 'next/server'
import { createScopedClient, demoLifecycle, type DemoWorkflowState } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function getOperatorDb() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  if (!user || !session) return null
  const db = createScopedClient(session.access_token)
  const { data: allowed, error } = await db.rpc('is_operator')
  return error || !allowed ? null : db
}

export async function GET(request: Request) {
  const db = await getOperatorDb()
  if (!db) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const state = new URL(request.url).searchParams.get('state') as DemoWorkflowState | null
  return NextResponse.json({ demos: await demoLifecycle.listDemos(db, state) })
}

export async function PATCH(request: Request) {
  const db = await getOperatorDb()
  if (!db) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await request.json() as { id?: string; state?: DemoWorkflowState; notes?: string }
  if (!body.id || !body.state) return NextResponse.json({ error: 'id and state are required' }, { status: 400 })
  return NextResponse.json({ demo: await demoLifecycle.updateDemoState(db, body.id, body.state, body.notes) })
}
