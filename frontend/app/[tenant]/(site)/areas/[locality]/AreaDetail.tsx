import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, FadeUp, FadeUpItem, HomeSection, Stagger } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'

type Area = NonNullable<ClientConfig['sections']['areas']>['items'][number]

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  eyebrow: ['Where we', 'Work'],
  finished: { lead: 'Finished', accent: 'On this road' },
  allProjects: 'All projects',
  readCase: 'Read the case study',
  studioTitle: { lead: 'The studio', accent: 'Is here' },
  addressLabel: 'Address',
  visitsLabel: 'Site visits in this area',
  visits: 'Same week, usually next day',
  nearbyLabel: 'We also work in',
  cta: { eyebrow: ['Walking distance', 'From your flat'], title: { lead: 'Come up', accent: 'And see us' }, action: 'Discuss a project here' },
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

function whatsappHref(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : undefined
}

function addressQuery(address: ClientConfig['business']['address']): string {
  return [address.line1, address.locality, address.city, address.state, address.pincode]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ')
}

function mapEmbedSrc(address: ClientConfig['business']['address']): string | undefined {
  const configured = address.mapsEmbedUrl?.trim()
  const usable = configured && !configured.includes('pb=sample') && /google\.[^/]+\/maps/i.test(configured)
  if (usable) return configured
  const query = addressQuery(address)
  return query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed` : undefined
}

function formatTitle(name: string): { lead: string; accent: string | null } {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length < 2) return { lead: name, accent: null }
  return { lead: words.slice(0, -1).join(' '), accent: words.at(-1) ?? null }
}

function AreaHeading({ area }: { area: Area }) {
  const title = formatTitle(area.name)
  const [lead, ...rest] = area.intro

  return (
    <section className={`${pagePad} pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,7vw,96px)]`}>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,88px)] min-[1080px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <p className="mb-[clamp(20px,3vw,34px)] m-0 grid gap-1.5 text-[10.5px] font-normal uppercase leading-[1.6] tracking-[0.24em] text-accent">
            {copy.eyebrow.map((line, index) => (
              <ClipLine key={line} delay={index * 0.05}>
                {line}
              </ClipLine>
            ))}
          </p>
          <h1 className="m-0 font-display text-[clamp(42px,8vw,104px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
            <ClipLine>{title.lead}</ClipLine>
            {title.accent && (
              <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>
                {title.accent}
              </ClipLine>
            )}
          </h1>
          {area.stats.length > 0 && (
            <div className="mt-[clamp(28px,4vw,44px)] grid grid-cols-2 gap-[clamp(18px,3vw,32px)] border-t border-accent pt-[clamp(22px,3vw,30px)]">
              {area.stats.map((stat) => (
                <div key={stat.label} className="grid gap-2">
                  <span className="text-[clamp(30px,3.8vw,48px)] font-normal leading-none tracking-[-0.02em] text-ink">
                    {stat.value}
                  </span>
                  <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <FadeUp className="min-w-0 max-w-[42em]" delay={0.12}>
          {lead ? (
            <p className="m-0 text-pretty text-[clamp(16px,1.8vw,19px)] leading-[1.65] text-ink">{lead}</p>
          ) : null}
          {rest.length ? (
            <div className="mt-5 grid gap-5">
              {rest.map((part) => (
                <p key={part.slice(0, 28)} className="m-0 text-pretty text-justify text-[15.5px] leading-[1.75] text-body">
                  {part}
                </p>
              ))}
            </div>
          ) : null}
        </FadeUp>
      </div>
    </section>
  )
}

function ProjectCards({ cards, projects }: { cards: Area['cards']; projects: ClientConfig['sections']['portfolio']['projects'] }) {
  if (!cards.length) return null

  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,100px)]`}>
      <div className="mb-[clamp(32px,4.5vw,52px)] flex flex-wrap items-end justify-between gap-5">
        <h2 className="m-0 font-display text-[clamp(34px,6vw,80px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
          <ClipLine>{copy.finished.lead}</ClipLine>
          <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>
            {copy.finished.accent}
          </ClipLine>
        </h2>
        <Link
          href="/portfolio"
          className="inline-flex min-h-11 items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent"
        >
          {copy.allProjects}
          <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
        </Link>
      </div>
      <Stagger className="grid gap-[clamp(16px,2.4vw,26px)]">
        {cards.map((card, index) => {
          const match = projects.find((project) => project.slug === card.slug)
          const href = match ? `/portfolio/${match.slug}` : '/portfolio'
          return (
            <FadeUpItem key={card.slug}>
              <Link
                href={href}
                className="relative grid grid-cols-1 items-center gap-[clamp(20px,3vw,40px)] border border-accent bg-surface p-[clamp(18px,2.4vw,26px)] text-ink transition-colors hover:bg-panel md:grid-cols-[minmax(220px,340px)_minmax(0,1fr)]"
              >
                <span className="pointer-events-none absolute top-[clamp(6px,1vw,12px)] right-[clamp(14px,2vw,26px)] font-display text-[clamp(48px,6vw,86px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {card.image && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-hairline">
                    <Image src={card.image} alt={card.title} fill sizes="340px" quality={90} className="object-cover" />
                  </div>
                )}
                <div className="relative grid min-w-0 gap-3.5">
                  <span className="text-[clamp(20px,2.6vw,32px)] font-normal uppercase leading-[1.1] tracking-[-0.01em]">
                    {card.title}
                  </span>
                  {card.body && <p className="m-0 max-w-[34em] text-pretty text-[14.5px] leading-[1.7] text-body">{card.body}</p>}
                  {card.meta && (
                    <div className="flex flex-wrap gap-x-[clamp(18px,3vw,32px)] gap-y-2.5 text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">
                      <span>{card.meta}</span>
                    </div>
                  )}
                  <span className="inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.2em]">
                    {copy.readCase}
                    <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </FadeUpItem>
          )
        })}
      </Stagger>
    </section>
  )
}

function MapNearby({ site, area }: { site: ClientConfig; area: Area }) {
  const embed = mapEmbedSrc(site.business.address)
  const address = site.business.address
  const line1 = [address.line1, address.locality].filter(Boolean).join(', ')
  const line2 = [address.city, address.state, address.pincode].filter(Boolean).join(', ')

  return (
    <section className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,5vw,72px)] min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <h2 className="m-0 font-display text-[clamp(28px,4.4vw,56px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
            <ClipLine>{copy.studioTitle.lead}</ClipLine>
            <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>
              {copy.studioTitle.accent}
            </ClipLine>
          </h2>
          <div className="mt-[clamp(28px,4vw,40px)] grid gap-5">
            <div className="grid gap-2 border-t border-hairline pt-[18px]">
              <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.addressLabel}</span>
              <span className="text-base leading-relaxed text-ink">
                {line1}
                {line2 ? (
                  <>
                    <br />
                    {line2}
                  </>
                ) : null}
              </span>
            </div>
            <div className="grid gap-2 border-t border-hairline pt-[18px]">
              <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.visitsLabel}</span>
              <span className="text-base leading-relaxed text-ink">{copy.visits}</span>
            </div>
          </div>
        </div>
        <div className="relative min-w-0">
          <div className="pointer-events-none absolute -top-5 bottom-5 left-5 -right-5 border border-accent" />
          <div className="relative min-h-[280px] overflow-hidden border border-accent bg-hairline md:min-h-[360px] lg:min-h-[460px]">
            {embed ? (
              <iframe
                className="absolute inset-0 h-full w-full border-0 grayscale"
                src={embed}
                title={copy.studioTitle.lead}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </div>
        </div>
      </div>
      {area.nearby.length > 0 && (
        <div className="mt-[clamp(48px,6vw,80px)] border-t border-accent pt-[clamp(24px,3vw,34px)]">
          <span className="mb-[18px] block text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
            {copy.nearbyLabel}
          </span>
          <div className="flex flex-wrap gap-x-[clamp(20px,3vw,40px)] gap-y-3.5 text-[clamp(13px,1.5vw,16px)] tracking-[0.06em] text-ink">
            {area.nearby.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function AreaCta({ href }: { href: string }) {
  return (
    <section id="contact" className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,100px)]`}>
      <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
        <div className="min-w-0">
          <div className="mb-[clamp(18px,3vw,30px)] grid gap-1.5 text-[10.5px] font-normal uppercase leading-relaxed tracking-[0.24em] text-accent">
            {copy.cta.eyebrow.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <h2 className="m-0 font-display text-[clamp(32px,5.2vw,68px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
            {copy.cta.title.lead}
            <span className="ml-[0.55em] block text-accent">{copy.cta.title.accent}</span>
          </h2>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-3.5 bg-cta px-[34px] py-5 text-[clamp(10.5px,1.1vw,12px)] font-medium uppercase tracking-[0.18em] text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] hover:bg-ink hover:text-cta"
        >
          {copy.cta.action}
          <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  )
}

export function AreaDetail({ site, area }: { site: ClientConfig; area: Area }) {
  const closing = renderableSections(site, ['footer'])
  const ctaHref = whatsappHref(site.business.whatsapp) ?? '#footer'

  return (
    <article className="overflow-x-clip bg-surface text-ink">
      <HeroNav
        businessName={site.business.name}
        phone={site.business.phone}
        tone="on-surface"
        inner
        services={site.sections.services?.items}
      />
      <HomeSection first>
        <AreaHeading area={area} />
      </HomeSection>
      <HomeSection>
        <ProjectCards cards={area.cards} projects={site.sections.portfolio.projects} />
      </HomeSection>
      <HomeSection>
        <MapNearby site={site} area={area} />
      </HomeSection>
      <HomeSection>
        <AreaCta href={ctaHref} />
      </HomeSection>
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
