import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { loadPublicTenantConfigWithOverrides } from '@/lib/tenant-config'
import { faviconVariantPath } from '@/lib/favicon-path'
import { NO_FLASH_SCRIPT } from './ThemeToggle'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>
}): Promise<Metadata> {
  const { tenant } = await params
  try {
    const config = await loadPublicTenantConfigWithOverrides(tenant)
    return {
      title: config.seo.title,
      description: config.seo.description,
      icons: config.brand.favicon
        ? { icon: config.brand.favicon, apple: faviconVariantPath(config.brand.favicon, 180) }
        : undefined,
      robots: { index: false, follow: false },
    }
  } catch {
    return {
      title: 'Studio Presence',
      robots: { index: false, follow: false },
    }
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
