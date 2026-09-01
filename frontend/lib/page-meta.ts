import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ClientConfig } from '@studio/backend'

/** Origin of the incoming request — used as `metadataBase` so OG URLs are shareable. */
export async function siteMetadataBase(): Promise<URL> {
  const h = await headers()
  const host = h.get('x-site-host') ?? h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  return new URL(`${proto}://${host}`)
}

const SHARE_IMAGE = { width: 1200, height: 630 }

/** Page title uses the layout template `%s — {business.name}`. OG/Twitter get the full string. */
export function pageMeta(
  site: ClientConfig,
  title: string,
  description?: string,
  options?: { absolute?: boolean; image?: string },
): Metadata {
  const full = options?.absolute ? title : `${title} — ${site.business.name}`
  const desc = description?.trim() || site.seo.description
  const image = {
    url: options?.image ?? '/opengraph-image',
    width: SHARE_IMAGE.width,
    height: SHARE_IMAGE.height,
    alt: full,
  }

  return {
    title: options?.absolute ? { absolute: title } : title,
    description: desc,
    openGraph: {
      title: full,
      description: desc,
      type: 'website',
      siteName: site.business.name,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: full,
      description: desc,
      images: [image.url],
    },
  }
}

export function notFoundMeta(): Metadata {
  return {
    title: 'Nothing built here',
    robots: { index: false, follow: false },
  }
}
