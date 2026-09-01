import { loadPublicClientConfig } from '@studio/backend'
import { siteMetadataBase } from '@/lib/page-meta'
import { localizedPublicPaths } from '@/lib/public-routes'

export const runtime = 'nodejs'

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    return new Response('Not found', { status: 404 })
  }

  if (!site.seo.sitemap) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'content-type': 'application/xml; charset=utf-8' },
    })
  }

  const origin = await siteMetadataBase()
  const urls = localizedPublicPaths(site, tenant)
    .map((path) => {
      const loc = escapeXml(new URL(path, origin).toString())
      const priority = path === '/' ? '1.0' : '0.7'
      return `<url><loc>${loc}</loc><changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${priority}</priority></url>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
