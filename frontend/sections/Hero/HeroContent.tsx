import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { Wordmark } from './Wordmark'
import { heroEyebrowLines } from './eyebrow'

/**
 * The copy block shared by full-bleed, video and standard — wordmark, eyebrow,
 * positioning line, description, CTA. Split builds its own (dark-background
 * copy needs different colour choices throughout, not just a `tone` swap).
 *
 * Visual hierarchy, and why it's shaped this way: the big two-tone heading is
 * the BUSINESS NAME (`site.business.name`), not `config.headline`. The
 * reference mockups put the studio's name in that huge two-tone treatment and
 * the tagline-style line beneath it — `config.headline` fills that second
 * role, `config.sub` the descriptive paragraph below it. Reusing the name as
 * the two-tone heading also means it needs no separate config field: the
 * headline schema field carries the positioning statement, exactly as
 * `config-schema.md`'s own example shows ("Interiors that feel like home").
 */

export function HeroContent({
  config,
  site,
  tone,
  headingSize = 'large',
}: {
  config: SectionConfig<'hero'>
  site: ClientConfig
  tone: 'on-photo' | 'on-surface'
  headingSize?: 'large' | 'display'
}) {
  const eyebrowColor = tone === 'on-photo' ? 'text-surface/80' : 'text-accent'
  const bodyColor = tone === 'on-photo' ? 'text-surface/90' : 'text-muted'

  // A boolean routing check, not a read of another section's content — if the
  // estimate calculator page exists for this client, the hero CTA should go
  // there rather than to a generic anchor. `site` is documented for exactly
  // this kind of cross-cutting, non-content read.
  const ctaHref = site.sections.estimate?.enabled ? '/estimate' : '#contact'

  return (
    <div>
      <div className={`mb-5 grid gap-1.5 text-[10.5px] font-normal uppercase leading-relaxed tracking-[0.24em] sm:mb-8 ${eyebrowColor}`}>
        {heroEyebrowLines(site).map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>

      <h1
        className={`m-0 font-display font-light uppercase leading-[0.9] tracking-tight ${
          headingSize === 'display'
            ? 'text-[clamp(44px,11vw,140px)]'
            : 'text-[clamp(46px,7.4vw,96px)]'
        }`}
      >
        <Wordmark
          businessName={site.business.name}
          className={tone === 'on-photo' ? 'text-surface' : 'text-ink'}
        />
      </h1>

      <p className={`mt-6 max-w-md text-[clamp(16px,1.7vw,19px)] leading-snug sm:mt-9 ${bodyColor}`}>
        {config.headline}
      </p>

      {config.sub && (
        <p className={`mt-3 max-w-lg text-sm leading-relaxed ${bodyColor}`}>{config.sub}</p>
      )}

      {config.ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-8 inline-flex min-h-11 items-center gap-3 bg-cta px-8 py-5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink sm:mt-12"
        >
          {config.ctaLabel} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  )
}

/** Full-bleed background photo, shared by the full-bleed and video variants. */
export function HeroBackdrop({
  image,
  alt,
  children,
}: {
  image: string | undefined
  alt: string
  children?: ReactNode
}) {
  return (
    <div className="absolute inset-0 bg-ink">
      {image && <Image src={image} alt={alt} fill priority className="object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/15 to-ink/60" />
      {children}
    </div>
  )
}
