'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeTextClass, publicLocaleFromSite } from '@/lib/i18n-client'
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
  const alternateLocale = locale === 'hi' ? 'en' : 'hi'
  const alternateLabel = copy.languageShort
  const ghostDigits = site.business.yearFounded ? String(site.business.yearFounded).slice(-2) : null
  const ctaHref = site.sections.estimate?.enabled ? localeHref('/estimate', locale) : '#contact'

  return (
    <section id="hero" className="relative grid min-h-[min(920px,100vh)] bg-ink md:grid-cols-2">
      {/* LEFT — dark half */}
      <div className="relative flex flex-col justify-end overflow-hidden bg-ink px-6 pt-36 pb-12 sm:px-10 sm:pt-44 sm:pb-16 md:pt-52">
        {ghostDigits && (
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-[0.3em] -left-[0.09em] select-none text-[clamp(200px,26vw,420px)] font-extralight leading-[0.7] tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.13)]"
          >
            {ghostDigits}
          </span>
        )}

        <span
          aria-hidden
          className="pointer-events-none absolute top-[clamp(150px,17vw,210px)] right-5 hidden select-none text-[clamp(11px,1.05vw,13px)] font-normal uppercase tracking-[0.52em] text-transparent [-webkit-text-stroke:0.6px_rgba(255,255,255,0.34)] [writing-mode:vertical-rl] md:block"
        >
          {site.business.name}
        </span>

        <div className="relative">
          <div className="mb-8 grid gap-2 text-[10px] font-normal uppercase leading-relaxed tracking-[0.3em] text-surface/55 sm:mb-11">
            {heroEyebrowLines(site).map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>

          <h1 className="m-0 text-[clamp(46px,6.6vw,86px)] font-extralight uppercase leading-[0.93] tracking-tight text-surface">
            <Wordmark businessName={site.business.name} />
          </h1>

          <div className="mt-8 flex items-start gap-5 sm:mt-12">
            <span className="mt-[0.62em] h-px w-10 shrink-0 bg-cta sm:w-14" />
            <p className="m-0 max-w-xs text-sm font-normal uppercase leading-snug tracking-[0.14em] text-surface/85">
              {config.headline}
            </p>
          </div>

          {config.ctaLabel && (
            <Link
              href={ctaHref}
              className={`mt-10 inline-flex min-h-10 items-center gap-2.5 whitespace-nowrap bg-cta px-6 py-4 text-[10px] font-medium text-ink sm:mt-14 sm:min-h-11 sm:gap-3 sm:px-7 sm:py-5 sm:text-[11px] ${localeTextClass(locale, 'uppercase tracking-[0.16em] sm:tracking-[0.2em]')}`}
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
          <Link href={localeHref('/', locale)} className="grid gap-1 text-xs font-medium uppercase leading-tight tracking-[0.3em] text-surface">
            <Wordmark businessName={site.business.name} />
          </Link>
          <div className="hidden items-center gap-6 text-[10px] font-normal uppercase tracking-[0.22em] text-surface md:flex">
            <Link href={localeHref('/', locale)}>{copy.home}</Link>
          </div>
        </div>
        <div className="flex items-center justify-between gap-5 px-6 sm:px-10">
          <div className="hidden items-center gap-6 text-[10px] font-normal uppercase tracking-[0.22em] text-ink md:flex">
            <Link href={localeHref('/#about', locale)}>{copy.about}</Link>
            <Link href={localeHref('/portfolio', locale)}>{copy.portfolio}</Link>
            <Link href={localeHref('/#contact', locale)}>{copy.contact}</Link>
          </div>
          <div className="ml-auto hidden items-center gap-3 whitespace-nowrap text-[11px] tracking-[0.14em] text-ink md:flex">
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
                  className="grid gap-1 text-xs font-medium uppercase leading-tight tracking-[0.3em] text-ink"
                >
                  <Wordmark businessName={site.business.name} />
                </Link>
                <div className="flex items-center gap-3">
                  {showHindi && (
                    <Link
                      href={localeHref('/', alternateLocale)}
                      hrefLang={alternateLocale}
                      onClick={() => setOpen(false)}
                      className={`inline-flex min-h-10 items-center border border-ink px-3 text-[12px] font-medium text-ink ${localeTextClass(locale, 'uppercase tracking-[0.14em]')}`}
                    >
                      {alternateLabel}
                    </Link>
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

              <div className="grid flex-1 content-center gap-1 py-10 text-[clamp(28px,10vw,54px)] font-display uppercase leading-none tracking-normal">
                {[
                  { href: localeHref('/', locale), label: copy.home },
                  { href: localeHref('/#about', locale), label: copy.about },
                  { href: localeHref('/portfolio', locale), label: copy.portfolio },
                  { href: localeHref('/#contact', locale), label: copy.contact },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-hairline py-4 text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <a
                href={`tel:${site.business.phone}`}
                onClick={() => setOpen(false)}
                className="border-t border-accent pt-5 text-[12px] font-normal uppercase tracking-[0.14em] text-ink"
              >
                {site.business.phone}
              </a>
              {showHindi && (
                <Link
                  href={localeHref('/', alternateLocale)}
                  hrefLang={alternateLocale}
                  onClick={() => setOpen(false)}
                  className={`pt-4 text-[12px] font-normal text-ink ${localeTextClass(locale, 'uppercase tracking-[0.14em]')}`}
                >
                  {alternateLabel}
                </Link>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
