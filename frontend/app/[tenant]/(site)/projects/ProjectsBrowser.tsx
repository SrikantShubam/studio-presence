'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeRoleClass, localeTextClass, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { FadeUpItem, Stagger } from '@/lib/motion'
import type { PortfolioProject } from '@/sections/Portfolio/shared'
import { ProjectImage, ProjectLink } from '@/sections/Portfolio/shared'
import { PROJECT_FILTER_IDS, type ProjectFilterId } from './project-filters'

/**
 * The filter tabs are a fixed taxonomy tied to `project.projectType`
 * (residential/commercial/office/retail), not per-client content — every
 * editorial-identity site groups its work the same way. "office" buckets under
 * "hospitality" here to match the reference design's grouping.
 */
const PAGE_SIZE = 12

const secondaryButtonBase =
  'inline-flex min-h-10 items-center gap-2.5 bg-ink px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-surface transition-colors hover:text-cta sm:min-h-11 sm:gap-3 sm:px-5 sm:py-3 sm:text-[10.5px] sm:tracking-[0.16em] lg:gap-3.5 lg:px-[34px] lg:py-5 lg:text-[clamp(10.5px,1.1vw,12px)] lg:tracking-[0.18em]'

const secondaryButtonShape =
  '[clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-16px)_100%,0_100%)] sm:[clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)]'

const BANDS: Record<2 | 4 | 6, Array<Array<[number, number]>>> = {
  6: [
    [[3, 2], [3, 2]],
    [[2, 1], [2, 1], [2, 1]],
    [[4, 2], [2, 2]],
    [[1, 1], [1, 1], [2, 1], [2, 1]],
    [[2, 2], [4, 2]],
  ],
  4: [
    [[2, 2], [2, 2]],
    [[1, 1], [1, 1], [2, 1]],
    [[3, 2], [1, 2]],
    [[2, 1], [2, 1]],
  ],
  2: [[[2, 2]], [[1, 1], [1, 1]], [[2, 1]], [[1, 1], [1, 1]]],
}

const COL_SPAN: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
}

const ROW_SPAN: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
}

function useColumnCount(): 2 | 4 | 6 {
  const [cols, setCols] = useState<2 | 4 | 6>(2)

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      setCols(width < 720 ? 2 : width < 1080 ? 4 : 6)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return cols
}

function bucket(type: PortfolioProject['projectType']): string | null {
  if (!type) return null
  return type === 'office' ? 'hospitality' : type
}

function projectMeta(project: PortfolioProject): string {
  return [project.location, project.duration].filter(Boolean).join(' · ')
}

function nameSize(rows: number): string {
  if (rows >= 3) return 'text-[clamp(16px,1.8vw,22px)]'
  if (rows === 2) return 'text-[clamp(14px,1.6vw,19px)]'
  return 'text-[clamp(12.5px,1.4vw,15px)]'
}

function filterHref(id: ProjectFilterId): string {
  return id === 'all' ? '/portfolio' : `/projects/${id}`
}

export function ProjectsBrowser({
  projects,
  active,
  detailPages,
  categoryHeaders,
  locale = 'en',
}: {
  projects: PortfolioProject[]
  active: string
  detailPages: boolean
  categoryHeaders: ClientConfig['sections']['portfolio']['categoryHeaders']
  locale?: PublicLocale
}) {
  const cols = useColumnCount()
  const [shown, setShown] = useState(PAGE_SIZE)
  const copy = chromeCopy[locale].portfolio
  const labelClass = locale === 'hi' ? localeRoleClass(locale, 'label') : localeTextClass(locale, 'uppercase tracking-[0.16em]')

  useEffect(() => {
    setShown(PAGE_SIZE)
  }, [active])

  const categories = useMemo(
    () =>
      PROJECT_FILTER_IDS.map((id) => ({
        id,
        label: copy.filters[id],
        count:
          id === 'all'
            ? projects.length
            : projects.filter((project) => bucket(project.projectType) === id).length,
      })),
    [copy.filters, projects],
  )

  const filtered = useMemo(() => {
    if (active === 'all') {
      return [...projects].sort((a, b) => (bucket(a.projectType) ?? '').localeCompare(bucket(b.projectType) ?? ''))
    }
    return projects.filter((project) => bucket(project.projectType) === active)
  }, [projects, active])

  const visible = filtered.slice(0, shown)
  const hasMore = visible.length < filtered.length
  const header = active !== 'all' ? categoryHeaders.find((h) => h.category === active) : undefined

  const tiles = useMemo(() => {
    const bands = BANDS[cols]
    const flat = bands.flat()
    const blockCount: Record<string, number> = {}
    for (const project of visible) {
      const key = bucket(project.projectType) ?? '_'
      blockCount[key] = (blockCount[key] ?? 0) + 1
    }

    const seen = new Set<string>()
    let inBlock = 0
    let cursor = 0
    let typeIndex = 0
    const lastType = new Map<string, number>()

    return visible.map((project) => {
      const key = bucket(project.projectType) ?? '_'
      const showBreak = active === 'all' && key !== '_' && !seen.has(key)
      if (showBreak) {
        seen.add(key)
        inBlock = 0
        cursor = 0
        if (!lastType.has(key)) {
          lastType.set(key, typeIndex)
          typeIndex += 1
        }
      }

      const pair = flat[inBlock % flat.length] ?? [1, 1]
      let span = pair[0]
      const rows = pair[1]
      const isBlockEnd = inBlock === (blockCount[key] ?? 1) - 1
      const room = cols - (cursor % cols)
      if (isBlockEnd || span > room) span = room
      cursor += span
      inBlock += 1

      return {
        project,
        span: Math.max(1, Math.min(span, cols)),
        rows,
        showBreak,
        breakKey: key,
        breakIndex: lastType.get(key) ?? 0,
      }
    })
  }, [visible, cols, active])

  return (
    <>
      <section className="px-5 sm:px-8 lg:px-16">
        <div className="flex flex-wrap gap-[clamp(18px,3vw,44px)] border-b border-accent pb-[clamp(16px,2vw,22px)]">
          {categories.map((category) => {
            const isActive = category.id === active
            return (
              <Link
                key={category.id}
                href={localeHref(filterHref(category.id), locale)}
                className={`min-h-11 border-b-2 py-2.5 text-[clamp(12px,1.4vw,15px)] font-normal transition-colors ${labelClass} ${
                  isActive ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {category.label}{' '}
                <span className={isActive ? 'text-accent' : 'text-muted'}>({category.count})</span>
              </Link>
            )
          })}
        </div>
      </section>

      {header && (
        <section className="px-5 pt-[clamp(44px,6vw,80px)] sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 items-end gap-[clamp(28px,5vw,72px)] border-b border-accent pb-[clamp(32px,4vw,52px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <h2 className="m-0 min-w-0 font-display text-[clamp(30px,5.2vw,66px)] font-light uppercase leading-[0.95] tracking-[-0.01em] text-ink">
              <span className="inline-block whitespace-nowrap">{header.lead}</span>{' '}
              <span className="inline-block whitespace-nowrap text-accent">{header.accent}</span>
            </h2>
            <div className="grid max-w-[38em] gap-3.5">
              {header.lines.map((line) => (
                <p key={line} className="m-0 text-pretty text-justify text-[15.5px] leading-[1.75] text-body">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {visible.length > 0 && (
        <section className="px-5 py-[clamp(32px,5vw,56px)] sm:px-8 lg:px-16">
          <Stagger className="grid auto-rows-[130px] grid-cols-2 gap-[clamp(12px,1.6vw,20px)] md:auto-rows-[150px] md:grid-cols-4 xl:auto-rows-[168px] xl:grid-cols-6">
            {tiles.map(({ project, span, rows, showBreak, breakKey, breakIndex }) => (
              <div key={project.slug} className="contents">
                {showBreak && (
                  <div className="col-span-full flex items-end gap-[18px] border-b border-accent py-[clamp(10px,1.4vw,16px)] pt-[clamp(24px,3vw,40px)]">
                    <span className="font-display text-[clamp(56px,7vw,104px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
                      {String(breakIndex + 1).padStart(2, '0')}
                    </span>
                    <span className={`pb-1.5 text-[clamp(13px,1.5vw,17px)] font-normal text-accent ${localeTextClass(locale, 'uppercase tracking-[0.16em]')}`}>
                      {copy.filters[breakKey as keyof typeof copy.filters] ?? breakKey}
                    </span>
                  </div>
                )}
                <FadeUpItem className={`${COL_SPAN[span] ?? 'col-span-1'} ${ROW_SPAN[rows] ?? 'row-span-1'} min-h-0 min-w-0`}>
                <ProjectLink
                  project={project}
                  detailPages={detailPages}
                  locale={locale}
                  className="group relative block h-full min-h-0 min-w-0 overflow-hidden bg-hairline"
                >
                  <ProjectImage
                    project={project}
                    className="transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/25 from-[28%] via-ink/45 to-ink/90 transition-opacity duration-500 group-hover:from-ink/35 group-hover:via-ink/55 group-hover:to-ink/95" />
                  <span className="absolute inset-x-[clamp(14px,1.6vw,22px)] bottom-[clamp(14px,1.6vw,20px)] grid gap-2 text-surface transition-transform duration-500 group-hover:-translate-y-2">
                    <span className={`break-words font-normal uppercase leading-[1.15] tracking-[0.01em] ${nameSize(rows)}`}>
                      {project.title}
                    </span>
                    {projectMeta(project) && (
                      <span className={`break-words text-surface/80 ${localeRoleClass(locale, 'meta')}`}>
                        {projectMeta(project)}
                      </span>
                    )}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className={`${secondaryButtonBase} ${secondaryButtonShape} ${localeRoleClass(locale, 'button')}`}>
                      {copy.viewMore}
                      <EditorialIcon name="arrow-right" className="h-3 w-3" />
                    </span>
                  </span>
                </ProjectLink>
                </FadeUpItem>
              </div>
            ))}
          </Stagger>
        </section>
      )}

      <section className="px-5 pb-[clamp(64px,9vw,120px)] sm:px-8 lg:px-16">
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-accent pt-[clamp(24px,3vw,36px)]">
          <span className={`text-muted ${localeRoleClass(locale, 'label')}`}>
            {copy.showing} {visible.length} {copy.of} {filtered.length} {copy.projectsWord}
          </span>
          {hasMore && (
            <button
              type="button"
              onClick={() => setShown((count) => count + PAGE_SIZE)}
              className={`${secondaryButtonBase} ${secondaryButtonShape} ${localeRoleClass(locale, 'button')}`}
            >
              {copy.loadMore}
              <EditorialIcon name="arrow-down" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </section>
    </>
  )
}
