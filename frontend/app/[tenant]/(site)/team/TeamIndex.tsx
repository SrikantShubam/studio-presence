import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, DrawFrame, FadeUp, HomeSection, RevealImage, Stagger, StaggerItem } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'
import { chromeCopy, localePageClass, localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'

type Team = NonNullable<ClientConfig['sections']['team']>

const pagePad = 'px-[clamp(20px,5vw,64px)]'

function Portrait({
  src,
  alt,
  ratio,
  sizes,
  delay = 0,
}: {
  src: string
  alt: string
  ratio: string
  sizes: string
  delay?: number
}) {
  return (
    <div className={`relative overflow-hidden bg-hairline ${ratio}`}>
      <RevealImage delay={delay}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={90}
          className="object-cover grayscale contrast-105 transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </RevealImage>
    </div>
  )
}

function Heading({ team, locale }: { team: Team; locale: ReturnType<typeof publicLocaleFromSite> }) {
  const labels = chromeCopy[locale].team
  return (
    <section className={`${pagePad} pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,7vw,96px)]`}>
      <div className="grid grid-cols-1 items-end gap-[clamp(32px,6vw,88px)] min-[1080px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <h1 className="m-0 font-display text-[clamp(44px,8.5vw,108px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
            <ClipLine>{labels.pageTitle.lead}</ClipLine>
            <ClipLine className="ml-[0.55em] text-accent" delay={0.08}>
              {labels.pageTitle.accent}
            </ClipLine>
          </h1>
        </div>
        {team.intro && (
          <FadeUp className="min-w-0 max-w-[38em]" delay={0.12}>
            <p className={`m-0 text-pretty text-justify leading-[1.75] text-body ${localeRoleClass(locale, 'body')}`}>{team.intro}</p>
          </FadeUp>
        )}
      </div>
    </section>
  )
}

function Principals({ members, locale }: { members: Team['members']; locale: ReturnType<typeof publicLocaleFromSite> }) {
  if (!members.length) return null
  const labels = chromeCopy[locale].team

  return (
    <section className={`${pagePad} border-t border-accent pb-[clamp(56px,8vw,100px)] pt-[clamp(40px,5vw,64px)]`}>
      <h2 className="mb-[clamp(36px,5vw,64px)] m-0 text-[clamp(13px,1.5vw,16px)] font-medium uppercase tracking-[0.24em] text-accent">
        <ClipLine>{labels.principalsLabel}</ClipLine>
      </h2>
      <Stagger className="grid grid-cols-1 gap-x-[clamp(28px,4vw,52px)] gap-y-[clamp(40px,6vw,80px)] min-[720px]:grid-cols-2 min-[1080px]:grid-cols-3">
        {members.map((person) => {
          const card = (
            <>
              <span className="relative mr-[22px] mt-[22px] block">
                <DrawFrame className="pointer-events-none absolute -top-[22px] right-[-22px] bottom-[22px] left-[22px] border border-accent" />
                {person.image && (
                  <Portrait src={person.image} alt="" ratio="aspect-[3/4]" sizes="(min-width:1080px) 28vw, (min-width:720px) 45vw, 100vw" />
                )}
              </span>
              <span className="grid gap-2.5">
                <span className="text-[clamp(20px,2.4vw,28px)] font-normal uppercase leading-[1.1] tracking-[-0.01em]">
                  {person.name}
                </span>
                <span className={`font-medium text-accent ${localeRoleClass(locale, 'label')}`}>{person.role}</span>
                {(person.line ?? person.bio) && (
                  <span className={`max-w-[30em] leading-[1.7] text-body ${localeRoleClass(locale, 'body')}`}>{person.line ?? person.bio}</span>
                )}
                {person.slug && (
                  <span className={`mt-1 inline-flex items-center gap-2 font-medium ${localeRoleClass(locale, 'label')}`}>
                    {labels.readProfile}
                    <EditorialIcon name="arrow-up-right" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                )}
              </span>
            </>
          )

          return (
            <StaggerItem key={person.slug ?? person.name}>
              {person.slug ? (
                <Link href={`/team/${person.slug}`} className="group grid gap-[22px] text-left text-ink">
                  {card}
                </Link>
              ) : (
                <div className="grid gap-[22px] text-left text-ink">{card}</div>
              )}
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}

function WiderTeam({ groups, locale }: { groups: Team['groups']; locale: ReturnType<typeof publicLocaleFromSite> }) {
  if (!groups.length) return null
  const labels = chromeCopy[locale].team

  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,100px)]`}>
      <h2 className="mb-[clamp(32px,4.5vw,52px)] m-0 text-[clamp(13px,1.5vw,16px)] font-medium uppercase tracking-[0.24em] text-accent">
        <ClipLine>{labels.widerTitle}</ClipLine>
      </h2>
      {groups.map((group, index) => (
        <div key={group.label} className="mb-[clamp(40px,5vw,68px)] last:mb-0">
          <div className="mb-[clamp(22px,3vw,32px)] flex items-baseline gap-[18px] border-b border-accent pb-4">
            <span className="font-display text-[clamp(30px,3.6vw,48px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
              <ClipLine>{String(index + 1).padStart(2, '0')}</ClipLine>
            </span>
            <span className="text-[clamp(13px,1.5vw,17px)] font-normal uppercase tracking-[0.16em]">
              <ClipLine delay={0.06}>{group.label}</ClipLine>
            </span>
            {group.count && (
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
                <ClipLine delay={0.1}>{group.count}</ClipLine>
              </span>
            )}
          </div>
          <Stagger className="grid grid-cols-2 gap-[clamp(20px,3vw,34px)] min-[720px]:grid-cols-4 min-[1080px]:grid-cols-6">
            {group.people.map((person) => (
              <StaggerItem key={person.name}>
                <div className="group grid gap-3.5 text-left text-ink">
                  {person.image && (
                    <Portrait src={person.image} alt="" ratio="aspect-[4/5]" sizes="(min-width:1080px) 14vw, (min-width:720px) 22vw, 45vw" />
                  )}
                  <span className="grid gap-1.5">
                    <span className="text-[clamp(14px,1.5vw,16px)] font-normal uppercase tracking-[0.02em]">{person.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-accent">{person.role}</span>
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      ))}
    </section>
  )
}

function Workshop({ workshop }: { workshop: Team['workshop'] }) {
  if (!workshop || (!workshop.title && !workshop.body && !workshop.photos.length)) return null

  return (
    <section className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
      <div className="mb-[clamp(28px,4vw,44px)] flex flex-wrap items-end justify-between gap-5">
        {workshop.title && (
          <h2 className="m-0 font-display text-[clamp(30px,5vw,64px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
            {workshop.title}
          </h2>
        )}
        {workshop.body && (
          <FadeUp className="m-0 max-w-[30em]" delay={0.1}>
            <p className="m-0 text-pretty text-justify text-[14.5px] leading-[1.7] text-body">{workshop.body}</p>
          </FadeUp>
        )}
      </div>
      {workshop.photos.length > 0 && (
        <Stagger className="grid grid-cols-1 gap-[clamp(12px,1.8vw,22px)] min-[720px]:grid-cols-2" delay={0.08}>
          {workshop.photos.map((figure) => (
            <StaggerItem key={figure.image} className={figure.wide ? 'min-[720px]:col-span-2' : ''}>
              <figure className="group m-0 grid gap-2.5">
                <div className={`relative overflow-hidden bg-hairline ${figure.wide ? 'aspect-video' : 'aspect-square'}`}>
                  <RevealImage>
                    <Image
                      src={figure.image}
                      alt=""
                      fill
                      sizes={figure.wide ? '100vw' : '50vw'}
                      quality={90}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </RevealImage>
                </div>
                {figure.caption && (
                  <figcaption className="text-[10.5px] uppercase tracking-[0.2em] text-muted">{figure.caption}</figcaption>
                )}
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  )
}

function Hiring({ hasRoles, locale }: { hasRoles: boolean; locale: ReturnType<typeof publicLocaleFromSite> }) {
  if (!hasRoles) return null
  const labels = chromeCopy[locale].team

  return (
    <section className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
      <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
        <div className="min-w-0">
          <h2 className="m-0 font-display text-[clamp(32px,5.2vw,68px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
            <ClipLine>{labels.hiring.title.lead}</ClipLine>
            <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
              {labels.hiring.title.accent}
            </ClipLine>
          </h2>
          <FadeUp className="mt-6 max-w-[32em]" delay={0.12}>
            <p className="m-0 text-pretty text-[15px] leading-[1.7] text-body">{labels.hiring.body}</p>
          </FadeUp>
        </div>
        <FadeUp delay={0.16}>
          <Link
            href="/careers"
            className="group inline-flex min-h-11 items-center gap-3.5 border border-ink px-[34px] py-5 text-[clamp(10.5px,1.1vw,12px)] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-surface"
          >
            {labels.hiring.action}
            <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </FadeUp>
      </div>
    </section>
  )
}

export function TeamIndex({ site }: { site: ClientConfig }) {
  const team = site.sections.team
  if (!team) return null
  const locale = publicLocaleFromSite(site)

  const closing = renderableSections(site, ['footer'])

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
        <Heading team={team} locale={locale} />
      </HomeSection>
      <HomeSection>
        <Principals members={team.members} locale={locale} />
      </HomeSection>
      <HomeSection>
        <WiderTeam groups={team.groups} locale={locale} />
      </HomeSection>
      <HomeSection>
        <Workshop workshop={team.workshop} />
      </HomeSection>
      <HomeSection>
        <Hiring hasRoles={Boolean(site.sections.careers?.enabled && site.sections.careers.roles.length)} locale={locale} />
      </HomeSection>
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
