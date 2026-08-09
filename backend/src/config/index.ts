/**
 * The client config contract — the public surface.
 *
 * FROZEN. Nothing in this directory may be edited by a delegated agent. A model
 * that can change the contract to make its code compile will do exactly that,
 * and then nothing downstream is checkable. See AGENTS.md.
 */

export {
  clientConfigSchema,
  sectionsSchema,
  IDENTITIES,
  STATUSES,
  TIERS,
} from './schema'

export type {
  ClientConfig,
  Identity,
  SectionConfig,
  SectionKey,
  SectionProps,
  Sections,
  Status,
  Tier,
} from './types'

export { applyTierDefaults, sectionsForTier, tiersUpTo } from './resolve'

export {
  formatIssues,
  validateClientConfig,
  type Issue,
  type Severity,
  type ValidateOptions,
  type ValidationResult,
} from './validate'

export {
  ConfigError,
  defaultClientsDir,
  defaultPublicDir,
  listClientSlugs,
  loadClientConfig,
  mergePatch,
  resolveClientConfig,
  type ResolveOptions,
} from './load'
