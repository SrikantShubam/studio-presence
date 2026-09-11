import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ContactPage } from './ContactPage'

type Props = {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params

  try {
    const site = await loadPublicClientConfigForLocale(tenant)
    if (!site || !site.sections.contact?.enabled) return notFoundMeta()
    const title = `Contact ${site.business.name}`
    const description = `Start an interiors conversation with ${site.business.name} in ${site.business.address.city}.`
    const meta = pageMeta(site, title, description)
    return {
      ...meta,
      alternates: site.i18n.locales.includes('hi')
        ? {
            canonical: '/contact',
            languages: {
              en: '/contact',
              hi: '/hi/contact',
            },
          }
        : { canonical: '/contact' },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function ContactRoute({ params }: Props) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant)
  } catch {
    notFound()
  }
  if (!site || !site.sections.contact?.enabled) notFound()

  return <ContactPage site={site} />
}
