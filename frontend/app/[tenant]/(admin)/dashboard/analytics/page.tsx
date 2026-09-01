import { AuthError, canAccessDashboard, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DEMO_ANALYTICS } from '../../demo-data'
import { AnalyticsDashboard } from './AnalyticsDashboard'

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams?: Promise<{ demo?: string }>
}) {
  const { tenant } = await params
  const query = await searchParams
  const mode = query?.demo === '1' ? 'demo' : await analyticsMode(tenant)
  return (
    <AnalyticsDashboard
      tenant={tenant}
      mode={mode}
      initialData={mode === 'demo' ? DEMO_ANALYTICS : null}
    />
  )
}

async function analyticsMode(tenantSlug: string): Promise<'paid' | 'unavailable'> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user?.email || !session) return 'unavailable'

  try {
    const tenantContext = await requireTenant({
      id: user.id,
      email: user.email,
      accessToken: session.access_token,
    })

    if (tenantContext.tenant.slug !== tenantSlug || !canAccessDashboard(tenantContext.tenant)) return 'unavailable'
    return 'paid'
  } catch (e) {
    if (e instanceof AuthError && (e.code === 'no-tenant' || e.code === 'wrong-tenant')) return 'unavailable'
    throw e
  }
}
