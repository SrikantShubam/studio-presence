'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { SectionComponentProps } from '@/sections/registry'
import { chromeCopy, localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'

function autoAdvanceRail(rail: HTMLDivElement | null) {
  if (!rail || rail.scrollWidth <= rail.clientWidth) return
  const firstCard = rail.querySelector<HTMLElement>('[data-instagram-card]')
  const step = firstCard ? firstCard.offsetWidth + 28 : rail.clientWidth
  const atEnd = rail.scrollLeft + rail.clientWidth + step >= rail.scrollWidth
  rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft + step, behavior: 'smooth' })
}

export function Instagram({ config, site }: SectionComponentProps<'instagram'>) {
  const railRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].instagram

  const enabled = Boolean(config?.enabled && config.embedPostUrls?.length)
  const gallery = enabled
    ? site.sections.portfolio.projects
        .flatMap((project) => project.images)
        .filter(Boolean)
        .slice(0, config?.embedPostUrls.length ?? 0)
    : []

  useEffect(() => {
    if (reduce || paused || gallery.length < 2) return
    const timer = window.setInterval(() => autoAdvanceRail(railRef.current), 3600)
    return () => window.clearInterval(timer)
  }, [gallery.length, paused, reduce])

  if (!config?.enabled || !config.embedPostUrls?.length || !gallery.length) return null

  return (
    <section id="instagram" className="border-t border-accent bg-surface px-5 py-[clamp(64px,8vw,110px)] text-ink sm:px-8 lg:px-16">
      <div>
        <div className="mb-[clamp(32px,4vw,52px)] flex flex-wrap items-end justify-between gap-5">
          <div className={`grid gap-1.5 leading-relaxed text-accent ${localeRoleClass(locale, 'eyebrow')}`}>
            {copy.eyebrow.map((line) => <h2 key={line} className="ai-type-instagram-heading m-0 font-display font-light leading-tight">{line}</h2>)}
          </div>
          {config.handle && (
            <a href={`https://instagram.com/${config.handle.replace(/^@/, '')}`} className={`inline-flex items-center gap-2 pb-1 font-medium text-ink hover:text-accent ${localeRoleClass(locale, 'button')}`}>
              <EditorialIcon name="instagram" className="h-5 w-5" />
              {copy.follow} {config.handle}{' '}
            </a>
          )}
        </div>
        <div
          ref={railRef}
          className="-mx-5 flex snap-x snap-proximity gap-[clamp(20px,3vw,34px)] overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {gallery.map((image, index) => (
            <div key={image} data-instagram-card className="relative min-w-0 flex-[0_0_72%] snap-start sm:flex-[0_0_34%] lg:flex-1">
              <div className="pointer-events-none absolute -top-3 left-3 right-3 bottom-3 border border-accent" />
              <div className="relative aspect-square overflow-hidden bg-hairline">
                <Image src={image} alt={`${site.business.name} ${copy.imageAlt} ${index + 1}`} fill sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 100vw" className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
