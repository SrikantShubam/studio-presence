'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { ClientConfig } from '@studio/backend'
import { chromeCopy, publicLocaleFromSite } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine } from '@/lib/motion'
import type { TestimonialsConfig, Testimonial } from './shared'

/** Fixed UI framing, identical for every client — not content, so not config. */
const arrows = { prev: 'Previous', next: 'Next' }
const ease = [0.22, 1, 0.36, 1] as const

function wrap(index: number, total: number): number {
  return ((index % total) + total) % total
}

function Stars({ className }: { className?: string }) {
  return (
    <div className={`mb-3.5 flex gap-1 text-[13px] tracking-[0.16em] text-cta ${className ?? ''}`} aria-hidden>
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
    </div>
  )
}

function FeaturedCard({ item }: { item: Testimonial }) {
  const textOnly = !item.image

  return (
    <article
      className={`grid min-h-[320px] gap-[clamp(20px,3vw,32px)] border border-accent bg-surface p-[clamp(22px,3vw,38px)] ${
        textOnly ? 'place-items-center text-center' : 'sm:grid-cols-[minmax(160px,230px)_minmax(0,1fr)]'
      }`}
    >
      {item.image ? (
        <div className="relative aspect-[3/4] min-h-[220px] overflow-hidden bg-hairline">
          <Image src={item.image} alt="" fill sizes="230px" className="object-cover" />
        </div>
      ) : null}
      <div className={`flex min-w-0 flex-col justify-between gap-6 ${textOnly ? 'max-w-[34em] items-center' : ''}`}>
        <p className="m-0 text-pretty text-[clamp(17px,2vw,24px)] font-normal leading-[1.5] text-ink">
          “{item.quote}”
        </p>
        <div className={textOnly ? 'text-center' : undefined}>
          <Stars className={textOnly ? 'justify-center' : undefined} />
          <div className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-ink">{item.author}</div>
          {item.context ? (
            <div className="mt-1.5 text-[10.5px] uppercase tracking-[0.16em] text-accent">{item.context}</div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

const slide = {
  enter: (direction: number) => ({ x: direction > 0 ? '14%' : '-14%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? '-14%' : '14%', opacity: 0 }),
}

export function TestimonialsCards({ config, site }: { config: TestimonialsConfig; site: ClientConfig }) {
  const items = config.items
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].testimonials

  const featured = items[index]

  useEffect(() => {
    if (paused || reduce || items.length < 2) return
    const timer = window.setInterval(() => {
      setDirection(1)
      setIndex((current) => wrap(current + 1, items.length))
    }, 5000)
    return () => window.clearInterval(timer)
  }, [paused, reduce, items.length])

  if (!config.enabled || !items.length || !featured) return null

  const go = (delta: number) => {
    setDirection(delta)
    setIndex((current) => wrap(current + delta, items.length))
  }

  return (
    <section
      id="testimonials"
      className="border-t border-accent bg-panel px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,120px)] text-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-[clamp(36px,5vw,64px)] flex flex-wrap items-end justify-between gap-6">
        <h2 className="ai-type-testimonial-heading m-0 font-display font-light uppercase leading-[0.88] tracking-[-0.03em]">
          <ClipLine>{copy.title.lead}</ClipLine>
          <ClipLine className="pl-[0.55em] text-accent" delay={0.08}>
            {copy.title.accent}
          </ClipLine>
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          {items.length > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={arrows.prev}
                onClick={() => go(-1)}
                className="grid h-11 w-11 place-items-center border border-accent text-ink transition-colors hover:bg-ink hover:text-surface"
              >
                <EditorialIcon name="chevron-left" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={arrows.next}
                onClick={() => go(1)}
                className="grid h-11 w-11 place-items-center border border-accent text-ink transition-colors hover:bg-ink hover:text-surface"
              >
                <EditorialIcon name="chevron-right" className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl min-w-0 gap-6">
        <div className="relative min-h-[320px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${featured.author}-${featured.quote}`}
              custom={direction}
              variants={reduce ? undefined : slide}
              initial={reduce ? false : 'enter'}
              animate="center"
              exit={reduce ? undefined : 'exit'}
              transition={{ duration: 0.45, ease }}
            >
              <FeaturedCard item={featured} />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  )
}
