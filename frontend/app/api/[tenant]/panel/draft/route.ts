import { NextResponse, type NextRequest } from 'next/server'
import { canWorkspaceRole, createScopedClient, demoDrafts, listWorkspaceMembers, PanelScopeError, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, context: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await context.params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  if (!user?.email || !session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const tenantContext = await requireTenant({ id: user.id, email: user.email, accessToken: session.access_token })
    const { tenant } = tenantContext
    if (tenant.slug !== tenantSlug) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    const members = await listWorkspaceMembers(tenantContext.db, tenant.id)
    const role = members.find((member) => member.user_id === user.id)?.role
    if (!role || !canWorkspaceRole(role, 'contentEdit')) return NextResponse.json({ error: 'Only the studio owner or content manager can submit content.' }, { status: 403 })
    const body = await request.json() as { baseRevision?: string; patch?: unknown }
    if (!body.baseRevision || !body.patch || typeof body.patch !== 'object' || Array.isArray(body.patch)) {
      return NextResponse.json({ error: 'baseRevision and patch are required' }, { status: 400 })
    }
    const draftId = await demoDrafts.submitPaidDraft(createScopedClient(session.access_token), {
      tenantSlug,
      baseRevision: body.baseRevision,
      patch: body.patch,
    })
    return NextResponse.json({ draftId }, { status: 201 })
  } catch (error) {
    if (error instanceof PanelScopeError) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ error: 'Could not submit the local demo draft.' }, { status: 403 })
  }
}
