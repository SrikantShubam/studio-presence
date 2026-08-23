'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { chromeCopy, localeHref, localeTextClass, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { serviceHref, type ServiceItem } from '@/sections/Services/shared'
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
  { href: '/', key: 'home' },
  { href: '/#services', key: 'services' },
  { href: '/#about', key: 'about' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/#contact', key: 'contact' },
] as const

function serviceLinks(items: ServiceItem[]): Array<{ title: string; href: string }> {
  return items.flatMap((item) => {
    const href = serviceHref(item)
    return href ? [{ title: item.title, href }] : []
  })
}

function ServicesDropdown({
  items,
  textColor,
  label,
  locale,
  onNavigate,
}: {
  items: Array<{ title: string; href: string }>
  textColor: string
  label: string
  locale: PublicLocale
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!items.length) {
    return (
      <Link href="/#services" className={textColor} onClick={onNavigate}>
        {label}
      </Link>
    )
  }

  const primaryHref = items[0]?.href ?? '/#services'

  return (
    <div ref={root} className="relative inline-flex items-center gap-1">
      <Link href={primaryHref} className={textColor} onClick={onNavigate}>
        {label}
      </Link>
      <button
        type="button"
        aria-label={chromeCopy[locale].nav.openServices}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-8 w-5 items-center justify-center bg-transparent ${textColor}`}
      >
        <EditorialIcon name="chevron-down" className={`h-2.5 w-2.5 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[16rem] border border-accent bg-surface text-ink">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={`block px-4 py-3 text-[11px] font-normal text-ink hover:bg-panel hover:text-accent ${localeTextClass(locale)}`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function HeroNav({
  businessName,
  phone,
  tone,
  inner: _inner = false,
  services = [],
  locale = 'en',
  locales = ['en'],
}: {
  businessName: string
  phone: string
  tone: 'on-photo' | 'on-surface'
  inner?: boolean
  services?: ServiceItem[]
  locale?: PublicLocale
  locales?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [mobileServices, setMobileServices] = useState(false)
  const reduce = useReducedMotion()
  const pathname = usePathname() || '/'
  const activeLocale: PublicLocale = pathname === '/hi' || pathname.startsWith('/hi/') ? 'hi' : locale
  const textColor = tone === 'on-photo' ? 'text-surface' : 'text-ink'
  const dividerColor = tone === 'on-photo' ? 'bg-surface/40' : 'bg-accent'
  const borderClass = tone === 'on-surface' ? 'border-b border-accent' : ''
  const links = serviceLinks(services).map((item) => ({ ...item, href: localeHref(item.href, activeLocale) }))
  const copy = chromeCopy[activeLocale].nav
  const navLinks = LINKS.map((link) => ({ ...link, href: localeHref(link.href, activeLocale), label: copy[link.key] }))
  const showHindi = locales.includes('hi')
  const alternateLocale: PublicLocale = activeLocale === 'hi' ? 'en' : 'hi'
  const alternateLabel = copy.languageShort
  const alternateHref = localeHref(pathname, alternateLocale)
  const navTextClass = activeLocale === 'hi' ? 'tracking-normal' : 'tracking-[0.2em]'

  useEffect(() => {
    if (!open) setMobileServices(false)
  }, [open])

  return (
    <>
      <nav
        className={`relative z-40 flex items-center justify-between gap-6 px-5 py-[clamp(20px,3vw,34px)] md:px-[clamp(20px,5vw,64px)] ${textColor} ${borderClass} bg-transparent`}
      >
        <Link href={localeHref('/', activeLocale)} className={textColor}>
          <Wordmark
            businessName={businessName}
            className="grid gap-[3px] text-[13px] font-medium leading-none tracking-[0.26em]"
          />
        </Link>

        <div className={`hidden items-center gap-8 text-[11.5px] font-normal md:flex ${navTextClass}`}>
          {navLinks.map((link) =>
            link.key === 'services' ? (
              <ServicesDropdown key={link.href} items={links} textColor={textColor} label={link.label} locale={activeLocale} />
            ) : (
              <Link key={link.href} href={link.href} className={textColor}>
                {link.label}
              </Link>
            ),
          )}
        </div>

        <div className="hidden items-center gap-4 text-xs tracking-[0.14em] md:flex">
          <span className={`h-4 w-px ${dividerColor}`} />
          {showHindi && (
            <Link
              href={alternateHref}
              className={`inline-flex min-h-9 items-center border border-current px-3 text-[11px] font-medium ${activeLocale === 'hi' ? 'tracking-normal' : 'tracking-[0.14em]'}`}
              hrefLang={alternateLocale}
              aria-label={copy.languageLabel}
            >
              {alternateLabel}
            </Link>
          )}
          <a href={`tel:${phone}`} className={textColor}>
            {phone}
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? copy.closeMenu : copy.openMenu}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center bg-transparent md:hidden"
        >
          <EditorialIcon name={open ? 'close' : 'bars'} className="h-4 w-4" />
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0 }}
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
                <Link href={localeHref('/', activeLocale)} onClick={() => setOpen(false)} className="text-ink">
                  <Wordmark
                    businessName={businessName}
                    className="grid gap-[3px] text-[13px] font-medium leading-none tracking-[0.26em]"
                  />
                </Link>
                <div className="flex items-center gap-3">
                  {showHindi && (
                    <Link
                      href={alternateHref}
                      hrefLang={alternateLocale}
                      aria-label={copy.languageLabel}
                      onClick={() => setOpen(false)}
                      className={`inline-flex min-h-10 items-center border border-ink px-3 text-[12px] font-medium text-ink ${activeLocale === 'hi' ? 'tracking-normal' : 'tracking-[0.14em]'}`}
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

              <div className="grid flex-1 content-center gap-1 py-10 text-[clamp(28px,10vw,54px)] font-display leading-none tracking-normal">
                {navLinks.map((link) =>
                  link.key === 'services' && links.length ? (
                    <div key={link.href} className="border-b border-hairline py-4">
                      <div className="flex items-center justify-between gap-5">
                        <Link href={links[0]?.href ?? '/#services'} onClick={() => setOpen(false)} className="text-ink">
                          {link.label}
                        </Link>
                        <button
                          type="button"
                          aria-label={copy.openServices}
                          aria-expanded={mobileServices}
                          onClick={() => setMobileServices((value) => !value)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center bg-transparent text-ink"
                        >
                          <EditorialIcon
                            name="chevron-down"
                            className={`h-3 w-3 transition-transform ${mobileServices ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                        {mobileServices ? (
                          <motion.div
                            key="mobile-services"
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.24 }}
                            className="overflow-hidden"
                          >
                            <div className={`grid gap-3 pt-5 text-[12px] font-normal leading-snug text-accent ${localeTextClass(activeLocale, 'uppercase tracking-[0.16em]')}`}>
                              {links.map((item) => (
                                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                  {item.title}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="border-b border-hairline py-4 text-ink"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>

              <a
                href={`tel:${phone}`}
                onClick={() => setOpen(false)}
                className="border-t border-accent pt-5 text-[12px] font-normal uppercase tracking-[0.14em] text-ink"
              >
                {phone}
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
