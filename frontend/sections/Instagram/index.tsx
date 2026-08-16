import Image from 'next/image'
import type { SectionComponentProps } from '@/sections/registry'
import { EditorialIcon } from '@/lib/icons'

/** Fixed UI framing, identical for every client — not content, so not config. */
const EYEBROW = ['From the site,', 'Week by week']
const FOLLOW_PREFIX = 'Follow'

export function Instagram({ config, site }: SectionComponentProps<'instagram'>) {
  if (!config?.enabled || !config.embedPostUrls?.length) return null

  const gallery = site.sections.portfolio.projects
    .flatMap((project) => project.images)
    .filter(Boolean)
    .slice(0, config.embedPostUrls.length)
  if (!gallery.length) return null

  return (
    <section id="instagram" className="border-t border-accent bg-surface px-5 py-[clamp(64px,8vw,110px)] text-ink sm:px-8 lg:px-16">
      <div>
        <div className="mb-[clamp(32px,4vw,52px)] flex flex-wrap items-end justify-between gap-5">
          <div className="grid gap-1.5 text-[10.5px] uppercase leading-relaxed tracking-[0.24em] text-accent">
            {EYEBROW.map((line) => <span key={line}>{line}</span>)}
          </div>
          {config.handle && (
            <a href={config.embedPostUrls[0]} className="pb-1 text-[11.5px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent">
              {FOLLOW_PREFIX} {config.handle}{' '}
              <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,130px),1fr))] gap-[clamp(20px,3vw,34px)]">
          {gallery.map((image, index) => (
            <div key={image} className="relative min-w-0">
              <div className="pointer-events-none absolute -top-3 left-3 right-3 bottom-3 border border-accent" />
              <div className="relative aspect-square overflow-hidden bg-hairline">
                <Image src={image} alt={`${site.business.name} studio work ${index + 1}`} fill sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 100vw" className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
