import Image from 'next/image'
import type { ClientConfig } from '@studio/backend'
import { chromeCopy, localePageClass, localePlaceName, localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { Footer } from '@/sections/Footer'
import { EditorialIcon } from '@/lib/icons'
import { ContactForm } from './ContactForm'

function digitsOnly(value: string | undefined): string {
  return (value ?? '').replace(/\D/g, '')
}

function whatsappUrl(phone: string | undefined, message?: string): string | undefined {
  const digits = digitsOnly(phone)
  if (!digits) return undefined
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${query}`
}

function fullAddressString(address: ClientConfig['business']['address']): string {
  return [address.line1, address.locality, address.city, address.state, address.pincode]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ')
}

function mapEmbedUrl(address: ClientConfig['business']['address']): string {
  if (address.mapsEmbedUrl && !address.mapsEmbedUrl.includes('pb=sample') && /google\.[^/]+\/maps/i.test(address.mapsEmbedUrl)) {
    return address.mapsEmbedUrl
  }
  const query = fullAddressString(address)
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`
}

function mapExternalUrl(address: ClientConfig['business']['address']): string {
  const query = fullAddressString(address)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function ContactPage({ site }: { site: ClientConfig }) {
  const locale = publicLocaleFromSite(site)
  const contactCopy = chromeCopy[locale].contact
  const pageCopy = contactCopy.page
  const city = localePlaceName(site.business.address.city, locale)
  const isHi = locale === 'hi'

  const heroPhoto = site.sections.about?.image || '/clients/ashish-interiors/editorial/hero.webp'
  const waLink = whatsappUrl(site.business.whatsapp || site.business.phone, `Hello ${site.business.name}, I would like to discuss an interiors project in ${site.business.address.city}.`)
  const directWa = whatsappUrl(site.business.whatsapp || site.business.phone)

  const instagramHandle = site.sections.instagram?.handle
  const instagramUrl = instagramHandle ? `https://instagram.com/${instagramHandle.replace(/^@/, '')}` : undefined
  const linkedinSocial = site.sections.footer?.socials?.find((s) => /linkedin/i.test(s.label || s.href))
  const linkedinUrl = linkedinSocial?.href

  const addressLine = [site.business.address.line1, site.business.address.locality].filter(Boolean).join(', ')
  const cityRegionLine = [city, site.business.address.state, site.business.address.pincode].filter(Boolean).join(' ')
  const hoursLine = [site.business.hours?.trim(), site.business.hoursExtra?.trim() || pageCopy.studio.sundayNote].filter(Boolean).join(' · ')

  return (
    <main lang={locale} data-public-locale={locale} className={`overflow-x-clip bg-surface text-ink ${localePageClass(locale)}`}>
      <HeroNav
        businessName={site.business.name}
        phone={site.business.phone}
        tone="on-surface"
        inner
        services={site.sections.services?.items}
        locale={locale}
        locales={site.i18n.locales}
      />

      {/* 1. CONTACT HERO SECTION */}
      <section className="relative overflow-hidden border-b border-accent bg-surface px-5 py-[clamp(48px,7vw,96px)] text-ink sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="relative">
            {/* Background Prop: svg-1 (CAD Floor Plan & Door Swing at 15% Opacity) */}
            <svg
              aria-hidden="true"
              viewBox="0 0 400 280"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="pointer-events-none absolute -right-4 -top-6 h-auto w-[min(100%,380px)] select-none text-accent opacity-[0.15]"
            >
              <rect x="30" y="30" width="340" height="220" strokeDasharray="3 3" />
              <line x1="30" y1="120" x2="220" y2="120" />
              <line x1="220" y1="30" x2="220" y2="170" />
              <line x1="130" y1="120" x2="130" y2="250" />
              <path d="M 30 190 A 50 50 0 0 1 80 240" strokeDasharray="2 2" />
              <line x1="30" y1="190" x2="30" y2="240" />
              <path d="M 220 70 A 40 40 0 0 1 260 110" strokeDasharray="2 2" />
              <line x1="220" y1="70" x2="220" y2="110" />
              <line x1="16" y1="30" x2="16" y2="250" strokeWidth="0.5" />
              <line x1="10" y1="30" x2="22" y2="30" strokeWidth="0.5" />
              <line x1="10" y1="250" x2="22" y2="250" strokeWidth="0.5" />
              <text x="12" y="145" fontSize="7.5" fill="currentColor" letterSpacing="0.12em" transform="rotate(-90 12 145)" textAnchor="middle" className="font-display">5800 MM · LIVING RUN</text>
              <text x="320" y="55" fontSize="7.5" fill="currentColor" letterSpacing="0.1em" textAnchor="end" className="font-display">PATNA RESIDENCE · 1:50</text>
            </svg>

            <div className="relative z-10">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 border border-hairline bg-panel px-3.5 py-1.5 text-xs text-accent">
                <EditorialIcon name="clock" className="h-3 w-3 shrink-0 text-accent" />
                <span className={localeRoleClass(locale, 'meta')}>{pageCopy.hero.badge}</span>
              </div>

              {/* Two-Tone Heading */}
              <h1 className={`m-0 break-words font-display text-[clamp(38px,6.5vw,84px)] font-light text-ink ${isHi ? 'leading-[1.26] tracking-normal' : 'uppercase leading-[0.92] tracking-[-0.035em]'}`}>
                <span>{pageCopy.hero.titleLead}</span>
                <span className={`block text-accent ${isHi ? 'mt-2.5 sm:mt-3' : 'pl-[0.35em]'}`}>
                  {pageCopy.hero.titleAccent}
                </span>
              </h1>

              {/* Lead paragraph */}
              <p className={`mt-6 max-w-[42em] text-ink/85 ${isHi ? 'text-[17px] leading-[1.85]' : 'text-[16.5px] leading-[1.75]'} ${localeRoleClass(locale, 'body')}`}>
                {pageCopy.hero.lead}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex min-h-12 items-center gap-3 bg-cta px-7 py-3.5 font-semibold text-ink transition-all hover:bg-ink hover:text-cta [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-14px)_100%,0_100%)] ${
                      isHi ? 'text-sm tracking-normal' : 'text-xs uppercase tracking-[0.16em]'
                    } ${localeRoleClass(locale, 'button')}`}
                  >
                    <EditorialIcon name="message-circle" className="h-4 w-4 shrink-0" />
                    <span>{pageCopy.hero.whatsappCta}</span>
                  </a>
                )}

                <a
                  href="#form"
                  className={`group/btn relative inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 font-semibold text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-14px)_100%,0_100%)] ${
                    isHi ? 'text-sm tracking-normal' : 'text-xs uppercase tracking-[0.16em]'
                  } ${localeRoleClass(locale, 'button')}`}
                >
                  <span
                    className="pointer-events-none absolute inset-px bg-surface transition-colors group-hover/btn:bg-panel [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-14px)_100%,0_100%)]"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 flex items-center gap-2 text-ink">
                    <span>{pageCopy.hero.reviewCta}</span>
                  </span>
                </a>
              </div>

              {/* Meta row */}
              <div className={`mt-8 flex flex-wrap items-center gap-6 border-t border-hairline pt-4 text-xs text-muted ${localeRoleClass(locale, 'meta')}`}>
                <span>{pageCopy.hero.established}</span>
                <span aria-hidden="true" className="text-hairline">/</span>
                <span>{pageCopy.hero.directReply}</span>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-panel lg:aspect-[16/12]">
            <Image
              src={heroPhoto}
              alt={pageCopy.hero.heroAlt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. STUDIO DETAILS & ENQUIRY FORM */}
      <section className="border-b border-accent bg-surface px-5 py-[clamp(56px,8vw,112px)] text-ink sm:px-8 lg:px-16" id="contact">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Studio Information */}
          <div>
            <p className={`font-semibold text-accent ${isHi ? 'text-sm tracking-normal' : 'text-xs uppercase tracking-[0.2em]'} ${localeRoleClass(locale, 'eyebrow')}`}>
              {pageCopy.studio.eyebrow}
            </p>

            <h2 className={`mt-3 font-display text-[clamp(32px,5vw,56px)] font-light text-ink ${isHi ? 'leading-[1.28] tracking-normal' : 'uppercase leading-[0.96] tracking-[-0.03em]'}`}>
              <span>{pageCopy.studio.headingLead}</span>
              <span className="block text-accent">{pageCopy.studio.headingAccent}</span>
            </h2>

            <p className={`mt-5 max-w-[38em] text-ink/85 ${isHi ? 'text-[16.5px] leading-[1.85]' : 'text-base leading-[1.75]'} ${localeRoleClass(locale, 'body')}`}>
              {pageCopy.studio.lead}
            </p>

            <div className="mt-10 grid gap-8 border-t border-hairline pt-8">
              {/* Direct Studio Line */}
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-[0.16em] text-accent ${localeRoleClass(locale, 'label')}`}>
                    {pageCopy.studio.directLineLabel}
                  </span>
                  <EditorialIcon name="phone" className="h-4 w-4 text-accent" />
                </div>
                <a
                  href={`tel:${site.business.phone}`}
                  className="mt-1.5 block font-display text-xl font-normal text-ink transition-colors hover:text-accent sm:text-2xl"
                >
                  {site.business.phone}
                </a>
              </div>

              {/* Email */}
              {site.business.email && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-[0.16em] text-accent ${localeRoleClass(locale, 'label')}`}>
                      {pageCopy.studio.emailLabel}
                    </span>
                    <EditorialIcon name="email" className="h-4 w-4 text-accent" />
                  </div>
                  <a
                    href={`mailto:${site.business.email}`}
                    className="mt-1.5 block font-display text-lg font-normal text-ink transition-colors hover:text-accent sm:text-xl"
                  >
                    {site.business.email}
                  </a>
                </div>
              )}

              {/* Studio Address */}
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-[0.16em] text-accent ${localeRoleClass(locale, 'label')}`}>
                    {pageCopy.studio.addressLabel}
                  </span>
                  <EditorialIcon name="map-pin" className="h-4 w-4 text-accent" />
                </div>
                <div className="mt-1.5 text-base text-ink">
                  <p className="m-0 font-medium">{addressLine}</p>
                  <p className="m-0 text-muted">{cityRegionLine} · {hoursLine}</p>
                </div>

                {/* Social Channels directly below Studio Address */}
                <div className="mt-5 flex items-center gap-5">
                  {directWa && (
                    <a
                      href={directWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      className="text-muted transition-colors hover:text-accent"
                    >
                      <EditorialIcon name="message-circle" className="h-5 w-5" />
                    </a>
                  )}

                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-muted transition-colors hover:text-accent"
                    >
                      <EditorialIcon name="instagram" className="h-5 w-5" />
                    </a>
                  )}

                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="text-muted transition-colors hover:text-accent"
                    >
                      <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                        <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Project Enquiry Form */}
          <div id="form" className="border-t border-hairline pt-8 lg:border-t-0 lg:pt-0">
            <p className={`font-semibold text-accent ${isHi ? 'text-sm tracking-normal' : 'text-xs uppercase tracking-[0.2em]'} ${localeRoleClass(locale, 'eyebrow')}`}>
              {pageCopy.form.eyebrow}
            </p>

            <h2 className={`mt-3 font-display text-[clamp(32px,5vw,56px)] font-light text-ink ${isHi ? 'leading-[1.28] tracking-normal' : 'uppercase leading-[0.96] tracking-[-0.03em]'}`}>
              <span>{pageCopy.form.headingLead}</span>
              <span className="block text-accent">{pageCopy.form.headingAccent}</span>
            </h2>

            <p className={`mt-5 max-w-[38em] text-ink/85 ${isHi ? 'text-[16.5px] leading-[1.85]' : 'text-base leading-[1.75]'} ${localeRoleClass(locale, 'body')}`}>
              {pageCopy.form.lead}
            </p>

            <div className="mt-8">
              <ContactForm site={site} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. STUDIO MAP SECTION */}
      <section className="bg-surface px-5 py-[clamp(40px,6vw,72px)] text-ink sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden border border-hairline bg-panel">
            <iframe
              src={mapEmbedUrl(site.business.address)}
              title={`${site.business.name} studio map`}
              loading="lazy"
              className="h-[clamp(300px,40vw,480px)] w-full border-0"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline bg-surface px-6 py-4 text-xs">
              <span className="font-medium text-accent">{pageCopy.map.caption}</span>
              <a
                href={mapExternalUrl(site.business.address)}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-ink underline transition-colors hover:text-accent"
              >
                {pageCopy.map.openGoogleMaps}
              </a>
            </div>
          </div>
        </div>
      </section>

      {site.sections.footer ? <Footer config={site.sections.footer} site={site} variant={site.sections.footer.variant} /> : null}
    </main>
  )
}
