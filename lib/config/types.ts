import type { z } from 'zod'
import type { clientConfigSchema, sectionsSchema, IDENTITIES, STATUSES, TIERS } from './schema'

/**
 * Types are inferred, never hand-written. Keeping a parallel set of interfaces in
 * sync with the Zod schema by hand is a job nobody does reliably, and the moment
 * they diverge the validator and the compiler start disagreeing about what a valid
 * config is.
 */

export type ClientConfig = z.infer<typeof clientConfigSchema>
export type Sections = z.infer<typeof sectionsSchema>
export type SectionKey = keyof Sections

export type Tier = (typeof TIERS)[number]
export type Status = (typeof STATUSES)[number]
export type Identity = (typeof IDENTITIES)[number]

/** The config for one named section, e.g. `SectionConfig<'hero'>`. */
export type SectionConfig<K extends SectionKey> = NonNullable<Sections[K]>

/**
 * What every section component receives. Nothing else — a section that reaches for
 * a global, an env var or a hardcoded string is the bug `check:hardcode` exists to
 * catch.
 */
export type SectionProps<K extends SectionKey> = {
  config: SectionConfig<K>
  /** The whole config, for cross-section needs like the WhatsApp number. Read-only. */
  site: ClientConfig
}
