import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, DrawFrame, HomeSection, RevealImage } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'

type Post = NonNullable<ClientConfig['sections']['journal']>['posts'][number]
type Block = Post['body'][number]

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  back: 'All journal posts',
  writtenBy: 'Written by',
  profile: 'See their profile',
  related: 'Projects this post draws on',
  caseStudy: 'Read the case study',
  cta: { lead: 'Planning', accent: 'Something similar?' },
  whatsapp: 'Message us on WhatsApp',
  previous: 'Previous post',
  nextPost: 'Next post',
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

function projectHref(slug: string | undefined, site: ClientConfig) {
  if (slug && site.sections.portfolio.projects.some((project) => project.slug === slug)) {
    return `/portfolio/${slug}`
  }
  return '/portfolio'
}

function whatsappHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
}

function BodyBlock({ block }: { block: Block }) {
  if (block.type === 'p') {
    return <p className="mt-[22px] mb-0 text-pretty text-[17px] leading-[1.72] text-body first:mt-0">{block.text}</p>
  }
  if (block.type === 'h2') {
    return (
      <h2 className="mt-[clamp(40px,5vw,60px)] mb-0 font-display text-[clamp(24px,3vw,36px)] font-light uppercase leading-none tracking-[-0.02em]">
        {block.lead}
        <span className="ml-[0.55em] block text-accent">{block.accent}</span>
      </h2>
    )
  }
  if (block.type === 'bullets') {
    return (
      <ul className="mt-[26px] mb-0 grid list-disc gap-3 pl-[1.1em] text-[17px] leading-[1.65] text-body">
        {block.items.map((item) => (
          <li key={item.slice(0, 32)} className="text-pretty">
            {item}
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === 'pullquote') {
    return (
      <blockquote className="my-[clamp(38px,4.5vw,56px)] border-y border-accent py-[clamp(24px,3vw,34px)]">
        <p className="m-0 text-pretty text-[clamp(20px,2.4vw,29px)] font-light leading-[1.42] tracking-[-0.01em] text-ink">
          {block.text}
        </p>
      </blockquote>
    )
  }
  // block.type === 'image'
  return (
    <figure className="mx-auto my-[clamp(44px,5.5vw,72px)] grid max-w-[56em] gap-3">
      <div className="relative aspect-video overflow-hidden bg-hairline">
        <Image src={block.image} alt="" fill sizes="900px" quality={90} className="object-cover" />
      </div>
      {block.caption && <figcaption className="text-[10.5px] uppercase tracking-[0.2em] text-muted">{block.caption}</figcaption>}
    </figure>
  )
}

export function JournalPost({ site, post, allPosts }: { site: ClientConfig; post: Post; allPosts: Post[] }) {
  const full = allPosts.filter((item) => item.full)
  const index = Math.max(0, full.findIndex((item) => item.slug === post.slug))
  const prev = full[(index - 1 + full.length) % full.length] ?? post
  const next = full[(index + 1) % full.length] ?? post
  const closing = renderableSections(site, ['footer'])
  const wa = whatsappHref(site.business.whatsapp)
  const title = post.displayTitle ?? { lead: post.title, accent: '' }

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
        <section className={`${pagePad} pt-[clamp(32px,4vw,56px)]`}>
          <Link
            href="/journal"
            className="inline-flex min-h-11 items-center gap-2 py-2.5 text-[11.5px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent"
          >
            <EditorialIcon name="arrow-left" className="h-3 w-3" />
            {copy.back}
          </Link>
          <div className="mt-[clamp(28px,4vw,44px)] flex flex-wrap gap-x-[clamp(20px,3vw,36px)] gap-y-3 text-[10.5px] font-medium uppercase tracking-[0.22em]">
            {post.topic && <span className="text-accent">{post.topic}</span>}
            <span className="text-muted">{post.date}</span>
            {post.words && <span className="text-muted">{post.words}</span>}
          </div>
          <h1 className="mt-[clamp(18px,2.6vw,28px)] mb-0 max-w-[20em] font-display text-[clamp(34px,6.2vw,84px)] font-light uppercase leading-[0.92] tracking-[-0.03em] text-ink">
            <ClipLine>{title.lead}</ClipLine>
            {title.accent && (
              <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
                {title.accent}
              </ClipLine>
            )}
          </h1>
        </section>
      </HomeSection>
      {post.cover && (
        <HomeSection>
          <section className={`${pagePad} pb-[clamp(48px,6vw,88px)] pt-[clamp(36px,5vw,72px)]`}>
            <div className="relative mr-[clamp(20px,3vw,30px)] mt-[clamp(20px,3vw,30px)]">
              <DrawFrame className="pointer-events-none absolute -top-[clamp(20px,3vw,30px)] bottom-[clamp(20px,3vw,30px)] left-[clamp(20px,3vw,30px)] right-[calc(clamp(20px,3vw,30px)*-1)] border border-accent" />
              <div className="relative aspect-[4/3] overflow-hidden bg-hairline min-[720px]:aspect-video">
                <RevealImage>
                  <Image src={post.cover} alt="" fill sizes="100vw" quality={90} priority className="object-cover" />
                </RevealImage>
              </div>
            </div>
          </section>
        </HomeSection>
      )}
      <HomeSection>
        <section className={`${pagePad} pb-[clamp(56px,8vw,100px)]`}>
          <div className="mx-auto max-w-[34em]">
            {post.body.map((block, i) => (
              <BodyBlock key={i} block={block} />
            ))}
          </div>
        </section>
      </HomeSection>
      {post.author?.name && (
        <HomeSection>
          <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(44px,6vw,80px)]`}>
            <div className="mx-auto grid max-w-[56em] grid-cols-1 items-center gap-[clamp(20px,3vw,36px)] min-[720px]:grid-cols-[180px_minmax(0,1fr)]">
              {post.author.image && (
                <div className="relative aspect-square max-w-[180px] overflow-hidden bg-hairline">
                  <Image src={post.author.image} alt="" fill sizes="180px" quality={90} className="object-cover grayscale contrast-105" />
                </div>
              )}
              <div className="grid gap-3">
                <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.writtenBy}</span>
                <span className="text-[clamp(20px,2.4vw,28px)] font-normal uppercase leading-[1.1]">{post.author.name}</span>
                {post.author.role && <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{post.author.role}</span>}
                {post.author.line && <p className="m-0 max-w-[38em] text-pretty text-[14.5px] leading-[1.7] text-body">{post.author.line}</p>}
                {post.author.slug && (
                  <Link href={`/team/${post.author.slug}`} className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink hover:text-accent">
                    {copy.profile} →
                  </Link>
                )}
              </div>
            </div>
          </section>
        </HomeSection>
      )}
      {post.related.length > 0 && (
        <HomeSection>
          <section className={`${pagePad} border-t border-accent py-[clamp(48px,7vw,90px)]`}>
            <h2 className="mb-[clamp(24px,3.4vw,40px)] m-0 text-[clamp(13px,1.5vw,16px)] font-medium uppercase tracking-[0.24em] text-accent">
              {copy.related}
            </h2>
            <div className="grid grid-cols-1 gap-[clamp(18px,2.6vw,28px)] min-[720px]:grid-cols-2">
              {post.related.map((item) => (
                <Link
                  key={item.slug}
                  href={projectHref(item.slug, site)}
                  className="grid gap-[18px] border border-accent p-[clamp(16px,2vw,22px)] text-ink transition-colors hover:bg-panel"
                >
                  {item.image && (
                    <span className="relative aspect-[16/10] overflow-hidden bg-hairline">
                      <Image src={item.image} alt="" fill sizes="(min-width:720px) 45vw, 100vw" quality={90} className="object-cover" />
                    </span>
                  )}
                  <span className="grid gap-3">
                    <span className="text-[clamp(17px,2vw,24px)] font-normal uppercase leading-[1.1] tracking-[-0.01em]">
                      {item.title}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]">
                      {copy.caseStudy}
                      <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </HomeSection>
      )}
      <HomeSection>
        <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(48px,7vw,90px)]`}>
          <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,48px)]">
            <h2 className="m-0 max-w-[18em] font-display text-[clamp(28px,4.4vw,56px)] font-light uppercase leading-[0.94] tracking-[-0.03em] text-ink">
              <ClipLine>{copy.cta.lead}</ClipLine>
              <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
                {copy.cta.accent}
              </ClipLine>
            </h2>
            {wa ? (
              <a
                href={wa}
                className="inline-flex min-h-11 items-center gap-3.5 bg-cta px-[34px] py-5 text-[clamp(10.5px,1.1vw,12px)] font-medium uppercase tracking-[0.18em] text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] hover:bg-ink hover:text-cta"
              >
                {copy.whatsapp}
                <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </section>
      </HomeSection>
      {full.length > 1 && (
        <section className="grid grid-cols-1 border-y border-accent min-[720px]:grid-cols-2">
          <Link
            href={`/journal/${prev.slug}`}
            className="grid gap-3 border-b border-accent px-[clamp(20px,5vw,64px)] py-[clamp(28px,4vw,52px)] text-left text-ink transition-colors hover:bg-panel min-[720px]:border-r min-[720px]:border-b-0"
          >
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">← {copy.previous}</span>
            <span className="max-w-[22em] text-[clamp(17px,2.2vw,26px)] font-normal uppercase leading-[1.15]">{prev.title}</span>
            <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">
              {[prev.topic, prev.date].filter(Boolean).join(' · ')}
            </span>
          </Link>
          <Link
            href={`/journal/${next.slug}`}
            className="grid justify-items-start gap-3 px-[clamp(20px,5vw,64px)] py-[clamp(28px,4vw,52px)] text-left text-ink transition-colors hover:bg-panel min-[720px]:justify-items-end min-[720px]:text-right"
          >
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.nextPost} →</span>
            <span className="max-w-[22em] text-[clamp(17px,2.2vw,26px)] font-normal uppercase leading-[1.15]">{next.title}</span>
            <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">
              {[next.topic, next.date].filter(Boolean).join(' · ')}
            </span>
          </Link>
        </section>
      )}
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
