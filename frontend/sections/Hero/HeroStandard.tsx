import Image from 'next/image'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { HeroContent } from './HeroContent'
import { HeroNav } from './HeroNav'

/**
 * Standard — the contained variant. Two columns; the photo sits inset with a
 * visible margin, framed by an offset outline (signature device #2 here,
 * alongside the two-tone wordmark) — deliberately NOT full-bleed. Nav sits on
 * the plain page background, not overlaid.
 *
 * Matches `design/reference/editorial/hero-standard-variant.html`.
 */
export function HeroStandard({ config, site }: { config: SectionConfig<'hero'>; site: ClientConfig }) {
  return (
    <section id="hero" className="bg-surface text-ink">
      <HeroNav businessName={site.business.name} phone={site.business.phone} tone="on-surface" />

      <div className="grid gap-10 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-[1.15fr_0.95fr] md:items-center md:gap-16 md:py-20">
        <HeroContent config={config} site={site} tone="on-surface" />

        <div className="relative mr-4 mb-4 sm:mr-7 sm:mb-7">
          <div className="pointer-events-none absolute -top-4 -left-4 right-4 bottom-4 border border-accent sm:-top-7 sm:-left-7 sm:right-7 sm:bottom-7" />
          <div className="relative aspect-[4/3] overflow-hidden bg-hairline sm:aspect-[3/4]">
            {config.image && (
              <Image
                src={config.image}
                alt={`${config.headline} — hero photograph`}
                fill
                priority
                className="object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
