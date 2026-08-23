import Image from 'next/image'
import type { ReactNode } from 'react'
import type { SectionConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeTextClass, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'

export type PortfolioConfig = SectionConfig<'portfolio'>
export type PortfolioProject = PortfolioConfig['projects'][number]

export const TEASER_LIMIT = 6

export function teaserProjects(config: PortfolioConfig): PortfolioProject[] {
  return config.projects.slice(0, TEASER_LIMIT)
}

export function projectHref(project: PortfolioProject, detailPages: boolean): string | null {
  return detailPages ? `/portfolio/${project.slug}` : null
}

export function ProjectLink({
  project,
  detailPages,
  className,
  locale = 'en',
  children,
}: {
  project: PortfolioProject
  detailPages: boolean
  className: string
  locale?: PublicLocale
  children: ReactNode
}) {
  const href = projectHref(project, detailPages)

  if (!href) return <div className={className}>{children}</div>

  return (
    <a href={localeHref(href, locale)} className={className}>
      {children}
    </a>
  )
}

/**
 * The reference mockups (design/reference/editorial/home-sections/portfolio.html
 * and featured-projects--carousel.html) have a small eyebrow tag above this
 * heading — "(WORK) SELECTED PROJECTS" — that isn't reproduced here. See
 * ServicesDetailed.tsx's comment for the reasoning: fabricated copy for a field
 * the schema doesn't have.
 */
export function PortfolioHeader({
  detailPages,
  compact = false,
  locale = 'en',
}: {
  detailPages: boolean
  compact?: boolean
  locale?: PublicLocale
}) {
  const copy = chromeCopy[locale].portfolio

  return (
    <div
      className={
        compact
          ? 'grid gap-6 px-5 pb-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-end md:gap-12 lg:px-16'
          : 'mb-[clamp(40px,6vw,76px)] flex flex-wrap items-end justify-between gap-6'
      }
    >
      <h2 className="m-0 font-display text-[clamp(46px,9vw,112px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
        {copy.titleLead}
        <br />
        <span className="ml-[0.5em] block text-accent">{copy.titleAccent}</span>
      </h2>

      {detailPages && (
        <a
          href={localeHref('/portfolio', locale)}
          className={`text-[11.5px] font-medium text-ink transition-colors hover:text-accent ${localeTextClass(locale, 'uppercase tracking-[0.2em]')}`}
        >
          <span className="inline-flex items-center gap-2">
            {copy.viewAll}
            <EditorialIcon name="arrow-right" className="h-3 w-3" />
          </span>
        </a>
      )}
    </div>
  )
}

export function ProjectImage({
  project,
  className = '',
  priority = false,
}: {
  project: PortfolioProject
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={project.cover}
      alt={`${project.title} cover photograph`}
      fill
      priority={priority}
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      className={`object-cover ${className}`}
    />
  )
}

export function ProjectLocation({ project, className = '' }: { project: PortfolioProject; className?: string }) {
  if (!project.location) return null

  return <span className={className}>LOCATION: {project.location}</span>
}

export function ProjectMeta({ project }: { project: PortfolioProject }) {
  const entries = [
    project.location ? ['location', project.location] : null,
    project.duration ? ['terms of execution', project.duration] : null,
    project.area ? ['area', project.area] : null,
  ].filter((entry): entry is [string, string] => Boolean(entry))

  if (!entries.length) return null

  return (
    <div className="grid gap-5 border-accent pt-1 md:border-l md:pl-7">
      {entries.slice(0, 2).map(([label, value]) => (
        <div key={label} className="grid gap-1">
          <span className="text-[11px] lowercase tracking-[0.16em] text-muted">{label}</span>
          <span className="break-words text-[clamp(18px,2.2vw,28px)] font-normal uppercase tracking-wide text-ink">
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}
