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
 * ==============================================================================
 * ARCHITECTURAL INVARIANT — STORAGE BOUNDARY RULE
 * ==============================================================================
 * Cloudflare R2 is STRICTLY RESERVED for paying, live customer tenants (paid tiers).
 * 
 * - Staging, onboarding, and demo tenants (t0 / status: demo) MUST NEVER touch R2.
 * - All demo, staging, and onboarding assets belong EXCLUSIVELY in Supabase Storage
 *   under the `tenant-assets` bucket (`staging/<userId>/...`).
 * 
 * Any attempt to route unpaid, demo, or staging uploads to R2 is a severe architectural
 * and cost-isolation violation. Do not bypass or weaken this boundary.
 * ==============================================================================
 */
export async function uploadAsset(
  params: StorageUploadParams,
  accessToken?: string,
): Promise<StorageUploadResult> {
  // Guardrail: Never allow staging or demo uploads to touch R2
  const isDemoOrStaging = params.isStaging || !params.tenantSlug || params.tenantSlug === 'demo'
  const r2 = isDemoOrStaging ? null : getR2Client()

  if (r2) {
    try {
      const bucketName = process.env.R2_BUCKET_NAME || 'studio-presence-assets'
      const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE_URL || ''
      const key = `tenants/${params.tenantSlug || 'demo'}/${params.assetType}/${params.filename}`

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
    } catch (r2Error) {
      console.warn('R2 upload failed, falling back to Supabase Storage:', r2Error)
    }
  }

  // Fallback to Supabase Storage 'tenant-assets' bucket
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
  if (key.startsWith('tenants/') && !key.startsWith('tenants/demo/') && cdnBase) {
    return `${cdnBase.replace(/\/$/, '')}/${key}`
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/tenant-assets/${key}`
}
