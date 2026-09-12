import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LocationIndex } from '../../locations/LocationIndex'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    return pageMeta(site, 'स्टूडियो लोकेशन', 'हमारे स्टूडियो और वर्कशॉप लोकेशन — पता, समय और संपर्क।')
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiLocationsPage({ params }: Props) {
  const { tenant } = await params
  const site = await loadPublicClientConfigForLocale(tenant, 'hi')
  if (!site) notFound()

  return <LocationIndex site={site} />
}
