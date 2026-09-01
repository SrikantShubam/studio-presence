import { loadPublicClientConfig } from '@studio/backend'
import { siteMetadataBase } from '@/lib/page-meta'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  if (site.seo.noindex) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const origin = await siteMetadataBase()
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /thank-you',
    'Disallow: /panel',
    'Disallow: /dashboard',
    'Disallow: /api/',
  ]
  if (site.seo.sitemap) lines.push(`Sitemap: ${new URL('/sitemap.xml', origin).toString()}`)
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
