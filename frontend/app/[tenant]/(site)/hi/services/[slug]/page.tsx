import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ServiceDetail } from '../../../services/[slug]/ServiceDetail'

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params

  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    const service = site?.sections.services?.items.find((item) => item.slug === slug)
    if (!site || !service) return notFoundMeta()
    const meta = pageMeta(site, service.title, service.blurb)
    return {
      ...meta,
      alternates: {
        canonical: `/hi/services/${slug}`,
        languages: {
          en: `/services/${slug}`,
          hi: `/hi/services/${slug}`,
        },
      },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiServiceDetailPage({ params }: Props) {
  const { tenant, slug } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant, 'hi')
  } catch {
    notFound()
  }
  if (!site) notFound()

  const services = site.sections.services
  if (!services?.enabled || !services.items.length) notFound()

  const service = services.items.find((item) => item.slug === slug)
  if (!service) notFound()

  return <ServiceDetail site={site} service={service} locale="hi" />
}
