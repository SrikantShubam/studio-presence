import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { LegalDoc } from '../legal/LegalDoc'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    return pageMeta(site, 'Privacy', 'What we collect, how long we keep it, and how to ask us to delete it.')
  } catch {
    return notFoundMeta()
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { tenant } = await params
  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }
  if (!site.legal.privacyPolicy || !site.legal.privacyPolicyDoc) notFound()
  return <LegalDoc site={site} kind="privacy" />
}
