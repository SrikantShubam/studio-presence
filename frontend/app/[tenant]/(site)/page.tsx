import { notFound } from 'next/navigation'
import { loadPublicClientConfig } from '@studio/backend'
import { HOME_SECTION_ORDER, renderableSections } from '@/sections/registry'

/**
 * The home page.
 *
 * It contains no layout decisions and no section list of its own — both come from
 * the registry, resolved against the client's config. That is deliberate: a page
 * that hardcoded which sections to render would silently ignore the tier, and
 * "changing tier is a config edit" would stop being true the first time someone
 * added a section here directly.
 *
 * Consequently this file should almost never change. New sections land in the
 * registry; ordering lives in HOME_SECTION_ORDER.
 */

export default async function HomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params

  let config
  try {
    config = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const sections = renderableSections(config, HOME_SECTION_ORDER)

  return (
    <main>
      {sections.map(({ key, Component, config: block, variant }) => (
        <Component key={key} config={block as never} site={config} variant={variant} />
      ))}
    </main>
  )
}
