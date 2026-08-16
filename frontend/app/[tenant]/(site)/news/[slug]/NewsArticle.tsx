import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, DrawFrame, FadeUp, HomeSection, RevealImage } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'

type NewsItem = NonNullable<ClientConfig['sections']['news']>['items'][number]

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  back: 'All news & press',
  related: 'The project this is about',
  caseStudy: 'Read the case study',
  previous: 'Previous item',
  next: 'Next item',
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

/** Splits a title into a two-line lead/accent treatment — same approach as About/index.tsx. */
function splitTitle(title: string): { lead: string; accent: string | null } {
  const words = title.trim().split(/\s+/)
  if (words.length < 2) return { lead: title, accent: null }
  return { lead: words.slice(0, -1).join(' '), accent: words.at(-1) ?? null }
}

function relatedHref(item: NewsItem, site: ClientConfig) {
  const slug = item.related?.slug
  if (slug && site.sections.portfolio.projects.some((project) => project.slug === slug)) {
    return `/portfolio/${slug}`
  }
  return '/portfolio'
}

export function NewsArticle({ site, item, allItems }: { site: ClientConfig; item: NewsItem; allItems: NewsItem[] }) {
  const index = Math.max(0, allItems.findIndex((entry) => entry.slug === item.slug))
  const prev = allItems[(index - 1 + allItems.length) % allItems.length] ?? item
  const next = allItems[(index + 1) % allItems.length] ?? item
  const closing = renderableSections(site, ['footer'])
  const numeral = String(index + 1).padStart(2, '0')
  const title = splitTitle(item.title)

  return (
    <article className="overflow-x-clip bg-surface text-ink">
      <HeroNav
        businessName={site.business.name}
        phone={site.business.phone}
        tone="on-surface"
        inner
        services={site.sections.services?.items}
      />
      <HomeSection first>
        <section className={`${pagePad} pt-[clamp(32px,4vw,56px)]`}>
          <Link
            href="/news"
            className="inline-flex min-h-11 items-center gap-2 py-2.5 text-[11.5px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent"
          >
            <EditorialIcon name="arrow-left" className="h-3 w-3" />
            {copy.back}
          </Link>
          <div className="mt-[clamp(28px,4vw,44px)] flex flex-wrap gap-x-[clamp(20px,3vw,36px)] gap-y-3 text-[10.5px] font-medium uppercase tracking-[0.22em]">
            {item.category && <span className="text-accent">{item.category}</span>}
            <span className="text-muted">{item.date}</span>
          </div>
          <h1 className="mt-[clamp(18px,2.6vw,28px)] mb-0 max-w-[22em] font-display text-[clamp(34px,6vw,80px)] font-light uppercase leading-[0.92] tracking-[-0.03em] text-ink">
            <ClipLine>{title.lead}</ClipLine>
            {title.accent && (
              <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
                {title.accent}
              </ClipLine>
            )}
          </h1>
        </section>
      </HomeSection>
      {item.photo && (
        <HomeSection>
          <section className={`${pagePad} pb-[clamp(48px,6vw,88px)] pt-[clamp(36px,5vw,72px)]`}>
            <div className="relative mr-[clamp(20px,3vw,30px)] mt-[clamp(20px,3vw,30px)]">
              <DrawFrame className="pointer-events-none absolute -top-[clamp(20px,3vw,30px)] bottom-[clamp(20px,3vw,30px)] left-[clamp(20px,3vw,30px)] right-[calc(clamp(20px,3vw,30px)*-1)] border border-accent" />
              <div className="relative aspect-[4/3] overflow-hidden bg-hairline min-[720px]:aspect-video">
                <RevealImage>
                  <Image src={item.photo} alt="" fill sizes="100vw" quality={90} priority className="object-cover" />
                </RevealImage>
              </div>
            </div>
          </section>
        </HomeSection>
      )}
      <HomeSection>
        <section className={`${pagePad} pb-[clamp(56px,8vw,100px)]`}>
          <div className="grid grid-cols-1 items-start gap-[clamp(28px,6vw,88px)] min-[1080px]:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)]">
            <div className="grid content-start gap-[22px] pt-1.5">
              <span className="font-display text-[clamp(60px,7vw,110px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
                {numeral}
              </span>
              {item.standfirst && (
                <span className="max-w-[20em] text-[11px] font-medium uppercase leading-[1.7] tracking-[0.2em] text-accent">
                  {item.standfirst}
                </span>
              )}
            </div>
            <div className="grid max-w-[40em] gap-6">
              {item.lead && (
                <FadeUp>
                  <p className="m-0 text-pretty text-[clamp(17px,1.9vw,21px)] leading-[1.6] text-ink">{item.lead}</p>
                </FadeUp>
              )}
              {item.body.map((part) => (
                <FadeUp key={part.slice(0, 28)}>
                  <p className="m-0 text-pretty text-justify text-base leading-[1.75] text-body">{part}</p>
                </FadeUp>
              ))}
              {item.pullquote && (
                <blockquote className="my-[clamp(14px,2vw,22px)] border-y border-accent py-[clamp(22px,3vw,34px)]">
                  <p className="m-0 text-pretty text-[clamp(19px,2.4vw,30px)] font-light leading-[1.45] tracking-[-0.01em] text-ink">
                    {item.pullquote}
                  </p>
                  {item.pullattr && (
                    <footer className="mt-[18px] text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">
                      {item.pullattr}
                    </footer>
                  )}
                </blockquote>
              )}
              {item.subhead && (
                <h2 className="mt-[clamp(8px,1.4vw,14px)] mb-0 text-[clamp(20px,2.4vw,28px)] font-normal uppercase tracking-[-0.01em]">
                  {item.subhead}
                </h2>
              )}
              {item.after.map((part) => (
                <FadeUp key={part.slice(0, 28)}>
                  <p className="m-0 text-pretty text-justify text-base leading-[1.75] text-body">{part}</p>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      </HomeSection>
      {item.related ? (
        <HomeSection>
          <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(48px,7vw,90px)]`}>
            <h2 className="mb-[clamp(24px,3.4vw,40px)] m-0 text-[clamp(13px,1.5vw,16px)] font-medium uppercase tracking-[0.24em] text-accent">
              {copy.related}
            </h2>
            <Link
              href={relatedHref(item, site)}
              className="group grid grid-cols-1 items-center gap-[clamp(20px,3vw,44px)] border border-accent bg-surface p-[clamp(18px,2.4vw,26px)] text-ink transition-colors hover:bg-panel min-[720px]:grid-cols-[minmax(200px,320px)_minmax(0,1fr)]"
            >
              {item.related.image && (
                <span className="relative aspect-[4/3] overflow-hidden bg-hairline">
                  <Image src={item.related.image} alt="" fill sizes="320px" quality={90} className="object-cover" />
                </span>
              )}
              <span className="grid gap-3.5">
                <span className="text-[clamp(20px,2.6vw,32px)] font-normal uppercase leading-[1.1] tracking-[-0.01em]">
                  {item.related.title}
                </span>
                <span className="inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.2em]">
                  {copy.caseStudy}
                  <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
                </span>
              </span>
            </Link>
          </section>
        </HomeSection>
      ) : null}
      {allItems.length > 1 && (
        <section className="grid grid-cols-1 border-y border-accent min-[720px]:grid-cols-2">
          <Link
            href={`/news/${prev.slug}`}
            className="grid gap-3 border-b border-accent px-[clamp(20px,5vw,64px)] py-[clamp(28px,4vw,52px)] text-left text-ink transition-colors hover:bg-panel min-[720px]:border-r min-[720px]:border-b-0"
          >
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
              ← {copy.previous}
            </span>
            <span className="max-w-[22em] text-[clamp(17px,2.2vw,26px)] font-normal uppercase leading-[1.15]">
              {prev.headline ?? prev.title}
            </span>
            <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">
              {[prev.category, prev.date].filter(Boolean).join(' · ')}
            </span>
          </Link>
          <Link
            href={`/news/${next.slug}`}
            className="grid justify-items-start gap-3 px-[clamp(20px,5vw,64px)] py-[clamp(28px,4vw,52px)] text-left text-ink transition-colors hover:bg-panel min-[720px]:justify-items-end min-[720px]:text-right"
          >
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
              {copy.next} →
            </span>
            <span className="max-w-[22em] text-[clamp(17px,2.2vw,26px)] font-normal uppercase leading-[1.15]">
              {next.headline ?? next.title}
            </span>
            <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">
              {[next.category, next.date].filter(Boolean).join(' · ')}
            </span>
          </Link>
        </section>
      )}
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
