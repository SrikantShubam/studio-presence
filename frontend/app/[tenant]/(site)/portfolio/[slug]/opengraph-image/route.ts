import { projectOgResponse } from '@/lib/og'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string; slug: string }> },
) {
  try {
    const { tenant, slug } = await params
    return await projectOgResponse(tenant, slug)
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
