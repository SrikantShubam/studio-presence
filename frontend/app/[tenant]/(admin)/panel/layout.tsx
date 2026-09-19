import type { ReactNode } from 'react'
import DashboardLayout from '../dashboard/layout'

/**
 * Panel layout reuses the shared DashboardLayout for full multi-page dashboard compatibility.
 */
export default async function PanelLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenant: string }>
}) {
  return <DashboardLayout params={params}>{children}</DashboardLayout>
}
