'use client'

import { useRef } from 'react'
import type { ClientConfig } from '@studio/backend'
import type { PortfolioConfig } from './shared'
import { PortfolioHeader, ProjectImage, ProjectLink, ProjectLocation, teaserProjects } from './shared'

function scrollRail(rail: HTMLDivElement | null, direction: -1 | 1) {
  if (!rail) return

  const firstCard = rail.querySelector<HTMLElement>('[data-project-card]')
  const step = firstCard ? firstCard.offsetWidth + 32 : rail.clientWidth
  rail.scrollBy({ left: step * direction, behavior: 'smooth' })
}

export function PortfolioCarousel({ config }: { config: PortfolioConfig; site: ClientConfig }) {
  const projects = teaserProjects(config)
  const railRef = useRef<HTMLDivElement>(null)

  if (!config.enabled || !projects.length) return null

  return (
    <section id="portfolio" className="overflow-hidden border-y border-accent bg-surface py-16 text-ink sm:py-20 lg:py-28">
      <PortfolioHeader detailPages={config.detailPages} compact />

      <div className="relative">
        <div
          ref={railRef}
          className="flex snap-x snap-proximity gap-5 overflow-x-auto px-5 pb-8 [scrollbar-width:none] sm:gap-7 sm:px-8 lg:gap-8 lg:px-16 [&::-webkit-scrollbar]:hidden"
          aria-label="Selected portfolio projects"
        >
          {projects.map((project, index) => (
            <ProjectLink
              key={project.slug}
              project={project}
              detailPages={config.detailPages}
              className="grid min-w-0 flex-[0_0_78%] snap-start gap-5 text-ink sm:flex-[0_0_44%] lg:flex-[0_0_30%]"
            >
              <span data-project-card className="relative mt-4 mr-4 block">
                <span className="pointer-events-none absolute -top-4 left-4 right-[-1rem] bottom-4 border border-accent" />
                <span className="relative block aspect-[4/5] overflow-hidden bg-hairline">
                  <ProjectImage project={project} priority={index === 0} />
                </span>
              </span>

              <span className="grid gap-3 border-t border-accent pt-4">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="break-words font-display text-[clamp(16px,1.7vw,21px)] font-normal uppercase leading-tight tracking-tight">
                    {project.title}
                  </span>
                  <span className="shrink-0 text-[10px] tracking-[0.16em] text-hairline">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>
                <ProjectLocation
                  project={project}
                  className="break-words text-[10px] font-normal uppercase tracking-[0.22em] text-muted"
                />
              </span>
            </ProjectLink>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous projects"
          onClick={() => scrollRail(railRef.current, -1)}
          className="absolute top-[32%] left-2 hidden h-11 w-11 items-center justify-center border border-accent bg-surface/90 text-sm text-ink transition-colors hover:bg-ink hover:text-surface md:flex"
        >
          &lt;
        </button>
        <button
          type="button"
          aria-label="Next projects"
          onClick={() => scrollRail(railRef.current, 1)}
          className="absolute top-[32%] right-2 hidden h-11 w-11 items-center justify-center border border-accent bg-surface/90 text-sm text-ink transition-colors hover:bg-ink hover:text-surface md:flex"
        >
          &gt;
        </button>
      </div>
    </section>
  )
}
