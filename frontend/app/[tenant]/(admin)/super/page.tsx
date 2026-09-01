import { SuperAdminConsole } from './SuperAdminConsole'

export default async function SuperPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  return <SuperAdminConsole tenant={tenant} />
}
