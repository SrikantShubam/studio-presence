import { loadPublicClientConfig } from '@studio/backend'
import { getTokenSet } from '@/lib/tokens'
import { faviconVariantPath } from '@/lib/favicon-path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant } = await params

  let body: Record<string, unknown>
  try {
    const site = await loadPublicClientConfig(tenant)
    const colors = getTokenSet(site.template).colors
    const palette = site.brand.palette
    body = {
      name: site.business.name,
      short_name: site.business.name,
      description: site.seo.description,
      start_url: '/',
      display: 'browser',
      background_color: palette?.surface ?? colors.surface,
      theme_color: palette?.ink ?? colors.ink,
      icons: site.brand.favicon
        ? [32, 180, 192, 512].map((size) => ({
            src: faviconVariantPath(site.brand.favicon!, size),
            sizes: size + 'x' + size,
            type: 'image/png',
          }))
        : [{ src: '/' + tenant + '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
    }
  } catch {
    body = { name: 'Studio', start_url: '/' }
  }

  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/manifest+json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
