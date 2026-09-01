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
    return pageMeta(site, 'Terms of work', 'Quotations, payment, warranty and cancellation.')
  } catch {
    return notFoundMeta()
  }
}

export default async function TermsPage({ params }: Props) {
  const { tenant } = await params
  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }
  if (!site.legal.terms || !site.legal.termsDoc) notFound()
  return <LegalDoc site={site} kind="terms" />
}
