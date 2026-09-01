'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { chromeCopy, publicLocaleFromSite } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine, FadeUp, Stagger, StaggerItem } from '@/lib/motion'

type News = NonNullable<ClientConfig['sections']['news']>

const pagePad = 'px-[clamp(20px,5vw,64px)]'

export function NewsBrowser({ news, site }: { news: News; site: ClientConfig }) {
  const locale = publicLocaleFromSite(site)
  const labels = chromeCopy[locale].news
  const all = labels.all
  const years = useMemo(() => {
    const set = new Set<string>()
    for (const item of news.press) if (item.year) set.add(item.year)
    for (const item of news.items) if (item.year) set.add(item.year)
    return [all, ...[...set].sort().reverse()]
  }, [all, news.press, news.items])

  const [year, setYear] = useState<string>(all)
  const press = useMemo(() => news.press.filter((item) => year === all || item.year === year), [all, news.press, year])
  const items = useMemo(() => news.items.filter((item) => year === all || item.year === year), [all, news.items, year])

  return (
    <>
      <section className={`${pagePad} pb-[clamp(28px,4vw,44px)] pt-[clamp(48px,7vw,96px)]`}>
        <div className="flex flex-wrap items-end justify-between gap-[clamp(24px,4vw,56px)]">
          <div className="min-w-0">
            <h1 className="m-0 font-display text-[clamp(44px,8.5vw,108px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
              <ClipLine>{labels.title.lead}</ClipLine>
              <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
                {labels.title.accent}
              </ClipLine>
            </h1>
          </div>
          {years.length > 1 && (
            <div className="flex flex-wrap gap-[clamp(16px,2.4vw,32px)] text-[clamp(12px,1.4vw,15px)] uppercase tracking-[0.16em]">
              {years.map((label) => {
                const active = year === label
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setYear(label)}
                    className={`min-h-11 border-b-2 bg-transparent py-2.5 ${
                      active ? 'border-accent text-ink' : 'border-transparent text-muted'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {press.length > 0 && (
        <section className={`${pagePad} border-t border-accent bg-panel pb-[clamp(56px,8vw,96px)] pt-[clamp(40px,5vw,64px)]`}>
          <div className="mb-[clamp(28px,4vw,44px)] flex flex-wrap items-end justify-between gap-[18px]">
            <h2 className="m-0 text-[clamp(13px,1.5vw,16px)] font-medium uppercase tracking-[0.24em] text-accent">
              {labels.press.title}
            </h2>
            <span className="text-xs tracking-[0.06em] text-muted">{labels.press.note}</span>
          </div>
          <div className="grid">
            {press.map((item) => (
              <a
                key={`${item.publication}-${item.date}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-1 items-start gap-[clamp(16px,3vw,44px)] border-t border-accent py-[clamp(24px,3.2vw,38px)] text-ink transition-colors hover:bg-surface min-[720px]:grid-cols-[minmax(160px,0.5fr)_minmax(0,1.5fr)]"
              >
                <span className="grid gap-3">
                  <span className="text-[clamp(18px,2.2vw,27px)] font-normal uppercase leading-[1.1] tracking-[0.02em] grayscale">
                    {item.publication}
                  </span>
                  {item.date && <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-muted">{item.date}</span>}
                </span>
                <span className="grid gap-4">
                  <span className="max-w-[34em] text-[clamp(15px,1.7vw,19px)] font-normal leading-[1.45]">{item.headline}</span>
                  {item.quote ? (
                    <span className="max-w-[38em] border-l border-accent pl-[clamp(14px,2vw,22px)] text-[14.5px] leading-[1.7] text-body">
                      {item.quote}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                    {labels.press.readOn} {item.publicationShort ?? item.publication}
                    <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {items.length > 0 ? (
        <section className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
          <div className="mb-[clamp(32px,4.5vw,52px)] flex flex-wrap items-end justify-between gap-[18px]">
            <h2 className="m-0 text-[clamp(13px,1.5vw,16px)] font-medium uppercase tracking-[0.24em] text-accent">
              {labels.studio.title}
            </h2>
            <span className="text-xs tracking-[0.06em] text-muted">{labels.studio.note}</span>
          </div>
          <Stagger className="grid grid-cols-1 gap-x-[clamp(20px,3vw,34px)] gap-y-[clamp(28px,4vw,48px)] min-[720px]:grid-cols-2 min-[1080px]:grid-cols-3">
            {items.map((item) => (
              <StaggerItem key={item.slug}>
                <Link href={`/news/${item.slug}`} className="group grid content-start gap-[18px] text-left text-ink">
                  {item.photo && (
                    <span className="relative aspect-[4/3] overflow-hidden bg-hairline">
                      <Image
                        src={item.photo}
                        alt=""
                        fill
                        sizes="(min-width:1080px) 30vw, (min-width:720px) 45vw, 100vw"
                        quality={90}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </span>
                  )}
                  <span className="grid gap-3">
                    <span className="flex flex-wrap gap-x-[clamp(14px,2vw,22px)] gap-y-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">
                      {item.category && <span>{item.category}</span>}
                      <span className="text-muted">{item.date}</span>
                    </span>
                    <span className="text-[clamp(17px,1.9vw,22px)] font-normal uppercase leading-[1.2] tracking-[-0.01em]">
                      {item.headline ?? item.title}
                    </span>
                    {item.summary && <span className="max-w-[32em] text-[14.5px] leading-[1.7] text-body">{item.summary}</span>}
                    <span className="mt-0.5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]">
                      {labels.studio.read}
                      <EditorialIcon name="arrow-right" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : press.length === 0 ? (
        <section className={`${pagePad} border-t border-accent py-[clamp(56px,8vw,100px)]`}>
          <FadeUp>
            <p className="m-0 text-[14.5px] text-muted">{labels.empty} {year}.</p>
          </FadeUp>
        </section>
      ) : null}
    </>
  )
}
