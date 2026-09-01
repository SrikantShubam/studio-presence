import { loadPublicClientConfig } from '@studio/backend'
import { getTokenSet } from '@/lib/tokens'

export const runtime = 'nodejs'

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
      icons: [{ src: site.brand.favicon ?? `/${tenant}/icon.svg`, sizes: 'any', type: 'image/svg+xml' }],
    }
  } catch {
    body = { name: 'Studio', start_url: '/' }
  }

  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/manifest+json; charset=utf-8' },
  })
}
