import { ConfigError, loadPublicClientConfig } from '@studio/backend'
import { brandIconSvg } from '@/lib/brand-icon'
import { getTokenSet } from '@/lib/tokens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant } = await params

  try {
    const site = await loadPublicClientConfig(tenant)
    const tokens = getTokenSet(site.template)

    return new Response(
      brandIconSvg({
        businessName: site.business.name,
        tokens,
        palette: site.brand.palette,
      }),
      {
        headers: {
          'content-type': 'image/svg+xml; charset=utf-8',
          'cache-control': 'no-store',
        },
      },
    )
  } catch (error) {
    if (error instanceof ConfigError) {
      return new Response(null, { status: 404 })
    }
    throw error
  }
}
