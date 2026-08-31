import React from 'react'
import type { SectionComponentProps } from '@/sections/registry'
import { chromeCopy, localeHref, localeTextClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { EditorialIcon, type EditorialIconName } from '@/lib/icons'
import { ClipLine } from '@/lib/motion'

type ContactDetail = {
  label: string
  value: string
  icon?: EditorialIconName
  href?: string
}

function formatAddress(address: SectionComponentProps<'contact'>['site']['business']['address']): string {
  const first = [address.line1, address.locality].filter((part): part is string => Boolean(part?.trim())).join(', ')
  const second = [address.city, address.state, address.pincode]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ')
  return [first, second].filter(Boolean).join('\n')
}

function whatsappHref(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : undefined
}

function addressQuery(address: SectionComponentProps<'contact'>['site']['business']['address']): string {
  return [address.line1, address.locality, address.city, address.state, address.pincode]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ')
}

function mapEmbedSrc(address: SectionComponentProps<'contact'>['site']['business']['address']): string | undefined {
  const configured = address.mapsEmbedUrl?.trim()
  const usable =
    configured &&
    !configured.includes('pb=sample') &&
    /google\.[^/]+\/maps/i.test(configured)
  if (usable) return configured
  const query = addressQuery(address)
  return query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed` : undefined
}

function mapOpenHref(address: SectionComponentProps<'contact'>['site']['business']['address']): string | undefined {
  const query = addressQuery(address)
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : undefined
}

export function Contact({ config, site }: SectionComponentProps<'contact'>) {
  if (!config?.enabled) return null

  const { business } = site
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].contact
  const address = formatAddress(business.address)
  const details: ContactDetail[] = [
    { label: copy.detailLabels.phone, value: business.phone, icon: 'phone' as const, href: `tel:${business.phone}` },
    { label: copy.detailLabels.whatsapp, value: business.whatsapp, icon: 'message-circle' as const, href: whatsappHref(business.whatsapp) },
    { label: copy.detailLabels.email, value: business.email ?? '', icon: 'email' as const, href: business.email ? `mailto:${business.email}` : undefined },
    { label: copy.detailLabels.studio, value: address, icon: 'map-pin' as const },
    {
      label: copy.detailLabels.hours,
      value: [business.hours?.trim(), business.hoursExtra?.trim()].filter(Boolean).join('\n'),
    },
  ].filter((detail) => detail.value.length > 0)

  if (!details.length) return null

  const mapLabel = [business.address.locality, business.address.city]
    .filter(Boolean)
    .join(', ')
  const estimateHref = site.sections.estimate?.enabled ? localeHref('/estimate', locale) : '#contact'
  const ctaLabel = site.sections.estimate?.enabled ? copy.estimateCta : (site.sections.ctaBand?.ctaLabel ?? site.sections.hero.ctaLabel ?? copy.estimateCta)
  const embedSrc = mapEmbedSrc(business.address)
  const openMapHref = mapOpenHref(business.address)

  return (
    <section
      id="contact"
      className="border-t border-accent bg-panel px-5 py-[clamp(64px,9vw,120px)] text-ink sm:px-8 lg:px-16"
    >
      <div className="grid items-start gap-[clamp(36px,6vw,90px)] lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-center">
        <div>
          <h2 className="m-0 font-display text-[clamp(40px,7.5vw,92px)] font-light uppercase leading-[0.88] tracking-[-0.03em]">
            <ClipLine>{copy.title.lead}</ClipLine>
            <ClipLine className="pl-[0.55em] text-accent" delay={0.08}>{copy.title.accent}</ClipLine>
          </h2>

          <div className="mt-[clamp(32px,4.5vw,52px)] grid max-w-5xl gap-x-[clamp(24px,4vw,48px)] gap-y-[26px] sm:grid-cols-2 xl:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.label} className="grid gap-2 border-b border-hairline pb-[22px] last:border-b-0">
                <span className={`inline-flex items-center gap-2 text-[10.5px] font-medium text-accent ${localeTextClass(locale, 'uppercase tracking-[0.22em]')}`}>
                  {detail.icon && <EditorialIcon name={detail.icon} className="h-3 w-3" />}
                  {detail.label}
                </span>
                {detail.href ? (
                  <a
                    href={detail.href}
                    className="break-words text-[clamp(18px,1.7vw,22px)] font-normal leading-tight transition-colors hover:text-accent"
                  >
                    {detail.value}
                  </a>
                ) : (
                  <span className="whitespace-pre-line break-words text-[clamp(18px,1.7vw,22px)] leading-relaxed">
                    {detail.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          <a
            href={estimateHref}
            className={`mt-[clamp(32px,4.5vw,52px)] inline-flex min-h-11 items-center gap-[14px] [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] bg-cta px-[34px] py-5 text-[clamp(10.5px,1.1vw,12px)] font-medium text-ink transition-colors hover:bg-ink hover:text-cta ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}
          >
            {ctaLabel}
            <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
          </a>
        </div>

        <div className="relative hidden min-h-[22rem] overflow-hidden border border-accent bg-hairline lg:block lg:min-h-[24rem]">
          {embedSrc ? (
            <iframe
              className="absolute inset-0 h-full w-full border-0 grayscale"
              src={embedSrc}
              title={copy.mapLabel}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-surface/90 px-4 py-3">
            <div className="min-w-0">
              <span className={`block font-mono text-[10px] text-muted ${localeTextClass(locale, 'uppercase tracking-[0.14em]')}`}>
                {copy.mapLabel}
              </span>
              <span className={`mt-1 block text-[11px] text-ink ${localeTextClass(locale, 'uppercase tracking-[0.14em]')}`}>{mapLabel}</span>
            </div>
            {openMapHref ? (
              <a
                href={openMapHref}
                target="_blank"
                rel="noreferrer"
                className={`pointer-events-auto inline-flex min-h-11 shrink-0 items-center gap-2 text-[11px] font-medium text-ink hover:text-accent ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}
              >
                {copy.mapAction}
                <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
