import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  AuthError,
  canWorkspaceRole,
  listWorkspaceMembers,
  requireTenant,
  WorkspacePreferencesError,
  workspacePreferences,
} from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const paramsSchema = z.object({ tenant: z.string().regex(/^[a-z0-9-]+$/) })
const valuesSchema = z.object({
  new_lead_alerts: z.boolean(),
  weekly_digest: z.boolean(),
}).strict()

type RouteContext = { params: Promise<{ tenant: string }> }

async function authenticate(tenantSlug: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user?.email || !session) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }
  }

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

async function ownerContext(tenantSlug: string) {
  const auth = await authenticate(tenantSlug)
  if (auth.error) return auth

  const members = await listWorkspaceMembers(auth.tenantContext.db, auth.tenantContext.tenant.id)
  const role = members.find((member) => member.user_id === auth.tenantContext.user.id)?.role
  if (!role || !canWorkspaceRole(role, 'membersManage')) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) }
  }

  return auth
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const parsed = paramsSchema.safeParse(await context.params)
  if (!parsed.success) return NextResponse.json({ error: 'not-found' }, { status: 404 })

  try {
    const auth = await authenticate(parsed.data.tenant)
    if (auth.error) return auth.error
    const preferences = await workspacePreferences.get(
      auth.tenantContext.db,
      auth.tenantContext.tenant.id,
    )
    return NextResponse.json({ preferences })
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.code }, { status: 403 })
    if (error instanceof WorkspacePreferencesError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    throw error
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const parsed = paramsSchema.safeParse(await context.params)
  if (!parsed.success) return NextResponse.json({ error: 'not-found' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Please send valid notification preferences.' }, { status: 400 })
  }

  const values = valuesSchema.safeParse(body)
  if (!values.success) {
    return NextResponse.json({ error: 'Notification preferences must be boolean values.' }, { status: 400 })
  }

  try {
    const auth = await ownerContext(parsed.data.tenant)
    if (auth.error) return auth.error
    const preferences = await workspacePreferences.save(
      auth.tenantContext.db,
      auth.tenantContext.tenant.id,
      auth.tenantContext.user.id,
      values.data,
    )
    return NextResponse.json({ preferences })
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.code }, { status: 403 })
    if (error instanceof WorkspacePreferencesError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    throw error
  }
}
