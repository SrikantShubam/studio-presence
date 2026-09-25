import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { loadPublicTenantConfigWithOverrides } from '@/lib/tenant-config'
import { NO_FLASH_SCRIPT } from './ThemeToggle'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>
}): Promise<Metadata> {
  const { tenant } = await params
  let title = 'Studio Presence'
  try {
    const config = await loadPublicTenantConfigWithOverrides(tenant)
    title = config.business.name
  } catch {
    title = 'Studio Presence'
  }
  return {
    title,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      {children}
    </>
  )
}
