import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { AuthError, canWorkspaceRole, ConfigError, PanelError, PanelScopeError, listWorkspaceMembers, panel, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * The panel's write channel — available at every tier, no `canAccessDashboard()`
 * gate here (compare `../analytics/route.ts`, which is t3-only).
 */

const paramsSchema = z.object({
  tenant: z.string().regex(/^[a-z0-9-]+$/),
})

type RouteContext = { params: Promise<{ tenant: string }> }

async function authenticate(tenantSlug: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }

  const tenantContext = await requireTenant({
    id: user.id,
    email: user.email,
    accessToken: session.access_token,
  })

  if (tenantContext.tenant.slug !== tenantSlug) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) }
  }

  return { tenantContext }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const parsed = paramsSchema.safeParse(await context.params)
  if (!parsed.success) return NextResponse.json({ error: 'not-found' }, { status: 404 })

  try {
    const auth = await authenticate(parsed.data.tenant)
    if (auth.error) return auth.error
    const { tenantContext } = auth

    const result = await panel.getEditableConfig(tenantContext.db, {
      id: tenantContext.tenant.id,
      slug: tenantContext.tenant.slug,
    })

    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.code }, { status: 403 })
    if (e instanceof ConfigError) return NextResponse.json({ error: 'not-found' }, { status: 404 })
    throw e
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const parsed = paramsSchema.safeParse(await context.params)
  if (!parsed.success) return NextResponse.json({ error: 'not-found' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Please send a valid patch.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected a flat object of field -> value.' }, { status: 400 })
  }

  try {
    const auth = await authenticate(parsed.data.tenant)
    if (auth.error) return auth.error
    const { tenantContext } = auth
    const members = await listWorkspaceMembers(tenantContext.db, tenantContext.tenant.id)
    const role = members.find((member) => member.user_id === tenantContext.user.id)?.role
    if (!role || !canWorkspaceRole(role, 'contentEdit')) {
      return NextResponse.json({ error: 'Only the studio owner or content manager can save website content.' }, { status: 403 })
    }

    const result = await panel.saveEditableConfig(
      tenantContext.db,
      { id: tenantContext.tenant.id, slug: tenantContext.tenant.slug },
      tenantContext.user.id,
      body as Record<string, unknown>,
    )

    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.code }, { status: 403 })
    if (e instanceof ConfigError) return NextResponse.json({ error: 'not-found' }, { status: 404 })
    if (e instanceof PanelScopeError) return NextResponse.json({ error: e.message }, { status: 400 })
    if (e instanceof PanelError) {
      console.error('Panel save failed', {
        tenant: parsed.data.tenant,
        error: e.message,
        cause: e.cause,
      })
      const detail =
        e.cause && typeof e.cause === 'object' && 'message' in e.cause
          ? String((e.cause as { message: unknown }).message)
          : ''
      return NextResponse.json(
        { error: detail ? `Could not save changes: ${detail}` : 'Could not save changes, please try again.' },
        { status: 502 },
      )
    }
    throw e
  }
}
