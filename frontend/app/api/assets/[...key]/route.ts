import { NextResponse } from 'next/server'
import { resolveAssetPublicUrl } from '@studio/backend'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: keySegments } = await params
  if (!keySegments || !keySegments.length) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Prevent path traversal
  const rawKey = keySegments.join('/')
  if (rawKey.includes('..') || !/^[a-zA-Z0-9_\-./]+$/.test(rawKey)) {
    return new NextResponse('Invalid asset key', { status: 400 })
  }

  const upstreamUrl = resolveAssetPublicUrl(rawKey)

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        accept: 'image/*,*/*',
      },
    })

    if (!upstreamRes.ok) {
      return new NextResponse('Asset not found', { status: upstreamRes.status })
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/webp'
    const arrayBuffer = await upstreamRes.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Failed to fetch asset from upstream storage', { status: 502 })
  }
}
