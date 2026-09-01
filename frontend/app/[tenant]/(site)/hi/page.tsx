import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { localePageClass } from '@/lib/i18n-client'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { HomeSection } from '@/lib/motion'
import { HOME_SECTION_ORDER, renderableSections } from '@/sections/registry'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    const meta = pageMeta(site, site.seo.title, site.seo.description, { absolute: true })
    return {
      ...meta,
      alternates: {
        canonical: '/hi',
        languages: {
          en: '/',
          hi: '/hi',
        },
      },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiHomePage({ params }: Props) {
  const { tenant } = await params

  let config
  try {
    config = await loadPublicClientConfigForLocale(tenant, 'hi')
  } catch {
    notFound()
  }
  if (!config) notFound()

  const sections = renderableSections(config, HOME_SECTION_ORDER)

  return (
    <main lang="hi" data-public-locale="hi" className={localePageClass('hi')}>
      {sections.map(({ key, Component, config: block, variant }) => (
        <HomeSection key={key} first={key === 'hero'}>
          <Component config={block as never} site={config} variant={variant} />
        </HomeSection>
      ))}
    </main>
  )
}
