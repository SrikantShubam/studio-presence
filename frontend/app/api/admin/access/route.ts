import { NextResponse } from 'next/server'
import { accessControl, createScopedClient } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = createScopedClient(session.access_token)
  const { data: allowed } = await db.rpc('is_operator')
  if (!allowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await request.json() as { tenantSlug?: string; email?: string; action?: 'grant' | 'revoke' }
  if (!body.tenantSlug || !body.email || !body.action) return NextResponse.json({ error: 'tenantSlug, email and action are required' }, { status: 400 })
  if (body.action === 'grant') await accessControl.grantEmailBySlug(db, body.tenantSlug, body.email)
  else await accessControl.revokeEmailBySlug(db, body.tenantSlug, body.email)
  return NextResponse.json({ ok: true })
}
