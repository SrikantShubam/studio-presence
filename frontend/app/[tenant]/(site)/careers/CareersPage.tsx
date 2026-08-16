import Image from 'next/image'
import type { ClientConfig } from '@studio/backend'
import { ClipLine, DrawFrame, FadeUp, HomeSection, RevealImage, Stagger, StaggerItem } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'
import { CareersRoles } from './CareersRoles'

type Careers = NonNullable<ClientConfig['sections']['careers']>

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  title: { lead: 'Work', accent: 'With us' },
  lookForTitle: { lead: 'What we', accent: 'Look for' },
  rolesTitle: { lead: 'Open', accent: 'Roles' },
  countSuffix: (n: number) => `${n} role${n === 1 ? '' : 's'} open`,
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

function Heading({ careers }: { careers: Careers }) {
  if (!careers.intro.length) {
    return (
      <section className={`${pagePad} pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,7vw,96px)]`}>
        <h1 className="m-0 font-display text-[clamp(46px,9vw,112px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
          <ClipLine>{copy.title.lead}</ClipLine>
          <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>{copy.title.accent}</ClipLine>
        </h1>
      </section>
    )
  }

  return (
    <section className={`${pagePad} pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,7vw,96px)]`}>
      <div className="grid grid-cols-1 items-end gap-[clamp(32px,6vw,88px)] min-[1080px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <h1 className="m-0 font-display text-[clamp(46px,9vw,112px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
            <ClipLine>{copy.title.lead}</ClipLine>
            <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
              {copy.title.accent}
            </ClipLine>
          </h1>
        </div>
        <Stagger className="grid max-w-[40em] gap-5" delay={0.12}>
          {careers.intro.map((part, index) => (
            <StaggerItem key={part.slice(0, 28)}>
              <p
                className={
                  index === 0
                    ? 'm-0 text-pretty text-[clamp(16px,1.8vw,20px)] leading-[1.6] text-ink'
                    : 'm-0 text-pretty text-justify text-[15.5px] leading-[1.75] text-body'
                }
              >
                {part}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function StudioPhoto({ photo }: { photo: Careers['studioPhoto'] }) {
  if (!photo) return null

  return (
    <section className={`${pagePad} pb-[clamp(56px,8vw,100px)]`}>
      <figure className="m-0 grid gap-0">
        <div className="relative mr-[clamp(20px,3vw,32px)] mt-[clamp(20px,3vw,32px)]">
          <DrawFrame className="pointer-events-none absolute -top-[clamp(20px,3vw,32px)] bottom-[clamp(20px,3vw,32px)] left-[clamp(20px,3vw,32px)] right-[calc(clamp(20px,3vw,32px)*-1)] border border-accent" />
          <div className="relative aspect-[4/3] overflow-hidden bg-hairline min-[720px]:aspect-video">
            <RevealImage>
              <Image src={photo.image} alt="" fill sizes="100vw" quality={90} className="object-cover" />
            </RevealImage>
          </div>
        </div>
        {photo.caption && (
          <figcaption className="mt-[clamp(30px,4vw,46px)] text-[10.5px] uppercase tracking-[0.2em] text-muted">
            {photo.caption}
          </figcaption>
        )}
      </figure>
    </section>
  )
}

function LookFor({ items }: { items: Careers['lookFor'] }) {
  if (!items.length) return null

  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,100px)]`}>
      <h2 className="mb-[clamp(36px,5vw,64px)] m-0 font-display text-[clamp(34px,6vw,80px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
        <ClipLine>{copy.lookForTitle.lead}</ClipLine>
        <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
          {copy.lookForTitle.accent}
        </ClipLine>
      </h2>
      <Stagger className="grid grid-cols-1 gap-[clamp(28px,4vw,48px)] min-[720px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {items.map((item, i) => (
          <StaggerItem key={item.title}>
            <div className="grid content-start gap-3.5 border-t border-accent pt-[22px]">
              <span className="font-display text-[clamp(40px,4.6vw,64px)] font-light leading-[0.82] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="m-0 text-[clamp(17px,1.9vw,21px)] font-normal uppercase tracking-[0.03em]">{item.title}</h3>
              <p className="m-0 text-pretty text-justify text-[14.5px] leading-[1.72] text-body">{item.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

function OpenRoles({ careers, email }: { careers: Careers; email?: string }) {
  const roles = careers.roles

  return (
    <section className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
      <div className="mb-[clamp(28px,4vw,44px)] flex flex-wrap items-end justify-between gap-5">
        <h2 className="m-0 font-display text-[clamp(34px,6vw,80px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
          <ClipLine>{copy.rolesTitle.lead}</ClipLine>
          <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
            {copy.rolesTitle.accent}
          </ClipLine>
        </h2>
        <FadeUp delay={0.08}>
          <span className="text-xs tracking-[0.06em] text-muted">{copy.countSuffix(roles.length)}</span>
        </FadeUp>
      </div>
      {roles.length ? (
        <CareersRoles roles={roles} email={email} />
      ) : careers.emptyState ? (
        <div className="border border-dashed border-accent px-[clamp(20px,4vw,48px)] py-[clamp(44px,6vw,80px)]">
          <div className="grid max-w-[38em] gap-[18px]">
            {careers.emptyState.title && (
              <h3 className="m-0 text-[clamp(20px,2.6vw,32px)] font-normal uppercase leading-[1.15] tracking-[-0.01em]">
                {careers.emptyState.title}
              </h3>
            )}
            {careers.emptyState.body && (
              <p className="m-0 text-pretty text-[15.5px] leading-[1.75] text-body">{careers.emptyState.body}</p>
            )}
            {email ? (
              <a href={`mailto:${email}`} className="text-[clamp(15px,1.7vw,19px)] font-normal text-ink">
                {email}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function Apply({ apply, email }: { apply: Careers['applyProcess']; email?: string }) {
  if (!apply) return null

  return (
    <section id="apply" className={`${pagePad} border-t border-accent bg-panel py-[clamp(56px,8vw,100px)]`}>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,88px)] min-[1080px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          {apply.title && (
            <h2 className="m-0 font-display text-[clamp(34px,6vw,80px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
              {apply.title}
            </h2>
          )}
          <FadeUp className="mt-[clamp(28px,4vw,44px)] grid gap-2.5 border-t border-accent pt-[22px]" delay={0.1}>
            {apply.sendTo && <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{apply.sendTo}</span>}
            {email ? (
              <a href={`mailto:${email}`} className="text-[clamp(19px,2.4vw,28px)] font-normal text-ink">
                {email}
              </a>
            ) : null}
            {apply.subject && <span className="mt-1.5 text-[13.5px] leading-[1.65] text-body">{apply.subject}</span>}
          </FadeUp>
        </div>
        <div className="grid max-w-[42em] gap-[clamp(24px,3vw,34px)]">
          {apply.sendItems.length > 0 && (
            <FadeUp className="grid gap-3.5">
              <ul className="m-0 grid list-disc gap-[11px] pl-[1.1em] text-[15px] leading-[1.7] text-body">
                {apply.sendItems.map((item) => (
                  <li key={item.slice(0, 32)} className="text-pretty">
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>
          )}
          {apply.nextBody.length > 0 && (
            <FadeUp className="grid gap-3.5 border-t border-hairline pt-[clamp(20px,2.6vw,28px)]" delay={0.08}>
              {apply.next && <h3 className="m-0 text-[clamp(15px,1.6vw,18px)] font-normal uppercase tracking-[0.06em]">{apply.next}</h3>}
              {apply.nextBody.map((part) => (
                <p key={part.slice(0, 32)} className="m-0 text-pretty text-[15px] leading-[1.72] text-body">
                  {part}
                </p>
              ))}
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  )
}

export function CareersPage({ site }: { site: ClientConfig }) {
  const careers = site.sections.careers
  if (!careers) return null

  const email = site.business.email
  const closing = renderableSections(site, ['footer'])

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
        <Heading careers={careers} />
      </HomeSection>
      <HomeSection>
        <StudioPhoto photo={careers.studioPhoto} />
      </HomeSection>
      <HomeSection>
        <LookFor items={careers.lookFor} />
      </HomeSection>
      <HomeSection>
        <OpenRoles careers={careers} email={email} />
      </HomeSection>
      <HomeSection>
        <Apply apply={careers.applyProcess} email={email} />
      </HomeSection>
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
