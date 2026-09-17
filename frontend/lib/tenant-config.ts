import { headers } from 'next/headers'
import {
  createAnonClient,
  createScopedClient,
  fetchClientOverridePatch,
  loadClientConfig,
  loadPublicClientConfig,
  resolveClientConfig,
  type ClientConfig,
} from '@studio/backend'

type PublicConfigRow = { tenant_slug: string; config: unknown }

/**
 * Load an authenticated tenant's durable workspace config.
 *
 * Static fixture loading remains the compatibility path for pre-workspace
 * tenants. Newly onboarded tenants have no fixture and must come from the
 * RLS-scoped workspace row.
 */
export async function loadTenantWorkspaceConfig(
  slug: string,
  tenantId: string,
  accessToken: string,
): Promise<ClientConfig> {
  const db = createScopedClient(accessToken)
  const { data, error } = await db
    .from('tenant_workspaces')
    .select('config')
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (error) throw new Error(`Could not load workspace config: ${error.message}`)
  if (data?.config) return resolveClientConfig(slug, data.config)
  return loadClientConfig(slug)
}

/**
 * Load public content by the persisted hostname, falling back to the fixture
 * loader for existing static sites that predate onboarding workspaces.
 */
export async function loadPublicTenantConfig(slug: string): Promise<ClientConfig> {
  const requestHeaders = await headers()
  const host = (requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? '').split(':')[0] ?? ''
  const db = createAnonClient()
  const { data, error } = await db.rpc('get_public_tenant_config_by_hostname', { p_hostname: host })

  if (error) throw new Error(`Could not load public workspace config: ${error.message}`)

  const row = (data as PublicConfigRow[] | null)?.[0]
  if (row) {
    if (row.tenant_slug !== slug) throw new Error('Public hostname and tenant route do not match.')
    return resolveClientConfig(slug, row.config)
  }

  return loadPublicClientConfig(slug)
}

/** Resolve a persisted workspace plus the existing public edit patch. */
export async function loadPublicTenantConfigWithOverrides(slug: string): Promise<ClientConfig> {
  const base = await loadPublicTenantConfig(slug)
  return resolveClientConfig(slug, base, { override: await fetchClientOverridePatch(slug) })
}
