import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { EstimatePage } from '../../estimate/EstimatePage'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    const meta = pageMeta(site, 'अनुमान निकालें', 'कार्पेट एरिया, घर के प्रकार और फिनिश लेवल से शुरुआती बजट रेंज।', {
      image: '/estimate/opengraph-image',
    })
    return {
      ...meta,
      alternates: {
        canonical: '/hi/estimate',
        languages: {
          en: '/estimate',
          hi: '/hi/estimate',
        },
      },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiEstimateRoute({ params }: Props) {
  const { tenant } = await params
  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant, 'hi')
  } catch {
    notFound()
  }
  if (!site) notFound()

  if (!site.sections.estimate?.enabled) notFound()

  return <EstimatePage site={site} />
}
