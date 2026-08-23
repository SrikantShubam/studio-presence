import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ProjectDetail } from './ProjectDetail'

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params

  try {
    const site = await loadPublicClientConfig(tenant)
    const project = site.sections.portfolio.projects.find((item) => item.slug === slug)
    if (!project) return notFoundMeta()
    return pageMeta(site, project.title, project.blurb, {
      image: `/portfolio/${slug}/opengraph-image`,
    })
  } catch {
    return notFoundMeta()
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { tenant, slug } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const portfolio = site.sections.portfolio
  if (!portfolio.enabled || !portfolio.detailPages || !portfolio.projects.length) notFound()

  const project = portfolio.projects.find((item) => item.slug === slug)
  if (!project) notFound()

  return <ProjectDetail site={site} project={project} />
}
