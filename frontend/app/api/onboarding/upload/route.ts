import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { uploadAsset } from '@studio/backend'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = new Set(['image/webp', 'image/png', 'image/jpeg'])
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const [{ data: userData }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  if (!userData.user || !sessionData.session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const assetType = ((formData.get('assetType') as string) || 'logo').toLowerCase()

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  if (assetType !== 'logo' && assetType !== 'photo') {
    return NextResponse.json({ error: 'Invalid asset type.' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload a WebP, PNG, or JPEG image.' },
      { status: 422 },
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File exceeds the 2 MB limit.' },
      { status: 422 },
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${assetType}-${Date.now()}.webp`

    const uploadResult = await uploadAsset(
      {
        buffer,
        contentType: file.type || 'image/webp',
        filename,
        assetType: assetType as 'logo' | 'photo',
        userId: userData.user.id,
        isStaging: true,
      },
      sessionData.session.access_token,
    )

    return NextResponse.json({
      ok: true,
      assetPath: uploadResult.assetPath,
      bytes: uploadResult.bytes,
      url: uploadResult.url,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Asset upload failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
