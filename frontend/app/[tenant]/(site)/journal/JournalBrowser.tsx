'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, DrawFrame, RevealImage, Stagger, StaggerItem } from '@/lib/motion'

type Journal = NonNullable<ClientConfig['sections']['journal']>
type Post = Journal['posts'][number]

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  read: 'Read the post',
  next: 'Next',
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'
const perPage = 9
const ALL = 'All'

export function JournalBrowser({ journal }: { journal: Journal }) {
  const topics = useMemo(() => [ALL, ...journal.topics], [journal.topics])
  const [topic, setTopic] = useState<string>(ALL)
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => journal.posts.filter((item) => topic === ALL || item.topic?.toLowerCase() === topic.toLowerCase()),
    [journal.posts, topic],
  )
  const featured = filtered[0]
  const rest = filtered.slice(1)
  const totalPages = Math.max(1, Math.ceil(rest.length / perPage))
  const safePage = Math.min(page, totalPages)
  const visible = rest.slice((safePage - 1) * perPage, safePage * perPage)

  function selectTopic(next: string) {
    setTopic(next)
    setPage(1)
  }

  return (
    <>
      <section className={`${pagePad} pb-[clamp(24px,3.4vw,40px)] pt-[clamp(48px,7vw,96px)]`}>
        <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
          <div className="min-w-0">
            <h1 className="m-0 font-display text-[clamp(46px,9vw,112px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
              <ClipLine>The</ClipLine>
              <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
                Journal
              </ClipLine>
            </h1>
          </div>
          {journal.intro && (
            <p className="m-0 max-w-[28em] text-pretty text-justify text-[15px] leading-[1.7] text-body">{journal.intro}</p>
          )}
        </div>
      </section>

      {topics.length > 1 && (
        <section className={pagePad}>
          <div className="flex flex-wrap gap-[clamp(16px,2.6vw,40px)] border-b border-accent pb-[clamp(16px,2vw,22px)]">
            {topics.map((name) => {
              const count =
                name === ALL ? journal.posts.length : journal.posts.filter((item) => item.topic?.toLowerCase() === name.toLowerCase()).length
              const active = topic === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => selectTopic(name)}
                  className={`min-h-11 border-b-2 bg-transparent py-2.5 text-[clamp(12px,1.4vw,15px)] uppercase tracking-[0.16em] ${
                    active ? 'border-accent text-ink' : 'border-transparent text-muted'
                  }`}
                >
                  {name} <span className={active ? 'text-accent' : 'text-muted'}>({count})</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {featured ? (
        <section className={`${pagePad} pb-[clamp(56px,7vw,96px)] pt-[clamp(44px,6vw,80px)]`}>
          <Featured post={featured} />
        </section>
      ) : null}

      {visible.length > 0 && (
        <section className={`${pagePad} border-t border-accent bg-panel pb-[clamp(40px,5vw,64px)] pt-[clamp(44px,6vw,80px)]`}>
          <Stagger className="grid grid-cols-1 gap-x-[clamp(20px,3vw,34px)] gap-y-[clamp(32px,4vw,52px)] min-[720px]:grid-cols-2 min-[1080px]:grid-cols-3">
            {visible.map((post, index) => {
              const numeral = String((safePage - 1) * perPage + index + 1).padStart(2, '0')
              const inner = (
                <>
                  {post.cover && (
                    <span className="relative aspect-[4/3] overflow-hidden bg-hairline">
                      <Image
                        src={post.cover}
                        alt=""
                        fill
                        sizes="(min-width:1080px) 30vw, (min-width:720px) 45vw, 100vw"
                        quality={90}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </span>
                  )}
                  <span className="flex items-start gap-3.5">
                    <span className="shrink-0 font-display text-[clamp(28px,3.2vw,42px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
                      {numeral}
                    </span>
                    <span className="grid min-w-0 gap-2.5">
                      <span className="flex flex-wrap gap-x-[clamp(12px,1.6vw,18px)] gap-y-1.5 text-[10px] font-medium uppercase tracking-[0.18em]">
                        {post.topic && <span className="text-accent">{post.topic}</span>}
                        <span className="text-muted">{post.date}</span>
                      </span>
                      <span className="text-[clamp(16px,1.8vw,20px)] font-normal uppercase leading-[1.2] tracking-[-0.01em]">
                        {post.title}
                      </span>
                      {post.excerpt && <span className="max-w-[30em] text-sm leading-[1.7] text-body">{post.excerpt}</span>}
                    </span>
                  </span>
                </>
              )
              return (
                <StaggerItem key={post.slug}>
                  {post.full ? (
                    <Link href={`/journal/${post.slug}`} className="group grid gap-4 text-left text-ink">
                      {inner}
                    </Link>
                  ) : (
                    <div className="grid gap-4 text-left text-ink">{inner}</div>
                  )}
                </StaggerItem>
              )
            })}
          </Stagger>
        </section>
      )}

      {totalPages > 1 && (
        <section className={`${pagePad} bg-panel pb-[clamp(64px,9vw,110px)] pt-[clamp(28px,3.4vw,40px)]`}>
          <div className="flex flex-wrap items-center justify-between gap-5 border-t border-accent pt-[clamp(22px,3vw,32px)]">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Page {safePage} of {totalPages} · {filtered.length} posts
            </span>
            <div className="flex flex-wrap items-center gap-[clamp(14px,2vw,26px)] text-[12.5px] tracking-[0.16em]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`min-h-11 min-w-11 border-b-2 bg-transparent px-2 py-2 ${
                    n === safePage ? 'border-accent text-ink' : 'border-transparent text-muted'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                disabled={safePage >= totalPages}
                className="min-h-11 bg-transparent py-2 pl-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink disabled:text-muted"
              >
                {copy.next} →
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function Featured({ post }: { post: Post }) {
  const title = post.displayTitle ?? { lead: post.title, accent: '' }
  const body = (
    <>
      {post.cover && (
        <span className="relative mr-[clamp(18px,2.6vw,28px)] mt-[clamp(18px,2.6vw,28px)] block">
          <DrawFrame className="pointer-events-none absolute -top-[clamp(18px,2.6vw,28px)] bottom-[clamp(18px,2.6vw,28px)] left-[clamp(18px,2.6vw,28px)] right-[calc(clamp(18px,2.6vw,28px)*-1)] border border-accent" />
          <span className="relative block aspect-[4/3] overflow-hidden bg-hairline">
            <RevealImage>
              <Image src={post.cover} alt="" fill sizes="(min-width:900px) 50vw, 100vw" quality={90} className="object-cover" />
            </RevealImage>
          </span>
        </span>
      )}
      <span className="grid gap-[clamp(16px,2vw,22px)]">
        <span className="flex flex-wrap gap-x-[clamp(14px,2vw,24px)] gap-y-2 text-[10.5px] font-medium uppercase tracking-[0.2em]">
          {post.topic && <span className="text-accent">{post.topic}</span>}
          <span className="text-muted">{post.date}</span>
        </span>
        <span className="max-w-[20em] font-display text-[clamp(28px,4.4vw,58px)] font-light uppercase leading-[0.98] tracking-[-0.03em]">
          {title.lead}
          {title.accent && <span className="ml-[0.55em] block text-accent">{title.accent}</span>}
        </span>
        {post.excerpt && <span className="max-w-[34em] text-[clamp(15px,1.7vw,18px)] leading-[1.65] text-body">{post.excerpt}</span>}
        <span className="flex flex-wrap gap-x-[clamp(16px,2.4vw,28px)] gap-y-2.5 text-[10.5px] uppercase tracking-[0.18em] text-muted">
          {post.author?.name && <span>{post.author.name}</span>}
          {post.words && <span>{post.words}</span>}
        </span>
        {post.full ? (
          <span className="mt-1 inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.2em]">
            {copy.read}
            <EditorialIcon name="arrow-right" className="h-3 w-3" />
          </span>
        ) : null}
      </span>
    </>
  )

  if (post.full) {
    return (
      <Link
        href={`/journal/${post.slug}`}
        className="grid w-full grid-cols-1 items-center gap-[clamp(32px,5vw,72px)] text-left text-ink min-[900px]:grid-cols-2"
      >
        {body}
      </Link>
    )
  }

  return <div className="grid grid-cols-1 items-center gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-2">{body}</div>
}
