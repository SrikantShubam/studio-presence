import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { HomeSection } from '@/lib/motion'
import { HOME_SECTION_ORDER, renderableSections } from '@/sections/registry'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>
}): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant)
    if (!site) return notFoundMeta()
    const meta = pageMeta(site, site.seo.title, site.seo.description, { absolute: true })
    return {
      ...meta,
      alternates: site.i18n.locales.includes('hi')
        ? {
            canonical: '/',
            languages: {
              en: '/',
              hi: '/hi',
            },
          }
        : { canonical: '/' },
    }
  } catch {
    return notFoundMeta()
  }
}

/**
 * The home page.
 *
 * It contains no layout decisions and no section list of its own — both come from
 * the registry, resolved against the client's config. That is deliberate: a page
 * that hardcoded which sections to render would silently ignore the tier, and
 * "changing tier is a config edit" would stop being true the first time someone
 * added a section here directly.
 *
 * Consequently this file should almost never change. New sections land in the
 * registry; ordering lives in HOME_SECTION_ORDER.
 */

export default async function HomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params

  let config
  try {
    config = await loadPublicClientConfigForLocale(tenant)
  } catch {
    notFound()
  }
  if (!config) notFound()

  const sections = renderableSections(config, HOME_SECTION_ORDER)

  return (
    <main lang="en">
      {sections.map(({ key, Component, config: block, variant }) => (
        <HomeSection key={key} first={key === 'hero'}>
          <Component config={block as never} site={config} variant={variant} />
        </HomeSection>
      ))}
    </main>
  )
}
