import { NextResponse, type NextRequest } from 'next/server'
import {
  AuthError,
  canWorkspaceRole,
  ConfigError,
  I18nError,
  I18nScopeError,
  i18nContent,
  listWorkspaceMembers,
  requireTenant,
} from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type RouteContext = { params: Promise<{ tenant: string; locale: string }> }

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
  const { tenant, locale: rawLocale } = await context.params
  const locale = i18nContent.parseI18nLocale(rawLocale)
  if (!locale) return NextResponse.json({ error: 'unsupported-locale' }, { status: 404 })

  try {
    const auth = await authenticate(tenant)
    if (auth.error) return auth.error
    const { tenantContext } = auth

    const result = await i18nContent.getEditableI18n(
      tenantContext.db,
      { id: tenantContext.tenant.id, slug: tenantContext.tenant.slug },
      locale,
    )

    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.code }, { status: 403 })
    if (e instanceof ConfigError) return NextResponse.json({ error: 'not-found' }, { status: 404 })
    if (e instanceof I18nError) return NextResponse.json({ error: 'Could not load Hindi content.' }, { status: 502 })
    throw e
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { tenant, locale: rawLocale } = await context.params
  const locale = i18nContent.parseI18nLocale(rawLocale)
  if (!locale) return NextResponse.json({ error: 'unsupported-locale' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Please send valid Hindi content.' }, { status: 400 })
  }

  try {
    const auth = await authenticate(tenant)
    if (auth.error) return auth.error
    const { tenantContext } = auth
    const members = await listWorkspaceMembers(tenantContext.db, tenantContext.tenant.id)
    const role = members.find((member) => member.user_id === tenantContext.user.id)?.role
    if (!role || !canWorkspaceRole(role, 'contentEdit')) {
      return NextResponse.json({ error: 'Only the studio owner or content manager can save website content.' }, { status: 403 })
    }

    const result = await i18nContent.saveEditableI18n(
      tenantContext.db,
      { id: tenantContext.tenant.id, slug: tenantContext.tenant.slug },
      tenantContext.user.id,
      locale,
      body,
    )

    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.code }, { status: 403 })
    if (e instanceof ConfigError) return NextResponse.json({ error: 'not-found' }, { status: 404 })
    if (e instanceof I18nScopeError) return NextResponse.json({ error: e.message }, { status: 400 })
    if (e instanceof I18nError) return NextResponse.json({ error: 'Could not save Hindi content.' }, { status: 502 })
    throw e
  }
}
