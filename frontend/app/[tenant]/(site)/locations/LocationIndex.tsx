import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, DrawFrame, FadeUp, HomeSection, RevealImage, Stagger, StaggerItem } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'
import { OpenBadge } from './LocationChrome'
import { chromeCopy, localeHref, localePageClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { HI_TRANSLATIONS, resolveTerritoryDirectory } from '@/lib/locations-data'

type Office = NonNullable<ClientConfig['sections']['locations']>['offices'][number]
const pagePad = 'px-[clamp(20px,5vw,64px)]'

function addressLines(address: Office['address']): string[] {
  return [
    address.line1,
    [address.locality, address.city].filter(Boolean).join(', '),
    [address.state, address.pincode].filter(Boolean).join(' '),
  ].filter((line): line is string => Boolean(line))
}

function addressText(address: Office['address']): string {
  return [address.line1, address.locality, address.city, address.state, address.pincode].filter(Boolean).join(', ')
}

function mapOpenHref(address: Office['address']): string | undefined {
  const query = addressText(address)
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : undefined
}

function whatsappHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
}

function fallbackOffice(site: ClientConfig): Office {
  return {
    slug: 'studio',
    name: site.business.name ? `${site.business.name} Studio` : 'Studio',
    address: {
      line1: site.business.address?.line1 || '',
      locality: site.business.address?.locality,
      city: site.business.address?.city || '',
      state: site.business.address?.state,
      pincode: site.business.address?.pincode,
    },
    phone: site.business.phone,
    hours: {
      weekday: site.business.hours || '10:00 – 19:00',
      sunday: site.business.hoursExtra || 'By appointment',
    },
    team: [],
    projectSlugs: site.sections.portfolio?.projects?.map((p) => p.slug) ?? [],
  }
}

export function LocationIndex({ site }: { site: ClientConfig }) {
  const closing = renderableSections(site, ['footer'])
  const locale = publicLocaleFromSite(site)
  const labels = chromeCopy[locale].locations

  const configuredOffices = site.sections.locations?.offices ?? []
  const officesList: Office[] =
    configuredOffices.length > 0
      ? configuredOffices.map((office) => {
          const isHi = locale === 'hi'
          const t = isHi ? HI_TRANSLATIONS[office.slug] : undefined
          return {
            ...office,
            name: t?.name || office.name,
            findNote: t?.findNote || office.findNote,
            phone: office.phone || site.business.phone,
          }
        })
      : [fallbackOffice(site)]

  const territoryList = resolveTerritoryDirectory(site)

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

      {/* Main Index Header */}
      <HomeSection first>
        <section className={`${pagePad} pb-[clamp(32px,5vw,60px)] pt-[clamp(48px,7vw,96px)]`}>
          <div className="max-w-[54em]">
            <span className="mb-3 block text-[11px] font-medium uppercase tracking-[0.24em] text-accent">
              <ClipLine>{labels.indexEyebrow}</ClipLine>
            </span>
            <h1 className="m-0 font-display text-[clamp(44px,8.5vw,108px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
              <ClipLine>
                {labels.indexTitle.lead} <span className="text-accent">{labels.indexTitle.accent}</span>
              </ClipLine>
            </h1>
            <FadeUp className="mt-[clamp(20px,3vw,32px)] text-[clamp(16px,1.8vw,20px)] leading-[1.65] text-body" delay={0.1}>
              <p className="m-0 max-w-[42em]">
                {officesList[0]?.about?.lead
                  ? officesList[0].about.lead
                  : site.sections.locations?.otherLocationsNote
                    ? site.sections.locations.otherLocationsNote
                    : officesList[0]?.address
                      ? addressText(officesList[0].address)
                      : ''}
              </p>
            </FadeUp>
          </div>
        </section>
      </HomeSection>

      {/* Offices & Locations Directory */}
      <HomeSection>
        <section className={`${pagePad} border-t border-accent pb-[clamp(56px,8vw,100px)] pt-[clamp(40px,6vw,72px)]`}>
          <Stagger className="grid grid-cols-1 gap-[clamp(48px,7vw,96px)]">
            {officesList.map((office, idx) => {
              const numStr = (idx + 1).toString().padStart(2, '0')
              const maps = mapOpenHref(office.address)
              const wa = whatsappHref(office.phone || site.business.whatsapp)
              const detailHref = locale === 'hi' ? `/hi/locations/${office.slug}` : `/locations/${office.slug}`
              const photo = office.photo?.image || site.sections.locations?.offices[0]?.photo?.image || site.sections.hero?.image

              return (
                <StaggerItem key={office.slug} className="border-b border-hairline pb-[clamp(40px,6vw,72px)] last:border-b-0 last:pb-0">
                  <div className="grid grid-cols-1 gap-[clamp(32px,5vw,64px)] min-[1020px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    {/* Left Column: Photo & Outlines */}
                    <div className="relative">
                      <div className="relative block sm:mr-[clamp(16px,2vw,24px)] sm:mt-[clamp(16px,2vw,24px)]">
                        <DrawFrame className="pointer-events-none absolute hidden border border-accent sm:block sm:-top-[clamp(16px,2vw,24px)] sm:bottom-[clamp(16px,2vw,24px)] sm:left-[clamp(16px,2vw,24px)] sm:-right-[clamp(16px,2vw,24px)]" />
                        <div className="relative aspect-[16/10] overflow-hidden bg-hairline">
                          {photo ? (
                            <RevealImage>
                              <Image
                                src={photo}
                                alt=""
                                fill
                                sizes="(min-width:1080px) 50vw, 100vw"
                                quality={90}
                                className="object-cover"
                              />
                            </RevealImage>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-panel text-muted">
                              <span className="font-display text-4xl font-light">{numStr}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {office.photo?.caption && (
                        <span className="mt-3 block text-[10.5px] uppercase tracking-[0.2em] text-muted">
                          {office.photo.caption}
                        </span>
                      )}
                    </div>

                    {/* Right Column: Location Details */}
                    <div className="flex flex-col justify-between gap-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between gap-4 border-b border-accent pb-3">
                          <span className="font-display text-[clamp(28px,3.5vw,44px)] font-light tracking-[-0.02em] text-accent">
                            {numStr}
                          </span>
                          <OpenBadge hours={office.hours} />
                        </div>

                        <div>
                          <h2 className="m-0 font-display text-[clamp(28px,4vw,52px)] font-light uppercase leading-[1.05] tracking-[-0.02em] text-ink">
                            {office.name}
                          </h2>
                          {office.address.locality && (
                            <span className="mt-1 block text-[12px] font-medium uppercase tracking-[0.2em] text-accent">
                              {office.address.locality}
                            </span>
                          )}
                        </div>

                        {/* Address Lines */}
                        <div className="grid gap-1 pt-1">
                          <span className="whitespace-pre-line text-[clamp(17px,1.9vw,22px)] font-normal leading-[1.4] text-ink">
                            {addressLines(office.address).join('\n')}
                          </span>
                          {office.findNote && (
                            <p className="mt-2 text-[14px] leading-[1.6] text-body">
                              {office.findNote}
                            </p>
                          )}
                        </div>

                        {/* Phone Number */}
                        {office.phone && (
                          <div className="flex items-center gap-3 border-t border-hairline pt-3 text-[15px]">
                            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                              {labels.contact.phone}:
                            </span>
                            <a
                              href={`tel:${office.phone.replace(/\s+/g, '')}`}
                              className="font-medium text-ink transition-colors hover:text-accent"
                            >
                              {office.phone}
                            </a>
                          </div>
                        )}

                        {/* Hours */}
                        {office.hours && (
                          <div className="grid gap-1.5 border-t border-hairline pt-3 text-[14px]">
                            {office.hours.weekday && (
                              <div className="flex justify-between gap-4">
                                <span className="text-muted">Mon – Sat</span>
                                <span className="font-medium text-ink">{office.hours.weekday}</span>
                              </div>
                            )}
                            {office.hours.sunday && (
                              <div className="flex justify-between gap-4">
                                <span className="text-muted">Sunday</span>
                                <span className="text-body">{office.hours.sunday}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Primary, Secondary, Call, WhatsApp */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 pt-4">
                        <Link
                          href={detailHref}
                          className="group inline-flex min-h-11 items-center gap-2.5 [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-16px)_100%,0_100%)] bg-cta px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-all duration-200 hover:bg-ink hover:text-cta"
                        >
                          <span>{labels.viewDetails}</span>
                          <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>

                        {maps ? (
                          <a
                            href={maps}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex min-h-11 items-center gap-2 border border-ink bg-transparent px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-surface"
                          >
                            {labels.contact.openMaps}
                            <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
                          </a>
                        ) : null}

                        {office.phone ? (
                          <a
                            href={`tel:${office.phone.replace(/\s+/g, '')}`}
                            className="inline-flex min-h-11 items-center gap-2 border border-ink bg-transparent px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-surface"
                          >
                            <EditorialIcon name="phone" className="h-3.5 w-3.5" />
                            <span>{office.phone}</span>
                          </a>
                        ) : null}

                        {wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex min-h-11 items-center gap-2 bg-wa-evergreen px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-surface transition-colors hover:bg-wa-deep"
                          >
                            <EditorialIcon name="message-circle" className="h-3.5 w-3.5" />
                            {labels.contact.whatsapp}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </Stagger>
        </section>
      </HomeSection>

      {/* Location & Territory Directory (Location-neutral regional matrix) */}
      <HomeSection>
        <section className={`${pagePad} border-t-2 border-ink py-[clamp(48px,6vw,84px)]`}>
          <div className="mb-8">
            <span className="mb-2 block text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
              {labels.regionalCoverageEyebrow}
            </span>
            <h2 className="m-0 font-display text-[clamp(26px,4vw,44px)] font-light uppercase tracking-[-0.02em] text-ink">
              {labels.regionalCoverageTitle.lead} <span className="text-accent">{labels.regionalCoverageTitle.accent}</span>
            </h2>
            <p className="mt-3 max-w-[48em] text-[15px] leading-[1.65] text-body">
              {labels.regionalCoverageDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {territoryList.map((terr) => {
              const detailHref = localeHref(`/locations/${terr.officeSlug}`, locale)
              const isHi = locale === 'hi'
              const studioName = isHi && terr.officeNameHi ? terr.officeNameHi : terr.officeName
              const regionEyebrow = isHi && terr.regionNameHi ? terr.regionNameHi : terr.regionName
              const locationSubtitle = isHi && terr.provinceStateHi ? terr.provinceStateHi : terr.provinceState
              const surveyText = isHi && terr.surveyResponseHi ? terr.surveyResponseHi : terr.surveyResponse

              return (
                <Link
                  key={terr.officeSlug}
                  href={detailHref}
                  className="group relative flex flex-col justify-between gap-5 border border-hairline bg-panel p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ink hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div>
                    <span className="mb-1 block text-[10.5px] font-medium uppercase tracking-[0.16em] text-accent">
                      {regionEyebrow}
                    </span>

                    <h3 className="m-0 text-[16px] font-semibold uppercase tracking-[0.04em] text-ink transition-colors duration-200 group-hover:text-accent">
                      {studioName}
                    </h3>

                    <span className="mt-1 block text-[12px] font-normal text-muted">
                      {locationSubtitle}
                    </span>

                    <p className="mt-3 text-[13px] leading-[1.6] text-body">
                      {terr.keyCities.join(', ')}
                    </p>

                    {terr.phone && (
                      <div className="mt-3 flex items-center gap-2 text-[13px]">
                        <EditorialIcon name="phone" className="h-3.5 w-3.5 text-accent" />
                        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
                          {labels.contact.phone}:
                        </span>
                        <span className="font-medium text-ink">
                          {terr.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-hairline/80 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-block bg-wa-evergreen/10 px-2.5 py-1 text-[11px] font-semibold text-wa-evergreen">
                        {surveyText}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent transition-colors duration-200 group-hover:text-ink">
                        <span>{isHi ? 'स्टूडियो देखें' : 'View studio'}</span>
                        <EditorialIcon name="arrow-right" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </HomeSection>

      {/* Render Closing Sections (Footer) */}
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
