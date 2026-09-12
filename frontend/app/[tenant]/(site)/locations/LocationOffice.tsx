import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, DrawFrame, HomeSection, RevealImage, Stagger, StaggerItem } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'
import { CopyAddress, OpenBadge } from './LocationChrome'
import { chromeCopy, localePageClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'

type Office = NonNullable<ClientConfig['sections']['locations']>['offices'][number]
type LocationCopy = (typeof chromeCopy)[PublicLocale]['locations']
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

function projectHref(slug: string, projects: ClientConfig['sections']['portfolio']['projects']) {
  return projects.some((p) => p.slug === slug) ? `/portfolio/${slug}` : '/portfolio'
}

function Heading({ office, copy, locale }: { office: Office; copy: LocationCopy; locale: PublicLocale }) {
  return (
    <section className={`${pagePad} pb-[clamp(28px,4vw,48px)] pt-[clamp(48px,7vw,96px)]`}>
      <Link
        href={locale === 'hi' ? '/hi/locations' : '/locations'}
        className="mb-6 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
      >
        <EditorialIcon name="arrow-left" className="h-3 w-3" />
        {copy.allLocations}
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
        <div className="min-w-0">
          <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.24em] text-accent">
            {office.address.locality ? `${office.address.locality} · ${office.address.city}` : office.address.city}
          </span>
          <h1 className="m-0 font-display text-[clamp(36px,6.5vw,88px)] font-light uppercase leading-[0.95] tracking-[-0.03em] text-ink">
            <ClipLine>{office.name}</ClipLine>
          </h1>
        </div>
        <div className="grid gap-3.5 pb-2">
          <OpenBadge hours={office.hours} />
          {office.hours?.weekday && (
            <span className="text-[clamp(20px,2.4vw,28px)] font-normal tracking-[-0.01em]">{office.hours.weekday}</span>
          )}
          {office.hours?.sunday && <span className="text-[13px] text-muted">{office.hours.sunday}</span>}
        </div>
      </div>
    </section>
  )
}

function StudioPhoto({ photo }: { photo: Office['photo'] }) {
  if (!photo) return null

  return (
    <section className={`${pagePad} pb-[clamp(44px,6vw,76px)] pt-[clamp(20px,2.6vw,36px)]`}>
      <figure className="mx-auto m-0 max-w-[56em]">
        <div className="relative block sm:mr-[clamp(16px,2vw,24px)] sm:mt-[clamp(16px,2vw,24px)]">
          <DrawFrame className="pointer-events-none absolute hidden border border-accent sm:block sm:-top-[clamp(16px,2vw,24px)] sm:bottom-[clamp(16px,2vw,24px)] sm:left-[clamp(16px,2vw,24px)] sm:-right-[clamp(16px,2vw,24px)]" />
          <div className="relative aspect-[16/9] overflow-hidden bg-hairline">
            <RevealImage>
              <Image src={photo.image} alt="" fill sizes="(min-width:1080px) 900px, 100vw" quality={90} priority className="object-cover" />
            </RevealImage>
          </div>
        </div>
        {photo.caption && (
          <figcaption className="mt-[clamp(20px,2.6vw,32px)] text-[10.5px] uppercase tracking-[0.2em] text-muted">
            {photo.caption}
          </figcaption>
        )}
      </figure>
    </section>
  )
}

function ContactBlock({ site, office, copy }: { site: ClientConfig; office: Office; copy: LocationCopy }) {
  const maps = mapOpenHref(office.address)
  const address = addressText(office.address)
  const wa = whatsappHref(site.business.whatsapp)

  return (
    <section id="contact" className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,100px)]`}>
      <div className="min-w-0 max-w-[42em]">
        <h2 className="mb-[clamp(28px,4vw,44px)] m-0 text-[clamp(13px,1.5vw,16px)] font-medium uppercase tracking-[0.24em] text-accent">
          <ClipLine>{copy.contact.title}</ClipLine>
        </h2>
        <div className="grid gap-2 border-b border-accent pb-[clamp(22px,3vw,30px)]">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.contact.address}</span>
          <span className="whitespace-pre-line text-[clamp(19px,2.2vw,26px)] font-normal leading-[1.35]">
            {addressLines(office.address).join('\n')}
          </span>
          {office.findNote && <span className="mt-1.5 text-[13.5px] leading-[1.6] text-body">{office.findNote}</span>}
        </div>
        <div className="grid grid-cols-1 gap-[clamp(20px,3vw,36px)] border-b border-accent py-[clamp(22px,3vw,30px)] min-[720px]:grid-cols-2">
          <div className="grid gap-2">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.contact.phone}</span>
            <a href={`tel:${site.business.phone}`} className="text-[clamp(19px,2.2vw,26px)] font-normal text-ink hover:text-accent">
              {site.business.phone}
            </a>
          </div>
          <div className="grid gap-2">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.contact.whatsapp}</span>
            {wa ? (
              <a href={wa} className="text-[clamp(19px,2.2vw,26px)] font-normal text-ink hover:text-accent">
                {site.business.whatsapp}
              </a>
            ) : (
              <span className="text-[clamp(19px,2.2vw,26px)] font-normal">{site.business.whatsapp}</span>
            )}
          </div>
        </div>
        {site.business.email ? (
          <div className="grid gap-2 border-b border-accent py-[clamp(22px,3vw,30px)]">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.contact.email}</span>
            <a href={`mailto:${site.business.email}`} className="text-[clamp(17px,1.9vw,22px)] font-normal text-ink hover:text-accent">
              {site.business.email}
            </a>
          </div>
        ) : null}
        {office.hours && (
          <div className="grid gap-3.5 pt-[clamp(22px,3vw,30px)]">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.contact.hours}</span>
            <div className="grid max-w-[340px] gap-2.5 text-[15px]">
              {office.hours.weekday && (
                <span className="flex justify-between gap-5">
                  <span>Monday – Friday</span>
                  <span className="text-body">{office.hours.weekday}</span>
                </span>
              )}
              {office.hours.saturday && (
                <span className="flex justify-between gap-5">
                  <span>Saturday</span>
                  <span className="text-body">{office.hours.saturday}</span>
                </span>
              )}
              {office.hours.sunday && (
                <span className="flex justify-between gap-5">
                  <span>Sunday</span>
                  <span className="text-muted">{office.hours.sunday}</span>
                </span>
              )}
            </div>
            {office.hours.note && <span className="mt-1.5 text-[13.5px] leading-[1.65] text-body">{office.hours.note}</span>}
            <div className="mt-2 flex flex-wrap gap-3">
              {maps ? (
                <a
                  href={maps}
                  className="inline-flex min-h-11 items-center gap-2.5 border border-ink px-6 py-[15px] text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-surface"
                >
                  {copy.contact.openMaps}
                  <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
                </a>
              ) : null}
              <CopyAddress address={address} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function WhoIsHere({ team, members, copy }: { team: Office['team']; members: ClientConfig['sections']['team']; copy: LocationCopy }) {
  if (!team.length) return null

  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,100px)]`}>
      <div className="mb-[clamp(32px,4.5vw,52px)] flex flex-wrap items-end justify-between gap-5">
        <h2 className="m-0 font-display text-[clamp(34px,6vw,80px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
          <ClipLine>
            {copy.whoTitle.lead} <span className="text-accent">{copy.whoTitle.accent}</span>
          </ClipLine>
        </h2>
      </div>
      <Stagger className="grid grid-cols-2 gap-[clamp(24px,3.4vw,40px)] min-[1080px]:grid-cols-4">
        {team.map((person) => {
          const slug = members?.members.find((m) => m.name === person.name)?.slug
          const inner = (
            <>
              {person.image && (
                <span className="relative aspect-[3/4] overflow-hidden bg-hairline">
                  <RevealImage>
                    <Image
                      src={person.image}
                      alt=""
                      fill
                      sizes="(min-width:1080px) 22vw, 45vw"
                      quality={90}
                      className="object-cover grayscale contrast-105 transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </RevealImage>
                </span>
              )}
              <span className="grid gap-2.5">
                <span className="text-[clamp(16px,1.8vw,21px)] font-normal uppercase leading-[1.15]">{person.name}</span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">{person.role}</span>
                {slug && (
                  <span className="mt-0.5 inline-flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.2em]">
                    {copy.whoProfile}
                    <EditorialIcon name="arrow-right" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                )}
              </span>
            </>
          )
          return (
            <StaggerItem key={person.name}>
              {slug ? (
                <Link href={`/team/${slug}`} className="group grid gap-[18px] text-ink">
                  {inner}
                </Link>
              ) : (
                <div className="grid gap-[18px] text-ink">{inner}</div>
              )}
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}

function Projects({ site, office, copy }: { site: ClientConfig; office: Office; copy: LocationCopy }) {
  const projects = site.sections.portfolio.projects.filter((p) => office.projectSlugs.includes(p.slug))
  if (!projects.length) return null

  return (
    <section className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
      <div className="mb-[clamp(32px,4.5vw,52px)] flex flex-wrap items-end justify-between gap-5">
        <h2 className="m-0 font-display text-[clamp(34px,6vw,80px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
          <ClipLine>
            {copy.projectsTitle.lead} <span className="text-accent">{copy.projectsTitle.accent}</span>
          </ClipLine>
        </h2>
        <Link href="/portfolio" className="text-[11.5px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent">
          {copy.projectsAll} ↗
        </Link>
      </div>
      <Stagger className="grid grid-cols-1 gap-[clamp(18px,2.6vw,28px)] min-[720px]:grid-cols-2 min-[1080px]:grid-cols-3">
        {projects.map((project) => (
          <StaggerItem key={project.slug}>
            <Link
              href={projectHref(project.slug, site.sections.portfolio.projects)}
              className="group grid border border-hairline text-ink transition-colors hover:border-accent"
            >
              <span className="relative aspect-[4/3] overflow-hidden bg-hairline">
                <Image
                  src={project.cover}
                  alt=""
                  fill
                  sizes="(min-width:1080px) 30vw, (min-width:720px) 45vw, 100vw"
                  quality={90}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </span>
              <span className="grid gap-2.5 p-[clamp(16px,2vw,22px)]">
                <span className="text-[clamp(15px,1.7vw,19px)] font-normal uppercase leading-[1.15]">{project.title}</span>
                {(project.location || project.duration) && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    {[project.location, project.duration].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

function OtherLocationsNote({ note, copy }: { note?: string; copy: LocationCopy }) {
  if (!note) return null

  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(44px,6vw,80px)]`}>
      <span className="mb-[18px] block text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.otherLabel}</span>
      <p className="m-0 max-w-[44em] text-pretty text-sm leading-[1.7] text-muted">{note}</p>
    </section>
  )
}

function VisitCta({ site, copy }: { site: ClientConfig; copy: LocationCopy }) {
  const wa = whatsappHref(site.business.whatsapp)

  return (
    <section className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
      <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
        <div>
          <div className="mb-[clamp(18px,3vw,30px)] text-[10.5px] font-normal uppercase leading-[1.6] tracking-[0.24em] text-accent">
            <ClipLine>{copy.visit.eyebrow.join(' ')}</ClipLine>
          </div>
          <h2 className="m-0 font-display text-[clamp(32px,5.2vw,68px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
            <ClipLine>
              {copy.visit.title.lead} <span className="text-accent">{copy.visit.title.accent}</span>
            </ClipLine>
          </h2>
        </div>
        {wa ? (
          <a
            href={wa}
            className="inline-flex min-h-11 items-center gap-3.5 bg-cta px-[34px] py-5 text-[clamp(10.5px,1.1vw,12px)] font-medium uppercase tracking-[0.18em] text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] hover:bg-ink hover:text-cta"
          >
            {copy.visit.action}
            <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </section>
  )
}

export function LocationOffice({ site, office }: { site: ClientConfig; office: Office }) {
  const closing = renderableSections(site, ['footer'])
  const locale = publicLocaleFromSite(site)
  const labels = chromeCopy[locale].locations

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
        <Heading office={office} copy={labels} locale={locale} />
      </HomeSection>
      <HomeSection>
        <StudioPhoto photo={office.photo} />
      </HomeSection>
      <HomeSection>
        <ContactBlock site={site} office={office} copy={labels} />
      </HomeSection>
      <HomeSection>
        <WhoIsHere team={office.team} members={site.sections.team} copy={labels} />
      </HomeSection>
      <HomeSection>
        <Projects site={site} office={office} copy={labels} />
      </HomeSection>
      <HomeSection>
        <OtherLocationsNote note={site.sections.locations?.otherLocationsNote} copy={labels} />
      </HomeSection>
      <HomeSection>
        <VisitCta site={site} copy={labels} />
      </HomeSection>
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
