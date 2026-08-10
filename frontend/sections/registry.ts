import type { ComponentType } from 'react'
import type { ClientConfig, SectionKey, Sections } from '@studio/backend'
import type { SectionVariants } from '@/lib/tokens/types'
import { getTokenSet } from '@/lib/tokens'
import { Hero } from './Hero'
import { QuickActions } from './QuickActions'

/**
 * THE SECTION CONTRACT.
 *
 * FROZEN — no delegated agent may edit this file. See AGENTS.md.
 *
 * Pages never import a section component by name. They ask this registry what to
 * render, and the registry answers from config. That indirection is the entire
 * reason `tier: "t1"` → `"t2"` changes a site without a code change: the page
 * does not know which sections exist, so it cannot hardcode the wrong list.
 *
 * Adding a section is one entry here plus one directory. If it ever takes more
 * than that, this file has grown a special case and the special case is the bug.
 */

/** What every section component receives. Nothing else. */
export type SectionComponentProps<K extends SectionKey = SectionKey> = {
  /** This section's resolved config block. Never optional — see `renderableSections`. */
  config: NonNullable<Sections[K]>
  /** The whole config, for cross-section needs like the WhatsApp number. Read-only. */
  site: ClientConfig
  /** Which composition to render, already resolved against the identity default. */
  variant: string | undefined
}

export type SectionComponent<K extends SectionKey = SectionKey> = ComponentType<
  SectionComponentProps<K>
>

/**
 * Registered sections.
 *
 * Deliberately partial. A section with no entry does not render, which is the
 * correct behaviour for one that has not been built yet — better a missing
 * section than a half-built one reaching a prospect.
 */
const REGISTRY: Partial<{ [K in SectionKey]: SectionComponent<K> }> = {
  hero: Hero,
  quickActions: QuickActions,
  // Everything else populated as sections land. Each ticket adds exactly one line.
}

/**
 * The order sections appear in on the home page.
 *
 * Config decides which sections render; this decides the sequence. Kept here
 * rather than in the page so that adding a section never means editing a layout,
 * and so the order is one list rather than a shape implied across several files.
 */
export const HOME_SECTION_ORDER: readonly SectionKey[] = [
  'hero',
  'quickActions',
  'trustBar',
  'services',
  'portfolio',
  'about',
  'process',
  'testimonials',
  'instagram',
  'faq',
  'contact',
  'map',
  'ctaBand',
  'footer',
]

/**
 * Is this section's content sufficient to render?
 *
 * `enabled` is necessary and not sufficient. A services block that is on but
 * holds no services should render nothing, not an empty heading over blank space
 * — and deciding that here rather than in each component means twenty-eight
 * components cannot each get it subtly wrong.
 */
function hasContent(key: SectionKey, block: Record<string, unknown>): boolean {
  const arrays: Partial<Record<SectionKey, string>> = {
    services: 'items',
    portfolio: 'projects',
    testimonials: 'items',
    faq: 'items',
    process: 'steps',
    trustBar: 'stats',
    team: 'members',
    awards: 'items',
    beforeAfter: 'pairs',
    instagram: 'embedPostUrls',
    journal: 'posts',
    news: 'items',
    careers: 'roles',
    caseStudy: 'items',
    locations: 'offices',
    quickActions: 'actions',
  }

  const field = arrays[key]
  if (field) {
    const value = block[field]
    return Array.isArray(value) && value.length > 0
  }

  if (key === 'hero') return typeof block.headline === 'string' && block.headline.length > 0
  if (key === 'about') return typeof block.body === 'string' && block.body.length > 0

  return true
}

/** Which composition to render: the client's explicit choice, else the identity's default. */
export function resolveVariant(
  config: ClientConfig,
  key: SectionKey,
  block: Record<string, unknown>,
): string | undefined {
  if (typeof block.variant === 'string') return block.variant

  const defaults = getTokenSet(config.template).defaultVariants
  return (defaults as Record<string, string | undefined>)[key as keyof SectionVariants]
}

export type ResolvedSection = {
  key: SectionKey
  Component: SectionComponent
  config: Record<string, unknown>
  variant: string | undefined
}

/**
 * The sections that should actually render, in order.
 *
 * A section survives all four gates: it is registered, its config block exists,
 * `enabled` is true, and it has content. Anything else is silently omitted —
 * which is right, because the alternative is a client's live site showing an
 * empty panel where their testimonials were meant to go.
 */
export function renderableSections(
  config: ClientConfig,
  order: readonly SectionKey[] = HOME_SECTION_ORDER,
): ResolvedSection[] {
  const out: ResolvedSection[] = []

  for (const key of order) {
    const Component = REGISTRY[key] as SectionComponent | undefined
    if (!Component) continue

    const block = config.sections[key] as Record<string, unknown> | undefined
    if (!block || block.enabled !== true) continue
    if (!hasContent(key, block)) continue

    out.push({ key, Component, config: block, variant: resolveVariant(config, key, block) })
  }

  return out
}

/** Which sections are registered. Used by tooling and tickets, not by pages. */
export function registeredSections(): SectionKey[] {
  return Object.keys(REGISTRY) as SectionKey[]
}
