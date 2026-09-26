import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  AuthError,
  ConfigError,
  canAccessDashboard,
  createUmamiClient,
  enquiryStats,
  getWorkspacePreferences,
  monthlyTrend,
  requireTenant,
  sourceBreakdown,
  topProjects,
  visitStats,
} from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { loadTenantWorkspaceConfig } from '@/lib/tenant-config'

const paramsSchema = z.object({
  tenant: z.string().regex(/^[a-z0-9-]+$/),
})

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ tenant: string }> },
) {
  const parsed = paramsSchema.safeParse(await context.params)
  if (!parsed.success) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 })
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const tenantContext = await requireTenant({
      id: user.id,
      email: user.email,
      accessToken: session.access_token,
    })

    if (tenantContext.tenant.slug !== parsed.data.tenant) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    if (!canAccessDashboard(tenantContext.tenant)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const config = await loadTenantWorkspaceConfig(
      tenantContext.tenant.slug,
      tenantContext.tenant.id,
      session.access_token,
    )
    const projects = config.sections.portfolio.projects.map((project) => ({
      slug: project.slug,
      title: project.title,
    }))

    const preferences = await getWorkspacePreferences(tenantContext.db, tenantContext.tenant.id)
    const umami =
      config.integrations.umami.enabled && config.integrations.umami.siteId
        ? safeUmamiClient(config.integrations.umami.siteId, preferences.timezone)
        : null

    const [enquiries, trend, sources, visits, topProjectList] = await Promise.all([
      enquiryStats(tenantContext.db, tenantContext.tenant.id),
      monthlyTrend(tenantContext.db, tenantContext.tenant.id),
      sourceBreakdown(tenantContext.db, tenantContext.tenant.id),
      visitStats(umami),
      topProjects(tenantContext.db, tenantContext.tenant.id, umami, projects),
    ])

    if (visits) {
      const periodKey = completedMonthKey(preferences.timezone)
      const { error: summaryError } = await tenantContext.db.rpc('record_workspace_activity', {
        p_tenant_id: tenantContext.tenant.id,
        p_event_type: 'analytics_monthly_summary',
        p_entity_type: 'analytics',
        p_payload: { visitors: visits.lastMonth },
        p_period_key: periodKey,
      })
      if (summaryError) console.error('Could not record monthly analytics summary.', summaryError)
    }

    return NextResponse.json({
      enquiryStats: enquiries,
      monthlyTrend: trend,
      sourceBreakdown: sources,
      visitStats: visits,
      topProjects: topProjectList,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: 403 })
    }

    if (e instanceof ConfigError) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 })
    }

    throw e
  }
}

function completedMonthKey(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric' }).formatToParts(now)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const previous = new Date(Date.UTC(year, month - 2, 1))
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`
}

function safeUmamiClient(siteId: string, timeZone: string) {
  try {
    return createUmamiClient(siteId, new Date(), timeZone)
  } catch {
    return null
  }
}
