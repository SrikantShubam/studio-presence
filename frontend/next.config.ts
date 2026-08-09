import type { NextConfig } from 'next'

/**
 * Env: `.env` lives at the repo root (every workspace needs the same Supabase
 * credentials), but Next only auto-loads `.env*` from `frontend/` itself.
 * Calling `@next/env`'s `loadEnvConfig` here to bridge the two was the first
 * attempt and it does not work reliably — `NEXT_PUBLIC_*` values must be baked
 * into the client bundle at webpack-config time, and Next's TypeScript config
 * loader evaluates this file in a context whose `process.env` mutation does not
 * reach that step in time. The values come back `undefined` in the browser
 * bundle despite loading "successfully" here.
 *
 * `frontend/.env.local` (gitignored, synced from the root `.env` by
 * `npm run sync:env`) is the fix — it is the one path Next's own env loading
 * was built for, so there is no timing question. See scripts/sync-frontend-env.ts.
 */

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Multi-tenancy: Host header -> tenant slug. Wired in middleware.ts.
  // Wildcard domain is *.vectorveda.online.
}

export default nextConfig
