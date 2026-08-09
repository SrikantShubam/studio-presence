import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Multi-tenancy: Host header -> tenant slug. Wired in middleware.ts.
  // Wildcard domain is *.vectorveda.online.
}

export default nextConfig
