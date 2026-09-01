import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { TeamIndex } from '../../team/TeamIndex'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    return pageMeta(site, 'स्टूडियो', 'हमारी डिजाइन और साइट निष्पादन टीम।')
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiTeamPage({ params }: Props) {
  const { tenant } = await params
  const site = await loadPublicClientConfigForLocale(tenant, 'hi')
  if (!site || !site.sections.team) notFound()
  return <TeamIndex site={site} />
}
