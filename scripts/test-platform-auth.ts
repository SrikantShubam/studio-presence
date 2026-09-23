import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  authCallbackUrl,
  canonicalAuthOrigin,
  tenantAuthNextPath,
  tenantDestinationUrl,
} from '../frontend/lib/platform-auth.ts'
import {
  AUTH_ERROR_MESSAGES,
  PASSWORD_MIN_LENGTH,
  isAllowedAuthOrigin,
  isValidPassword,
  safeAuthNextPath,
} from '../frontend/lib/auth-policy.ts'
import { confirmationRequest } from '../frontend/lib/auth-confirmation.ts'

const invitePage = readFileSync('frontend/app/invite/[token]/page.tsx', 'utf8')

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

assert.equal(
  authCallbackUrl('https://temporary.vercel.app', {
    path: '/auth/confirm',
    next: 'https://untrusted.example/steal',
  }),
  'https://temporary.vercel.app/auth/confirm?next=%2Fdashboard',
)

assert.equal(
  authCallbackUrl('https://temporary.vercel.app', { path: '/auth/recovery' }),
  'https://temporary.vercel.app/auth/recovery',
)

assert.equal(tenantAuthNextPath('/dashboard/content'), '/dashboard/content')
assert.equal(tenantAuthNextPath('/panel'), '/panel')
assert.equal(tenantAuthNextPath('/abc-studios-its-a-test/dashboard'), '/dashboard')
assert.equal(tenantAuthNextPath('/abc-studios-its-a-test/dashboard/content?tab=leads', 'abc-studios-its-a-test'), '/dashboard/content?tab=leads')
assert.equal(tenantAuthNextPath('/demo'), '/dashboard')
assert.equal(tenantAuthNextPath('/onboarding'), '/dashboard')
assert.equal(tenantAuthNextPath('https://example.com/demo'), '/dashboard')
assert.equal(tenantAuthNextPath('//example.com/demo'), '/dashboard')
assert.equal(PASSWORD_MIN_LENGTH, 12)
assert.equal(isValidPassword('short'), false)
assert.equal(isValidPassword('twelve-chars'), true)
assert.equal(isValidPassword(' twelve-charx '), true)
assert.equal(safeAuthNextPath('/dashboard/content?tab=leads'), '/dashboard/content?tab=leads')
assert.equal(safeAuthNextPath('/abc-studios-its-a-test/dashboard'), '/abc-studios-its-a-test/dashboard')
assert.equal(safeAuthNextPath('/abc-studios-its-a-test/dashboard/content?tab=leads'), '/abc-studios-its-a-test/dashboard/content?tab=leads')
assert.equal(safeAuthNextPath('https://example.com/steal'), '/dashboard')
assert.equal(safeAuthNextPath('//example.com/steal'), '/dashboard')
assert.equal(safeAuthNextPath('/onboarding'), '/dashboard')
assert.equal(AUTH_ERROR_MESSAGES['invalid-credentials'], 'Unable to sign in with those details.')
assert.equal(AUTH_ERROR_MESSAGES['recovery-sent'], 'If an account exists for that email, recovery instructions are on the way.')
assert.equal(isAllowedAuthOrigin('http://localhost:3000'), true)
assert.equal(isAllowedAuthOrigin('http://ashish.localhost:3000'), true)
assert.equal(isAllowedAuthOrigin('https://candidate.srikantshubams-projects.vercel.app'), true)
assert.equal(isAllowedAuthOrigin('https://preview.srikantshubams-projects.vercel.app'), true)
assert.equal(isAllowedAuthOrigin('https://unapproved.example.com'), false)
assert.equal(
  isAllowedAuthOrigin('https://approved-preview.vercel.app', new Set(['https://approved-preview.vercel.app'])),
  true,
)

assert.deepEqual(
  confirmationRequest(new URLSearchParams('code=confirmation-code')),
  { kind: 'code', code: 'confirmation-code' },
)
assert.deepEqual(
  confirmationRequest(new URLSearchParams('token_hash=confirmation-token&type=signup')),
  { kind: 'token_hash', tokenHash: 'confirmation-token', type: 'signup' },
)
assert.deepEqual(
  confirmationRequest(new URLSearchParams('token_hash=confirmation-token&type=recovery')),
  { kind: 'invalid' },
)
assert.deepEqual(confirmationRequest(new URLSearchParams()), { kind: 'session' })

assert.equal(
  tenantDestinationUrl('https://preview.example.com', 'tenant-a', '/dashboard', 'path'),
  'https://preview.example.com/tenant-a/dashboard',
)

assert.equal(
  tenantDestinationUrl('https://tenant-a.example.com', 'tenant-a', '/dashboard', 'host'),
  'https://tenant-a.example.com/dashboard',
)

assert.match(invitePage, /Join workspace/, 'invite entry page must use concise title')
assert.match(invitePage, /Continue with Google/, 'invite entry page must offer Google')
assert.match(invitePage, /Use email/, 'invite entry page must offer email')
assert.match(invitePage, /\/login\\?next=/, 'invite entry page must preserve the invitation token for email auth')

console.log('platform auth tests passed')
