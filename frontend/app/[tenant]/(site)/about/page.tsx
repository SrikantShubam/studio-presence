import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { AboutPage } from './AboutPage'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params

  try {
    const site = await loadPublicClientConfigForLocale(tenant)
    if (!site?.sections.about?.enabled || !site.sections.about.body?.trim()) return notFoundMeta()
    const meta = pageMeta(site, `About ${site.business.name}`, site.sections.about.body)
    return {
      ...meta,
      alternates: site.i18n.locales.includes('hi')
        ? {
            canonical: '/about',
            languages: {
              en: '/about',
              hi: '/hi/about',
            },
          }
        : { canonical: '/about' },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function AboutRoute({ params }: Props) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant)
  } catch {
    notFound()
  }
  if (!site?.sections.about?.enabled || !site.sections.about.body?.trim()) notFound()

  return <AboutPage site={site} />
}
