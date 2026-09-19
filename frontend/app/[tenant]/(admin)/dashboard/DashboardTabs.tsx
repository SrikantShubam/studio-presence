'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardTabs({ orientation = 'top' }: { orientation?: 'top' | 'side' }) {
  const pathname = usePathname()
  const current = pathname ?? ''
  const segments = current.split('/').filter(Boolean)
  const tenantPrefix = segments[0] && segments[0] !== 'dashboard' ? `/${segments[0]}` : ''

  const onEnquiries = current.includes('/dashboard/enquiries') || /\/dashboard\/[0-9a-f-]+/.test(current)
  const onContent = current.includes('/dashboard/content')
  const onAnalytics = current.includes('/dashboard/analytics')
  const onSettings = current.includes('/dashboard/settings')
  const onOverview = !onEnquiries && !onContent && !onAnalytics && !onSettings && current.includes('/dashboard')

  const items = [
    { href: '/dashboard', label: 'Overview', active: onOverview },
    { href: '/dashboard/enquiries', label: 'Enquiries', active: onEnquiries },
    { href: '/dashboard/content', label: 'Website Content', active: onContent },
    { href: '/dashboard/analytics', label: 'Analytics', active: onAnalytics },
    { href: '/dashboard/settings', label: 'Settings', active: onSettings },
  ]

  if (orientation === 'side') {
    return (
      <nav className="grid gap-1 text-sm font-medium">
        {items.map((item) => (
          <Link
            key={item.label}
            href={`${tenantPrefix}${item.href}`}
            className={`flex min-h-11 items-center rounded px-3 transition-colors ${
              item.active
                ? 'bg-admin-primary-soft text-admin-primary'
                : 'text-admin-muted hover:bg-admin-raised hover:text-admin-ink'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav className="flex min-h-12 max-w-full gap-1 overflow-x-auto rounded-lg border border-admin-border bg-admin-raised p-1 text-sm font-medium">
      {items.map((item) => (
        <Link
          key={item.label}
          href={`${tenantPrefix}${item.href}`}
          className={`flex min-w-20 shrink-0 items-center justify-center rounded px-3 transition-colors ${
            item.active
              ? 'bg-admin-primary text-admin-on-primary'
              : 'text-admin-muted hover:text-admin-ink'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
