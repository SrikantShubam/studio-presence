/**
 * Identity token sets.
 *
 * A "template identity" is nothing but one of these plus a set of section variant
 * choices. There is no per-identity code, no per-identity branch, no per-identity
 * component. If adding an identity ever requires more than a new file in this
 * directory plus an entry in `index.ts`, the two-axis architecture has broken.
 */

export type IdentitySlug =
  | 'editorial'
  | 'premium'
  | 'warm-contemporary'
  | 'bold-modern'

/** Every section that has more than one composition, and what those are. */
export type SectionVariants = {
  hero: 'standard' | 'full-bleed' | 'video' | 'split'
  services: 'compact' | 'detailed'
  featuredProjects: 'grid' | 'carousel'
  testimonials: 'cards' | 'carousel'
  footer: 'expanded' | 'compact'
}

export type TokenSet = {
  slug: IdentitySlug
  /** Human name, used in the panel and in sales material. Never rendered on a client site. */
  label: string

  colors: {
    /** Primary text, logo, nav. */
    ink: string
    /** Accent word in headings, hairlines, rules. */
    accent: string
    /** Primary CTA buttons. In most identities this colour is reserved for CTAs only. */
    cta: string
    /** Page background. */
    surface: string
    /** Secondary text. */
    muted: string
    /** Thin dividers and borders. */
    hairline: string
  }

  fonts: {
    display: string
    body: string
  }

  /** Corner radius, as a CSS length. Editorial is `0px` and that is a hard rule, not a default. */
  radius: string

  /** Which composition of each multi-variant section this identity ships by default. */
  defaultVariants: SectionVariants
}
