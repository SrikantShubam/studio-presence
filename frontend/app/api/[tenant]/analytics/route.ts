import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  AuthError,
  ConfigError,
  canAccessDashboard,
  createUmamiClient,
  enquiryStats,
  loadClientConfig,
  monthlyTrend,
  requireTenant,
  sourceBreakdown,
  topProjects,
  visitStats,
} from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

    const config = loadClientConfig(tenantContext.tenant.slug)
    const projects = config.sections.portfolio.projects.map((project) => ({
      slug: project.slug,
      title: project.title,
    }))

    const umami =
      config.integrations.umami.enabled && config.integrations.umami.siteId
        ? safeUmamiClient(config.integrations.umami.siteId)
        : null

    const [enquiries, trend, sources, visits, topProjectList] = await Promise.all([
      enquiryStats(tenantContext.db, tenantContext.tenant.id),
      monthlyTrend(tenantContext.db, tenantContext.tenant.id),
      sourceBreakdown(tenantContext.db, tenantContext.tenant.id),
      visitStats(umami),
      topProjects(tenantContext.db, tenantContext.tenant.id, umami, projects),
    ])

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

function safeUmamiClient(siteId: string) {
  try {
    return createUmamiClient(siteId)
  } catch {
    return null
  }
}
