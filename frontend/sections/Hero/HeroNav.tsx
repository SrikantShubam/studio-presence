'use client'

import { useState } from 'react'
import { Wordmark } from './Wordmark'

/**
 * Shared nav for the full-bleed, standard and video hero variants. Split's nav
 * is bespoke (it spans two visually distinct halves) and lives in
 * HeroSplit.tsx directly rather than being forced through this component.
 *
 * The five links are fixed chrome, not config — per
 * `docs/product/prompts/00-shared/global-chrome.md`'s master nav spec, nav
 * structure is identical for every client of a given identity; only the
 * palette changes. That's why "SERVICES", "PORTFOLIO" etc. are literal text
 * here rather than pulled from config: they aren't this client's copy, they're
 * the site's fixed navigation, the same way an admin screen's "Sign out" label
 * isn't config either.
 *
 * `tone` controls contrast, not structure — the same five links either sit on
 * a photo (translucent scrim, white text) or on a plain page background (ink
 * text, hairline border underneath).
 */

const LINKS = [
  { href: '#hero', label: 'HOME' },
  { href: '#services', label: 'SERVICES' },
  { href: '#about', label: 'ABOUT' },
  { href: '#portfolio', label: 'PORTFOLIO' },
  { href: '#contact', label: 'CONTACT' },
]

export function HeroNav({
  businessName,
  phone,
  tone,
}: {
  businessName: string
  phone: string
  tone: 'on-photo' | 'on-surface'
}) {
  const [open, setOpen] = useState(false)

  const textColor = tone === 'on-photo' ? 'text-surface' : 'text-ink'
  const dividerColor = tone === 'on-photo' ? 'bg-surface/40' : 'bg-accent'
  const borderClass = tone === 'on-surface' ? 'border-b border-accent' : ''

  return (
    <>
      <nav
        className={`relative flex items-center justify-between gap-6 px-5 py-5 sm:px-8 sm:py-6 ${textColor} ${borderClass}`}
      >
        <Wordmark
          businessName={businessName}
          className="grid gap-[3px] text-[13px] font-medium leading-none tracking-[0.26em]"
        />

        <div className="hidden items-center gap-8 text-[11.5px] font-normal tracking-[0.2em] md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className={textColor}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 text-xs tracking-[0.14em] md:flex">
          <span className={`h-4 w-px ${dividerColor}`} />
          <span>{phone}</span>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-11 w-11 flex-col items-center justify-center gap-[5px] border ${
            tone === 'on-photo' ? 'border-surface/50' : 'border-accent'
          } bg-transparent md:hidden`}
        >
          <span className={`block h-px w-5 ${tone === 'on-photo' ? 'bg-surface' : 'bg-ink'}`} />
          <span className={`block h-px w-5 ${tone === 'on-photo' ? 'bg-surface' : 'bg-ink'}`} />
          <span className={`block h-px w-5 ${tone === 'on-photo' ? 'bg-surface' : 'bg-ink'}`} />
        </button>
      </nav>

      {open && (
        <div
          className={`relative mx-5 flex flex-col gap-[2px] border-t border-b border-accent px-0 py-4 text-[13px] font-normal tracking-[0.2em] sm:mx-8 md:hidden ${textColor}`}
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-3 ${textColor}`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
