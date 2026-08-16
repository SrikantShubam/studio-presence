import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { AreaDetail } from './AreaDetail'

type Props = { params: Promise<{ tenant: string; locality: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, locality } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    const area = site.sections.areas?.items.find((item) => item.slug === locality)
    if (!area) return notFoundMeta()
    return pageMeta(site, area.name, `Projects and notes from work in ${area.name}.`)
  } catch {
    return notFoundMeta()
  }
}

export default async function AreaDetailPage({ params }: Props) {
  const { tenant, locality } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const area = site.sections.areas?.items.find((item) => item.slug === locality)
  if (!area) notFound()

  return <AreaDetail site={site} area={area} />
}
