import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LocationOffice } from '../../locations/LocationOffice'

type Props = { params: Promise<{ tenant: string }> }

function fallbackOffice(site: NonNullable<Awaited<ReturnType<typeof loadPublicClientConfigForLocale>>>) {
  if (!site.business.address) return null
  return {
    slug: 'studio',
    name: site.business.name ? `${site.business.name} स्टूडियो` : 'स्टूडियो',
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
      sunday: site.business.hoursExtra || 'अपॉइंटमेंट द्वारा',
    },
    team: [],
    projectSlugs: site.sections.portfolio?.projects?.map((p) => p.slug) ?? [],
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    const office = site.sections.locations?.offices[0] || fallbackOffice(site)
    if (!office) return notFoundMeta()
    return pageMeta(site, office.name || 'स्टूडियो लोकेशन', 'पता, समय और स्टूडियो संपर्क।')
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiLocationsPage({ params }: Props) {
  const { tenant } = await params
  const site = await loadPublicClientConfigForLocale(tenant, 'hi')
  if (!site) notFound()
  const office = site.sections.locations?.offices[0] || fallbackOffice(site)
  if (!office) notFound()
  return <LocationOffice site={site} office={office} />
}

