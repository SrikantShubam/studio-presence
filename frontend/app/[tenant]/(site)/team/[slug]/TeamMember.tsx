import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, DrawFrame, FadeUp, HomeSection, RevealImage, Stagger, StaggerItem } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'

type Member = NonNullable<ClientConfig['sections']['team']>['members'][number]

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  back: 'All of the studio',
  credentials: 'Credentials',
  projectsTitle: { lead: 'Projects', accent: 'They led' },
  previous: 'Previous',
  next: 'Next',
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

function splitName(name: string): { first: string; last: string } {
  const words = name.trim().split(/\s+/)
  if (words.length < 2) return { first: name, last: '' }
  return { first: words.slice(0, -1).join(' '), last: words.at(-1) ?? '' }
}

function projectMeta(
  slug: string,
  projects: ClientConfig['sections']['portfolio']['projects'],
): { href: string; meta: string } {
  const project = projects.find((item) => item.slug === slug)
  if (!project) return { href: '/portfolio', meta: '' }
  return {
    href: `/portfolio/${project.slug}`,
    meta: [project.projectType, project.duration].filter(Boolean).join(' · '),
  }
}

export function TeamMember({
  site,
  member,
  allMembers,
}: {
  site: ClientConfig
  member: Member
  allMembers: Member[]
}) {
  const withDetail = allMembers.filter((m) => m.slug && m.body.length)
  const index = Math.max(0, withDetail.findIndex((item) => item.slug === member.slug))
  const prev = withDetail[(index - 1 + withDetail.length) % withDetail.length] ?? member
  const next = withDetail[(index + 1) % withDetail.length] ?? member
  const closing = renderableSections(site, ['footer'])
  const projects = site.sections.portfolio.projects
  const { first, last } = splitName(member.name)

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
        <section className={`${pagePad} pb-[clamp(56px,8vw,100px)] pt-[clamp(32px,4vw,56px)]`}>
          <Link
            href="/team"
            className="inline-flex min-h-11 items-center gap-2 py-2.5 text-[11.5px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent"
          >
            <EditorialIcon name="arrow-left" className="h-3 w-3" />
            {copy.back}
          </Link>
          <div className="mt-[clamp(24px,3vw,40px)] grid grid-cols-1 items-start gap-[clamp(36px,6vw,90px)] min-[1080px]:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
            {member.image && (
              <div className="relative mr-[22px] mt-[22px]">
                <DrawFrame className="pointer-events-none absolute -top-[22px] right-[-22px] bottom-[22px] left-[22px] border border-accent" />
                <div className="relative aspect-[3/4] overflow-hidden bg-hairline">
                  <RevealImage>
                    <Image
                      src={member.image}
                      alt=""
                      fill
                      sizes="(min-width:1080px) 36vw, 100vw"
                      quality={90}
                      priority
                      className="object-cover grayscale contrast-105"
                    />
                  </RevealImage>
                </div>
              </div>
            )}
            <div className="min-w-0">
              {member.eyebrow && (
                <p className="mb-[clamp(18px,2.6vw,28px)] m-0 text-[10.5px] font-normal uppercase leading-[1.6] tracking-[0.24em] text-accent">
                  <ClipLine>{member.eyebrow}</ClipLine>
                </p>
              )}
              <h1 className="m-0 font-display text-[clamp(36px,6.5vw,86px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
                <ClipLine>{first}</ClipLine>
                {last && (
                  <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>
                    {last}
                  </ClipLine>
                )}
              </h1>
              <FadeUp className="mt-[clamp(24px,3vw,34px)] flex flex-wrap gap-x-[clamp(20px,3vw,40px)] gap-y-3 border-t border-accent pt-5 text-[11px] font-medium uppercase tracking-[0.2em] text-accent" delay={0.1}>
                <span>{member.role}</span>
                {member.tenure && <span>{member.tenure}</span>}
              </FadeUp>
              <Stagger className="mt-[clamp(28px,4vw,44px)] grid max-w-[42em] gap-5" delay={0.16}>
                {member.body.map((part) => (
                  <StaggerItem key={part.slice(0, 28)}>
                    <p className="m-0 text-pretty text-justify text-[15.5px] leading-[1.75] text-body">{part}</p>
                  </StaggerItem>
                ))}
              </Stagger>
              {member.credentials.length > 0 && (
                <FadeUp className="mt-[clamp(28px,4vw,44px)] grid gap-2.5 border-t border-hairline pt-[22px]" delay={0.08}>
                  <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
                    {copy.credentials}
                  </span>
                  <span className="text-[14.5px] leading-[1.7] text-ink">{member.credentials.join(' ')}</span>
                </FadeUp>
              )}
            </div>
          </div>
        </section>
      </HomeSection>
      {member.projects.length > 0 && (
        <HomeSection>
          <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,100px)]`}>
            <h2 className="mb-[clamp(28px,4vw,48px)] m-0 font-display text-[clamp(30px,5vw,64px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
              <ClipLine>{copy.projectsTitle.lead}</ClipLine>
              <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>
                {copy.projectsTitle.accent}
              </ClipLine>
            </h2>
            <Stagger className="grid">
              {member.projects.map((project, i) => {
                const { href, meta } = projectMeta(project.slug, projects)
                return (
                  <StaggerItem key={project.slug}>
                    <Link
                      href={href}
                      className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-[clamp(16px,3vw,40px)] border-b border-accent py-[clamp(20px,2.6vw,30px)] text-ink transition-colors hover:bg-surface min-[720px]:grid-cols-[auto_minmax(0,1.6fr)_minmax(0,1fr)_auto]"
                    >
                      <span className="font-display text-[clamp(34px,4.4vw,60px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[clamp(17px,2.2vw,26px)] font-normal uppercase leading-[1.15] tracking-[-0.01em]">
                        {project.title}
                      </span>
                      {meta && (
                        <span className="col-start-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-accent min-[720px]:col-start-auto">
                          {meta}
                        </span>
                      )}
                      <span className="col-start-2 justify-self-start min-[720px]:col-start-auto min-[720px]:justify-self-end">
                        <EditorialIcon name="arrow-up-right" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </section>
        </HomeSection>
      )}
      {withDetail.length > 1 && (
        <HomeSection>
          <section className="grid grid-cols-1 border-y border-accent min-[720px]:grid-cols-2">
            <Link
              href={`/team/${prev.slug}`}
              className="group grid gap-3 border-b border-accent px-[clamp(20px,5vw,64px)] py-[clamp(28px,4vw,52px)] text-left text-ink transition-colors hover:bg-panel min-[720px]:border-r min-[720px]:border-b-0"
            >
              <span className="inline-flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
                <EditorialIcon name="arrow-left" className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" />
                {copy.previous}
              </span>
              <span className="text-[clamp(18px,2.4vw,28px)] font-normal uppercase leading-[1.1]">{prev.name}</span>
              <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">{prev.role}</span>
            </Link>
            <Link
              href={`/team/${next.slug}`}
              className="group grid justify-items-start gap-3 px-[clamp(20px,5vw,64px)] py-[clamp(28px,4vw,52px)] text-left text-ink transition-colors hover:bg-panel min-[720px]:justify-items-end min-[720px]:text-right"
            >
              <span className="inline-flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
                {copy.next}
                <EditorialIcon name="arrow-right" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="text-[clamp(18px,2.4vw,28px)] font-normal uppercase leading-[1.1]">{next.name}</span>
              <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">{next.role}</span>
            </Link>
          </section>
        </HomeSection>
      )}
      <div id="contact">
        {closing.map(({ key, Component, config, variant }) => (
          <HomeSection key={key}>
            <Component config={config as never} site={site} variant={variant} />
          </HomeSection>
        ))}
      </div>
    </article>
  )
}
