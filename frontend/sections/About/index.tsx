import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { SectionComponentProps } from '@/sections/registry'
import { ClipLine, FadeUp } from '@/lib/motion'
import { chromeCopy, localeHref, localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'

function splitHeading(heading: string): { lead: string; accent: string | null } {
  const words = heading.trim().split(/\s+/)
  if (words.length < 2) return { lead: heading, accent: null }

  const splitAt = 1
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
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].about

  const heading = config.heading?.trim()
  const headingParts = heading ? splitHeading(heading) : null
  const paragraphs = bodyParagraphs(body)
  const hasImage = Boolean(config.image)

  return (
    <section id="about" className="relative border-t border-accent bg-panel px-5 py-[clamp(64px,9vw,120px)] text-ink sm:px-8 lg:px-16">
      <div
        className={`relative mx-auto grid max-w-6xl items-center gap-[clamp(36px,7vw,96px)] ${
          hasImage ? 'lg:grid-cols-[1fr_1.1fr]' : 'lg:max-w-3xl'
        }`}
      >
        {config.image && (
          <div className="relative mx-auto w-full max-w-md md:max-w-sm lg:mx-0 lg:max-w-md">
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
          <div className={`mb-[clamp(20px,3vw,34px)] grid gap-1.5 font-normal leading-[1.6] text-accent ${localeRoleClass(locale, 'eyebrow')}`}>
            {copy.eyebrow.map((line, index) => (
              <ClipLine key={line} delay={index * 0.05}>{line}</ClipLine>
            ))}
          </div>
          {headingParts && (
            <h2 className="m-0 max-w-4xl break-words font-display text-[clamp(40px,7.5vw,92px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
              <ClipLine>{headingParts.lead}</ClipLine>
              {headingParts.accent && (
                <ClipLine className="pl-[0.55em] text-accent" delay={0.08}>{headingParts.accent}</ClipLine>
              )}
            </h2>
          )}

          <FadeUp className={headingParts ? 'mt-[clamp(28px,4vw,44px)] space-y-5' : 'space-y-5'} delay={0.12}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className={`m-0 max-w-[36em] leading-[1.75] text-ink md:text-justify ${localeRoleClass(locale, 'body')}`}>
                {paragraph}
              </p>
            ))}
          </FadeUp>
          <div className="mt-[clamp(32px,4vw,48px)] flex flex-wrap items-end justify-between gap-5 border-t border-accent pt-6">
            <div className="flex items-baseline gap-[18px]">
              <span className="font-display text-[clamp(40px,5vw,56px)] font-normal leading-none tracking-[-0.03em]">{site.business.yearFounded}</span>
              <span className={`font-medium text-accent ${localeRoleClass(locale, 'label')}`}>{copy.founded} {site.business.address.city}</span>
            </div>
            <Link
              href={localeHref('/about', locale)}
              className={`inline-flex min-h-11 items-center gap-3 border border-accent bg-surface px-5 py-3 font-medium text-ink transition-colors hover:bg-ink hover:text-surface ${localeRoleClass(locale, 'button')}`}
            >
              {copy.readMore}
              <EditorialIcon name="arrow-right" className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
