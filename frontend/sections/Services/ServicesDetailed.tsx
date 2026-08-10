import Image from 'next/image'
import type { SectionConfig } from '@studio/backend'
import { ServiceLink, serviceNumber } from './shared'

/**
 * The reference mockup (design/reference/editorial/home-sections/services.html)
 * has a small eyebrow above the heading — "DOING OUR JOB FROM THE BOTTOM OF OUR
 * HEARTS" — that isn't reproduced here. It's tonal, owner-voice copy specific to
 * how one studio wants to sound, not structural chrome like a nav label, and the
 * services schema has no field for it. AGENTS.md's "no copy" rule applies:
 * fabricating that line for every client would put the same sentence on studios
 * whose actual voice is nothing like it.
 */

function imageFrameClasses(index: number): string {
  return index % 2 === 0
    ? 'sm:mr-7 sm:mb-7'
    : 'sm:ml-7 sm:mb-7 md:order-2'
}

function offsetFrameClasses(index: number): string {
  return index % 2 === 0
    ? 'sm:-top-7 sm:-left-7 sm:right-7 sm:bottom-7'
    : 'sm:-top-7 sm:left-7 sm:-right-7 sm:bottom-7'
}

function numeralPositionClasses(index: number, hasImage: boolean): string {
  if (!hasImage) return 'left-0'
  return index % 2 === 0 ? 'right-0' : 'left-0'
}

export function ServicesDetailed({ config }: { config: SectionConfig<'services'> }) {
  return (
    <section id="services" className="border-t border-accent bg-surface px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] md:items-end md:gap-16">
        <h2 className="m-0 font-display text-[clamp(46px,13vw,112px)] font-light uppercase leading-[0.88] tracking-tight">
          Our
          <span className="block pl-[0.55em] text-accent">Services</span>
        </h2>

        <p className="m-0 max-w-prose text-sm leading-relaxed text-muted">
          {config.items.map((item) => item.title).join(' / ')}
        </p>
      </div>

      <div className="grid gap-16 md:gap-20 lg:gap-24">
        {config.items.map((item, index) => {
          const hasImage = Boolean(item.image)

          return (
            <ServiceLink
              key={`${item.title}-${index}`}
              item={item}
              className={`grid min-w-0 gap-8 text-ink ${
                hasImage ? 'md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:items-center lg:gap-20' : ''
              }`}
            >
              {item.image && (
                <div className={`relative ${imageFrameClasses(index)}`}>
                  <div
                    className={`pointer-events-none absolute hidden border border-accent sm:block ${offsetFrameClasses(
                      index,
                    )}`}
                  />
                  <div className="relative aspect-[4/3] overflow-hidden bg-hairline">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="relative min-w-0 pt-10">
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -top-8 select-none font-display text-[clamp(100px,22vw,190px)] font-light leading-none text-transparent [-webkit-text-stroke:1px_var(--t-hairline)] ${numeralPositionClasses(
                    index,
                    hasImage,
                  )}`}
                >
                  {serviceNumber(index)}
                </span>

                <div className="relative flex min-w-0 items-center gap-5">
                  <h3 className="m-0 min-w-0 break-words font-display text-[clamp(26px,8vw,40px)] font-normal uppercase leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <span className="hidden h-px max-w-16 flex-1 bg-ink sm:block" aria-hidden />
                </div>

                <p className="relative m-0 mt-6 max-w-prose text-sm leading-loose text-muted md:text-[15px]">
                  {item.blurb}
                </p>
              </div>
            </ServiceLink>
          )
        })}
      </div>
    </section>
  )
}
