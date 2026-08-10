import Link from 'next/link'
import type { ReactNode } from 'react'
import type { SectionConfig } from '@studio/backend'

export type ServiceItem = SectionConfig<'services'>['items'][number]

export function serviceNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}

export function serviceHref(item: ServiceItem): string | null {
  return item.slug ? `/services/${item.slug}` : null
}

export function ServiceLink({
  item,
  className,
  children,
}: {
  item: ServiceItem
  className: string
  children: ReactNode
}) {
  const href = serviceHref(item)

  if (!href) {
    return <div className={className}>{children}</div>
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
