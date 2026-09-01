import type { ReactNode } from 'react'
import { AdminChrome as DashboardLayout } from '../AdminChrome'

/**
 * The panel's session gate.
 *
 * Product authorization is resolved by the page below this layout. A signed-in
 * visitor without tenant membership still gets the same editor UI in local-only
 * mode, while a granted customer gets Supabase-backed persistence.
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
