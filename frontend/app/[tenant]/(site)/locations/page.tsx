import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    return pageMeta(site, 'Locations', 'Visit the studio — hours, address and who is at the table.')
  } catch {
    return notFoundMeta()
  }
}

/**
 * Not a real page — this and `/locations/[office]` used to render the exact
 * same content regardless of which URL was hit, because neither one actually
 * used the `[office]` param. With more than one office this would be silently
 * wrong; with one, it's just a duplicate. Redirect to the one real office
 * page rather than maintain two routes that show the same thing.
 */
export default async function LocationsIndex({ params }: Props) {
  const { tenant } = await params
  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const office = site.sections.locations?.offices[0]
  if (!office) notFound()

  redirect(`/locations/${office.slug}`)
}
