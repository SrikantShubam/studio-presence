import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { CareersPage } from './CareersPage'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    return pageMeta(site, 'Work with us', 'Open roles at the studio and workshop.')
  } catch {
    return notFoundMeta()
  }
}

export default async function CareersRoute({ params }: Props) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  if (!site.sections.careers?.enabled) notFound()

  return <CareersPage site={site} />
}
