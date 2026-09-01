'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { chromeCopy, localeHref, localePageClass, localeRoleClass, localeTextClass, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine } from '@/lib/motion'

const ease = [0.22, 1, 0.36, 1] as const

export function NotFoundView() {
  const reduce = useReducedMotion()
  const pathname = usePathname() || '/'
  const locale: PublicLocale = pathname === '/hi' || pathname.startsWith('/hi/') ? 'hi' : 'en'
  const copy = chromeCopy[locale].notFound

  return (
    <div lang={locale} data-public-locale={locale} className={`flex min-h-screen flex-col overflow-x-clip bg-surface text-ink ${localePageClass(locale)}`}>
      <main className="grid flex-1 items-center gap-[clamp(32px,6vw,88px)] px-[clamp(20px,5vw,64px)] py-[clamp(56px,10vw,140px)] min-[720px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0">
          <p className={`mb-[clamp(20px,3vw,34px)] m-0 grid gap-1.5 font-normal leading-[1.6] text-accent ${localeRoleClass(locale, 'eyebrow')}`}>
            {copy.eyebrow.map((line, index) => (
              <ClipLine key={line} delay={index * 0.05}>
                {line}
              </ClipLine>
            ))}
          </p>
          <h1 className={`m-0 font-display text-[clamp(46px,9vw,116px)] font-light leading-[0.95] text-ink ${localeRoleClass(locale, 'sectionTitle')}`}>
            <ClipLine>{copy.title.lead}</ClipLine>
            <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
              {copy.title.accent}
            </ClipLine>
          </h1>
          <motion.p
            className="mt-[clamp(28px,4vw,44px)] mb-0 max-w-[26em] text-pretty text-[clamp(16px,1.8vw,19px)] leading-[1.6] text-body"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.28 }}
          >
            {copy.body}
          </motion.p>
          <motion.div
            className="mt-[clamp(32px,4.5vw,52px)] flex flex-wrap gap-3.5"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.4 }}
          >
            <Link
              href={localeHref('/', locale)}
              className={`inline-flex min-h-11 items-center gap-3.5 bg-cta px-[34px] py-5 font-medium text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] hover:bg-ink hover:text-cta ${localeRoleClass(locale, 'button')}`}
            >
              {copy.home}
              <EditorialIcon name="arrow-right" className="h-3 w-3" />
            </Link>
          </motion.div>
          <motion.div
            className={`mt-[clamp(32px,4vw,48px)] flex flex-wrap gap-x-[clamp(18px,2.6vw,32px)] gap-y-3 border-t border-accent pt-[22px] font-medium ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.52 }}
          >
            {copy.links.map((item) => (
              <Link key={item.href} href={localeHref(item.href, locale)} className="text-ink hover:text-accent">
                {item.label}
              </Link>
            ))}
          </motion.div>
        </div>

        <div className="relative hidden min-h-[340px] items-center justify-center min-[720px]:flex">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-[52px] left-[26px] right-[-26px] top-0 border border-accent"
            initial={reduce ? false : { opacity: 0, x: 18, y: -18 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.2 }}
          />
          <motion.div
            className="relative mr-[26px] mt-[26px] grid aspect-[4/5] w-full max-w-[420px] place-items-center overflow-hidden border border-hairline"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.12 }}
          >
            <motion.span
              className="font-display text-[clamp(120px,15vw,220px)] font-light leading-[0.8] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]"
              initial={reduce ? false : { y: 40, opacity: 0 }}
              animate={reduce ? { y: 0, opacity: 1 } : { y: [0, -8, 0], opacity: 1 }}
              transition={
                reduce
                  ? { duration: 0.4 }
                  : {
                      y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.9 },
                      opacity: { duration: 0.7, ease, delay: 0.35 },
                    }
              }
            >
              404
            </motion.span>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
