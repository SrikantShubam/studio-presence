import Link from 'next/link'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { localeHref, localeTextClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'
import { ClipLine } from '@/lib/motion'
import type { SectionComponentProps } from '@/sections/registry'
import { Wordmark } from '../Hero/Wordmark'

/** Fixed UI framing, identical for every client — not content, so not config. */
const COPY = {
  en: {
    links: {
      home: 'Home',
      about: 'About',
      team: 'Team',
      careers: 'Careers',
      locations: 'Locations',
      portfolio: 'Portfolio',
      services: 'Services',
      estimate: 'Estimate',
      news: 'News',
      journal: 'Journal',
      privacy: 'Privacy',
      terms: 'Terms',
    },
    groups: { studio: 'Studio', work: 'Work', areas: 'Areas', writing: 'Writing', legal: 'Legal' },
    reserved: 'All rights reserved.',
    whatsappCta: 'WhatsApp',
    contactTitle: { lead: 'Come', accent: 'See us' },
    mapLabel: 'Studio location',
  },
  hi: {
    links: {
      home: 'होम',
      about: 'परिचय',
      team: 'टीम',
      careers: 'करियर',
      locations: 'लोकेशन',
      portfolio: 'पोर्टफोलियो',
      services: 'सेवाएं',
      estimate: 'अनुमान',
      news: 'समाचार',
      journal: 'जर्नल',
      privacy: 'प्राइवेसी',
      terms: 'नियम',
    },
    groups: { studio: 'स्टूडियो', work: 'काम', areas: 'क्षेत्र', writing: 'लेखन', legal: 'कानूनी' },
    reserved: 'सर्वाधिकार सुरक्षित।',
    whatsappCta: 'WhatsApp',
    contactTitle: { lead: 'आइए', accent: 'मिलते हैं' },
    mapLabel: 'स्टूडियो लोकेशन',
  },
}

type FooterConfig = SectionConfig<'footer'>
type FooterLink = { href: string; label: string }

function addressText(site: ClientConfig): string {
  const { address } = site.business
  return [address.line1, address.locality, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(', ')
}

function addressQuery(site: ClientConfig): string {
  const { address } = site.business
  return [address.line1, address.locality, address.city, address.state, address.pincode]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ')
}

function whatsappHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
}

function mapEmbedSrc(site: ClientConfig): string | undefined {
  const configured = site.business.address.mapsEmbedUrl?.trim()
  const usable =
    configured &&
    !configured.includes('pb=sample') &&
    /google\.[^/]+\/maps/i.test(configured)
  if (usable) return configured
  const query = addressQuery(site)
  return query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed` : undefined
}

function footerGroups(site: ClientConfig, locale: PublicLocale): { title: string; links: FooterLink[] }[] {
  const copy = COPY[locale]
  const labels = copy.links
  const studio: FooterLink[] = [
    { href: '/', label: labels.home },
    { href: '/#about', label: labels.about },
  ]
  if (site.sections.team?.enabled || site.sections.team?.detailPages) {
    studio.push({ href: '/team', label: labels.team })
  }
  if (site.sections.careers?.enabled) studio.push({ href: '/careers', label: labels.careers })
  if (site.sections.locations?.enabled) studio.push({ href: '/locations', label: labels.locations })

  const work: FooterLink[] = []
  if (site.sections.portfolio?.enabled) work.push({ href: '/portfolio', label: labels.portfolio })
  if (site.sections.services?.enabled) work.push({ href: '/#services', label: labels.services })
  if (site.sections.estimate?.enabled) work.push({ href: '/estimate', label: labels.estimate })

  // Only areas with a real sections.areas entry actually have a page.
  const areas: FooterLink[] = (site.sections.areas?.items ?? []).map((area) => ({
    href: `/areas/${area.slug}`,
    label: area.name,
  }))

  const writing: FooterLink[] = []
  if (site.sections.news?.enabled) writing.push({ href: '/news', label: labels.news })
  if (site.sections.journal?.enabled) writing.push({ href: '/journal', label: labels.journal })

  const legal: FooterLink[] = []
  if (site.legal.privacyPolicy) legal.push({ href: '/privacy', label: labels.privacy })
  if (site.legal.terms) legal.push({ href: '/terms', label: labels.terms })
  for (const social of site.sections.footer?.socials ?? []) {
    legal.push({ href: social.href, label: social.label })
  }

  return [
    { title: copy.groups.studio, links: studio },
    { title: copy.groups.work, links: work },
    { title: copy.groups.areas, links: areas },
    { title: copy.groups.writing, links: writing },
    { title: copy.groups.legal, links: legal },
  ].filter((group) => group.links.length > 0)
}

function FooterNavLink({ href, label, locale }: FooterLink & { locale: PublicLocale }) {
  const className = 'text-surface transition-colors hover:text-cta'
  if (href.startsWith('http')) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    )
  }
  return (
    <Link href={localeHref(href, locale)} className={className}>
      {label}
    </Link>
  )
}

function VisitSitemap({ site }: { site: ClientConfig }) {
  const locale = publicLocaleFromSite(site)
  const groups = footerGroups(site, locale)
  if (!groups.length) return null

  return (
    <div className="grid grid-cols-2 items-start gap-x-[clamp(20px,3vw,36px)] gap-y-10 border-t border-accent px-[clamp(20px,5vw,64px)] pb-[clamp(48px,6vw,72px)] pt-[clamp(32px,4vw,48px)] min-[700px]:grid-cols-5">
      {groups.map((group) => (
        <nav key={group.title} className={`grid content-start gap-4 text-[11.5px] leading-none ${localeTextClass(locale, 'uppercase tracking-[0.16em]')}`}>
          <span className={`mb-3 block min-h-4 text-[10.5px] text-cta ${localeTextClass(locale, 'tracking-[0.22em]')}`}>{group.title}</span>
          {group.links.map((link) => (
            <FooterNavLink key={`${group.title}-${link.href}`} {...link} locale={locale} />
          ))}
        </nav>
      ))}
    </div>
  )
}

function SocialLinks({ socials }: { socials: FooterConfig['socials'] }) {
  if (!socials.length) return null

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-2 text-[11px] font-medium uppercase tracking-[0.18em]">
      {socials.map((social, index) => (
        <span key={`${social.label}-${social.href}`} className="flex items-center gap-3">
          {index > 0 && <span className="text-accent" aria-hidden>|</span>}
          <a href={social.href} className="text-ink transition-colors hover:text-accent">
            {social.label}
          </a>
        </span>
      ))}
    </div>
  )
}

function ExpandedFooter({ site }: { config: FooterConfig; site: ClientConfig }) {
  const { address } = site.business
  const cityLine = [address.city, address.pincode].filter(Boolean).join(' ')
  const eyebrow = [address.locality, cityLine].filter(Boolean)
  const body = [addressText(site), site.business.hours, site.business.hoursExtra].filter(Boolean).join(' — ')
  const embedSrc = mapEmbedSrc(site)
  const wa = whatsappHref(site.business.whatsapp)
  const locale = publicLocaleFromSite(site)
  const copy = COPY[locale]

  return (
    <footer id="footer" className="overflow-hidden border-t border-accent bg-ink text-surface">
      <div className="grid items-end gap-[clamp(28px,5vw,64px)] px-[clamp(20px,5vw,64px)] py-[clamp(56px,7vw,100px)] min-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
        <div className="min-w-0">
          {eyebrow.length ? (
            <p className={`mb-[22px] m-0 grid gap-1.5 text-[10.5px] text-cta ${localeTextClass(locale, 'uppercase tracking-[0.24em]')}`}>
              {eyebrow.map((line) => (
                <ClipLine key={line}>{line}</ClipLine>
              ))}
            </p>
          ) : null}
          <h2 className="m-0 font-display text-[clamp(36px,6vw,80px)] font-light uppercase leading-[0.88] tracking-[-0.03em]">
            <ClipLine>{copy.contactTitle.lead}</ClipLine>
            <ClipLine className="ml-[0.55em] block text-cta" delay={0.08}>
              {copy.contactTitle.accent}
            </ClipLine>
          </h2>
          {body ? (
            <p className="mt-[22px] mb-0 max-w-[32em] text-pretty text-[15px] leading-[1.7] text-muted">{body}</p>
          ) : null}
          <div className="mt-[clamp(22px,3vw,32px)] grid justify-items-start gap-3">
            <a
              href={`tel:${site.business.phone}`}
              className="text-[clamp(20px,2.2vw,28px)] font-normal tracking-[-0.02em] text-surface hover:text-cta"
            >
              {site.business.phone}
            </a>
            {site.business.email ? (
              <a
                href={`mailto:${site.business.email}`}
                className="text-[clamp(15px,1.6vw,18px)] text-surface hover:text-cta"
              >
                {site.business.email}
              </a>
            ) : null}
            {wa ? (
              <a
                href={wa}
                className={`mt-1 inline-flex min-h-11 items-center border border-cta px-7 py-4 text-[11px] font-medium text-cta transition-colors hover:bg-cta hover:text-ink ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}
              >
                {copy.whatsappCta}
              </a>
            ) : null}
          </div>
        </div>
        {embedSrc ? (
          <div className="relative aspect-[4/3] min-h-[200px] w-full overflow-hidden border border-accent bg-hairline min-[900px]:max-h-[280px] min-[900px]:aspect-auto min-[900px]:h-[280px]">
            <iframe
              className="absolute inset-0 h-full w-full border-0 grayscale"
              src={embedSrc}
              title={copy.mapLabel}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}
      </div>
      <VisitSitemap site={site} />
      <div className={`grid gap-3 border-t border-accent px-[clamp(20px,5vw,64px)] py-[22px] text-[10.5px] leading-relaxed text-muted min-[720px]:grid-cols-[1fr_auto] min-[720px]:items-center ${localeTextClass(locale, 'uppercase tracking-[0.16em]')}`}>
        <span className="break-words">
          © {new Date().getFullYear()} {site.business.name.toUpperCase()}. {copy.reserved}
        </span>
        {site.business.hours ? <span>{site.business.hours}</span> : null}
      </div>
    </footer>
  )
}

function CompactFooter({ config, site }: { config: FooterConfig; site: ClientConfig }) {
  const address = addressText(site)
  const locale = publicLocaleFromSite(site)
  const copy = COPY[locale]
  const labels = copy.links
  const showSeparator = site.legal.privacyPolicy && site.legal.terms

  return (
    <footer id="footer" className="overflow-hidden border-t border-accent bg-surface text-ink">
      <div className="flex flex-wrap items-center justify-between gap-5 px-5 py-7 sm:gap-8 sm:px-8 lg:px-16">
        <Wordmark
          businessName={site.business.name}
          className="grid shrink-0 gap-1 text-[clamp(11px,1.05vw,13px)] font-medium uppercase leading-[1.15] tracking-[0.28em]"
        />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-relaxed text-muted sm:justify-center">
          <a href={`tel:${site.business.phone}`} className="min-w-0 break-words text-ink hover:text-accent">
            {site.business.phone}
          </a>
          {(() => {
            const href = whatsappHref(site.business.whatsapp)
            if (!href) return null
            return (
              <>
                <span className="h-3.5 w-px shrink-0 bg-accent" aria-hidden />
                <a href={href} className="min-w-0 break-words text-ink hover:text-accent">
                  {site.business.whatsapp}
                </a>
              </>
            )
          })()}
          {address ? <span className="h-3.5 w-px shrink-0 bg-accent" aria-hidden /> : null}
          {address ? <span className="min-w-0 break-words">{address}</span> : null}
        </div>
        <SocialLinks socials={config.socials} />
      </div>
      <nav className={`flex flex-wrap gap-x-5 gap-y-2 border-t border-hairline px-5 py-4 text-[11px] sm:px-8 lg:px-16 ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}>
        {footerGroups(site, locale)
          .flatMap((group) => group.links)
          .filter((link, index, all) => all.findIndex((item) => item.href === link.href) === index)
          .slice(0, 10)
          .map((link) =>
            link.href.startsWith('http') ? (
              <a key={link.href} href={link.href} className="text-ink hover:text-accent">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={localeHref(link.href, locale)} className="text-ink hover:text-accent">
                {link.label}
              </Link>
            ),
          )}
      </nav>
      <div className={`flex flex-wrap justify-between gap-[14px] bg-ink px-5 py-[22px] text-[10.5px] font-normal text-surface sm:px-8 lg:px-16 ${localeTextClass(locale, 'uppercase tracking-[0.16em]')}`}>
        <span className="break-words">
          © {new Date().getFullYear()} {site.business.name.toUpperCase()}. {copy.reserved}
        </span>
        {(site.legal.privacyPolicy || site.legal.terms) && (
          <span className="flex flex-wrap gap-2">
            {site.legal.privacyPolicy ? (
              <a href={localeHref('/privacy', locale)} className="text-surface hover:text-cta">
                {labels.privacy}
              </a>
            ) : null}
            {showSeparator ? <span aria-hidden>|</span> : null}
            {site.legal.terms ? (
              <a href={localeHref('/terms', locale)} className="text-surface hover:text-cta">
                {labels.terms}
              </a>
            ) : null}
          </span>
        )}
      </div>
    </footer>
  )
}

export function Footer({ config, site, variant }: SectionComponentProps<'footer'>) {
  if (!config?.enabled) return null

  const resolvedVariant = variant ?? config.variant ?? 'expanded'
  return resolvedVariant === 'compact' ? (
    <CompactFooter config={config} site={site} />
  ) : (
    <ExpandedFooter config={config} site={site} />
  )
}
