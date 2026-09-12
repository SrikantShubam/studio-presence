import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { middleware } from '../frontend/middleware'
import { TENANT_MAP } from '../frontend/lib/tenant-map'

function request(pathname: string, host: string): NextRequest {
  return new NextRequest(`https://${host}${pathname}`, {
    headers: { host },
  })
}

const originalCustomDomains = { ...TENANT_MAP.byCustomDomain }
const originalSubdomains = { ...TENANT_MAP.bySubdomain }

try {
  TENANT_MAP.bySubdomain.stress = {
    ...TENANT_MAP.bySubdomain.stress,
    status: 'archived',
  }
  TENANT_MAP.byCustomDomain['unpaid.example'] = {
    slug: 'ashish-interiors',
    status: 'sold',
    tier: 't1',
    template: 'editorial',
  }
  TENANT_MAP.byCustomDomain['archived.example'] = {
    slug: 'stress',
    status: 'archived',
    tier: 't3',
    template: 'editorial',
  }

  const unpaidAsset = middleware(request('/clients/ashish-interiors/hero.jpg', 'unpaid.example'))
  assert.equal(unpaidAsset.status, 404)
  assert.equal(await unpaidAsset.text(), 'This site is not live yet.')

  const archivedAsset = middleware(request('/clients/stress/hero.jpg', 'stress.localhost'))
  assert.equal(archivedAsset.status, 410)
  assert.equal(await archivedAsset.text(), 'This site is no longer available.')

  const archivedCustomAsset = middleware(request('/clients/stress/hero.jpg', 'archived.example'))
  assert.equal(archivedCustomAsset.status, 404)
  assert.equal(await archivedCustomAsset.text(), 'This site is not live yet.')

  const nextAsset = middleware(request('/_next/static/chunk.js', 'unknown.example'))
  assert.equal(nextAsset.headers.get('x-middleware-next'), '1')

  const apiRoute = middleware(request('/api/health', 'unknown.example'))
  assert.equal(apiRoute.headers.get('x-middleware-next'), '1')
} finally {
  for (const key of Object.keys(TENANT_MAP.byCustomDomain)) delete TENANT_MAP.byCustomDomain[key]
  Object.assign(TENANT_MAP.byCustomDomain, originalCustomDomains)
  for (const key of Object.keys(TENANT_MAP.bySubdomain)) delete TENANT_MAP.bySubdomain[key]
  Object.assign(TENANT_MAP.bySubdomain, originalSubdomains)
}

console.log('middleware routing checks passed')
