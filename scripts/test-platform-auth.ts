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

const inviteEntry = readFileSync('frontend/app/invite/[token]/InvitationEntry.tsx', 'utf8')
const invitePage = readFileSync('frontend/app/invite/[token]/page.tsx', 'utf8')
const platformLogin = readFileSync('frontend/app/login/page.tsx', 'utf8')
const loginForm = readFileSync('frontend/app/[tenant]/(admin)/login/LoginForm.tsx', 'utf8')
const invitationSignup = readFileSync('frontend/lib/invitation-signup.ts', 'utf8')
const invitationFunction = readFileSync('supabase/functions/invitation-signup/index.ts', 'utf8')
const membershipRoute = readFileSync('frontend/app/[tenant]/(admin)/dashboard/components/../../../../api/[tenant]/members/route.ts', 'utf8')

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
assert.equal(safeAuthNextPath('/invite/invitation-token'), '/invite/invitation-token')
assert.equal(safeAuthNextPath('/invite/invitation-token?source=email'), '/invite/invitation-token?source=email')
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

assert.match(inviteEntry, /Private workspace/, 'invite entry page must use premium invitation eyebrow')
assert.match(inviteEntry, /Your place in the studio/, 'invite entry page must use premium invitation title')
assert.match(inviteEntry, /studioName/, 'invite entry page must render the studio name')
assert.match(inviteEntry, /logoUrl/, 'invite entry page must render the studio logo')
assert.match(inviteEntry, /Continue with Google/, 'invite entry page must offer Google')
assert.match(inviteEntry, /Continue with email/, 'invite entry page must offer email')
assert.match(inviteEntry, /\/login\?next=/, 'invite entry page must preserve the invitation token for email auth')
assert.match(inviteEntry, /signOut\(\{ scope: 'local' \}\)/, 'invite flow must clear only the current browser session before switching accounts')
assert.match(inviteEntry, /auth=1/, 'invite auth callbacks must mark a newly authenticated invitation session')
assert.match(invitePage, /InvitationSessionReset/, 'invite page must reset an existing session before accepting an invitation')
assert.match(invitePage, /auth === "1"/, 'invite page must only accept sessions created by the invitation flow')
assert.doesNotMatch(invitePage, /error\?\.includes\("expired"\)/, 'invite page must not label every invitation error as expired')
assert.match(membershipRoute, /searchParams\.set\(['"]tenant['"]/, 'invitation links must carry the tenant slug for branding')
assert.match(platformLogin, /Private workspace/, 'platform login must use invitation-specific eyebrow')
assert.match(platformLogin, /email address that received this invitation/, 'platform login must explain invited email matching')
assert.match(loginForm, /Show password/, 'login form must provide a visible password toggle')
assert.match(loginForm, /Hide password/, 'login form must provide a visible password hide toggle')
assert.match(loginForm, /pr-12/, 'password inputs must reserve space for the toggle')
assert.match(loginForm, /\[&::-ms-reveal\]:hidden/, 'login form must hide the browser password reveal control')
assert.match(loginForm, /isInvite \? 'signup' : 'signin'/, 'invitation email auth must default to account creation')
assert.match(loginForm, /createInvitationAccount/, 'invitation signup must use the confirmed-account function')
assert.match(loginForm, /supabase\.auth\.signUp/, 'ordinary signup must retain Supabase email confirmation')
assert.match(invitationSignup, /functions\/v1\/invitation-signup/, 'browser invitation signup must call the Edge Function')
assert.match(invitationFunction, /email_confirm: true/, 'invitation function must confirm invitation-created accounts')
assert.match(invitationFunction, /accept_tenant_invitation/, 'invitation function must accept the workspace invitation')
assert.match(loginForm, /if \(isInvite\) \{/, 'invitation login must clear an existing session instead of redirecting it')
assert.match(loginForm, /signOut\(\{ scope: 'local' \}\)/, 'invitation login must clear only the current browser session')
assert.match(loginForm, /New to this workspace\? Create your account below\./, 'invitation email auth must explain the account creation path')
assert.match(platformLogin, /Create your account to join/, 'invitation login must use dedicated account creation copy')

console.log('platform auth tests passed')
