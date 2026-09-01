import type { ReactNode } from 'react'
import { AdminChrome } from '../AdminChrome'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenant: string }>
}) {
  return <AdminChrome params={params}>{children}</AdminChrome>
}
