import { loadClientConfig, type Tenant } from '@studio/backend'

export function rootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vectorveda.online'
}

export function tenantHostFor(tenant: Tenant): string {
  const config = loadClientConfig(tenant.slug)
  return `${config.domain.demoSubdomain}.${rootDomain()}`
}

export function tenantOriginFor(tenant: Tenant): string {
  return `https://${tenantHostFor(tenant)}`
}
