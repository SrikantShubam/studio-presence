import type { ClientConfig } from '@studio/backend'

/** Public paths that belong in the sitemap. Admin, thank-you and 404 stay out. */
export function publicPaths(site: ClientConfig): string[] {
  const paths = new Set<string>(['/'])
  const sections = site.sections

  if (sections.portfolio?.enabled && sections.portfolio.projects.length) {
    paths.add('/portfolio')
    const categories = new Set<string>()
    for (const project of sections.portfolio.projects) {
      if (sections.portfolio.detailPages) paths.add(`/portfolio/${project.slug}`)
      if (project.category) categories.add(project.category)
      if (project.projectType) categories.add(project.projectType)
    }
    for (const category of categories) paths.add(`/projects/${category}`)
  }

  if (sections.services?.enabled) {
    for (const item of sections.services.items) {
      if (item.slug) paths.add(`/services/${item.slug}`)
    }
  }

  // Only areas with a real sections.areas entry actually have a page — see
  // AreaDetail.tsx. business.serviceAreas is the flat name list shown in copy
  // elsewhere; listing all of it here would put 404s in the sitemap.
  for (const area of site.sections.areas?.items ?? []) {
    paths.add(`/areas/${area.slug}`)
  }

  if (sections.team?.enabled && sections.team.members.length) {
    paths.add('/team')
    if (sections.team.detailPages) {
      for (const member of sections.team.members) {
        if (member.slug) paths.add(`/team/${member.slug}`)
      }
    }
  }

  if (sections.careers?.enabled) paths.add('/careers')

  if (sections.locations?.enabled && sections.locations.offices.length) {
    paths.add('/locations')
    for (const office of sections.locations.offices) {
      paths.add(`/locations/${office.slug}`)
    }
  }

  if (sections.news?.enabled) {
    paths.add('/news')
    for (const item of sections.news.items) paths.add(`/news/${item.slug}`)
  }

  if (sections.journal?.enabled) {
    paths.add('/journal')
    for (const post of sections.journal.posts) paths.add(`/journal/${post.slug}`)
  }

  if (sections.estimate?.enabled) paths.add('/estimate')
  if (site.legal.privacyPolicy) paths.add('/privacy')
  if (site.legal.terms) paths.add('/terms')

  return [...paths]
}
