import type { ClientConfig, SectionKey } from '@studio/backend'
import { localePageClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { HomeSection } from '@/lib/motion'
import { renderableSections } from '@/sections/registry'
import { HeroNav } from '@/sections/Hero/HeroNav'

const ABOUT_SECTION_ORDER: readonly SectionKey[] = ['about', 'team', 'process', 'testimonials', 'contact', 'footer']

export function AboutPage({ site }: { site: ClientConfig }) {
  const locale = publicLocaleFromSite(site)
  const sections = renderableSections(site, ABOUT_SECTION_ORDER)

  return (
    <main lang={locale} data-public-locale={locale} className={`overflow-x-clip bg-surface text-ink ${localePageClass(locale)}`}>
      <HeroNav
        businessName={site.business.name}
        phone={site.business.phone}
        tone="on-surface"
        inner
        services={site.sections.services?.items}
        locale={locale}
        locales={site.i18n.locales}
      />
      {sections.map(({ key, Component, config, variant }, index) => (
        <HomeSection key={key} first={index === 0}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </main>
  )
}
