import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ProjectsCategory } from '../projects/ProjectsCategory'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant)
    if (!site) return notFoundMeta()
    const meta = pageMeta(site, 'Portfolio', 'Completed flats, offices and other work we have been allowed to photograph.')
    return {
      ...meta,
      alternates: site.i18n.locales.includes('hi')
        ? {
            canonical: '/portfolio',
            languages: {
              en: '/portfolio',
              hi: '/hi/portfolio',
            },
          }
        : { canonical: '/portfolio' },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function PortfolioIndexPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant)
  } catch {
    notFound()
  }
  if (!site) notFound()

  const portfolio = site.sections.portfolio
  if (!portfolio.enabled || !portfolio.projects.length) notFound()

  return <ProjectsCategory site={site} category="all" />
}
