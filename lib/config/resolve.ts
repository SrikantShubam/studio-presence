import type { SectionKey, Tier } from './types'

/**
 * Tier resolution.
 *
 * A tier is nothing but a set of sections switched on. Selling T2 instead of T1 is
 * editing one string in one JSON file — never a branch, never a fork, never a code
 * change. That constraint is the product.
 *
 * Runs on the RAW config, before Zod parses it, and that ordering matters: once
 * Zod has applied its `.default(false)` there is no way left to tell "the client
 * didn't mention this section" from "the client explicitly turned it off", and the
 * override rule needs that distinction.
 */

/** Sections each tier switches on, cumulatively. */
const TIER_SECTIONS: Record<Tier, readonly SectionKey[]> = {
  t0: ['hero', 'portfolio', 'map', 'contact', 'ctaBand', 'stickyMobileCta', 'footer'],
  t1: [
    'quickActions',
    'trustBar',
    'services',
    'about',
    'process',
    'testimonials',
    'instagram',
    'faq',
    'team',
  ],
  t2: ['beforeAfter', 'reviews', 'awards', 'inquiryForm', 'estimate'],
  t3: ['caseStudy', 'locations', 'videoTour', 'companyProfile', 'journal', 'news', 'careers'],
}

const TIER_ORDER: readonly Tier[] = ['t0', 't1', 't2', 't3']

/** Flags outside `sections` that a tier also turns on. */
const TIER_FLAGS: Partial<Record<Tier, (c: RawConfig) => void>> = {
  t1: (c) => {
    setPath(c, ['seo', 'localBusinessSchema'], true)
    setPath(c, ['integrations', 'umami', 'enabled'], true)
    setPath(c, ['legal', 'privacyPolicy'], true)
    setPath(c, ['legal', 'terms'], true)
  },
  t2: (c) => {
    setPath(c, ['sections', 'portfolio', 'detailPages'], true)
    setPath(c, ['integrations', 'searchConsole', 'enabled'], true)
  },
  t3: (c) => {
    setPath(c, ['sections', 'team', 'detailPages'], true)
    setPath(c, ['integrations', 'leadDashboard', 'enabled'], true)
    setPath(c, ['integrations', 'reviewRequestFlow', 'enabled'], true)
    setPath(c, ['i18n', 'enabled'], true)
  },
}

type RawConfig = Record<string, unknown>

function isRecord(v: unknown): v is RawConfig {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Set a nested value only if the leaf isn't already present. Explicit always wins. */
function setPath(root: RawConfig, path: string[], value: unknown): void {
  let node = root
  for (const key of path.slice(0, -1)) {
    const next = node[key]
    if (!isRecord(next)) {
      const created: RawConfig = {}
      node[key] = created
      node = created
    } else {
      node = next
    }
  }
  const leaf = path[path.length - 1]
  if (leaf !== undefined && !(leaf in node)) node[leaf] = value
}

/** Every tier up to and including `tier`. */
export function tiersUpTo(tier: Tier): readonly Tier[] {
  const end = TIER_ORDER.indexOf(tier)
  return TIER_ORDER.slice(0, end + 1)
}

/** The section set a tier turns on, cumulative. Used by `check:tiers`. */
export function sectionsForTier(tier: Tier): SectionKey[] {
  return tiersUpTo(tier).flatMap((t) => [...TIER_SECTIONS[t]])
}

/**
 * Apply tier defaults to a raw parsed-JSON config.
 *
 * Mutates a clone, returns it. Sections the tier includes get `enabled: true`
 * unless the file already said otherwise — which is how a T1 client gets a
 * `reviews` block during negotiation without being moved to T2.
 */
export function applyTierDefaults(raw: unknown): RawConfig {
  if (!isRecord(raw)) throw new Error('Config must be a JSON object.')
  const config: RawConfig = structuredClone(raw)

  const tier = config.tier
  if (typeof tier !== 'string' || !TIER_ORDER.includes(tier as Tier)) {
    // Leave it. Zod produces a better message than we would here.
    return config
  }

  if (!isRecord(config.sections)) config.sections = {}
  const sections = config.sections as RawConfig

  for (const t of tiersUpTo(tier as Tier)) {
    for (const key of TIER_SECTIONS[t]) {
      const existing = sections[key]
      if (isRecord(existing)) {
        if (!('enabled' in existing)) existing.enabled = true
      } else if (existing === undefined) {
        sections[key] = { enabled: true }
      }
    }
    TIER_FLAGS[t]?.(config)
  }

  return config
}
