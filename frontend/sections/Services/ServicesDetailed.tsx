import Image from 'next/image'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import Link from 'next/link'
import { chromeCopy, localeHref, localeRoleClass, localeTextClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { serviceHref, serviceNumber } from './shared'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, FadeUpItem, Stagger } from '@/lib/motion'

/**
 * The reference mockup (design/reference/editorial/home-sections/services.html)
 * has a small eyebrow above the heading ("Doing our job from the bottom of our
 * hearts") and a description line beneath it. Neither is reproduced: both are
 * tonal, owner-voice copy specific to how one studio wants to sound, not
 * structural chrome like a nav label, and there's no schema field for either —
 * on purpose. AGENTS.md's "no copy" rule applies: fabricating those lines for
 * every client would put the same sentence in every studio's mouth regardless
 * of whether it sounds like them.
 */
function offsetFrameClasses(index: number): string {
  return index % 2 === 0
    ? 'sm:-top-7 sm:-left-7 sm:right-7 sm:bottom-7'
    : 'sm:-top-7 sm:left-7 sm:-right-7 sm:bottom-7'
}

function numeralPositionClasses(index: number, hasImage: boolean): string {
  if (!hasImage) return 'left-0'
  return index % 2 === 0 ? 'right-0' : 'left-0'
}

const buttonBase =
  'group/button relative inline-flex min-h-10 items-center gap-2.5 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] transition-colors sm:min-h-11 sm:gap-3 sm:px-5 sm:py-3 sm:text-[10.5px] sm:tracking-[0.16em] lg:gap-3.5 lg:px-[34px] lg:py-5 lg:text-[clamp(10.5px,1.1vw,12px)] lg:tracking-[0.18em]'

const buttonShape =
  '[clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-16px)_100%,0_100%)] sm:[clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)]'

export function ServicesDetailed({
  config,
  site,
}: {
  config: SectionConfig<'services'>
  site: ClientConfig
}) {
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].services
  const buttonTextClass = localeTextClass(locale, 'uppercase tracking-[0.16em] sm:tracking-[0.18em]')

  return (
    <section id="services" className="border-t border-accent bg-surface px-6 pb-[clamp(72px,10vw,130px)] pt-[clamp(64px,8vw,110px)] text-ink sm:px-8 lg:px-16">
      <div className="mb-[clamp(48px,7vw,96px)] flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,60px)]">
        <h2 className="m-0 font-display text-[clamp(46px,9vw,112px)] font-light uppercase leading-[0.88] tracking-[-0.03em]">
          <ClipLine>{copy.titleLead}</ClipLine>
          <ClipLine className="pl-[0.55em] text-accent" delay={0.08}>{copy.titleAccent}</ClipLine>
        </h2>
      </div>

      <Stagger className="grid gap-[clamp(72px,10vw,130px)] md:gap-[clamp(110px,12vw,150px)]">
        {config.items.map((item, index) => {
          const hasImage = Boolean(item.image)
          const href = serviceHref(item)

          return (
            <FadeUpItem
              key={`${item.title}-${index}`}
              className={`group grid min-w-0 gap-[clamp(40px,7vw,80px)] text-ink md:grid-cols-[1.15fr_1fr] md:items-center ${hasImage ? '' : 'md:grid-cols-1'}`}
            >
              <div className={`relative min-w-0 px-1 pt-8 sm:px-0 sm:pt-5 ${hasImage ? (index % 2 === 0 ? 'md:order-2' : 'md:order-1') : ''}`}>
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -top-14 select-none font-display text-[clamp(110px,14vw,190px)] font-light leading-none text-transparent opacity-20 transition-[opacity,color] duration-300 group-hover:opacity-35 [-webkit-text-stroke:1px_var(--t-hairline)] group-hover:[-webkit-text-stroke:1px_var(--color-accent)] ${numeralPositionClasses(
                    index,
                    hasImage,
                  )}`}
                >
                  {serviceNumber(index)}
                </span>

                <div className="relative flex min-w-0 items-center gap-5">
                  <h3 className="m-0 min-w-0 break-words font-display text-[clamp(26px,3.4vw,40px)] font-normal uppercase leading-tight tracking-[-0.01em] transition-colors duration-300 group-hover:text-accent">
                    {item.title}
                  </h3>
                  <span className="hidden h-px max-w-16 flex-1 bg-ink transition-all duration-300 group-hover:max-w-28 group-hover:bg-accent sm:block" aria-hidden />
                </div>

                <p className={`relative m-0 mt-6 max-w-[34em] leading-[1.75] text-muted md:text-justify ${localeRoleClass(locale, 'body')}`}>
                  {item.blurb}
                </p>

                <div className="relative mt-8 flex flex-wrap items-center gap-4 md:flex-nowrap">
                  {href ? (
                    <Link href={localeHref(href, locale)} className={`${buttonBase} ${buttonShape} ${buttonTextClass} bg-cta text-ink hover:bg-ink hover:text-cta`}>
                      {copy.readMore}
                      <EditorialIcon name="arrow-up-right" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Link>
                  ) : null}
                  <Link
                    href={site.sections.estimate?.enabled ? localeHref('/estimate', locale) : '#contact'}
                    className={`${buttonBase} ${buttonShape} ${buttonTextClass} bg-ink text-ink hover:text-surface`}
                  >
                    <span className={`pointer-events-none absolute inset-px ${buttonShape} bg-surface transition-colors group-hover/button:bg-ink`} aria-hidden />
                    <span className="relative">{site.sections.estimate?.enabled ? copy.estimate : (site.sections.ctaBand?.ctaLabel ?? site.sections.hero.ctaLabel ?? copy.estimate)}</span>
                    <EditorialIcon name="arrow-up-right" className="relative h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Link>
                </div>
              </div>

              {item.image && (
                <div className={`relative min-w-0 sm:mb-7 ${index % 2 === 0 ? 'sm:ml-7 md:order-1' : 'sm:mr-7 md:order-2'}`}>
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
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                </div>
              )}
            </FadeUpItem>
          )
        })}
      </Stagger>
    </section>
  )
}
