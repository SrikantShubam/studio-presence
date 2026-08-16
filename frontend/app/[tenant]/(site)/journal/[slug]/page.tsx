import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { JournalPost } from './JournalPost'

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    const post = site.sections.journal?.posts.find((item) => item.slug === slug)
    if (!post) return notFoundMeta()
    return pageMeta(site, post.title, post.excerpt)
  } catch {
    return notFoundMeta()
  }
}

export default async function JournalPostPage({ params }: Props) {
  const { tenant, slug } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const journal = site.sections.journal
  const post = journal?.posts.find((item) => item.slug === slug && item.full)
  if (!journal || !post) notFound()

  return <JournalPost site={site} post={post} allPosts={journal.posts} />
}
