import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LocationOffice } from '../LocationOffice'

type Props = { params: Promise<{ tenant: string; office: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, office: officeSlug } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    const offices = site.sections.locations?.offices ?? []
    const office = offices.find(
      (item) =>
        item.slug === officeSlug ||
        (offices.length === 1 && (officeSlug === 'boring-road' || officeSlug === 'studio' || officeSlug === 'digha-ghat'))
    )
    if (!office) return notFoundMeta()
    return pageMeta(site, office.name, 'Visit the studio — hours, address and who is at the table.')
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

  const offices = site.sections.locations?.offices ?? []
  const office = offices.find(
    (item) =>
      item.slug === officeSlug ||
      (offices.length === 1 && (officeSlug === 'boring-road' || officeSlug === 'studio' || officeSlug === 'digha-ghat'))
  )
  if (!office) notFound()

  return <LocationOffice site={site} office={office} />
}
