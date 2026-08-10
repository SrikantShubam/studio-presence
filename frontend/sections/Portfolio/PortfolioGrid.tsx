import type { ClientConfig } from '@studio/backend'
import type { PortfolioConfig, PortfolioProject } from './shared'
import { PortfolioHeader, ProjectImage, ProjectLink, ProjectLocation, ProjectMeta, teaserProjects } from './shared'

const TILE_CLASSES = [
  'md:col-span-7 md:row-span-3',
  'md:col-span-5 md:row-span-2',
  'md:col-span-3 md:row-span-1',
  'md:col-span-2 md:row-span-1',
  'md:col-span-4 md:row-span-2',
  'md:col-span-3 md:row-span-1',
]

const TILE_ASPECTS = [
  'aspect-[4/5] md:aspect-auto',
  'aspect-[4/3] md:aspect-auto',
  'aspect-[5/4] md:aspect-auto',
  'aspect-[5/4] md:aspect-auto',
  'aspect-[4/5] md:aspect-auto',
  'aspect-[5/4] md:aspect-auto',
]

function FeaturedProject({ project }: { project: PortfolioProject }) {
  return (
    <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)] md:items-start md:gap-12 lg:gap-16">
      <span className="pointer-events-none absolute -top-10 right-0 font-display text-[clamp(76px,10vw,140px)] font-light leading-none text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
        01
      </span>

      <div className="relative min-w-0">
        <h3 className="m-0 break-words font-display text-[clamp(24px,2.8vw,34px)] font-normal uppercase leading-tight tracking-tight text-ink">
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
}: {
  project: PortfolioProject
  index: number
  detailPages: boolean
}) {
  return (
    <ProjectLink
      project={project}
      detailPages={detailPages}
      className={`group relative min-w-0 overflow-hidden bg-hairline ${TILE_ASPECTS[index] ?? TILE_ASPECTS[0]} ${
        TILE_CLASSES[index] ?? TILE_CLASSES[TILE_CLASSES.length - 1]
      }`}
    >
      <ProjectImage project={project} priority={index === 0} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/0 via-ink/10 to-ink/75" />
      <div className="absolute inset-x-0 bottom-0 grid gap-2 p-4 text-surface sm:p-5">
        <span className="break-words font-display text-[clamp(13px,1.6vw,22px)] font-normal uppercase leading-tight">
          {project.title}
        </span>
        <ProjectLocation
          project={project}
          className="break-words text-[9.5px] font-medium uppercase tracking-[0.18em] text-surface/80"
        />
      </div>
    </ProjectLink>
  )
}

export function PortfolioGrid({ config }: { config: PortfolioConfig; site: ClientConfig }) {
  const projects = teaserProjects(config)
  if (!config.enabled || !projects.length) return null
  const featuredProject = projects[0]
  if (!featuredProject) return null

  return (
    <section id="portfolio" className="overflow-hidden border-t border-accent bg-surface px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <PortfolioHeader detailPages={config.detailPages} />

      <div className="grid gap-10">
        <FeaturedProject project={featuredProject} />

        <div className="grid auto-rows-[minmax(130px,14vw)] grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-12 md:gap-4 lg:gap-5">
          {projects.map((project, index) => (
            <MosaicTile key={project.slug} project={project} index={index} detailPages={config.detailPages} />
          ))}
        </div>
      </div>
    </section>
  )
}
