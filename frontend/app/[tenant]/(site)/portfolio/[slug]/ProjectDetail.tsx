import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { chromeCopy, localeHref, localePageClass, localeRoleClass, localeTextClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, HomeSection } from '@/lib/motion'
import { GalleryPhoto, ProjectGallery, type GalleryItem } from './ProjectGallery'
import { HeroNav } from '@/sections/Hero/HeroNav'
import type { PortfolioProject } from '@/sections/Portfolio/shared'
import { renderableSections } from '@/sections/registry'

type CaseStudy = NonNullable<ClientConfig['sections']['caseStudy']>['items'][number]

const pagePad = 'px-[clamp(20px,5vw,64px)]'

/** Same word-split approach as About/index.tsx — not stored, just how a plain title is presented. */
function splitTitle(title: string): { lead: string; accent: string | null } {
  const comma = title.indexOf(',')
  if (comma > 0) return { lead: title.slice(0, comma).trim(), accent: title.slice(comma + 1).trim() || null }
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length < 2) return { lead: title, accent: null }
  return { lead: words.slice(0, -1).join(' '), accent: words.at(-1) ?? null }
}

function projectTypeLabel(value: PortfolioProject['projectType']): string | null {
  return value ? value.replace(/-/g, ' ') : null
}

function neighbors(projects: PortfolioProject[], slug: string) {
  const index = projects.findIndex((item) => item.slug === slug)
  return {
    index,
    prev: index > 0 ? projects[index - 1] : undefined,
    next: index >= 0 && index < projects.length - 1 ? projects[index + 1] : undefined,
  }
}

function whatsappHref(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : undefined
}

function ProjectTitle({ title, number, locale }: { title: { lead: string; accent: string | null }; number: string; locale: PublicLocale }) {
  const copy = chromeCopy[locale].portfolio.detail

  return (
    <section className={`${pagePad} pb-[clamp(32px,4vw,56px)] pt-[clamp(48px,7vw,92px)]`}>
      <div className="flex flex-wrap items-end justify-between gap-[clamp(20px,4vw,48px)]">
        <div className="min-w-0">
          <div className={`mb-[clamp(20px,3vw,34px)] grid gap-1.5 font-normal leading-relaxed text-accent ${locale === 'hi' ? 'text-[clamp(14px,1.45vw,17px)]' : 'text-[10.5px]'} ${localeTextClass(locale, 'uppercase tracking-[0.24em]')}`}>
            <ClipLine>{copy.selected}</ClipLine>
            <ClipLine delay={0.05}>{copy.caseStudy}</ClipLine>
            <ClipLine delay={0.1}>
              {copy.number} {number}
            </ClipLine>
          </div>
          <h1 className="m-0 min-w-0 max-w-full break-words font-display text-[clamp(44px,8.5vw,108px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
            <ClipLine>{title.lead}</ClipLine>
            {title.accent ? (
              <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>{title.accent}</ClipLine>
            ) : null}
          </h1>
        </div>
        <Link
          href={localeHref('/portfolio', locale)}
          className={`inline-flex shrink-0 items-center gap-2 py-3 text-[11.5px] font-medium text-ink hover:text-accent ${localeTextClass(locale, 'uppercase tracking-[0.2em]')}`}
        >
          <EditorialIcon name="chevron-left" className="h-3 w-3" />
          {copy.back}
        </Link>
      </div>
    </section>
  )
}

function HeroPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <section className={`${pagePad} pb-[clamp(56px,8vw,110px)]`}>
      <div className="relative mt-[clamp(20px,3vw,32px)] mr-[clamp(20px,3vw,32px)] min-w-0">
        <div className="pointer-events-none absolute -top-[clamp(20px,3vw,32px)] bottom-[clamp(20px,3vw,32px)] left-[clamp(20px,3vw,32px)] -right-[clamp(20px,3vw,32px)] border border-accent" />
        <GalleryPhoto src={src} alt={alt} sizes="100vw" ratio="aspect-[4/3] lg:aspect-video" priority />
      </div>
    </section>
  )
}

function Metadata({ project, budget, locale }: { project: PortfolioProject; budget?: string; locale: PublicLocale }) {
  const copy = chromeCopy[locale].portfolio.detail
  const entries = [
    { label: copy.meta.location, value: project.location },
    { label: copy.meta.roomType, value: projectTypeLabel(project.projectType) },
    { label: copy.meta.budget, value: budget },
    { label: copy.meta.duration, value: project.duration },
  ].filter((entry) => Boolean(entry.value)) as Array<{ label: string; value: string }>

  if (!entries.length) return null

  return (
    <section className={`${pagePad} border-y border-accent bg-panel py-[clamp(48px,6vw,80px)]`}>
      <div className="grid grid-cols-2 gap-[clamp(28px,4vw,56px)] lg:grid-cols-4">
        {entries.map((entry) => (
          <div key={entry.label} className="min-w-0 border-l border-accent pl-4 lg:pl-[clamp(16px,2vw,28px)]">
            <span className={`block text-muted ${locale === 'hi' ? localeRoleClass(locale, 'label') : 'text-[11px] lowercase tracking-[0.16em]'}`}>{entry.label}</span>
            <span className={`mt-2.5 block break-words font-normal text-ink ${locale === 'hi' ? 'text-[clamp(26px,3vw,38px)] leading-[1.25]' : 'text-[clamp(22px,2.6vw,32px)] leading-[1.1]'} ${localeTextClass(locale, 'uppercase tracking-[0.01em]')}`}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function NumberedHeading({
  index,
  lead,
  accent,
  stroke = 'hairline',
}: {
  index: string
  lead: string
  accent: string
  stroke?: 'hairline' | 'muted'
}) {
  const strokeClass =
    stroke === 'muted' ? '[-webkit-text-stroke:1px_var(--color-muted)]' : '[-webkit-text-stroke:1px_var(--color-hairline)]'

  return (
    <div className="min-w-0">
      <span className={`block font-display text-[clamp(90px,11vw,160px)] font-light leading-[0.85] text-transparent ${strokeClass}`}>
        {index}
      </span>
      <h2 className="mt-[clamp(12px,2vw,20px)] m-0 font-display text-[clamp(32px,5vw,62px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
        <ClipLine>{lead}</ClipLine>
        <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>{accent}</ClipLine>
      </h2>
    </div>
  )
}

function Brief({ paragraphs, locale }: { paragraphs: string[]; locale: PublicLocale }) {
  if (!paragraphs.length) return null

  return (
    <section className={`${pagePad} py-[clamp(64px,9vw,120px)]`}>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,90px)] lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <NumberedHeading index="01" lead={chromeCopy[locale].portfolio.detail.briefLead} accent={chromeCopy[locale].portfolio.detail.briefAccent} />
        <div className="grid min-w-0 max-w-[40em] gap-[22px]">
          {paragraphs.map((part, index) => (
            <p
              key={`${index}-${part.slice(0, 24)}`}
              className={
                index === 0
                  ? 'm-0 text-pretty text-[clamp(17px,1.9vw,21px)] leading-[1.6] text-ink'
                  : 'm-0 text-pretty text-justify text-base leading-[1.75] text-body'
              }
            >
              {part}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

function Photos({ photos, title }: { photos: string[]; title: string }) {
  if (!photos.length) return null

  return (
    <section className={`${pagePad} pb-[clamp(56px,8vw,100px)]`}>
      <div className="grid grid-cols-1 gap-[clamp(12px,2vw,24px)] md:grid-cols-2 lg:grid-cols-3">
        {photos.map((src, index) => (
          <figure key={`${src}-${index}`} className="m-0 grid min-w-0 gap-3">
            <GalleryPhoto src={src} alt={`${title} photograph ${index + 1}`} sizes="(max-width: 768px) 100vw, (min-width: 1024px) 33vw, 50vw" ratio="aspect-[4/3]" />
          </figure>
        ))}
      </div>
    </section>
  )
}

function Approach({ intro, decisions, locale }: { intro?: string; decisions: CaseStudy['decisions']; locale: PublicLocale }) {
  if (!intro && !decisions.length) return null

  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(64px,9vw,120px)]`}>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,90px)] lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <NumberedHeading index="02" lead={chromeCopy[locale].portfolio.detail.approachLead} accent={chromeCopy[locale].portfolio.detail.approachAccent} stroke="muted" />
        <div className="grid min-w-0 max-w-[44em] gap-[clamp(32px,4vw,48px)]">
          {intro ? <p className="m-0 text-pretty text-justify text-base leading-[1.75] text-body">{intro}</p> : null}
          {decisions.length > 0 && (
            <div className="grid gap-[clamp(24px,3vw,34px)]">
              {decisions.map((decision) => (
                <div
                  key={decision.letter}
                  className="grid grid-cols-[44px_minmax(0,1fr)] gap-[clamp(14px,2.4vw,32px)] border-t border-accent pt-[22px] sm:grid-cols-[clamp(56px,7vw,90px)_minmax(0,1fr)]"
                >
                  <span className="font-display text-[clamp(40px,5vw,64px)] font-light leading-[0.85] text-transparent [-webkit-text-stroke:1px_var(--color-muted)]">
                    {decision.letter}
                  </span>
                  <div className="min-w-0">
                    <h3 className={`m-0 text-[clamp(18px,2.1vw,25px)] font-normal text-ink ${localeTextClass(locale, 'uppercase tracking-[-0.01em]')}`}>{decision.title}</h3>
                    <p className="mt-3 m-0 text-pretty text-justify text-[15px] leading-[1.75] text-body">{decision.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Outcome({ paragraphs, stats, locale }: { paragraphs: string[]; stats: CaseStudy['stats']; locale: PublicLocale }) {
  if (!paragraphs.length && !stats.length) return null

  return (
    <section className={`${pagePad} border-t border-accent py-[clamp(64px,9vw,120px)]`}>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,90px)] lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <NumberedHeading index="03" lead={chromeCopy[locale].portfolio.detail.outcomeLead} accent={chromeCopy[locale].portfolio.detail.outcomeAccent} />
        <div className="grid min-w-0 max-w-[40em] gap-[22px]">
          {paragraphs.map((part) => (
            <p key={part.slice(0, 32)} className="m-0 text-pretty text-justify text-base leading-[1.75] text-body">
              {part}
            </p>
          ))}
          {stats.length ? (
            <div className="mt-[clamp(14px,2vw,22px)] grid grid-cols-2 gap-[clamp(20px,3vw,40px)] sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="grid gap-2 border-t border-accent pt-5">
                  <span className="text-[clamp(30px,3.4vw,44px)] font-normal leading-none tracking-[-0.02em] text-ink">{stat.value}</span>
                  <span className={`text-[10.5px] font-medium text-accent ${localeTextClass(locale, 'uppercase tracking-[0.2em]')}`}>{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ClientQuote({ quote, locale }: { quote: NonNullable<CaseStudy['quote']>; locale: PublicLocale }) {
  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,110px)]`}>
      <div className="grid grid-cols-1 gap-[clamp(24px,4vw,48px)] border border-accent bg-surface p-[clamp(24px,3vw,40px)] md:grid-cols-[minmax(200px,300px)_minmax(0,1fr)]">
        {quote.image ? (
          <div className="relative aspect-[3/4] overflow-hidden bg-hairline">
            <Image src={quote.image} alt={quote.author} fill sizes="300px" quality={90} className="object-cover object-center" />
          </div>
        ) : null}
        <div className="flex flex-col justify-between gap-[clamp(24px,3vw,36px)]">
          <p className="m-0 text-pretty font-light text-[clamp(19px,2.6vw,32px)] leading-[1.45] tracking-[-0.01em] text-ink">
            &ldquo;{quote.text}&rdquo;
          </p>
          <div>
            <div className="mb-3.5 flex gap-1 text-[13px] tracking-[0.16em] text-cta" aria-hidden>
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <div className={`text-[12.5px] font-medium text-ink ${localeTextClass(locale, 'uppercase tracking-[0.16em]')}`}>{quote.author}</div>
            {quote.context ? <div className={`mt-1.5 text-[10.5px] text-accent ${localeTextClass(locale, 'uppercase tracking-[0.16em]')}`}>{quote.context}</div> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function DetailCta({ href, locale }: { href: string; locale: PublicLocale }) {
  const copy = chromeCopy[locale].portfolio.detail

  return (
    <section id="contact" className={`${pagePad} border-t border-accent py-[clamp(64px,8vw,110px)]`}>
      <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
        <div className="min-w-0">
          <div className={`mb-[clamp(18px,3vw,30px)] grid gap-1.5 text-[10.5px] font-normal leading-relaxed text-accent ${localeTextClass(locale, 'uppercase tracking-[0.24em]')}`}>
            {copy.ctaEyebrow.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <h2 className="m-0 font-display text-[clamp(34px,5.5vw,72px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
            {copy.ctaTitleLead}
            <span className="ml-[0.55em] block text-accent">{copy.ctaTitleAccent}</span>
          </h2>
        </div>
        <Link
          href={href}
          className={`inline-flex min-h-11 items-center gap-3.5 bg-cta px-[34px] py-5 font-medium text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] hover:bg-ink hover:text-cta ${localeRoleClass(locale, 'button')}`}
        >
          {copy.ctaAction}
          <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  )
}

function NeighborLink({ project, direction, locale }: { project: PortfolioProject; direction: 'prev' | 'next'; locale: PublicLocale }) {
  const type = projectTypeLabel(project.projectType)
  const meta = [type, project.duration].filter(Boolean).join(' · ')
  const copy = chromeCopy[locale].portfolio.detail

  return (
    <Link
      href={localeHref(`/portfolio/${project.slug}`, locale)}
      className={`grid min-h-11 min-w-0 gap-3.5 ${pagePad} py-[clamp(32px,4.5vw,60px)] text-ink hover:bg-panel ${
        direction === 'next' ? 'md:justify-items-end md:text-right' : ''
      } ${direction === 'prev' ? 'border-b border-accent md:border-b-0 md:border-r' : ''}`}
    >
      <span className={`inline-flex items-center gap-2 font-medium text-accent ${locale === 'hi' ? 'text-[clamp(14px,1.35vw,16px)]' : 'text-[10.5px]'} ${localeTextClass(locale, 'uppercase tracking-[0.22em]')}`}>
        {direction === 'prev' ? <EditorialIcon name="chevron-left" className="h-3 w-3" /> : null}
        {direction === 'prev' ? copy.previous : copy.next}
        {direction === 'next' ? <EditorialIcon name="chevron-right" className="h-3 w-3" /> : null}
      </span>
      <span className="break-words text-[clamp(20px,2.6vw,32px)] font-normal uppercase leading-[1.1] tracking-[-0.01em]">{project.title}</span>
      {meta ? <span className={`break-words text-muted ${locale === 'hi' ? 'text-[clamp(14px,1.35vw,16px)]' : 'text-[10.5px]'} ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}>{meta}</span> : null}
    </Link>
  )
}

function PrevNext({ projects, slug, locale }: { projects: PortfolioProject[]; slug: string; locale: PublicLocale }) {
  const { prev, next } = neighbors(projects, slug)
  if (!prev && !next) return null

  return (
    <nav className="grid grid-cols-1 border-y border-accent md:grid-cols-2">
      {prev ? <NeighborLink project={prev} direction="prev" locale={locale} /> : <div className="hidden md:block" />}
      {next ? <NeighborLink project={next} direction="next" locale={locale} /> : null}
    </nav>
  )
}

export function ProjectDetail({ site, project }: { site: ClientConfig; project: PortfolioProject }) {
  const projects = site.sections.portfolio.projects
  const locale = publicLocaleFromSite(site)
  const { index } = neighbors(projects, project.slug)
  const caseStudy = site.sections.caseStudy?.items.find((item) => item.slug === project.slug)
  const title = splitTitle(caseStudy?.title ?? project.title)
  const gallery = caseStudy?.images.length ? caseStudy.images : [project.cover, ...project.images]
  const hero = gallery[0] ?? project.cover
  const rest = gallery.slice(1)
  const items: GalleryItem[] = gallery.map((src, i) => ({ src, caption: i === 0 ? 'Cover photograph' : project.title }))
  const closing = renderableSections(site, ['footer'])
  const ctaHref = whatsappHref(site.business.whatsapp) ?? (site.sections.estimate?.enabled ? localeHref('/estimate', locale) : '#footer')

  return (
    <article lang={locale} data-public-locale={locale} className={`overflow-x-clip bg-surface text-ink ${localePageClass(locale)}`}>
      <HeroNav businessName={site.business.name} phone={site.business.phone} tone="on-surface" inner services={site.sections.services?.items} locale={locale} locales={site.i18n.locales} />
      <ProjectGallery items={items} locale={locale}>
        <HomeSection first>
          <ProjectTitle title={title} number={String((index >= 0 ? index : 0) + 1).padStart(2, '0')} locale={locale} />
        </HomeSection>
        <HomeSection>
          <HeroPhoto src={hero} alt={`${title.lead} cover photograph`} />
        </HomeSection>
        <HomeSection>
          <Metadata project={project} budget={project.budget} locale={locale} />
        </HomeSection>
        {caseStudy && (
          <>
            <HomeSection>
              <Brief paragraphs={caseStudy.problem} locale={locale} />
            </HomeSection>
            <HomeSection>
              <Photos photos={rest.slice(0, Math.ceil(rest.length / 2))} title={project.title} />
            </HomeSection>
            <HomeSection>
              <Approach intro={caseStudy.approachIntro} decisions={caseStudy.decisions} locale={locale} />
            </HomeSection>
            <HomeSection>
              <Photos photos={rest.slice(Math.ceil(rest.length / 2))} title={project.title} />
            </HomeSection>
            <HomeSection>
              <Outcome paragraphs={caseStudy.outcome} stats={caseStudy.stats} locale={locale} />
            </HomeSection>
          </>
        )}
        {!caseStudy && rest.length > 0 && (
          <HomeSection>
            <Photos photos={rest} title={project.title} />
          </HomeSection>
        )}
        {!caseStudy && project.blurb && (
          <HomeSection>
            <Brief paragraphs={[project.blurb]} locale={locale} />
          </HomeSection>
        )}
        {caseStudy?.quote && (
          <HomeSection>
          <ClientQuote quote={caseStudy.quote} locale={locale} />
          </HomeSection>
        )}
        <HomeSection>
          <DetailCta href={ctaHref} locale={locale} />
        </HomeSection>
        <HomeSection>
          <PrevNext projects={projects} slug={project.slug} locale={locale} />
        </HomeSection>
      </ProjectGallery>
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
