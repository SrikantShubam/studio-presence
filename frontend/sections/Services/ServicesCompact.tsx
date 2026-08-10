import type { SectionConfig } from '@studio/backend'
import { ServiceLink, serviceNumber } from './shared'

/**
 * The reference mockup (design/reference/editorial/services---grid-compact.html)
 * has a small eyebrow tag above the heading — "(SVC) WHAT WE TAKE ON" — that
 * isn't reproduced here. See ServicesDetailed.tsx's comment for the reasoning:
 * fabricated copy for a field the schema doesn't have.
 */

export function ServicesCompact({ config }: { config: SectionConfig<'services'> }) {
  return (
    <section id="services" className="border-y border-accent bg-surface px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <div className="border-b border-accent pb-12">
        <h2 className="m-0 font-display text-[clamp(42px,13vw,104px)] font-extralight uppercase leading-[0.86] tracking-tight">
          Our
          <span className="block pl-[0.5em] text-accent">Services</span>
        </h2>
      </div>

      <div className="grid">
        {config.items.map((item, index) => (
          <ServiceLink
            key={`${item.title}-${index}`}
            item={item}
            className="grid min-w-0 gap-4 border-b border-accent py-8 text-ink transition-colors hover:bg-muted/10 sm:grid-cols-[auto_minmax(0,0.95fr)] sm:gap-x-8 md:grid-cols-[auto_minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-baseline lg:grid-cols-[auto_minmax(0,0.8fr)_minmax(0,1.15fr)_auto]"
          >
            <span
              aria-hidden
              className="select-none font-display text-[clamp(52px,15vw,104px)] font-extralight leading-[0.78] tracking-tight text-transparent [-webkit-text-stroke:1px_var(--t-hairline)]"
            >
              {serviceNumber(index)}
            </span>

            <h3 className="m-0 min-w-0 max-w-full break-words font-display text-[clamp(21px,7vw,40px)] font-light uppercase leading-tight tracking-tight">
              {item.title}
            </h3>

            <p className="m-0 min-w-0 max-w-prose text-sm leading-relaxed text-muted sm:col-start-2 md:col-start-auto md:text-base">
              {item.blurb}
            </p>

            {item.slug && (
              <span className="hidden justify-self-end text-accent lg:block" aria-hidden>
                -&gt;
              </span>
            )}
          </ServiceLink>
        ))}
      </div>
    </section>
  )
}
