import Link from 'next/link'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeRoleClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon, type EditorialIconName } from '@/lib/icons'
import type { SectionComponentProps } from '@/sections/registry'
import { BrandMark } from '../Hero/BrandMark'
import { Wordmark } from '../Hero/Wordmark'

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

function socialIcon(label: string): EditorialIconName | undefined {
  const normalized = label.toLowerCase()
  if (normalized.includes('instagram')) return 'instagram'
  if (normalized.includes('facebook')) return 'facebook'
  return undefined
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
  const copy = chromeCopy[locale].footer
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
        <nav key={group.title} className={`grid content-start gap-4 leading-none ${localeRoleClass(locale, 'footer')}`}>
          <h5 className={`ai-type-footer-group-heading mb-3 m-0 block min-h-4 font-normal text-cta ${localeRoleClass(locale, 'label')}`}>{group.title}</h5>
          {group.links.map((link) => (
            <FooterNavLink key={`${group.title}-${link.href}`} {...link} locale={locale} />
          ))}
        </nav>
      ))}
    </div>
  )
}

function SocialLinks({ socials, locale }: { socials: FooterConfig['socials']; locale: PublicLocale }) {
  if (!socials.length) return null

  return (
    <div className={`flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-2 font-medium ${localeRoleClass(locale, 'label')}`}>
      {socials.map((social, index) => (
        <span key={`${social.label}-${social.href}`} className="flex items-center gap-3">
          {index > 0 && <span className="text-accent" aria-hidden>|</span>}
          <a href={social.href} className="inline-flex items-center gap-2 text-ink transition-colors hover:text-accent">
            {socialIcon(social.label) ? <EditorialIcon name={socialIcon(social.label) as EditorialIconName} className="h-3 w-3" /> : null}
            {social.label}
          </a>
        </span>
      ))}
    </div>
  )
}

function ExpandedFooter({ site }: { config: FooterConfig; site: ClientConfig }) {
  const embedSrc = mapEmbedSrc(site)
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].footer
  const contactCopy = chromeCopy[locale].contact
  const phone = site.business.phone ?? ''
  const whatsapp = site.business.whatsapp ?? ''
  const email = site.business.email ?? ''

  return (
    <footer id="footer" className="overflow-hidden border-t border-accent bg-ink text-surface">
      <div className="grid items-end gap-[clamp(28px,5vw,64px)] px-[clamp(20px,5vw,64px)] py-[clamp(56px,7vw,100px)] min-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
        <div className="min-w-0">
          <div className="flex items-center gap-3 text-cta" aria-label={site.business.name}>
            <BrandMark businessName={site.business.name} />
            <Wordmark as="h2" businessName={site.business.name} className="m-0 grid gap-1 font-display text-[clamp(22px,3vw,38px)] font-medium uppercase leading-[0.9] tracking-[0.08em]" />
          </div>
          <div className="mt-[clamp(28px,4vw,46px)] grid gap-x-[clamp(24px,4vw,48px)] gap-y-6 min-[720px]:grid-cols-3">
            {[
              { label: contactCopy.detailLabels.phone, value: phone, icon: 'phone' as const, href: phone ? `tel:${phone}` : undefined },
              { label: contactCopy.detailLabels.whatsapp, value: whatsapp, icon: 'message-circle' as const, href: whatsappHref(whatsapp) ?? undefined },
              { label: contactCopy.detailLabels.email, value: email, icon: 'email' as const, href: email ? `mailto:${email}` : undefined },
            ].filter((detail) => detail.value).map((detail) => (
              <div key={detail.label} className="grid min-w-0 gap-2 pb-5">
                <span className={`inline-flex items-center gap-2 text-cta ${localeRoleClass(locale, 'label')}`}><EditorialIcon name={detail.icon} className="h-3 w-3" />{detail.label}</span>
                <a href={detail.href} className="break-words text-[clamp(16px,1.5vw,21px)] leading-tight text-surface transition-colors hover:text-cta">{detail.value}</a>
              </div>
            ))}
          </div>
        </div>
        {embedSrc ? (
          <div className="relative flex aspect-[4/3] min-h-[200px] w-full items-center justify-center overflow-hidden border border-accent bg-hairline min-[900px]:max-h-[280px] min-[900px]:aspect-auto min-[900px]:h-[280px]">
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
      <div className={`grid gap-3 border-t border-accent px-[clamp(20px,5vw,64px)] py-[22px] leading-relaxed text-muted min-[720px]:grid-cols-[1fr_auto] min-[720px]:items-center ${localeRoleClass(locale, 'footer')}`}>
        <span className="break-words">
          © {new Date().getFullYear()} {site.business.name.toUpperCase()}. {copy.reserved}
        </span>
        {site.business.hours ? <p className="m-0">{site.business.hours}</p> : null}
      </div>
    </footer>
  )
}

function CompactFooter({ config, site }: { config: FooterConfig; site: ClientConfig }) {
  const address = addressText(site)
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].footer
  const labels = copy.links
  const showSeparator = site.legal.privacyPolicy && site.legal.terms

  return (
    <footer id="footer" className="overflow-hidden border-t border-accent bg-surface text-ink">
      <div className="flex flex-wrap items-center justify-between gap-5 px-5 py-7 sm:gap-8 sm:px-8 lg:px-16">
        <Wordmark
          as="h2"
          businessName={site.business.name}
          className="ai-type-wordmark-footer m-0 grid shrink-0 gap-1 font-medium uppercase leading-[1.15]"
        />
        <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 leading-relaxed text-muted sm:justify-center ${localeRoleClass(locale, 'footer')}`}>
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
          {address ? <p className="m-0 min-w-0 break-words">{address}</p> : null}
        </div>
        <SocialLinks socials={config.socials} locale={locale} />
      </div>
      <nav className={`flex flex-wrap gap-x-5 gap-y-2 border-t border-hairline px-5 py-4 sm:px-8 lg:px-16 ${localeRoleClass(locale, 'footer')}`}>
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
      <div className={`flex flex-wrap justify-between gap-[14px] bg-ink px-5 py-[22px] font-normal text-surface sm:px-8 lg:px-16 ${localeRoleClass(locale, 'footer')}`}>
        <span className="break-words">
          © {new Date().getFullYear()} {site.business.name.toUpperCase()}. {copy.reserved}
        </span>
        {(site.legal.privacyPolicy || site.legal.terms) && (
          <div className="flex flex-wrap gap-2">
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
          </div>
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
