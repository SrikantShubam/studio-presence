import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LocationOffice } from '../LocationOffice'
import { resolveOffice, SEO_DATA } from '@/lib/locations-data'

type Props = { params: Promise<{ tenant: string; office: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, office: officeSlug } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    const office = resolveOffice(site, officeSlug, 'en')
    if (!office) return notFoundMeta()

    const seo = SEO_DATA[office.slug]
    const title = seo?.metaTitle || `${office.name} | ${site.business.name}`
    const description = seo?.metaDescription || `Visit ${office.name} in ${office.address.locality || office.address.city}. Address, hours, and consultation appointments.`

    return pageMeta(site, title, description)
  } catch {
    return notFoundMeta()
  }
}

export default async function LocationOfficePage({ params }: Props) {
  const { tenant, office: officeSlug } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const office = resolveOffice(site, officeSlug, 'en')
  if (!office) notFound()

  return <LocationOffice site={site} office={office} />
}
