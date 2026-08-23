import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ProjectDetail } from '../../../portfolio/[slug]/ProjectDetail'

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params

  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    const project = site?.sections.portfolio.projects.find((item) => item.slug === slug)
    if (!site || !project) return notFoundMeta()
    const meta = pageMeta(site, project.title, project.blurb, {
      image: `/portfolio/${slug}/opengraph-image`,
    })
    return {
      ...meta,
      alternates: {
        canonical: `/hi/portfolio/${slug}`,
        languages: {
          en: `/portfolio/${slug}`,
          hi: `/hi/portfolio/${slug}`,
        },
      },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiProjectDetailPage({ params }: Props) {
  const { tenant, slug } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant, 'hi')
  } catch {
    notFound()
  }
  if (!site) notFound()

  const portfolio = site.sections.portfolio
  if (!portfolio.enabled || !portfolio.detailPages || !portfolio.projects.length) notFound()

  const project = portfolio.projects.find((item) => item.slug === slug)
  if (!project) notFound()

  return <ProjectDetail site={site} project={project} />
}
