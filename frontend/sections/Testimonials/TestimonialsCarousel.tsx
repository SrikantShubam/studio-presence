'use client'

import { useState } from 'react'
import type { TestimonialsConfig } from './shared'
import { TestimonialByline, TestimonialPhoto } from './shared'

function counter(current: number, total: number): string {
  return `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
}

export function TestimonialsCarousel({ config }: { config: TestimonialsConfig }) {
  const [index, setIndex] = useState(0)

  if (!config.enabled || !config.items.length) return null

  const total = config.items.length
  const item = config.items[index] ?? config.items[0]
  if (!item) return null

  const go = (next: number) => setIndex((next + total) % total)

  return (
    <section id="testimonials" className="relative overflow-hidden border-y border-accent bg-surface px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-[clamp(64px,5vw,72px)] lg:py-28">
      <span
        aria-hidden
        className="pointer-events-none absolute top-[34%] left-1/2 -translate-x-1/2 select-none font-display text-[clamp(200px,30vw,480px)] font-extralight leading-[0.7] text-transparent [-webkit-text-stroke:1px_var(--t-hairline)]"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/*
       * The reference mockup (design/reference/editorial/testimonials---carousel-variant.html)
       * has a small eyebrow tag above the heading — "(SAY) IN THEIR OWN WORDS" — that
       * isn't reproduced here. See sections/Services/ServicesDetailed.tsx's comment for
       * the reasoning: fabricated copy for a field the schema doesn't have.
       */}
      <div className="relative mb-14 grid gap-6 md:mb-24">
        <h2 className="m-0 font-display text-[clamp(42px,10vw,100px)] font-extralight uppercase leading-[0.86] tracking-tight">
          What
          <span className="block pl-[0.5em] text-accent">Clients Say</span>
        </h2>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 md:grid-cols-[46px_minmax(0,1fr)_46px] md:gap-10">
        {total > 1 && (
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => go(index - 1)}
            className="hidden h-[46px] w-[46px] items-center justify-center border-0 border-b border-accent bg-transparent p-0 text-base text-ink transition-colors hover:text-accent md:flex"
          >
            &lt;-
          </button>
        )}

        <div className="grid min-w-0 justify-items-center gap-8 text-center md:gap-12">
          <blockquote className="m-0 max-w-[22em] min-w-0">
            <p className="m-0 text-balance font-display text-[clamp(24px,4.3vw,52px)] font-extralight leading-tight tracking-tight text-ink">
              {item.quote}
            </p>
          </blockquote>

          <footer className="flex min-w-0 flex-wrap items-center justify-center gap-4">
            <TestimonialPhoto item={item} size="large" />
            <TestimonialByline item={item} align="center" showRule />
          </footer>
        </div>

        {total > 1 && (
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => go(index + 1)}
            className="hidden h-[46px] w-[46px] items-center justify-center justify-self-end border-0 border-b border-accent bg-transparent p-0 text-base text-ink transition-colors hover:text-accent md:flex"
          >
            -&gt;
          </button>
        )}
      </div>

      {total > 1 && (
        <>
          <div className="relative mt-12 flex min-w-0 flex-wrap items-center justify-center gap-2 md:mt-20">
            {config.items.map((dash, dashIndex) => (
              <button
                key={`${dash.author}-${dashIndex}`}
                type="button"
                aria-label={`Show testimonial ${dashIndex + 1}`}
                onClick={() => go(dashIndex)}
                className="flex h-9 items-center bg-transparent p-0"
              >
                <span
                  className={`block h-px ${dashIndex === index ? 'w-9 bg-ink' : 'w-5 bg-hairline'}`}
                />
              </button>
            ))}
            <span className="ml-3 text-[10px] font-normal uppercase tracking-[0.22em] text-muted">
              {counter(index, total)}
            </span>
          </div>

          <div className="relative mt-5 flex justify-center gap-3 md:hidden">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => go(index - 1)}
              className="flex h-[46px] w-[46px] items-center justify-center border border-accent bg-transparent p-0 text-base text-ink"
            >
              &lt;-
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => go(index + 1)}
              className="flex h-[46px] w-[46px] items-center justify-center border border-accent bg-transparent p-0 text-base text-ink"
            >
              -&gt;
            </button>
          </div>
        </>
      )}
    </section>
  )
}
