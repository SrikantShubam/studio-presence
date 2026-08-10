import React from 'react'
import Image from 'next/image'
import type { SectionComponentProps } from '@/sections/registry'

function splitHeading(heading: string): { lead: string; accent: string | null } {
  const words = heading.trim().split(/\s+/)
  if (words.length < 2) return { lead: heading, accent: null }

  const splitAt = Math.ceil(words.length / 2)
  return {
    lead: words.slice(0, splitAt).join(' '),
    accent: words.slice(splitAt).join(' '),
  }
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function About({ config, site }: SectionComponentProps<'about'>) {
  const body = config.body?.trim()
  if (!config?.enabled || !body) return null

  const heading = config.heading?.trim()
  const headingParts = heading ? splitHeading(heading) : null
  const paragraphs = bodyParagraphs(body)
  const hasImage = Boolean(config.image)

  return (
    <section id="about" className="overflow-hidden border-t border-accent bg-surface px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <div
        className={`relative mx-auto grid max-w-6xl items-center gap-10 lg:gap-20 ${
          hasImage ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]' : 'lg:max-w-3xl'
        }`}
      >
        {config.image && (
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="absolute -top-4 -left-4 right-4 bottom-4 border border-accent sm:-top-7 sm:-left-7 sm:right-7 sm:bottom-7" />
            <div className="relative aspect-[3/4] overflow-hidden border border-hairline bg-muted/15">
              <Image
                src={config.image}
                alt={heading ?? site.business.name}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="min-w-0">
          {headingParts && (
            <h2 className="m-0 max-w-4xl break-words font-display text-[clamp(40px,7vw,88px)] font-light uppercase leading-none text-ink">
              {headingParts.lead}
              {headingParts.accent && (
                <span className="block pl-[0.55em] text-accent">{headingParts.accent}</span>
              )}
            </h2>
          )}

          <div className={headingParts ? 'mt-8 space-y-5 sm:mt-10' : 'space-y-5'}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="m-0 max-w-prose text-base leading-8 text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
