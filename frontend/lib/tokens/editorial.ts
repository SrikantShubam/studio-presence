import type { TokenSet } from './types'

/**
 * Editorial — the first and, for now, only built identity.
 *
 * Source of truth for these values is the exported designs themselves, in
 * `design/reference/editorial/*.html`. The hex codes are exact and have no
 * substitutes: `#D9BC72` in particular is reserved for primary CTA buttons and
 * appears nowhere else on the page. Using it as a heading colour or a border is
 * the single most common way an Editorial page stops looking like one.
 *
 * THIS PALETTE IS WARM. That is the whole character of the identity, and it was
 * wrong here for most of the build: `muted` was #6B6B6B and `hairline` #E5E5E5,
 * both neutral greys, and BOTH APPEAR ZERO TIMES in any of the 22 designs. The
 * designs use #8B8377 (96 uses) and #DCD7CE (62). Every caption and every rule on
 * the site was rendering cool against a warm design, everywhere at once — which
 * reads as "close but cheap" and is invisible to `check:hardcode`, because that
 * check only forbids literals and is satisfied by a token holding the wrong value.
 *
 * Counted straight out of the designs, by CSS property:
 *   #141414  574x  color        ink
 *   #51372A  678x  color/bg     accent
 *   #4A4A4A  130x  color        body
 *   #8B8377   96x  color        muted
 *   #D9BC72   73x  background   cta
 *   #DCD7CE   62x  border       hairline
 *   #FAF8F5   54x  background   panel
 */
export const editorial: TokenSet = {
  slug: 'editorial',
  label: 'Editorial',

  colors: {
    ink: '#141414',
    accent: '#51372A',
    cta: '#D9BC72',
    surface: '#FFFFFF',
    body: '#4A4A4A',
    muted: '#8B8377',
    hairline: '#DCD7CE',
    panel: '#FAF8F5',
  },

  fonts: {
    // Grotesque sans for both headings and body. Not a serif — the italic serif in
    // the FAQ reference belongs to a different identity's voice.
    display: 'Archivo, "Helvetica Neue", Helvetica, Arial, sans-serif',
    body: 'Archivo, "Helvetica Neue", Helvetica, Arial, sans-serif',
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
