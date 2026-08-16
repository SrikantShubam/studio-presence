import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ServiceDetail } from './ServiceDetail'

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params

  try {
    const site = await loadPublicClientConfig(tenant)
    const service = site.sections.services?.items.find((item) => item.slug === slug)
    if (!service) return notFoundMeta()
    return pageMeta(site, service.title, service.blurb)
  } catch {
    return notFoundMeta()
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { tenant, slug } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const services = site.sections.services
  if (!services?.enabled || !services.items.length) notFound()

  const service = services.items.find((item) => item.slug === slug)
  if (!service) notFound()

  return <ServiceDetail site={site} service={service} />
}
