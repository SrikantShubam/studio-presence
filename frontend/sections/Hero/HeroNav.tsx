'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { chromeCopy, localeHref, localeRoleClass, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { serviceHref, type ServiceItem } from '@/sections/Services/shared'
import { BrandMark } from './BrandMark'
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
  { href: '/about', key: 'about' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/#contact', key: 'contact' },
] as const

function activePathname(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'hi') parts.shift()
  if (parts.length > 1) parts.shift()
  return `/${parts.join('/')}` || '/'
}

function isActiveLink(key: (typeof LINKS)[number]['key'], pathname: string): boolean {
  const path = activePathname(pathname)
  if (key === 'home') return path === '/'
  if (key === 'portfolio') return path === '/portfolio' || path.startsWith('/portfolio/') || path.startsWith('/projects/')
  if (key === 'services') return path.startsWith('/services/')
  if (key === 'about') return path === '/about'
  return false
}

function serviceLinks(items: ServiceItem[]): Array<{ title: string; href: string }> {
  return items.flatMap((item) => {
    const href = serviceHref(item)
    return href ? [{ title: item.title, href }] : []
  })
}

function LanguageSwitcher({
  activeLocale,
  pathname,
  tone,
  onNavigate,
}: {
  activeLocale: PublicLocale
  pathname: string
  tone: 'on-photo' | 'on-surface'
  onNavigate?: () => void
}) {
  const copy = chromeCopy[activeLocale].nav
  const base = tone === 'on-photo' ? 'text-surface/70' : 'bg-transparent text-muted'
  const inactive = tone === 'on-photo' ? 'border-transparent text-surface/70 hover:text-surface' : 'border-transparent text-muted hover:text-ink'

  return (
    <div
      aria-label={copy.languageLabel}
      className={`ai-language-switcher inline-flex min-h-11 items-center p-1 font-medium ${localeRoleClass(activeLocale, 'switcher')} ${base}`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center bg-ink text-surface">
        <EditorialIcon name="language" className="h-4 w-4" />
      </span>
      {(['en', 'hi'] as const).map((item) => (
        <Link
          key={item}
          href={localeHref(pathname, item)}
          hrefLang={item}
          aria-current={activeLocale === item ? 'true' : undefined}
          onClick={onNavigate}
          className={`inline-flex min-h-9 min-w-11 items-center justify-center border px-3 ${
            activeLocale === item ? 'border-cta bg-cta text-ink' : inactive
          }`}
        >
          {item === 'en' ? copy.english : copy.hindi}
        </Link>
      ))}
    </div>
  )
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
        <h5 className="ai-type-menu-item m-0 font-normal">{label}</h5>
      </Link>
    )
  }

  return (
    <div ref={root} className="relative inline-flex items-center gap-1" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className={`bg-transparent transition-colors ${open ? 'text-cta' : textColor}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="true">
        <h5 className="ai-type-menu-item m-0 font-normal">{label}</h5>
      </button>
      <button
        type="button"
        aria-label={chromeCopy[locale].nav.openServices}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-8 w-5 items-center justify-center bg-transparent transition-colors ${open ? 'text-cta' : textColor}`}
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
              className={`block px-4 py-3 font-normal text-ink hover:bg-panel hover:text-accent ${localeRoleClass(locale, 'label')}`}
            >
              <h6 className="ai-heading-reset m-0">{item.title}</h6>
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
  stickyOnScroll = false,
}: {
  businessName: string
  phone: string
  tone: 'on-photo' | 'on-surface'
  inner?: boolean
  services?: ServiceItem[]
  locale?: PublicLocale
  locales?: string[]
  stickyOnScroll?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [mobileServices, setMobileServices] = useState(false)
  const [isDocked, setIsDocked] = useState(false)
  const lastScrollY = useRef(0)
  const touchY = useRef<number | null>(null)
  const upwardIntentAt = useRef(0)
  const upwardDistance = useRef(0)
  const reduce = useReducedMotion()
  const pathname = usePathname() || '/'
  const resolvedTone = isDocked ? 'on-surface' : tone
  const activeLocale: PublicLocale = pathname === '/hi' || pathname.startsWith('/hi/') ? 'hi' : locale
  const textColor = resolvedTone === 'on-photo' ? 'text-surface' : 'text-ink'
  const dividerColor = resolvedTone === 'on-photo' ? 'bg-surface/40' : 'bg-accent'
  const borderClass = resolvedTone === 'on-surface' ? 'border-b border-accent' : ''
  const links = serviceLinks(services).map((item) => ({ ...item, href: localeHref(item.href, activeLocale) }))
  const copy = chromeCopy[activeLocale].nav
  const navLinks = LINKS.map((link) => ({ ...link, href: localeHref(link.href, activeLocale), label: copy[link.key] }))
  const showHindi = locales.includes('hi')

  useEffect(() => {
    if (!open) setMobileServices(false)
  }, [open])

  useEffect(() => {
    if (!stickyOnScroll) return

    const markIntent = (direction: 'up' | 'down') => {
      if (direction === 'up') {
        upwardIntentAt.current = Date.now()
        return
      }
      upwardIntentAt.current = 0
      upwardDistance.current = 0
      setIsDocked(false)
    }

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 4) return
      markIntent(event.deltaY < 0 ? 'up' : 'down')
    }

    const onTouchStart = (event: TouchEvent) => {
      touchY.current = event.touches[0]?.clientY ?? null
    }

    const onTouchMove = (event: TouchEvent) => {
      const nextY = event.touches[0]?.clientY
      const previousY = touchY.current
      if (nextY == null || previousY == null) return
      const delta = nextY - previousY
      touchY.current = nextY
      if (Math.abs(delta) < 6) return
      markIntent(delta > 0 ? 'up' : 'down')
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'PageUp' || event.key === 'Home') markIntent('up')
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === 'End' || event.key === ' ') markIntent('down')
    }

    const onScroll = () => {
      const current = window.scrollY
      const delta = current - lastScrollY.current
      lastScrollY.current = current
      if (current <= window.innerHeight * 0.55) {
        upwardDistance.current = 0
        setIsDocked(false)
        return
      }
      if (delta > 6) {
        upwardDistance.current = 0
        setIsDocked(false)
        return
      }
      if (delta >= -6) return

      const hasRecentUpwardIntent = Date.now() - upwardIntentAt.current < 350
      if (!hasRecentUpwardIntent) return

      upwardDistance.current += Math.abs(delta)
      if (upwardDistance.current >= 36) setIsDocked(true)
    }

    lastScrollY.current = window.scrollY
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [stickyOnScroll])

  return (
    <>
      <motion.nav
        key={isDocked ? 'docked' : 'hero'}
        initial={isDocked && !reduce ? { opacity: 0, y: -64 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
        className={`${isDocked ? 'fixed inset-x-0 top-0 bg-surface/95 backdrop-blur-sm' : 'relative bg-transparent'} z-40 flex items-center justify-between gap-6 px-5 py-[clamp(20px,3vw,34px)] md:px-[clamp(20px,5vw,64px)] ${textColor} ${borderClass}`}
      >
        <Link href={localeHref('/', activeLocale)} className={`inline-flex items-center gap-3 ${textColor}`}>
          <BrandMark businessName={businessName} className="hidden size-10 md:grid" />
          <Wordmark
            as="h2"
            businessName={businessName}
            className="ai-type-wordmark-nav m-0 grid gap-[3px] font-medium leading-none"
          />
        </Link>

        <div className={`hidden items-center gap-8 font-normal lg:flex lg:[&_.ai-type-menu-item]:text-xs ${localeRoleClass(activeLocale, 'nav')}`}>
          {navLinks.map((link) =>
            link.key === 'services' ? (
              <ServicesDropdown
                key={link.href}
                items={links}
                textColor={isActiveLink(link.key, pathname) ? 'text-cta' : textColor}
                label={link.label}
                locale={activeLocale}
              />
            ) : (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActiveLink(link.key, pathname) ? 'page' : undefined}
                className={`${isActiveLink(link.key, pathname) ? 'text-cta' : textColor} transition-colors hover:text-cta`}
              >
                <h5 className="ai-type-menu-item m-0 font-normal">{link.label}</h5>
              </Link>
            ),
          )}
        </div>

        <div className={`hidden items-center gap-4 lg:flex ${localeRoleClass(activeLocale, 'label')}`}>
          {showHindi && <LanguageSwitcher activeLocale={activeLocale} pathname={pathname} tone={resolvedTone} />}
          <span className={`h-4 w-px ${dividerColor}`} />
          <a href={`tel:${phone}`} className={textColor}>
            {phone}
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? copy.closeMenu : copy.openMenu}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center bg-transparent lg:hidden"
        >
          <EditorialIcon name={open ? 'close' : 'bars'} className="h-4 w-4" />
        </button>
      </motion.nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-surface text-ink lg:hidden"
          >
            <motion.div
              initial={reduce ? false : { y: -18 }}
              animate={{ y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: -18, opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-screen flex-col px-6 py-6 sm:px-8"
            >
              <div className="flex items-center justify-between gap-5 border-b border-accent pb-5">
                <Link href={localeHref('/', activeLocale)} onClick={() => setOpen(false)} className="inline-flex items-center gap-3 text-ink">
                  <BrandMark businessName={businessName} className="size-10" />
                  <Wordmark
                    as="h2"
                    businessName={businessName}
                    className="ai-type-wordmark-nav m-0 grid gap-[3px] font-medium leading-none"
                  />
                </Link>
                <div className="flex items-center gap-3">
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

              <div className="ai-type-mobile-nav grid flex-1 content-center gap-1 py-10 font-display leading-none tracking-normal">
                {navLinks.map((link) =>
                  link.key === 'services' && links.length ? (
                    <div key={link.href} className="border-b border-hairline py-4">
                      <div className="flex items-center justify-between gap-5">
                        <button type="button" onClick={() => setMobileServices((value) => !value)} className="bg-transparent text-left text-ink">
                          <h5 className="ai-heading-reset m-0">{link.label}</h5>
                        </button>
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
                            <div className={`grid gap-4 pt-5 font-normal leading-snug text-accent ${localeRoleClass(activeLocale, 'meta')}`}>
                              {links.map((item) => (
                                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                  <h6 className="ai-heading-reset m-0">{item.title}</h6>
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
                      <h5 className="ai-heading-reset m-0">{link.label}</h5>
                    </Link>
                  ),
                )}
              </div>

              <div className="flex items-center justify-between gap-5 border-t border-accent pt-5">
                <a
                  href={`tel:${phone}`}
                  onClick={() => setOpen(false)}
                  className={`font-normal text-ink ${localeRoleClass(activeLocale, 'meta')}`}
                >
                  {phone}
                </a>
                {showHindi && <LanguageSwitcher activeLocale={activeLocale} pathname={pathname} tone="on-surface" onNavigate={() => setOpen(false)} />}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
