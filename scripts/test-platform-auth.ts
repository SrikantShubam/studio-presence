import assert from 'node:assert/strict'

import {
  authCallbackUrl,
  canonicalAuthOrigin,
  tenantAuthNextPath,
  tenantDestinationUrl,
} from '../frontend/lib/platform-auth.ts'

assert.equal(
  canonicalAuthOrigin('https://temporary.vercel.app', 'https://preview.example.com'),
  'https://preview.example.com',
)

assert.equal(
  authCallbackUrl('https://temporary.vercel.app', {
    next: '/dashboard',
  }),
  'https://temporary.vercel.app/auth/callback?next=%2Fdashboard',
)

assert.equal(
  authCallbackUrl('https://temporary.vercel.app', {
    tenant: 'ashish-interiors',
  }),
  'https://temporary.vercel.app/auth/callback?tenant=ashish-interiors',
)

assert.equal(tenantAuthNextPath('/dashboard/content'), '/dashboard/content')
assert.equal(tenantAuthNextPath('/panel'), '/panel')
assert.equal(tenantAuthNextPath('/demo'), '/dashboard')
assert.equal(tenantAuthNextPath('/onboarding'), '/dashboard')
assert.equal(tenantAuthNextPath('https://example.com/demo'), '/dashboard')
assert.equal(tenantAuthNextPath('//example.com/demo'), '/dashboard')

assert.equal(
  tenantDestinationUrl('https://preview.example.com', 'tenant-a', '/dashboard', 'path'),
  'https://preview.example.com/tenant-a/dashboard',
)

assert.equal(
  tenantDestinationUrl('https://tenant-a.example.com', 'tenant-a', '/dashboard', 'host'),
  'https://tenant-a.example.com/dashboard',
)

console.log('platform auth tests passed')
