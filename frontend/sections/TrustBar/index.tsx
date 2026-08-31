import Image from 'next/image'
import type { SectionComponentProps } from '@/sections/registry'
import { FadeUpItem, Stagger } from '@/lib/motion'
import { localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'

function gridCols(count: number): string {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  if (count === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  return 'grid-cols-2 lg:grid-cols-4'
}

export function TrustBar({ config, site }: SectionComponentProps<'trustBar'>) {
  if (!config?.enabled || !config.stats?.length) return null

  const stats = config.stats.slice(0, 4)
  const locale = publicLocaleFromSite(site)

  return (
    <section id="trust-bar" className="border-t border-accent bg-surface px-5 py-[clamp(64px,9vw,120px)] text-ink md:px-[clamp(20px,5vw,64px)]">
      <Stagger className={`grid gap-[clamp(40px,5vw,72px)] ${gridCols(stats.length)}`}>
        {stats.map((stat, index) => {
          const serviceItem = site.sections.services?.items?.[index]

          return (
            <FadeUpItem
              key={`${stat.value}-${stat.label}`}
              className="grid min-w-0 content-start gap-[22px] text-left"
            >
              {serviceItem?.image && (
                <div className="relative aspect-[4/3] overflow-hidden bg-hairline">
                  <Image src={serviceItem.image} alt={stat.label} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
                </div>
              )}
              <div className="flex items-end gap-4">
                <h3 className="ai-type-trust-value m-0 shrink-0 font-display font-medium leading-none tracking-[-0.03em] text-ink">
                  {stat.value}
                </h3>
                <h5 className={`ai-type-trust-label m-0 max-w-xs font-medium leading-relaxed text-accent ${localeRoleClass(locale, 'label')}`}>
                  {stat.label.split(' · ')[0]}
                </h5>
              </div>
            </FadeUpItem>
          )
        })}
      </Stagger>
    </section>
  )
}
