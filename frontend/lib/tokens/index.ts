import { editorial } from './editorial'
import type { IdentitySlug, TokenSet } from './types'

export type { IdentitySlug, SectionVariants, TokenSet } from './types'

/**
 * Registered identities. Adding one is a file plus a line here — nothing else.
 *
 * Only Editorial is built. Premium, Warm Contemporary and Bold Modern have design
 * prompts written but no generated designs yet, so they are deliberately absent
 * rather than stubbed: a half-built identity that renders is worse than one that
 * fails validation, because the broken one can reach a client.
 */
const TOKEN_SETS: Partial<Record<IdentitySlug, TokenSet>> = {
  editorial,
}

export function getTokenSet(slug: IdentitySlug): TokenSet {
  const set = TOKEN_SETS[slug]
  if (!set) {
    throw new Error(
      `Identity "${slug}" has no token set. Built identities: ${Object.keys(TOKEN_SETS).join(', ')}.`,
    )
  }
  return set
}

export function isBuiltIdentity(slug: string): slug is IdentitySlug {
  return slug in TOKEN_SETS
}

/**
 * Resolve a token set to the `--t-*` custom properties the stylesheet reads.
 *
 * `paletteOverride` is the client's own colours, when they have a brand worth
 * respecting. It overrides individual entries only — an override that supplied
 * three of six colours leaves the other three on the identity's values, which is
 * what you want: a client palette is rarely a complete design system.
 */
export function tokensToCssVars(
  tokens: TokenSet,
  paletteOverride?: Partial<TokenSet['colors']>,
): Record<string, string> {
  const colors = { ...tokens.colors, ...paletteOverride }

  return {
    '--t-ink': colors.ink,
    '--t-accent': colors.accent,
    '--t-cta': colors.cta,
    '--t-surface': colors.surface,
    '--t-muted': colors.muted,
    '--t-hairline': colors.hairline,
    '--t-font-display': tokens.fonts.display,
    '--t-font-body': tokens.fonts.body,
    '--t-radius': tokens.radius,
  }
}
