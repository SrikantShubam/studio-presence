import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { FILTERS } from '../ProjectsBrowser'
import { ProjectsCategory } from '../ProjectsCategory'

type Props = { params: Promise<{ tenant: string; category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, category } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    const name = category.replace(/-/g, ' ')
    return pageMeta(site, name, `Projects in ${name}.`)
  } catch {
    return notFoundMeta()
  }
}

export default async function ProjectsCategoryPage({ params }: Props) {
  const { tenant, category } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const portfolio = site.sections.portfolio
  if (!portfolio.enabled || !portfolio.projects.length) notFound()

  const slug = category.toLowerCase()
  const known = FILTERS.some((filter) => filter.id === slug)
  if (!known) notFound()

  return <ProjectsCategory site={site} category={slug} />
}
