import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { TeamMember } from './TeamMember'

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    const member = site.sections.team?.members.find((item) => item.slug === slug)
    if (!member) return notFoundMeta()
    return pageMeta(site, member.name, member.line ?? member.bio)
  } catch {
    return notFoundMeta()
  }
}

export default async function TeamMemberPage({ params }: Props) {
  const { tenant, slug } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const team = site.sections.team
  if (!team?.detailPages) notFound()

  const member = team.members.find((item) => item.slug === slug)
  if (!member || !member.body.length) notFound()

  return <TeamMember site={site} member={member} allMembers={team.members} />
}
