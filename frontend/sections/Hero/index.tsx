import type { SectionComponentProps } from '@/sections/registry'
import { HeroFullBleed } from './HeroFullBleed'
import { HeroStandard } from './HeroStandard'
import { HeroVideo } from './HeroVideo'
import { HeroSplit } from './HeroSplit'

/**
 * THE REFERENCE SECTION. Every other section ticket says "match sections/Hero"
 * — this is the pattern being matched, not just an example of it.
 *
 * What every ticket should copy from this file specifically:
 *   - the directory shape (index.tsx dispatches, one file per variant, small
 *     shared pieces factored out only when genuinely reused — HeroContent and
 *     HeroNav are shared because full-bleed/video/standard really do share
 *     structure; Split doesn't force itself into that shape just for DRY)
 *   - config comes in fully typed via SectionComponentProps, never re-fetched
 *     or re-validated here — that already happened in the registry
 *   - `site` reads are limited to genuinely cross-cutting fields (business
 *     name/phone, a routing boolean) — never another section's content block
 *   - every colour is a token utility; nothing here will show up in
 *     check:hardcode
 *   - unresolved variants fall back to the identity's default rather than
 *     rendering nothing — a typo in a client's config shouldn't blank the hero
 */
export function Hero({ config, site, variant }: SectionComponentProps<'hero'>) {
  switch (variant) {
    case 'standard':
      return <HeroStandard config={config} site={site} />
    case 'video':
      return <HeroVideo config={config} site={site} />
    case 'split':
      return <HeroSplit config={config} site={site} />
    case 'full-bleed':
    default:
      return <HeroFullBleed config={config} site={site} />
  }
}
