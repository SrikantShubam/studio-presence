import { AnalyticsDashboard } from './AnalyticsDashboard'

export default async function AnalyticsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  return <AnalyticsDashboard tenant={tenant} />
}
