import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeTextClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, FadeUp, HomeSection } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'
import { ProjectsBrowser } from './ProjectsBrowser'

function ListingCta({ estimateEnabled, locale }: { estimateEnabled: boolean; locale: PublicLocale }) {
  const copy = chromeCopy[locale].portfolio.listingCta
  const href = estimateEnabled ? localeHref('/estimate', locale) : '#footer'

  return (
    <section
      id="contact"
      className="border-t border-accent bg-panel px-5 py-[clamp(56px,8vw,100px)] sm:px-8 lg:px-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
        <div className="min-w-0">
          <div className={`mb-[clamp(18px,3vw,30px)] grid gap-1.5 text-[10.5px] font-normal leading-relaxed text-accent ${localeTextClass(locale, 'uppercase tracking-[0.24em]')}`}>
            {copy.eyebrow.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <h2 className="m-0 font-display text-[clamp(34px,5.5vw,72px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
            {copy.titleLead}
            <span className="ml-[0.55em] block text-accent">{copy.titleAccent}</span>
          </h2>
        </div>
        <Link
          href={href}
          className={`inline-flex min-h-11 items-center gap-3.5 bg-cta px-[34px] py-5 text-[clamp(10.5px,1.1vw,12px)] font-medium text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] hover:bg-ink hover:text-cta ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}
        >
          {copy.action}
          <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  )
}

export function ProjectsCategory({
  site,
  category,
}: {
  site: ClientConfig
  category: string
}) {
  const portfolio = site.sections.portfolio
  const yearFounded = site.business.yearFounded
  const closing = renderableSections(site, ['footer'])
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].portfolio

  return (
    <article lang={locale} className="overflow-x-clip bg-surface text-ink">
      <HeroNav
        businessName={site.business.name}
        phone={site.business.phone}
        tone="on-surface"
        inner
        services={site.sections.services?.items}
        locale={locale}
        locales={site.i18n.locales}
      />

      <HomeSection first>
      <section
        id="portfolio"
        className="px-5 pb-[clamp(28px,4vw,48px)] pt-[clamp(48px,7vw,96px)] sm:px-8 lg:px-16"
      >
        <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
          <div className="min-w-0">
            <div className={`mb-[clamp(20px,3vw,34px)] grid gap-1.5 text-[10.5px] font-normal leading-relaxed text-accent ${localeTextClass(locale, 'uppercase tracking-[0.24em]')}`}>
              <ClipLine>{portfolio.projects.length}</ClipLine>
              <ClipLine delay={0.05}>{copy.eyebrowLabel}</ClipLine>
              {yearFounded && portfolio.rangeEnd ? (
                <ClipLine delay={0.12}>{yearFounded} — {portfolio.rangeEnd}</ClipLine>
              ) : null}
            </div>
            <h1 className="m-0 font-display text-[clamp(44px,8.5vw,108px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
              <ClipLine>{copy.titleLead}</ClipLine>
              <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>{copy.titleAccent}</ClipLine>
            </h1>
          </div>
          {portfolio.introText ? (
            <FadeUp>
              <p className="m-0 max-w-[30em] text-pretty text-justify text-[15px] leading-[1.7] text-body">
                {portfolio.introText}
              </p>
            </FadeUp>
          ) : null}
        </div>
      </section>
      </HomeSection>

      <HomeSection>
        <ProjectsBrowser
          projects={portfolio.projects}
          active={category}
          detailPages={portfolio.detailPages}
          categoryHeaders={portfolio.categoryHeaders}
          locale={locale}
        />
      </HomeSection>
      <HomeSection>
        <ListingCta estimateEnabled={Boolean(site.sections.estimate?.enabled)} locale={locale} />
      </HomeSection>

      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
