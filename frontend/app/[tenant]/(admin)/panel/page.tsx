import { PanelEditor } from './PanelEditor'

export default async function PanelPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  return <PanelEditor tenant={tenant} />
}
