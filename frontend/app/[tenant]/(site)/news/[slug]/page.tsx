import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { NewsArticle } from './NewsArticle'

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    const item = site.sections.news?.items.find((entry) => entry.slug === slug)
    if (!item) return notFoundMeta()
    return pageMeta(site, item.headline ?? item.title, item.summary)
  } catch {
    return notFoundMeta()
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const { tenant, slug } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const news = site.sections.news
  const item = news?.items.find((entry) => entry.slug === slug)
  if (!news || !item) notFound()

  return <NewsArticle site={site} item={item} allItems={news.items} />
}
