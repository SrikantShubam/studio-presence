import Link from 'next/link'
import type { ClientConfig, SectionConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeRoleClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon, type EditorialIconName } from '@/lib/icons'
import type { SectionComponentProps } from '@/sections/registry'

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

function footerGroups(site: ClientConfig, locale: PublicLocale): { title: string; links: FooterLink[] }[] {
  const copy = chromeCopy[locale].footer
  const labels = copy.links
  const studio: FooterLink[] = [
    { href: '/', label: labels.home },
    { href: '/about', label: labels.about },
  ]
  if (site.sections.contact?.enabled) {
    studio.push({ href: '/contact', label: labels.contact })
  }
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
  const className = 'text-surface/75 text-sm uppercase tracking-[0.04em] transition-colors hover:text-cta'
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
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
    <div className="border-t border-accent px-[clamp(20px,5vw,64px)] pb-[clamp(48px,6vw,72px)] pt-[clamp(36px,5vw,56px)]">
      <div className="grid grid-cols-2 items-start gap-x-[clamp(24px,4vw,48px)] gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {groups.map((group) => (
          <nav key={group.title} className={`grid content-start gap-3.5 leading-none ${localeRoleClass(locale, 'footer')}`}>
            <h5 className={`m-0 block border-b border-accent/50 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cta ${localeRoleClass(locale, 'label')}`}>
              {group.title}
            </h5>
            <div className="grid gap-2.5 pt-1">
              {group.links.map((link) => (
                <FooterNavLink key={`${group.title}-${link.href}`} {...link} locale={locale} />
              ))}
            </div>
          </nav>
        ))}
      </div>
    </div>
  )
}

function SocialLinks({
  socials,
  locale: _locale,
  tone = 'dark',
}: {
  socials: FooterConfig['socials']
  locale?: PublicLocale
  tone?: 'dark' | 'light'
}) {
  if (!socials.length) return null

  const linkClass =
    tone === 'dark'
      ? 'text-surface/85 hover:text-cta'
      : 'text-ink hover:text-accent'

  const iconClass =
    tone === 'dark'
      ? 'text-cta'
      : 'text-accent'

  return (
    <div className="inline-flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:text-base font-semibold uppercase tracking-[0.16em]">
      {socials.map((social, index) => (
        <span key={`${social.label}-${social.href}`} className="flex items-center gap-5">
          {index > 0 && <span className={tone === 'dark' ? 'text-accent' : 'text-hairline'} aria-hidden>|</span>}
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex items-center gap-2.5 transition-colors ${linkClass}`}
          >
            {socialIcon(social.label) ? (
              <EditorialIcon
                name={socialIcon(social.label) as EditorialIconName}
                className={`!h-5 !w-5 shrink-0 text-base ${iconClass} transition-transform group-hover:scale-110`}
              />
            ) : null}
            <span>{social.label}</span>
          </a>
        </span>
      ))}
    </div>
  )
}

function ExpandedFooter({ config, site }: { config: FooterConfig; site: ClientConfig }) {
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].footer
  const contactCopy = chromeCopy[locale].contact
  const phone = site.business.phone ?? ''
  const whatsapp = site.business.whatsapp ?? ''
  const email = site.business.email ?? ''
  const address = addressText(site)
  const query = addressQuery(site)
  const showSeparator = site.legal.privacyPolicy && site.legal.terms
  const estimateHref = site.sections.estimate?.enabled ? localeHref('/estimate', locale) : null

  return (
    <footer id="footer" className="overflow-hidden border-t border-accent bg-ink text-surface">
      {/* 1. Atelier Masthead & Direct Studio Lines */}
      <div className="grid gap-x-[clamp(36px,6vw,88px)] gap-y-12 px-[clamp(20px,5vw,64px)] py-[clamp(56px,8vw,104px)] min-[960px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        {/* Left: Brand Wordmark, Two-Tone Mandate & Reassurance */}
        <div className="min-w-0">
          <Link href={localeHref('/', locale)} className="inline-block" aria-label={site.business.name}>
            <picture>
              <source srcSet="/brand/wordmark-horizontal-dark.svg" type="image/svg+xml" />
              <source srcSet="/brand/wordmark-horizontal-dark.webp" type="image/webp" />
              <img
                src="/brand/wordmark-horizontal-dark.svg"
                alt={site.business.name}
                width={520}
                height={80}
                className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto max-w-full object-contain"
              />
            </picture>
          </Link>

          <div className="mt-8 border-t border-accent/60 pt-8 sm:mt-10 sm:pt-10">
            <h2 className="m-0 text-[clamp(28px,3.5vw,46px)] font-light uppercase tracking-tight text-surface">
              {copy.contactTitle.lead}
              <span className="ml-[0.45em] text-cta">
                {copy.contactTitle.accent}
              </span>
            </h2>
            <p className={`mt-4 max-w-xl text-base leading-relaxed text-surface/75 sm:text-lg ${localeRoleClass(locale, 'body')}`}>
              {config.reassuranceLine ?? copy.newsletter}
            </p>
          </div>

          {/* Physical Address & Operating Hours */}
          {(address || site.business.hours) && (
            <div className="mt-8 grid gap-4 text-base sm:text-lg leading-relaxed text-surface/85 sm:mt-10">
              {address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-3.5 text-surface/85 transition-colors hover:text-cta"
                >
                  <EditorialIcon name="map-pin" className="mt-1 !h-5 !w-5 shrink-0 text-cta text-lg transition-transform group-hover:scale-110" />
                  <span className="text-sm sm:text-base tracking-wide uppercase">{address}</span>
                </a>
              )}
              {site.business.hours && (
                <div className="inline-flex items-center gap-3.5 text-surface/85">
                  <EditorialIcon name="clock" className="!h-5 !w-5 shrink-0 text-cta text-lg" />
                  <span className="text-sm sm:text-base tracking-wide uppercase">{site.business.hours}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Direct Studio Lines & Action Suite */}
        <div className="flex flex-col justify-between gap-8 border-t border-accent/60 pt-8 min-[960px]:border-t-0 min-[960px]:border-l min-[960px]:border-accent/60 min-[960px]:pl-[clamp(32px,5vw,72px)] min-[960px]:pt-0">
          <div className="grid gap-6">
            <span className={`text-xs font-semibold uppercase tracking-[0.24em] text-cta ${localeRoleClass(locale, 'label')}`}>
              {contactCopy.detailLabels.studio}
            </span>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="break-words text-[clamp(24px,3.2vw,40px)] font-light tracking-tight text-surface transition-colors hover:text-cta"
              >
                {phone}
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="break-words text-base text-surface/80 transition-colors hover:text-cta sm:text-lg"
              >
                {email}
              </a>
            )}

            {/* Chamfered & Outlined Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {whatsapp && (
                <a
                  href={whatsappHref(whatsapp) ?? '#'}
                  className="inline-flex min-h-11 items-center gap-2.5 bg-cta px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-90 [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-14px)_100%,0_100%)]"
                >
                  <EditorialIcon name="message-circle" className="h-3.5 w-3.5" />
                  {copy.whatsappCta} ↗
                </a>
              )}
              {estimateHref && (
                <Link
                  href={estimateHref}
                  className="group/btn relative inline-flex min-h-11 items-center gap-2.5 bg-surface px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-surface transition-colors hover:text-ink [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-14px)_100%,0_100%)]"
                >
                  <span
                    className="pointer-events-none absolute inset-px bg-ink transition-colors group-hover/btn:bg-surface [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-14px)_100%,0_100%)]"
                    aria-hidden
                  />
                  <span className="relative z-10 flex items-center gap-2 text-surface transition-colors group-hover/btn:text-ink">
                    {contactCopy.estimateCta} ↗
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Action Utilities: Studio Map Navigation & Social Channels */}
          <div className="grid gap-3 border-t border-accent/40 pt-5 text-sm sm:text-base font-semibold uppercase tracking-[0.16em]">
            {query && (
              <div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-surface/85 transition-colors hover:text-cta"
                >
                  <EditorialIcon name="map-pin" className="!h-5 !w-5 shrink-0 text-cta transition-transform group-hover:scale-110" />
                  <span>{contactCopy.mapAction}</span>
                  <span className="text-cta">↗</span>
                </a>
              </div>
            )}
            <SocialLinks socials={config.socials} locale={locale} tone="dark" />
          </div>
        </div>
      </div>

      {/* 2. Architectural Directory (Sitemap) */}
      <VisitSitemap site={site} />

      {/* 3. Colophon & Legal Datum */}
      <div className={`flex flex-wrap items-center justify-between gap-4 border-t border-accent px-[clamp(20px,5vw,64px)] py-6 text-xs tracking-[0.14em] text-surface/60 sm:py-7 ${localeRoleClass(locale, 'footer')}`}>
        <span className="break-words">
          © {new Date().getFullYear()} {site.business.name.toUpperCase()}. {copy.reserved}
        </span>
        {(site.legal.privacyPolicy || site.legal.terms) && (
          <div className="flex flex-wrap items-center gap-3">
            {site.legal.privacyPolicy ? (
              <a href={localeHref('/privacy', locale)} className="text-surface/75 transition-colors hover:text-cta">
                {copy.links.privacy}
              </a>
            ) : null}
            {showSeparator ? <span className="text-accent" aria-hidden>|</span> : null}
            {site.legal.terms ? (
              <a href={localeHref('/terms', locale)} className="text-surface/75 transition-colors hover:text-cta">
                {copy.links.terms}
              </a>
            ) : null}
          </div>
        )}
      </div>
    </footer>
  )
}

function CompactFooter({ config, site }: { config: FooterConfig; site: ClientConfig }) {
  const address = addressText(site)
  const query = addressQuery(site)
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].footer
  const labels = copy.links
  const showSeparator = site.legal.privacyPolicy && site.legal.terms

  return (
    <footer id="footer" className="overflow-hidden border-t border-accent bg-surface text-ink">
      {/* Upper Row: Wordmark, Studio Contacts, Socials */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-[clamp(20px,5vw,64px)] py-8">
        <Link href={localeHref('/', locale)} className="inline-block shrink-0" aria-label={site.business.name}>
          <picture>
            <source srcSet="/brand/wordmark-horizontal-light.svg" type="image/svg+xml" />
            <source srcSet="/brand/wordmark-horizontal-light.webp" type="image/webp" />
            <img
              src="/brand/wordmark-horizontal-light.svg"
              alt={site.business.name}
              width={520}
              height={80}
              className="h-10 sm:h-12 md:h-14 w-auto object-contain"
            />
          </picture>
        </Link>
        <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted sm:justify-center ${localeRoleClass(locale, 'footer')}`}>
          {site.business.phone && (
            <a href={`tel:${site.business.phone}`} className="min-w-0 break-words font-medium text-ink transition-colors hover:text-accent">
              {site.business.phone}
            </a>
          )}
          {site.business.whatsapp && (
            <>
              <span className="h-3.5 w-px shrink-0 bg-accent" aria-hidden />
              <a href={whatsappHref(site.business.whatsapp) ?? '#'} className="min-w-0 break-words font-medium text-ink transition-colors hover:text-accent">
                {site.business.whatsapp}
              </a>
            </>
          )}
          {address && (
            <>
              <span className="h-3.5 w-px shrink-0 bg-accent" aria-hidden />
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="m-0 min-w-0 break-words hover:text-ink"
              >
                {address}
              </a>
            </>
          )}
        </div>
        <SocialLinks socials={config.socials} locale={locale} tone="light" />
      </div>

      {/* Directory Row */}
      <nav className={`flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline px-[clamp(20px,5vw,64px)] py-4 text-xs font-medium uppercase tracking-[0.14em] ${localeRoleClass(locale, 'footer')}`}>
        {footerGroups(site, locale)
          .flatMap((group) => group.links)
          .filter((link, index, all) => all.findIndex((item) => item.href === link.href) === index)
          .slice(0, 10)
          .map((link) =>
            link.href.startsWith('http') ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-ink transition-colors hover:text-accent">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={localeHref(link.href, locale)} className="text-ink transition-colors hover:text-accent">
                {link.label}
              </Link>
            ),
          )}
      </nav>

      {/* Bottom Bar */}
      <div className={`flex flex-wrap justify-between gap-4 bg-ink px-[clamp(20px,5vw,64px)] py-5 text-xs tracking-[0.14em] text-surface ${localeRoleClass(locale, 'footer')}`}>
        <span className="break-words">
          © {new Date().getFullYear()} {site.business.name.toUpperCase()}. {copy.reserved}
        </span>
        {(site.legal.privacyPolicy || site.legal.terms) && (
          <div className="flex flex-wrap items-center gap-2">
            {site.legal.privacyPolicy ? (
              <a href={localeHref('/privacy', locale)} className="text-surface transition-colors hover:text-cta">
                {labels.privacy}
              </a>
            ) : null}
            {showSeparator ? <span aria-hidden>|</span> : null}
            {site.legal.terms ? (
              <a href={localeHref('/terms', locale)} className="text-surface transition-colors hover:text-cta">
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
