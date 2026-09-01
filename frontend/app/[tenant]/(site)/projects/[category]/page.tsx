import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ProjectsCategory } from '../ProjectsCategory'
import { isProjectFilterId } from '../project-filters'

type Props = { params: Promise<{ tenant: string; category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, category } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant)
    if (!site) return notFoundMeta()
    const name = category.replace(/-/g, ' ')
    const meta = pageMeta(site, name, `Projects in ${name}.`)
    return {
      ...meta,
      alternates: site.i18n.locales.includes('hi')
        ? {
            canonical: `/projects/${category}`,
            languages: {
              en: `/projects/${category}`,
              hi: `/hi/projects/${category}`,
            },
          }
        : { canonical: `/projects/${category}` },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function ProjectsCategoryPage({ params }: Props) {
  const { tenant, category } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant)
  } catch {
    notFound()
  }
  if (!site) notFound()

  const portfolio = site.sections.portfolio
  if (!portfolio.enabled || !portfolio.projects.length) notFound()

  const slug = category.toLowerCase()
  if (!isProjectFilterId(slug)) notFound()

  return <ProjectsCategory site={site} category={slug} />
}
