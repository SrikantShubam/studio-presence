import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ContactPage } from '../../contact/ContactPage'

type Props = {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params

  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site || !site.sections.contact?.enabled) return notFoundMeta()
    const title = `${site.business.name} से संपर्क करें`
    const description = `${site.business.address.city} में ${site.business.name} से अपने इंटीरियर प्रोजेक्ट पर चर्चा करें।`
    const meta = pageMeta(site, `${title} — ${site.business.name}`, description, { absolute: true })
    return {
      ...meta,
      alternates: {
        canonical: '/hi/contact',
        languages: {
          en: '/contact',
          hi: '/hi/contact',
        },
      },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiContactRoute({ params }: Props) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant, 'hi')
  } catch {
    notFound()
  }
  if (!site || !site.sections.contact?.enabled) notFound()

  return <ContactPage site={site} />
}
