import type { TokenSet } from './types'

/**
 * Editorial — the first and, for now, only built identity.
 *
 * Source of truth for these values is
 * `docs/product/prompts/unit-1-editorial/00-identity-system.md`. The hex codes are
 * exact and have no substitutes: `#D9BC72` in particular is reserved for primary
 * CTA buttons and appears nowhere else on the page. Using it as a heading colour or
 * a border is the single most common way an Editorial page stops looking like one.
 */
export const editorial: TokenSet = {
  slug: 'editorial',
  label: 'Editorial',

  colors: {
    ink: '#141414',
    accent: '#51372A',
    cta: '#D9BC72',
    surface: '#FFFFFF',
    muted: '#6B6B6B',
    hairline: '#E5E5E5',
  },

  fonts: {
    // Grotesque sans for both headings and body. Not a serif — the italic serif in
    // the FAQ reference belongs to a different identity's voice.
    display: '"Neue Haas Grotesk Display", Helvetica, Arial, sans-serif',
    body: '"Neue Haas Grotesk Text", Helvetica, Arial, sans-serif',
  },

  // Square corners always. Never rounded.
  radius: '0px',

  defaultVariants: {
    hero: 'full-bleed',
    services: 'detailed',
    featuredProjects: 'grid',
    testimonials: 'cards',
    footer: 'expanded',
  },
}
