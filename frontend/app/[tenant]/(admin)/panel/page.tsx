import { ContentManagerPage } from '../dashboard/content/ContentManagerPage'

export default async function PanelPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params
  return <ContentManagerPage tenant={tenant} />
}
