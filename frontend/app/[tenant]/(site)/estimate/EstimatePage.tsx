import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { localeHref, localePageClass, localeRoleClass, localeTextClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { ClipLine, FadeUp, HomeSection, Stagger, StaggerItem } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'
import { EstimateCalc } from './EstimateCalc'

/** Fixed UI framing, identical for every client; not content, so not config. */
const copy = {
  en: {
    eyebrow: ['Three inputs,', 'A honest range,', 'No form to fill'],
    title: { lead: 'Calculate', accent: 'The estimate' },
    includedTitle: { lead: 'What the', accent: 'Range covers' },
    seeServices: 'See full services',
  },
  hi: {
    eyebrow: ['तीन जानकारी,', 'एक साफ रेंज,', 'कोई लंबा फॉर्म नहीं'],
    title: { lead: 'निकालें', accent: 'अनुमान' },
    includedTitle: { lead: 'इस रेंज में', accent: 'क्या शामिल है' },
    seeServices: 'पूरी सेवाएं देखें',
  },
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

export function EstimatePage({ site }: { site: ClientConfig }) {
  const estimate = site.sections.estimate
  const closing = renderableSections(site, ['footer'])
  const locale = publicLocaleFromSite(site)
  const text = copy[locale]

  if (!estimate) return null

  return (
    <article lang={locale} data-public-locale={locale} className={`overflow-x-clip bg-surface text-ink ${localePageClass(locale)}`}>
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
        <section className={`${pagePad} pb-[clamp(32px,4vw,56px)] pt-[clamp(48px,7vw,96px)]`}>
          <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
            <div className="min-w-0">
              <p className={`mb-[clamp(20px,3vw,34px)] m-0 grid gap-1.5 font-normal leading-[1.6] text-accent ${localeRoleClass(locale, 'eyebrow')}`}>
                {text.eyebrow.map((line, index) => (
                  <ClipLine key={line} delay={index * 0.05}>
                    {line}
                  </ClipLine>
                ))}
              </p>
              <h1 className="m-0 font-display text-[clamp(42px,8vw,104px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
                <ClipLine>{text.title.lead}</ClipLine>
                <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
                  {text.title.accent}
                </ClipLine>
              </h1>
            </div>
            {estimate.intro && (
              <FadeUp className="max-w-[30em]" delay={0.1}>
                <p className={`m-0 text-pretty text-justify leading-[1.7] text-body ${localeRoleClass(locale, 'body')}`}>{estimate.intro}</p>
              </FadeUp>
            )}
          </div>
        </section>
      </HomeSection>
      <HomeSection>
        <section className={`${pagePad} pb-[clamp(64px,9vw,120px)]`}>
          <EstimateCalc estimate={estimate} phone={site.business.phone} hours={site.business.hours} locale={locale} />
        </section>
      </HomeSection>
      {estimate.included.length > 0 && (
        <HomeSection>
          <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(64px,9vw,110px)]`}>
            <div className="mb-[clamp(36px,5vw,64px)] flex flex-wrap items-end justify-between gap-6">
              <h2 className={`m-0 font-display text-[clamp(36px,6.5vw,84px)] font-light leading-[0.88] text-ink ${localeRoleClass(locale, 'sectionTitle')}`}>
                <ClipLine>{text.includedTitle.lead}</ClipLine>
                <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
                  {text.includedTitle.accent}
                </ClipLine>
              </h2>
              <Link href={localeHref('/#services', locale)} className={`text-[11.5px] font-medium text-ink hover:text-accent ${localeTextClass(locale, 'uppercase tracking-[0.2em]')}`}>
                {text.seeServices} ↗
              </Link>
            </div>
            <Stagger className="grid grid-cols-1 gap-[clamp(24px,4vw,48px)] min-[720px]:grid-cols-2 min-[1080px]:grid-cols-4">
              {estimate.included.map((item, i) => (
                <StaggerItem key={item.title}>
                  <div className="grid gap-3.5 border-t border-accent pt-[22px]">
                    <span className="font-display text-[clamp(34px,4vw,52px)] font-light leading-[0.85] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={`m-0 text-[clamp(15px,1.6vw,18px)] font-normal ${localeTextClass(locale, 'uppercase tracking-[0.06em]')}`}>{item.title}</h3>
                    <p className={`m-0 text-pretty text-justify leading-[1.7] text-body ${localeRoleClass(locale, 'body')}`}>{item.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        </HomeSection>
      )}
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
