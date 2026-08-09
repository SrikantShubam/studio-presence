/**
 * Data layer.
 *
 * `createScopedClient` is what request paths use. `createServiceRoleClient` is
 * exported from its own module rather than here, deliberately — importing it has
 * to be a visible, deliberate act, and `check:tenant-isolation` greps for exactly
 * that import.
 */

export { createAnonClient, createScopedClient, type Db } from './scoped'

export type {
  ClientOverride,
  Database,
  Lead,
  LeadEvent,
  LeadSource,
  LeadStatus,
  Tenant,
  TenantMember,
  TenantStatus,
  TenantTier,
} from './types'
