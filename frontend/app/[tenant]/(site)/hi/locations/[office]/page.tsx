import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LocationOffice } from '../../../locations/LocationOffice'
import { resolveOffice, SEO_DATA } from '@/lib/locations-data'

type Props = { params: Promise<{ tenant: string; office: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, office: officeSlug } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    const office = resolveOffice(site, officeSlug, 'hi')
    if (!office) return notFoundMeta()

    const seo = SEO_DATA[office.slug]
    const title = `${office.name} | ${site.business.name}`
    const description = seo?.metaDescription || `स्टूडियो देखें — समय, पता और टीम।`

    return pageMeta(site, title, description)
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiLocationOfficePage({ params }: Props) {
  const { tenant, office: officeSlug } = await params
  const site = await loadPublicClientConfigForLocale(tenant, 'hi')
  if (!site) notFound()

  const office = resolveOffice(site, officeSlug, 'hi')
  if (!office) notFound()

  return <LocationOffice site={site} office={office} />
}
