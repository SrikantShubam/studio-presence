'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'
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
  const locale = publicLocaleFromSite(site)
  const ctaLabel = site.sections.estimate?.enabled ? chromeCopy[locale].hero.estimateCta : config.ctaLabel

  return (
    <Stagger delay={0.15}>
      <FadeUpItem>
        <div className={`mb-8 grid gap-3 font-normal leading-relaxed sm:mb-8 md:gap-2 ${eyebrowColor} ${localeRoleClass(locale, 'eyebrow')}`}>
          {heroEyebrowLines(site, locale).map((line, i) => (
            <h2 key={i} className="ai-heading-reset m-0">
              {line}
            </h2>
          ))}
        </div>
      </FadeUpItem>

      <FadeUpItem>
        <Wordmark
          as="h1"
          businessName={site.business.name}
          className={`m-0 font-display font-light uppercase leading-[0.9] tracking-[-0.025em] ${
            headingSize === 'display'
              ? 'ai-type-hero-wordmark-display'
              : 'ai-type-hero-wordmark'
          } ${tone === 'on-photo' ? 'text-surface' : 'text-ink'}`}
        />
      </FadeUpItem>

      <FadeUpItem>
        <h2 className={`mt-[clamp(30px,4.2vh,42px)] max-w-[18em] font-normal md:mt-[clamp(24px,3vw,34px)] ${bodyColor} ai-type-hero-support`}>
          {config.headline}
        </h2>
      </FadeUpItem>

      {config.sub ? (
        <FadeUpItem>
          <p className={`mt-5 max-w-[34rem] leading-[1.65] ${bodyColor} ${localeRoleClass(locale, 'heroSub')}`}>{config.sub}</p>
        </FadeUpItem>
      ) : null}

      {ctaLabel ? (
        <FadeUpItem>
          <Link
            href={ctaHref.startsWith('/') ? localeHref(ctaHref, locale) : ctaHref}
            className="ai-type-hero-cta mt-[clamp(24px,4vh,42px)] inline-flex min-h-11 items-center gap-2.5 [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-16px)_100%,0_100%)] bg-cta px-6 py-4 font-medium text-ink sm:gap-[14px] sm:[clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] sm:px-[34px] sm:py-5 md:mt-[clamp(24px,3.5vw,40px)]"
          >
            {ctaLabel} <EditorialIcon name="arrow-right" className="h-3 w-3" />
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
