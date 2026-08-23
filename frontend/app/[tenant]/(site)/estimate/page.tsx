import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { EstimatePage } from './EstimatePage'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant)
    if (!site) return notFoundMeta()
    const meta = pageMeta(
      site,
      'Calculate the estimate',
      'An indicative range from carpet area, home type and finish level.',
      { image: '/estimate/opengraph-image' },
    )
    return {
      ...meta,
      alternates: site.i18n.locales.includes('hi')
        ? {
            canonical: '/estimate',
            languages: {
              en: '/estimate',
              hi: '/hi/estimate',
            },
          }
        : { canonical: '/estimate' },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function EstimateRoute({ params }: Props) {
  const { tenant } = await params
  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant)
  } catch {
    notFound()
  }
  if (!site) notFound()

  if (!site.sections.estimate?.enabled) notFound()

  return <EstimatePage site={site} />
}
