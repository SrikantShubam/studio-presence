'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeRoleClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { Wordmark } from './Wordmark'
import { heroEyebrowLines } from './eyebrow'

/**
 * Split — a hard 50/50 vertical seam, no overlap. Dark half carries the copy,
 * a ghost numeral bled off the corner and an outlined vertical wordmark down
 * the seam (three signature devices at once: two-tone heading, ghost numeral,
 * vertical wordmark — more than any other variant, matching how much visual
 * weight the mockup gives this one).
 *
 * Nav is bespoke here rather than reused from HeroNav: it spans both halves
 * in one row, split into two asymmetric groups, which HeroNav's single-tone
 * model can't express. Kept self-contained rather than forcing a shared
 * abstraction across a genuinely different structure.
 *
 * The stats footer in the reference mockup ("240+ projects", "12 years") is
 * deliberately not reproduced — that content belongs to `sections.trustBar`,
 * and Hero receiving only its own config block (not another section's) is
 * the isolation the registry contract is built on. A future ticket can add a
 * dedicated stats field to the hero schema if this composition needs its own.
 *
 * Matches `design/reference/editorial/hero---split-format.html`.
 */
export function HeroSplit({ config, site }: { config: SectionConfig<'hero'>; site: ClientConfig }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].nav
  const showHindi = site.i18n.locales.includes('hi')
  const ghostDigits = site.business.yearFounded ? String(site.business.yearFounded).slice(-2) : null
  const ctaHref = site.sections.estimate?.enabled ? localeHref('/estimate', locale) : '#contact'
  const languageSwitcher = (tone: 'dark' | 'light') => (
    <div className={`ai-language-switcher inline-flex min-h-11 items-center border p-1 font-medium ${localeRoleClass(locale, 'switcher')} ${
      tone === 'dark' ? 'border-surface/50 text-surface/70' : 'border-hairline bg-transparent text-muted'
    }`}>
      <span className={`grid h-9 w-9 shrink-0 place-items-center border bg-ink text-surface ${
        tone === 'dark' ? 'border-surface/35' : 'border-hairline'
      }`}>
        <EditorialIcon name="language" className="h-4 w-4" />
      </span>
      {(['en', 'hi'] as const).map((item: PublicLocale) => (
        <Link
          key={item}
          href={localeHref('/', item)}
          hrefLang={item}
          onClick={() => setOpen(false)}
          aria-current={locale === item ? 'true' : undefined}
          className={`inline-flex min-h-9 min-w-11 items-center justify-center border px-3 ${
            locale === item
              ? 'border-cta bg-cta text-ink'
              : tone === 'dark'
                ? 'border-transparent text-surface/70 hover:text-surface'
                : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          {item === 'en' ? copy.english : copy.hindi}
        </Link>
      ))}
    </div>
  )

  return (
    <section id="hero" className="relative grid min-h-[min(920px,100vh)] bg-ink md:grid-cols-2">
      {/* LEFT — dark half */}
      <div className="relative flex flex-col justify-end overflow-hidden bg-ink px-6 pt-36 pb-12 sm:px-10 sm:pt-44 sm:pb-16 md:pt-52">
        {ghostDigits && (
          <h2
            aria-hidden
            className="ai-type-split-ghost pointer-events-none absolute -bottom-[0.3em] -left-[0.09em] m-0 select-none font-extralight leading-[0.7] tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.13)]"
          >
            {ghostDigits}
          </h2>
        )}

        <h2
          aria-hidden
          className="ai-type-split-vertical pointer-events-none absolute top-[clamp(150px,17vw,210px)] right-5 m-0 hidden select-none font-normal uppercase text-transparent [-webkit-text-stroke:0.6px_rgba(255,255,255,0.34)] [writing-mode:vertical-rl] md:block"
        >
          {site.business.name}
        </h2>

        <div className="relative">
          <div className={`mb-8 grid gap-2 font-normal leading-relaxed text-surface/55 sm:mb-11 ${localeRoleClass(locale, 'eyebrow')}`}>
            {heroEyebrowLines(site, locale).map((line, i) => (
              <h2 key={i} className="ai-heading-reset m-0">
                {line}
              </h2>
            ))}
          </div>

          <Wordmark
            as="h1"
            businessName={site.business.name}
            className="ai-type-split-wordmark m-0 font-display font-extralight uppercase leading-[0.93] tracking-tight text-surface"
          />

          <div className="mt-8 flex items-start gap-5 sm:mt-12">
            <span className="mt-[0.62em] h-px w-10 shrink-0 bg-cta sm:w-14" />
            <h2 className={`m-0 max-w-sm font-normal leading-[1.55] text-surface/85 ${locale === 'hi' ? 'ai-type-hero-sub tracking-normal' : 'ai-type-hero-sub uppercase tracking-[0.14em]'}`}>
              {config.headline}
            </h2>
          </div>

          {config.ctaLabel && (
            <Link
              href={ctaHref}
              className="ai-type-hero-cta mt-8 inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap bg-cta px-6 py-4 font-semibold text-ink sm:mt-10 sm:gap-3 sm:px-7 sm:py-5"
            >
              {config.ctaLabel} <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* RIGHT — photo half */}
      <div className="relative min-h-[62vh] overflow-hidden bg-hairline md:min-h-0">
        {config.image && (
          <Image
            src={config.image}
            alt={`${config.headline} — hero photograph`}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-surface/95 via-surface/60 to-transparent" />
      </div>

      {/* NAV — spans both halves, seam-aligned */}
      <nav className="absolute inset-x-0 top-0 grid items-start py-6 sm:py-8 md:grid-cols-2">
        <div className="flex items-center justify-between gap-5 px-6 sm:px-10">
          <Link href={localeHref('/', locale)} className="text-surface">
            <Wordmark as="h2" businessName={site.business.name} className="ai-type-wordmark-nav m-0 grid gap-1 font-medium uppercase leading-tight" />
          </Link>
          <div className={`hidden items-center gap-6 font-normal text-surface md:flex ${localeRoleClass(locale, 'nav')}`}>
            <Link href={localeHref('/', locale)}><h5 className="ai-type-menu-item m-0 font-normal">{copy.home}</h5></Link>
            {showHindi && languageSwitcher('dark')}
          </div>
        </div>
        <div className="flex items-center justify-between gap-5 px-6 sm:px-10">
          <div className={`hidden items-center gap-6 font-normal text-ink md:flex ${localeRoleClass(locale, 'nav')}`}>
            <Link href={localeHref('/about', locale)}><h5 className="ai-type-menu-item m-0 font-normal">{copy.about}</h5></Link>
            <Link href={localeHref('/portfolio', locale)}><h5 className="ai-type-menu-item m-0 font-normal">{copy.portfolio}</h5></Link>
            <Link href={localeHref('/contact', locale)}><h5 className="ai-type-menu-item m-0 font-normal">{copy.contact}</h5></Link>
          </div>
          <div className={`ml-auto hidden items-center gap-3 whitespace-nowrap text-ink md:flex ${localeRoleClass(locale, 'label')}`}>
            {showHindi && languageSwitcher('light')}
            <span className="h-3 w-px shrink-0 bg-accent" />
            <a href={`tel:${site.business.phone}`}>{site.business.phone}</a>
          </div>
          <button
            type="button"
            aria-label={open ? copy.closeMenu : copy.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="ml-auto flex h-11 w-11 flex-col items-center justify-center gap-[5px] bg-surface/80 md:hidden"
          >
            <span className="block h-px w-[18px] bg-ink" />
            <span className="block h-px w-[18px] bg-ink" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="split-mobile-menu"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-surface text-ink md:hidden"
          >
            <motion.div
              initial={reduce ? false : { y: -18 }}
              animate={{ y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: -18, opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-screen flex-col px-6 py-6 sm:px-8"
            >
              <div className="flex items-center justify-between gap-5 border-b border-accent pb-5">
                <Link
                  href={localeHref('/', locale)}
                  onClick={() => setOpen(false)}
                  className="text-ink"
                >
                  <Wordmark as="h2" businessName={site.business.name} className="ai-type-wordmark-nav m-0 grid gap-1 font-medium uppercase leading-tight" />
                </Link>
                <div className="flex items-center gap-3">
                  {showHindi && (
                    languageSwitcher('light')
                  )}
                  <button
                    type="button"
                    aria-label={copy.closeMenu}
                    onClick={() => setOpen(false)}
                    className="flex h-11 w-11 items-center justify-center bg-transparent text-ink"
                  >
                    <EditorialIcon name="close" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className={`ai-type-mobile-nav grid flex-1 content-center gap-1 py-10 font-display leading-none tracking-normal ${locale === 'en' ? 'uppercase' : ''}`}>
                {[
                  { href: localeHref('/', locale), label: copy.home },
                  { href: localeHref('/about', locale), label: copy.about },
                  { href: localeHref('/portfolio', locale), label: copy.portfolio },
                  { href: localeHref('/contact', locale), label: copy.contact },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-hairline py-4 text-ink"
                  >
                    <h5 className="ai-heading-reset m-0">{item.label}</h5>
                  </Link>
                ))}
              </div>

              <a
                href={`tel:${site.business.phone}`}
                onClick={() => setOpen(false)}
                className={`border-t border-accent pt-5 font-normal text-ink ${localeRoleClass(locale, 'meta')}`}
              >
                {site.business.phone}
              </a>
              {showHindi && <div className="pt-4">{languageSwitcher('light')}</div>}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
