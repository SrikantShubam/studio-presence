import type { ClientConfig } from '@studio/backend'
import { HomeSection } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'
import { JournalBrowser } from './JournalBrowser'

export function JournalIndex({ site }: { site: ClientConfig }) {
  const closing = renderableSections(site, ['footer'])
  const journal = site.sections.journal
  if (!journal) return null

  return (
    <article className="overflow-x-clip bg-surface text-ink">
      <HeroNav
        businessName={site.business.name}
        phone={site.business.phone}
        tone="on-surface"
        inner
        services={site.sections.services?.items}
      />
      <HomeSection first>
        <JournalBrowser journal={journal} />
      </HomeSection>
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
