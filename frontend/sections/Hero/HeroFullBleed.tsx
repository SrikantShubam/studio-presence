import { Fragment } from 'react'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { localeTextClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { HeroBackdrop, HeroContent } from './HeroContent'
import { HeroNav } from './HeroNav'

/**
 * Full-bleed — the identity's default hero variant (`lib/tokens/editorial.ts`).
 * One edge-to-edge photograph, nav overlaid with a scrim, copy pinned to the
 * upper portion, a small "EST. <year> · <city>" mark in the corner.
 *
 * Matches `design/reference/editorial/home-sections/hero.html`.
 */
export function HeroFullBleed({ config, site }: { config: SectionConfig<'hero'>; site: ClientConfig }) {
  const locale = publicLocaleFromSite(site)
  const corner = [
    site.business.yearFounded ? `${locale === 'hi' ? 'स्थापित' : 'EST.'} ${site.business.yearFounded}` : null,
    site.business.address.city,
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
            locales={site.i18n.locales}
          />
        </div>

        <div className="relative px-5 pt-[clamp(72px,10vh,120px)] pb-[clamp(156px,22vh,210px)] sm:px-8 md:px-[clamp(20px,5vw,64px)] md:pt-[clamp(56px,8vh,108px)]">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[1000px]">
            <HeroContent config={config} site={site} tone="on-photo" headingSize="display" />
            </div>
            {config.categories.length > 0 && (
              <div className={`hidden shrink-0 gap-3 pt-[14px] text-right text-[clamp(9.5px,1vw,11px)] font-normal text-surface md:grid ${localeTextClass(locale, 'uppercase tracking-[0.22em]')}`}>
                {config.categories.map((category, i) => (
                  <Fragment key={category}>
                    {i > 0 && <span className="ml-auto h-px w-9 bg-surface/40" aria-hidden />}
                    <span>{category}</span>
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {corner && (
          <div className={`absolute bottom-[clamp(24px,4vw,44px)] left-[clamp(20px,5vw,64px)] text-[clamp(9.5px,1vw,11px)] font-normal text-surface md:right-[clamp(20px,5vw,64px)] md:left-auto md:text-right ${localeTextClass(locale, 'uppercase tracking-[0.24em]')}`}>
            {corner}
          </div>
        )}
      </HeroBackdrop>
    </section>
  )
}
