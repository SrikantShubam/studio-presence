'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { FadeUpItem, Stagger } from '@/lib/motion'
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
    <Stagger delay={0.15}>
      <FadeUpItem>
        <div className={`mb-8 grid gap-3 text-[10.5px] font-normal uppercase leading-relaxed tracking-[0.24em] sm:mb-8 md:gap-2 ${eyebrowColor}`}>
          {heroEyebrowLines(site).map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      </FadeUpItem>

      <FadeUpItem>
        <h1
          className={`m-0 font-display font-light uppercase leading-[0.9] tracking-[-0.025em] ${
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
      </FadeUpItem>

      <FadeUpItem>
        <p className={`mt-[clamp(30px,4.2vh,42px)] max-w-[16em] text-[clamp(15px,1.6vw,21px)] font-normal uppercase leading-[1.25] tracking-[0.18em] md:mt-[clamp(24px,3vw,34px)] ${bodyColor}`}>
          {config.headline}
        </p>
      </FadeUpItem>

      {config.sub ? (
        <FadeUpItem>
          <p className={`mt-5 max-w-lg text-sm leading-relaxed ${bodyColor}`}>{config.sub}</p>
        </FadeUpItem>
      ) : null}

      {config.ctaLabel ? (
        <FadeUpItem>
          <Link
            href={ctaHref}
            className="mt-[clamp(40px,6vh,64px)] inline-flex min-h-10 items-center gap-2.5 [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-16px)_100%,0_100%)] bg-cta px-6 py-4 text-[10px] font-medium uppercase tracking-[0.16em] text-ink sm:min-h-11 sm:gap-[14px] sm:[clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] sm:px-[34px] sm:py-5 sm:text-[clamp(10.5px,1.1vw,12px)] sm:tracking-[0.18em] md:mt-[clamp(32px,4.5vw,52px)]"
          >
            {config.ctaLabel} <EditorialIcon name="arrow-right" className="h-3 w-3" />
          </Link>
        </FadeUpItem>
      ) : null}
    </Stagger>
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
  const reduce = useReducedMotion()

  return (
    <div className="absolute inset-0 bg-ink">
      {image ? (
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image src={image} alt={alt} fill priority className="object-cover" />
        </motion.div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/15 to-ink/60" />
      {children}
    </div>
  )
}
