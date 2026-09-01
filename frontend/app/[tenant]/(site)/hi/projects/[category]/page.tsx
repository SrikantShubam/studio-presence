import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { chromeCopy } from '@/lib/i18n-client'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { ProjectsCategory } from '../../../projects/ProjectsCategory'

type Props = { params: Promise<{ tenant: string; category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, category } = await params
  try {
    const site = await loadPublicClientConfigForLocale(tenant, 'hi')
    if (!site) return notFoundMeta()
    const slug = category.toLowerCase()
    const label = chromeCopy.hi.portfolio.filters[slug as keyof typeof chromeCopy.hi.portfolio.filters] ?? slug
    const meta = pageMeta(site, label, `${label} प्रोजेक्ट।`)
    return {
      ...meta,
      alternates: {
        canonical: `/hi/projects/${category}`,
        languages: {
          en: `/projects/${category}`,
          hi: `/hi/projects/${category}`,
        },
      },
    }
  } catch {
    return notFoundMeta()
  }
}

export default async function HindiProjectsCategoryPage({ params }: Props) {
  const { tenant, category } = await params

  let site
  try {
    site = await loadPublicClientConfigForLocale(tenant, 'hi')
  } catch {
    notFound()
  }
  if (!site) notFound()

  const portfolio = site.sections.portfolio
  if (!portfolio.enabled || !portfolio.projects.length) notFound()

  const slug = category.toLowerCase()
  const known = Object.keys(chromeCopy.en.portfolio.filters).includes(slug)
  if (!known) notFound()

  return <ProjectsCategory site={site} category={slug} />
}
