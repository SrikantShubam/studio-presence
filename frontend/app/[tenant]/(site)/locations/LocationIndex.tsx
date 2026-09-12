import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, DrawFrame, FadeUp, HomeSection, RevealImage, Stagger, StaggerItem } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'
import { OpenBadge } from './LocationChrome'
import { chromeCopy, localePageClass, publicLocaleFromSite } from '@/lib/i18n-client'

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

  const officesList: Office[] = site.sections.locations?.offices?.length
    ? site.sections.locations.offices
    : [fallbackOffice(site)]

  const hasWorkshopNote = Boolean(site.sections.locations?.otherLocationsNote)

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
                {site.sections.locations?.otherLocationsNote
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

                      {/* Action Buttons */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 pt-4">
                        <Link
                          href={detailHref}
                          className="inline-flex min-h-12 items-center gap-2.5 bg-cta px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-surface"
                        >
                          {labels.viewDetails}
                          <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5" />
                        </Link>

                        {maps ? (
                          <a
                            href={maps}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex min-h-12 items-center gap-2 border border-hairline px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:border-accent hover:text-accent"
                          >
                            {labels.contact.openMaps}
                            <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
                          </a>
                        ) : null}

                        {wa ? (
                          <a
                            href={wa}
                            className="inline-flex min-h-12 items-center gap-2 border border-hairline px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:border-accent hover:text-accent"
                          >
                            {labels.contact.whatsapp}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}

            {/* Optional Facility 02 / Workshop Entry if highlighted in notes */}
            {hasWorkshopNote && officesList.length === 1 && (
              <StaggerItem className="border-t border-accent bg-panel p-[clamp(24px,4vw,48px)]">
                <div className="grid grid-cols-1 items-start justify-between gap-6 min-[800px]:grid-cols-[auto_1fr_auto]">
                  <span className="font-display text-[clamp(28px,3.5vw,44px)] font-light text-accent">
                    02
                  </span>
                  <div className="grid gap-2">
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
                      {labels.otherLabel}
                    </span>
                    <h3 className="m-0 font-display text-[clamp(20px,2.4vw,28px)] font-normal uppercase text-ink">
                      Cabinet Workshop & Fabrication Unit
                    </h3>
                    <p className="m-0 max-w-[46em] text-sm leading-[1.7] text-body">
                      {site.sections.locations?.otherLocationsNote}
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={whatsappHref(site.business.whatsapp) || '#'}
                      className="inline-flex min-h-11 items-center gap-2 border border-ink px-5 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-surface"
                    >
                      {labels.visit.action}
                      <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </StaggerItem>
            )}
          </Stagger>
        </section>
      </HomeSection>

      {/* Service Areas Band */}
      {site.business.serviceAreas && site.business.serviceAreas.length > 0 && (
        <HomeSection>
          <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(40px,5vw,64px)]`}>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <span className="mb-2 block text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
                  {labels.serviceAreasLabel}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {site.business.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="border border-hairline bg-surface px-3 py-1.5 text-[12px] font-normal tracking-wide text-ink"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/contact"
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent"
              >
                {labels.contact.title} →
              </Link>
            </div>
          </section>
        </HomeSection>
      )}

      {/* Render Closing Sections (Footer) */}
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
