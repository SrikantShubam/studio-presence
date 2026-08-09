import type { ClientConfig, SectionConfig } from '@studio/backend'
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
  const corner = [
    site.business.yearFounded ? `EST. ${site.business.yearFounded}` : null,
    site.business.address.city,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section id="hero" className="relative min-h-[min(860px,100vh)] overflow-hidden">
      <HeroBackdrop image={config.image} alt={`${config.headline} — hero photograph`}>
        <div className="relative">
          <HeroNav businessName={site.business.name} phone={site.business.phone} tone="on-photo" />
        </div>

        <div className="relative px-5 py-10 sm:px-8 sm:py-16 md:pb-24">
          <div className="max-w-3xl">
            <HeroContent config={config} site={site} tone="on-photo" headingSize="display" />
          </div>
        </div>

        {corner && (
          <div className="absolute bottom-6 left-5 text-[10.5px] uppercase tracking-[0.24em] text-surface sm:bottom-11 sm:left-8">
            {corner}
          </div>
        )}
      </HeroBackdrop>
    </section>
  )
}
