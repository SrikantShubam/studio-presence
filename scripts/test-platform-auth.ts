import assert from 'node:assert/strict'

import {
  authCallbackUrl,
  canonicalAuthOrigin,
  tenantDestinationUrl,
} from '../frontend/lib/platform-auth.ts'

assert.equal(
  canonicalAuthOrigin('https://temporary.vercel.app', 'https://preview.example.com'),
  'https://preview.example.com',
)

assert.equal(
  authCallbackUrl('https://temporary.vercel.app', 'https://preview.example.com', {
    next: '/dashboard',
  }),
  'https://preview.example.com/auth/callback?next=%2Fdashboard',
)

assert.equal(
  authCallbackUrl('https://temporary.vercel.app', 'https://preview.example.com', {
    tenant: 'ashish-interiors',
  }),
  'https://preview.example.com/auth/callback?tenant=ashish-interiors',
)

assert.equal(
  tenantDestinationUrl('https://preview.example.com', 'tenant-a', '/dashboard', 'path'),
  'https://preview.example.com/tenant-a/dashboard',
)

assert.equal(
  tenantDestinationUrl('https://tenant-a.example.com', 'tenant-a', '/dashboard', 'host'),
  'https://tenant-a.example.com/dashboard',
)

console.log('platform auth tests passed')
