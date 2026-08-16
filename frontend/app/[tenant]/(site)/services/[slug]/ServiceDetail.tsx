import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, FadeUp, FadeUpItem, HomeSection, Stagger } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import type { PortfolioProject } from '@/sections/Portfolio/shared'
import { renderableSections } from '@/sections/registry'
import { ServiceFaq } from './ServiceFaq'

type Service = NonNullable<ClientConfig['sections']['services']>['items'][number]

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  back: 'All projects',
  includedTitle: { lead: 'What the', accent: 'price covers' },
  linkedTitle: { lead: 'A project', accent: 'we built' },
  read: 'Read the case study',
  cta: {
    eyebrow: ['Send us the', 'measurements'],
    title: { lead: 'Two walls,', accent: 'one number' },
    action: 'Get an estimate on WhatsApp',
  },
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

function whatsappHref(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : undefined
}

function Photo({
  src,
  alt,
  sizes,
  ratio,
  priority = false,
}: {
  src: string
  alt: string
  sizes: string
  ratio: string
  priority?: boolean
}) {
  return (
    <div className={`relative min-w-0 w-full overflow-hidden bg-hairline ${ratio}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={90} className="object-cover object-center" />
    </div>
  )
}

function Caption({ children }: { children: string }) {
  return <figcaption className="text-[10.5px] uppercase tracking-[0.2em] text-muted">{children}</figcaption>
}

function ServiceHeading({ service }: { service: Service }) {
  const [lead, ...rest] = service.intro

  return (
    <section className={`${pagePad} pb-[clamp(36px,5vw,64px)] pt-[clamp(48px,7vw,96px)]`}>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,88px)] min-[1080px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <h1 className="m-0 font-display text-[clamp(42px,8vw,104px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
            {service.title}
          </h1>
          {service.price ? (
            <FadeUp className="mt-[clamp(28px,4vw,44px)] grid gap-2.5 border-t border-accent pt-[clamp(22px,3vw,30px)]" delay={0.12}>
              <span className="text-[clamp(28px,3.6vw,46px)] font-normal leading-none tracking-[-0.02em] text-ink">
                {service.price.value}
              </span>
              {service.price.unit && (
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">{service.price.unit}</span>
              )}
              {service.price.note && (
                <span className="mt-1.5 text-[13px] leading-[1.6] text-muted">{service.price.note}</span>
              )}
            </FadeUp>
          ) : null}
        </div>

        <FadeUp className="min-w-0 max-w-[42em] font-body" delay={0.16}>
          {lead ? (
            <p className="m-0 text-pretty text-[clamp(16px,1.8vw,19px)] leading-[1.65] text-ink">{lead}</p>
          ) : null}
          {rest.length ? (
            <div className="mt-5 grid gap-5">
              {rest.map((part) => (
                <p key={part.slice(0, 24)} className="m-0 text-pretty text-justify text-[15.5px] leading-[1.75] text-body">
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

function ServicePhotos({ service }: { service: Service }) {
  const [lead, ...tiles] = service.photos
  if (!lead) return null

  return (
    <section className={`${pagePad} pb-[clamp(56px,8vw,100px)]`}>
      <div className="relative mb-[clamp(14px,2vw,22px)] mr-[clamp(20px,3vw,30px)] mt-[clamp(20px,3vw,30px)]">
        <div className="pointer-events-none absolute -top-[clamp(20px,3vw,30px)] bottom-[clamp(20px,3vw,30px)] left-[clamp(20px,3vw,30px)] -right-[clamp(20px,3vw,30px)] border border-accent" />
        <figure className="relative m-0 grid gap-3">
          <Photo src={lead.image} alt={lead.caption ?? service.title} sizes="100vw" ratio="aspect-[4/3] lg:aspect-video" priority />
          {lead.caption && <Caption>{lead.caption}</Caption>}
        </figure>
      </div>
      {tiles.length > 0 && (
        <Stagger className="mt-[clamp(28px,4vw,48px)] grid grid-cols-2 gap-[clamp(12px,2vw,22px)] md:grid-cols-3 lg:grid-cols-5">
          {tiles.map((tile, i) => (
            <FadeUpItem key={tile.image + i}>
              <figure className="m-0 grid min-w-0 gap-3">
                <Photo src={tile.image} alt={tile.caption ?? service.title} sizes="(max-width: 768px) 50vw, 20vw" ratio="aspect-square" />
                {tile.caption && <Caption>{tile.caption}</Caption>}
              </figure>
            </FadeUpItem>
          ))}
        </Stagger>
      )}
    </section>
  )
}

function WhatsIncluded({ service }: { service: Service }) {
  if (!service.included.length) return null

  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(64px,9vw,110px)]`}>
      <div className="mb-[clamp(36px,5vw,60px)] flex flex-wrap items-end justify-between gap-6">
        <h2 className="m-0 font-display text-[clamp(34px,6vw,80px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
          <ClipLine>{copy.includedTitle.lead}</ClipLine>
          <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>{copy.includedTitle.accent}</ClipLine>
        </h2>
      </div>
      <Stagger className="grid grid-cols-1 gap-[clamp(22px,3.5vw,44px)] md:grid-cols-2 lg:grid-cols-3">
        {service.included.map((item, i) => (
          <FadeUpItem key={item.title} className="grid gap-3 border-t border-accent pt-5">
            <span className="font-display text-[clamp(32px,4vw,52px)] font-light leading-[0.85] text-transparent [-webkit-text-stroke:1px_var(--color-muted)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="m-0 text-[clamp(14.5px,1.5vw,17px)] font-normal uppercase tracking-[0.06em] text-ink">
              {item.title}
            </h3>
            <p className="m-0 text-pretty text-[13.5px] leading-[1.7] text-body">{item.body}</p>
          </FadeUpItem>
        ))}
      </Stagger>
    </section>
  )
}

function LinkedProject({ project }: { project?: PortfolioProject }) {
  if (!project) return null

  return (
    <section className={`${pagePad} border-t border-accent py-[clamp(64px,9vw,110px)]`}>
      <div className="mb-[clamp(28px,4vw,44px)] flex flex-wrap items-end justify-between gap-5">
        <h2 className="m-0 font-display text-[clamp(30px,5vw,64px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
          {copy.linkedTitle.lead}
          <span className="ml-[0.55em] block text-accent">{copy.linkedTitle.accent}</span>
        </h2>
        <Link
          href="/portfolio"
          className="inline-flex min-h-11 items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent"
        >
          {copy.back}
          <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
        </Link>
      </div>
      <Link
        href={`/portfolio/${project.slug}`}
        className="grid grid-cols-1 items-center gap-[clamp(20px,3vw,40px)] border border-accent p-[clamp(18px,2.4vw,26px)] text-ink hover:bg-panel md:grid-cols-[minmax(220px,360px)_minmax(0,1fr)]"
      >
        <Photo src={project.cover} alt={project.title} sizes="360px" ratio="aspect-[4/3]" />
        <div className="grid min-w-0 gap-4">
          <span className="text-[clamp(22px,2.8vw,34px)] font-normal uppercase leading-[1.1] tracking-[-0.01em]">
            {project.title}
          </span>
          {project.blurb && (
            <p className="m-0 max-w-[34em] text-pretty text-[14.5px] leading-[1.7] text-body">{project.blurb}</p>
          )}
          {[project.location, project.duration].filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-x-[clamp(20px,3vw,36px)] gap-y-3 text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">
              {[project.location, project.duration].filter(Boolean).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          )}
          <span className="inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.2em]">
            {copy.read}
            <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </section>
  )
}

function ServiceCta({ href }: { href: string }) {
  return (
    <section id="contact" className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
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

export function ServiceDetail({
  site,
  service,
}: {
  site: ClientConfig
  service: Service
}) {
  const linked = service.linkedProjectSlug
    ? site.sections.portfolio.projects.find((item) => item.slug === service.linkedProjectSlug)
    : undefined
  const closing = renderableSections(site, ['footer'])
  const ctaHref = whatsappHref(site.business.whatsapp) ?? (site.sections.estimate?.enabled ? '/estimate' : '#footer')

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
        <ServiceHeading service={service} />
      </HomeSection>
      <HomeSection>
        <ServicePhotos service={service} />
      </HomeSection>
      <HomeSection>
        <WhatsIncluded service={service} />
      </HomeSection>
      <HomeSection>
        <LinkedProject project={linked} />
      </HomeSection>
      {service.faq.length > 0 && (
        <HomeSection>
          <ServiceFaq faq={service.faq} />
        </HomeSection>
      )}
      <HomeSection>
        <ServiceCta href={ctaHref} />
      </HomeSection>
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
