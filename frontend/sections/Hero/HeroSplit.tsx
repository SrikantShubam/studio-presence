'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig, SectionConfig } from '@studio/backend'
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
  const ghostDigits = site.business.yearFounded ? String(site.business.yearFounded).slice(-2) : null
  const ctaHref = site.sections.estimate?.enabled ? '/estimate' : '#contact'

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
              className="mt-10 inline-flex min-h-11 items-center gap-3 whitespace-nowrap bg-cta px-7 py-5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink sm:mt-14"
            >
              {config.ctaLabel} <span aria-hidden>↗</span>
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
          <span className="grid gap-1 text-xs font-medium uppercase leading-tight tracking-[0.3em] text-surface">
            <Wordmark businessName={site.business.name} />
          </span>
          <div className="hidden items-center gap-6 text-[10px] font-normal uppercase tracking-[0.22em] text-surface md:flex">
            <a href="#hero">Home</a>
          </div>
        </div>
        <div className="flex items-center justify-between gap-5 px-6 sm:px-10">
          <div className="hidden items-center gap-6 text-[10px] font-normal uppercase tracking-[0.22em] text-ink md:flex">
            <a href="#about">About</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="ml-auto hidden items-center gap-3 whitespace-nowrap text-[11px] tracking-[0.14em] text-ink md:flex">
            <span className="h-3 w-px shrink-0 bg-accent" />
            {site.business.phone}
          </div>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="ml-auto flex h-11 w-11 flex-col items-center justify-center gap-[5px] border border-ink/20 bg-surface/80 md:hidden"
          >
            <span className="block h-px w-[18px] bg-ink" />
            <span className="block h-px w-[18px] bg-ink" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="absolute inset-x-0 top-[64px] z-10 flex flex-col gap-[2px] bg-surface px-6 py-4 text-[13px] font-normal uppercase tracking-[0.2em] text-ink md:hidden">
          {['Home', 'About', 'Portfolio', 'Contact'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="py-3"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
