import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { ServiceDetail } from './ServiceDetail'

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params

  try {
    const site = await loadPublicClientConfigForLocale(tenant)
    if (!site) return notFoundMeta()
    const service = site.sections.services?.items.find((item) => item.slug === slug)
    if (!service) return notFoundMeta()
    const meta = pageMeta(site, service.title, service.blurb)
    return {
      ...meta,
      alternates: site.i18n.locales.includes('hi')
        ? {
            canonical: `/services/${slug}`,
            languages: {
              en: `/services/${slug}`,
              hi: `/hi/services/${slug}`,
            },
          }
        : { canonical: `/services/${slug}` },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { tenant, slug } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant)
  } catch {
    notFound()
  }
  if (!site) notFound()

  const services = site.sections.services
  if (!services?.enabled || !services.items.length) notFound()

  const service = services.items.find((item) => item.slug === slug)
  if (!service) notFound()

  return <ServiceDetail site={site} service={service} />
}
