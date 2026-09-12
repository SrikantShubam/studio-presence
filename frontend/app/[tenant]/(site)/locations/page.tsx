import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LocationIndex } from './LocationIndex'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    return pageMeta(site, 'Locations', 'Our studio and workshop locations — hours, addresses and visiting details.')
  } catch {
    return notFoundMeta()
  }
}

export default async function LocationsIndexPage({ params }: Props) {
  const { tenant } = await params
  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  return <LocationIndex site={site} />
}
