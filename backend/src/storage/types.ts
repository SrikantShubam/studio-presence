export type StorageProvider = 'supabase' | 'r2'

export type AssetType = 'logo' | 'photo'

export interface StorageUploadParams {
  buffer: Buffer
  contentType: string
  filename: string
  assetType: AssetType
  tier?: 't0' | 't1' | 't2' | 't3'
  tenantSlug?: string
  userId?: string
  isStaging?: boolean
}

export interface StorageUploadResult {
  assetPath: string
  key: string
  bytes: number
  storageProvider: StorageProvider
  url: string
}
