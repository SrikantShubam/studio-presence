import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  outputFileTracingIncludes: {
    '/**': [
      '../clients/**/*',
      '../backend/**/*',
      './public/**/*',
    ],
  },
  reactStrictMode: true,
  transpilePackages: [
    '@fortawesome/fontawesome-svg-core',
    '@fortawesome/react-fontawesome',
    '@fortawesome/free-brands-svg-icons',
    '@fortawesome/free-solid-svg-icons',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [256, 384, 640],
    qualities: [75, 90],
  },
  // Multi-tenancy: Host header -> tenant slug. Wired in middleware.ts.
  // Wildcard domain is *.vectorveda.online.
}

export default nextConfig
