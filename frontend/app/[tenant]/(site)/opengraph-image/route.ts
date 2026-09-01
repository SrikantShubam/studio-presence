import { homeOgResponse } from '@/lib/og'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  try {
    const { tenant } = await params
    return await homeOgResponse(tenant)
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
