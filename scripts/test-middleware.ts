import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'preview.srikantshubams-projects.vercel.app'
process.env.NEXT_PUBLIC_TENANT_ROUTING = 'host'

const { middleware } = await import('../frontend/middleware')

function request(url: string): NextRequest {
  const parsed = new URL(url)
  return new NextRequest(url, { headers: { host: parsed.host } })
}

function location(response: Response): string {
  return response.headers.get('location') ?? ''
}

const platformRoot = middleware(request('http://localhost/'))
assert.equal(platformRoot.status, 200, 'bare local root should remain a platform route')

const bareAdmin = middleware(request('http://localhost/dashboard'))
assert.equal(bareAdmin.status, 307, 'bare local admin path should redirect to platform login')
assert.equal(new URL(location(bareAdmin)).pathname, '/login')

const onboarding = middleware(request('http://localhost/onboarding'))
assert.equal(onboarding.status, 200, 'unlinked accounts need the platform onboarding route')

const confirmation = middleware(request('http://localhost/auth/confirm?token_hash=abc&type=signup'))
assert.equal(confirmation.status, 200, 'confirmation must remain a platform route')

const recovery = middleware(request('http://ashish.localhost/auth/recovery?token_hash=abc&type=recovery'))
assert.equal(recovery.status, 200, 'recovery must remain on the exact tenant browser origin')

const reset = middleware(request('http://localhost/reset-password'))
assert.equal(reset.status, 200, 'reset password must remain a platform route')

const retiredPath = middleware(request('http://localhost/qa-owner/dashboard'))
assert.equal(retiredPath.status, 307, 'retired tenant admin path should redirect')
const retiredUrl = new URL(location(retiredPath))
assert.equal(retiredUrl.pathname, '/login')
assert.equal(retiredUrl.searchParams.get('error'), 'retired-tenant')

const retiredSubdomain = middleware(request('http://qa-owner.localhost/dashboard'))
assert.equal(retiredSubdomain.status, 404, 'retired tenant subdomain should fail closed')

const currentSubdomain = middleware(request('http://ashish.localhost/dashboard'))
assert.equal(currentSubdomain.status, 200, 'current tenant subdomain should still resolve')
assert.equal(currentSubdomain.headers.get('x-tenant'), 'ashish-interiors')

const previewRoot = middleware(request('https://preview.srikantshubams-projects.vercel.app/'))
assert.equal(previewRoot.status, 200, 'preview root should remain a platform route')

const previewTenant = middleware(request('https://ashish-interiors.preview.srikantshubams-projects.vercel.app/dashboard'))
assert.equal(previewTenant.status, 200, 'preview tenant hostname should resolve directly')
assert.equal(previewTenant.headers.get('x-tenant'), 'ashish-interiors')

const pathFallback = middleware(request('https://preview.srikantshubams-projects.vercel.app/ashish-interiors/dashboard'))
assert.equal(pathFallback.status, 404, 'preview must not fall back to path-based tenant routing')

const unknownPreviewTenant = middleware(request('https://qa-owner.preview.srikantshubams-projects.vercel.app/dashboard'))
assert.equal(unknownPreviewTenant.status, 404, 'retired preview tenant hostname must fail closed')

const candidateRoot = middleware(request('https://candidate.srikantshubams-projects.vercel.app/'))
assert.equal(candidateRoot.status, 200, 'candidate root should remain a platform route')

const candidateTenant = middleware(request('https://ashish-interiors.candidate.srikantshubams-projects.vercel.app/dashboard'))
assert.equal(candidateTenant.status, 200, 'candidate tenant hostname should resolve directly')
const rawVercelHash = middleware(request('https://studio-presence-staging-o8b411qnv-srikantshubams-projects.vercel.app/'))
assert.equal(rawVercelHash.status, 308, 'raw deployment hash should 308 redirect to candidate domain')
assert.equal(new URL(location(rawVercelHash)).hostname, 'candidate.srikantshubams-projects.vercel.app')

console.log('middleware routing checks passed')

