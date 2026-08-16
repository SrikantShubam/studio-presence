import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { EstimatePage } from './EstimatePage'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    return pageMeta(
      site,
      'Calculate the estimate',
      'An indicative range from carpet area, home type and finish level.',
      { image: '/estimate/opengraph-image' },
    )
  } catch {
    return notFoundMeta()
  }
}

export default async function EstimateRoute({ params }: Props) {
  const { tenant } = await params
  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  if (!site.sections.estimate?.enabled) notFound()

  return <EstimatePage site={site} />
}
