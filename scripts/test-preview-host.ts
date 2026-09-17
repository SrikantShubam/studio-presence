import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'srikantsubham.qd.je'
process.env.VERCEL_URL = 'studio-presence-staging-preview.vercel.app'

const { middleware } = await import('../frontend/middleware')

function request(pathname: string): NextRequest {
  const url = `https://${process.env.VERCEL_URL}${pathname}`
  return new NextRequest(url, { headers: { host: process.env.VERCEL_URL! } })
}

assert.equal(middleware(request('/')).status, 200, 'Vercel deployment host should serve the platform root')
assert.equal(middleware(request('/login')).status, 200, 'Vercel deployment host should serve platform login')

console.log('preview-host routing checks passed')
