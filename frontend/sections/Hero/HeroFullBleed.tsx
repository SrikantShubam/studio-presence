import { Fragment } from 'react'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { chromeCopy, localePlaceName, publicLocaleFromSite } from '@/lib/i18n-client'
import { HeroBackdrop, HeroContent } from './HeroContent'
import { HeroNav } from './HeroNav'
import { HeroCategoryPiano } from './HeroCategoryPiano'

/**
 * Full-bleed — the identity's default hero variant (`lib/tokens/editorial.ts`).
 * One edge-to-edge photograph, nav overlaid with a scrim, copy pinned to the
 * upper portion, a small "EST. <year> · <city>" mark in the corner.
 *
 * Matches `design/reference/editorial/home-sections/hero.html`.
 */
export function HeroFullBleed({ config, site }: { config: SectionConfig<'hero'>; site: ClientConfig }) {
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].hero
  const categories = config.categories ?? []
  const corner = [
    site.business.yearFounded ? `${copy.established} ${site.business.yearFounded}` : null,
    localePlaceName(site.business.address.city, locale),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      <HeroBackdrop image={config.image} alt={`${config.headline} — hero photograph`}>
        <div className="relative">
          <HeroNav
            businessName={site.business.name}
            phone={site.business.phone}
            tone="on-photo"
            services={site.sections.services?.items}
            locale={locale}
            locales={site.i18n.locales}
            stickyOnScroll
          />
        </div>

        <div className="relative px-5 pt-[clamp(72px,10vh,128px)] pb-[clamp(112px,16vh,168px)] sm:px-8 md:px-[clamp(20px,5vw,64px)] md:pt-[clamp(56px,7vh,104px)]">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[1000px]">
            <HeroContent config={config} site={site} tone="on-photo" headingSize="display" />
            </div>
            {categories.length > 0 && (
              <div className="ai-type-corner-meta hidden shrink-0 gap-3 pt-[14px] text-right font-normal text-surface md:grid">
                {categories.map((category, i) => (
                  <Fragment key={category}>
                    {i > 0 && <span className="ml-auto h-px w-9 bg-surface/40" aria-hidden />}
                  <HeroCategoryPiano label={category} index={i} />
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {corner && (
          <h5 className="ai-type-corner-meta absolute bottom-[clamp(24px,4vw,44px)] left-[clamp(20px,5vw,64px)] m-0 font-normal text-surface md:right-[clamp(20px,5vw,64px)] md:left-auto md:text-right">
            {corner}
          </h5>
        )}
      </HeroBackdrop>
    </section>
  )
}
