'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { ClientConfig } from '@studio/backend'
import { localeTextClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'
import type { PortfolioConfig, PortfolioProject } from './shared'
import { PortfolioHeader, ProjectImage, ProjectLink, ProjectLocation, ProjectMeta, teaserProjects } from './shared'

function autoAdvanceRail(rail: HTMLDivElement | null) {
  if (!rail || rail.scrollWidth <= rail.clientWidth) return
  const firstCard = rail.querySelector<HTMLElement>('[data-project-card]')
  const step = firstCard ? firstCard.offsetWidth + 28 : rail.clientWidth
  const atEnd = rail.scrollLeft + rail.clientWidth + step >= rail.scrollWidth
  rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft + step, behavior: 'smooth' })
}

const TILE_CLASSES = [
  'lg:col-span-7 lg:row-span-3',
  'lg:col-span-5 lg:row-span-2',
  'lg:col-span-3 lg:row-span-1',
  'lg:col-span-2 lg:row-span-1',
  'lg:col-span-4 lg:row-span-2',
  'lg:col-span-3 lg:row-span-1',
]

const TILE_ASPECTS = [
  'aspect-[4/5] lg:aspect-auto',
  'aspect-[4/3] lg:aspect-auto',
  'aspect-[5/4] lg:aspect-auto',
  'aspect-[5/4] lg:aspect-auto',
  'aspect-[4/5] lg:aspect-auto',
  'aspect-[5/4] lg:aspect-auto',
]

function FeaturedProject({ project }: { project: PortfolioProject }) {
  return (
    <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)] md:items-start md:gap-12 lg:gap-16">
      <span className="pointer-events-none absolute -top-10 right-0 font-display text-[clamp(76px,10vw,140px)] font-light leading-none text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
        01
      </span>

      <div className="relative min-w-0">
        <h3 className="m-0 break-words font-display text-[clamp(24px,2.8vw,34px)] font-semibold uppercase leading-tight tracking-tight text-ink">
          {project.title}
        </h3>
        {project.blurb && (
          <p className="mt-5 max-w-3xl text-pretty text-[15px] leading-relaxed text-muted">{project.blurb}</p>
        )}
      </div>

      <ProjectMeta project={project} />
    </div>
  )
}

function MosaicTile({
  project,
  index,
  detailPages,
  locale,
}: {
  project: PortfolioProject
  index: number
  detailPages: boolean
  locale: PublicLocale
}) {
  return (
    <ProjectLink
      project={project}
      detailPages={detailPages}
      locale={locale}
      className={`group relative min-w-0 overflow-hidden bg-hairline ${TILE_ASPECTS[index] ?? TILE_ASPECTS[0]} ${
        TILE_CLASSES[index] ?? TILE_CLASSES[TILE_CLASSES.length - 1]
      }`}
    >
      <ProjectImage project={project} priority className="transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-ink/0 via-ink/10 to-ink/75" />
      <div className="absolute inset-x-0 bottom-0 grid gap-2 p-4 text-surface sm:p-5">
        <span className="break-words font-display text-[clamp(13px,1.6vw,22px)] font-normal uppercase leading-tight">
          {project.title}
        </span>
        <ProjectLocation
          project={project}
          className={`break-words text-[9.5px] font-medium text-surface/80 ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}
        />
      </div>
    </ProjectLink>
  )
}

export function PortfolioGrid({ config, site }: { config: PortfolioConfig; site: ClientConfig }) {
  const projects = teaserProjects(config)
  const locale = publicLocaleFromSite(site)
  const railRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduce || paused || projects.length < 2) return
    const timer = window.setInterval(() => autoAdvanceRail(railRef.current), 4200)
    return () => window.clearInterval(timer)
  }, [paused, projects.length, reduce])

  if (!config.enabled || !projects.length) return null
  const featuredProject = projects[0]
  if (!featuredProject) return null

  return (
    <section id="portfolio" className="overflow-hidden border-t border-accent bg-surface px-5 pb-[clamp(72px,10vw,130px)] pt-[clamp(64px,8vw,110px)] text-ink sm:px-8 lg:px-16">
      <PortfolioHeader detailPages={config.detailPages} locale={locale} />

      <div className="grid gap-[clamp(32px,4vw,52px)]">
        <FeaturedProject project={featuredProject} />

        <div
          ref={railRef}
          className="grid grid-cols-1 gap-[clamp(10px,1.4vw,20px)] sm:grid-cols-2 md:flex md:snap-x md:gap-7 md:overflow-x-auto md:pb-3 md:[scrollbar-width:none] lg:grid lg:auto-rows-[clamp(120px,11.8vw,170px)] lg:grid-cols-12 lg:gap-[clamp(10px,1.4vw,20px)] lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {projects.map((project, index) => (
            <span key={project.slug} data-project-card className="contents md:block md:flex-[0_0_44%] md:snap-start lg:contents">
              <MosaicTile project={project} index={index} detailPages={config.detailPages} locale={locale} />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
