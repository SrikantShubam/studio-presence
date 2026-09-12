import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LocationOffice } from './LocationOffice'

type Props = { params: Promise<{ tenant: string }> }

function fallbackOffice(site: Awaited<ReturnType<typeof loadPublicClientConfig>>) {
  if (!site.business.address) return null
  return {
    slug: 'studio',
    name: site.business.name ? `${site.business.name} Studio` : 'Studio',
    address: {
      line1: site.business.address.line1,
      locality: site.business.address.locality,
      city: site.business.address.city,
      state: site.business.address.state,
      pincode: site.business.address.pincode,
    },
    phone: site.business.phone,
    hours: {
      weekday: site.business.hours || '10:00 – 19:00',
      sunday: site.business.hoursExtra || 'By appointment',
    },
    team: [],
    projectSlugs: site.sections.portfolio?.projects?.map((p) => p.slug) ?? [],
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    const office = site.sections.locations?.offices[0] || fallbackOffice(site)
    if (!office) return notFoundMeta()
    return pageMeta(site, office.name || 'Locations', 'Visit the studio — hours, address and who is at the table.')
  } catch {
    return notFoundMeta()
  }
}

export default async function LocationsIndex({ params }: Props) {
  const { tenant } = await params
  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const office = site.sections.locations?.offices[0] || fallbackOffice(site)
  if (!office) notFound()

  return <LocationOffice site={site} office={office} />
}


