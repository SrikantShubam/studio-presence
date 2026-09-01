import { ContentManagerPage } from './ContentManagerPage'

export default async function DashboardContentPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  return <ContentManagerPage tenant={tenant} />
}
