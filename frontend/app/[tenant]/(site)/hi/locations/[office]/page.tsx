import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LocationOffice } from '../../../locations/LocationOffice'

type Props = { params: Promise<{ tenant: string; office: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, office: officeSlug } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    const offices = site.sections.locations?.offices ?? []
    const office = offices.find(
      (item) =>
        item.slug === officeSlug ||
        (offices.length === 1 && (officeSlug === 'boring-road' || officeSlug === 'studio' || officeSlug === 'digha-ghat'))
    )
    if (!office) return notFoundMeta()
    return pageMeta(site, office.name, 'स्टूडियो देखें — समय, पता और टीम।')
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiLocationOfficePage({ params }: Props) {
  const { tenant, office: officeSlug } = await params
  const site = await loadPublicClientConfigForLocale(tenant, 'hi')
  if (!site) notFound()

  const offices = site.sections.locations?.offices ?? []
  const office = offices.find(
    (item) =>
      item.slug === officeSlug ||
      (offices.length === 1 && (officeSlug === 'boring-road' || officeSlug === 'studio' || officeSlug === 'digha-ghat'))
  )
  if (!office) notFound()

  return <LocationOffice site={site} office={office} />
}
