import type { SectionConfig } from '@studio/backend'
import Link from 'next/link'
import { EditorialIcon } from '@/lib/icons'
import { serviceHref, serviceNumber } from './shared'

/**
 * The reference mockup (design/reference/editorial/services---grid-compact.html)
 * has a small eyebrow tag above the heading — "(SVC) What we take on" — that
 * isn't reproduced here. See ServicesDetailed.tsx's comment for the reasoning:
 * fabricated copy for a field the schema doesn't have.
 */
const TITLE = { lead: 'Our', accent: 'Services' }
const READ_MORE = 'Read more'

export function ServicesCompact({ config }: { config: SectionConfig<'services'> }) {
  return (
    <section id="services" className="border-y border-accent bg-surface px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <div className="border-b border-accent pb-12">
        <h2 className="m-0 font-display text-[clamp(42px,13vw,104px)] font-extralight uppercase leading-[0.86] tracking-tight">
          {TITLE.lead}
          <span className="block pl-[0.5em] text-accent">{TITLE.accent}</span>
        </h2>
      </div>

      <div className="grid">
        {config.items.map((item, index) => {
          const href = serviceHref(item)

          return (
            <article
              key={`${item.title}-${index}`}
              className="group grid min-w-0 gap-4 border-b border-accent py-8 text-ink transition-colors duration-300 hover:bg-panel sm:grid-cols-[auto_minmax(0,0.95fr)] sm:gap-x-8 md:grid-cols-[auto_minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-baseline lg:grid-cols-[auto_minmax(0,0.8fr)_minmax(0,1.15fr)_auto]"
            >
              <span
                aria-hidden
                className="select-none font-display text-[clamp(52px,15vw,104px)] font-extralight leading-[0.78] tracking-tight text-transparent transition-[color] duration-300 [-webkit-text-stroke:1px_var(--t-hairline)] group-hover:[-webkit-text-stroke:1px_var(--color-accent)]"
              >
                {serviceNumber(index)}
              </span>

              <h3 className="m-0 min-w-0 max-w-full break-words font-display text-[clamp(21px,7vw,40px)] font-light uppercase leading-tight tracking-tight transition-colors duration-300 group-hover:text-accent">
                {item.title}
              </h3>

              <p className="m-0 min-w-0 max-w-prose text-sm leading-relaxed text-muted sm:col-start-2 md:col-start-auto md:text-base">
                {item.blurb}
              </p>

              {href ? (
                <Link
                  href={href}
                  className="inline-flex min-h-11 items-center gap-3.5 justify-self-start bg-cta px-[34px] py-5 text-[clamp(10.5px,1.1vw,12px)] font-medium uppercase tracking-[0.18em] text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] hover:bg-ink hover:text-cta lg:justify-self-end"
                >
                  {READ_MORE}
                  <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
