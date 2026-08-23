'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
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
  { href: '/', label: 'HOME' },
  { href: '/#services', label: 'SERVICES' },
  { href: '/#about', label: 'ABOUT' },
  { href: '/portfolio', label: 'PORTFOLIO' },
  { href: '/#contact', label: 'CONTACT' },
]

function serviceLinks(items: ServiceItem[]): Array<{ title: string; href: string }> {
  return items.flatMap((item) => {
    const href = serviceHref(item)
    return href ? [{ title: item.title, href }] : []
  })
}

function ServicesDropdown({
  items,
  textColor,
  onNavigate,
}: {
  items: Array<{ title: string; href: string }>
  textColor: string
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
        SERVICES
      </Link>
    )
  }

  const primaryHref = items[0]?.href ?? '/#services'

  return (
    <div ref={root} className="relative inline-flex items-center gap-1">
      <Link href={primaryHref} className={textColor} onClick={onNavigate}>
        SERVICES
      </Link>
      <button
        type="button"
        aria-label="Open services menu"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex min-h-11 items-center bg-transparent ${textColor}`}
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
              className="block px-4 py-3 text-[11px] font-normal uppercase tracking-[0.18em] text-ink hover:bg-panel hover:text-accent"
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
}: {
  businessName: string
  phone: string
  tone: 'on-photo' | 'on-surface'
  inner?: boolean
  services?: ServiceItem[]
}) {
  const [open, setOpen] = useState(false)
  const [mobileServices, setMobileServices] = useState(false)
  const reduce = useReducedMotion()
  const textColor = tone === 'on-photo' ? 'text-surface' : 'text-ink'
  const dividerColor = tone === 'on-photo' ? 'bg-surface/40' : 'bg-accent'
  const borderClass = tone === 'on-surface' ? 'border-b border-accent' : ''
  const links = serviceLinks(services)

  useEffect(() => {
    if (!open) setMobileServices(false)
  }, [open])

  return (
    <>
      <nav
        className={`relative z-40 flex items-center justify-between gap-6 px-5 py-[clamp(20px,3vw,34px)] md:px-[clamp(20px,5vw,64px)] ${textColor} ${borderClass} bg-transparent`}
      >
        <Link href="/" className={textColor}>
          <Wordmark
            businessName={businessName}
            className="grid gap-[3px] text-[13px] font-medium leading-none tracking-[0.26em]"
          />
        </Link>

        <div className="hidden items-center gap-8 text-[11.5px] font-normal tracking-[0.2em] md:flex">
          {LINKS.map((link) =>
            link.label === 'SERVICES' ? (
              <ServicesDropdown key={link.href} items={links} textColor={textColor} />
            ) : (
              <Link key={link.href} href={link.href} className={textColor}>
                {link.label}
              </Link>
            ),
          )}
        </div>

        <div className="hidden items-center gap-4 text-xs tracking-[0.14em] md:flex">
          <span className={`h-4 w-px ${dividerColor}`} />
          <a href={`tel:${phone}`} className={textColor}>
            {phone}
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
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
                <Link href="/" onClick={() => setOpen(false)} className="text-ink">
                  <Wordmark
                    businessName={businessName}
                    className="grid gap-[3px] text-[13px] font-medium leading-none tracking-[0.26em]"
                  />
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-11 items-center justify-center bg-transparent text-ink"
                >
                  <EditorialIcon name="close" className="h-4 w-4" />
                </button>
              </div>

              <div className="grid flex-1 content-center gap-1 py-10 text-[clamp(28px,10vw,54px)] font-display uppercase leading-none tracking-normal">
                {LINKS.map((link) =>
                  link.label === 'SERVICES' && links.length ? (
                    <div key={link.href} className="border-b border-hairline py-4">
                      <div className="flex items-center justify-between gap-5">
                        <Link href={links[0]?.href ?? '/#services'} onClick={() => setOpen(false)} className="text-ink">
                          SERVICES
                        </Link>
                        <button
                          type="button"
                          aria-label="Open services menu"
                          aria-expanded={mobileServices}
                          onClick={() => setMobileServices((value) => !value)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center bg-transparent text-ink"
                        >
                          <EditorialIcon
                            name="chevron-down"
                            className={`h-3.5 w-3.5 transition-transform ${mobileServices ? 'rotate-180' : ''}`}
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
                            <div className="grid gap-3 pt-5 text-[12px] font-normal uppercase leading-snug tracking-[0.16em] text-accent">
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
