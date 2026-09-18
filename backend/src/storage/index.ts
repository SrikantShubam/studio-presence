import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createAnonClient, createScopedClient } from '../db/scoped'
import type { StorageUploadParams, StorageUploadResult } from './types'

export * from './types'

function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

/**
 * Upload an asset either to Supabase Storage (staging/demo) or Cloudflare R2 (paid tier).
 */
export async function uploadAsset(
  params: StorageUploadParams,
  accessToken?: string,
): Promise<StorageUploadResult> {
  const isPaid = params.tier && params.tier !== 't0'
  const isR2Eligible = isPaid && !params.isStaging && params.tenantSlug

  const r2 = getR2Client()

  if (isR2Eligible && r2) {
    const bucketName = process.env.R2_BUCKET_NAME || 'studio-presence-assets'
    const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE_URL || ''
    const key = `tenants/${params.tenantSlug}/${params.assetType}/${params.filename}`

    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )

    const url = cdnBase ? `${cdnBase.replace(/\/$/, '')}/${key}` : key
    const assetPath = `/api/assets/${key}`

    return {
      assetPath,
      key,
      bytes: params.buffer.length,
      storageProvider: 'r2',
      url,
    }
  }

  // Demo / Staging upload to Supabase Storage 'tenant-assets' bucket
  const client = accessToken ? createScopedClient(accessToken) : createAnonClient()
  const key = params.isStaging && params.userId
    ? `staging/${params.userId}/${params.assetType}/${params.filename}`
    : `tenants/${params.tenantSlug || 'demo'}/${params.assetType}/${params.filename}`

  const { error } = await client.storage.from('tenant-assets').upload(key, params.buffer, {
    contentType: params.contentType,
    upsert: true,
  })

  if (error) {
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`)
  }

  const { data: publicUrlData } = client.storage.from('tenant-assets').getPublicUrl(key)
  const assetPath = `/api/assets/${key}`

  return {
    assetPath,
    key,
    bytes: params.buffer.length,
    storageProvider: 'supabase',
    url: publicUrlData.publicUrl,
  }
}

/**
 * Resolve public asset URL from storage key.
 */
export function resolveAssetPublicUrl(key: string): string {
  const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE_URL
  if (key.startsWith('tenants/') && cdnBase) {
    return `${cdnBase.replace(/\/$/, '')}/${key}`
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/tenant-assets/${key}`
}
