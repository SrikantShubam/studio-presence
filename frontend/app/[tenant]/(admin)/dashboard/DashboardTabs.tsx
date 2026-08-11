'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * The Leads/Analytics tabs, highlighted by the actual current route rather
 * than a hardcoded "Leads is always active" — the layout that used to inline
 * this got that wrong once there were two real destinations to distinguish.
 */
export function DashboardTabs() {
  const pathname = usePathname()
  const onAnalytics = pathname?.endsWith('/dashboard/analytics') ?? false

  return (
    <nav className="grid min-h-12 grid-cols-2 rounded-lg border border-admin-border bg-admin-bg p-1 text-sm font-medium sm:w-64">
      <Link
        href="/dashboard"
        className={`flex items-center justify-center rounded-lg px-3 ${
          onAnalytics ? 'text-admin-muted' : 'bg-admin-primary text-admin-surface'
        }`}
      >
        Leads
      </Link>
      <Link
        href="/dashboard/analytics"
        className={`flex items-center justify-center rounded-lg px-3 ${
          onAnalytics ? 'bg-admin-primary text-admin-surface' : 'text-admin-muted'
        }`}
      >
        Analytics
      </Link>
    </nav>
  )
}
