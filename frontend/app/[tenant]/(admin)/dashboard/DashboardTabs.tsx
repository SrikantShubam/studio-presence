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
      <nav aria-label="Primary navigation" className="grid gap-1 text-sm font-medium">
        {items.map((item) => (
          <Link
            key={item.label}
            href={`${tenantPrefix}${item.href}`}
            aria-current={item.active ? 'page' : undefined}
            className={`flex min-h-11 items-center rounded-lg px-3 transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary ${
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
    <nav aria-label="Primary navigation" className="grid grid-cols-2 gap-1 rounded-lg border border-admin-border bg-admin-raised p-1 text-sm font-medium sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={`${tenantPrefix}${item.href}`}
          aria-current={item.active ? 'page' : undefined}
          className={`flex min-h-11 items-center justify-center rounded-lg px-3 text-center transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary ${
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
