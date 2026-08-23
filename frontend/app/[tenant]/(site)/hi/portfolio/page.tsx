import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { chromeCopy } from '@/lib/i18n-client'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ProjectsCategory } from '../../projects/ProjectsCategory'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    const copy = chromeCopy.hi.portfolio
    const meta = pageMeta(site, copy.titleAccent, 'पूरे हुए घर, ऑफिस और दूसरे इंटीरियर प्रोजेक्ट।')
    return {
      ...meta,
      alternates: {
        canonical: '/hi/portfolio',
        languages: {
          en: '/portfolio',
          hi: '/hi/portfolio',
        },
      },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiPortfolioIndexPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant, 'hi')
  } catch {
    notFound()
  }
  if (!site) notFound()

  const portfolio = site.sections.portfolio
  if (!portfolio.enabled || !portfolio.projects.length) notFound()

  return <ProjectsCategory site={site} category="all" />
}
