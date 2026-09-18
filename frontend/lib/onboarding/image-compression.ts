/**
 * Client-Side Image Compression Engine
 *
 * Strips EXIF metadata and GPS coordinates via Canvas redraw, downscales
 * oversized images, and converts files into highly optimized WebP format
 * before network upload.
 */

export interface CompressionOptions {
  maxDimension?: number
  quality?: number
  targetMimeType?: string
}

export interface CompressionResult {
  blob: Blob
  width: number
  height: number
  originalSize: number
  compressedSize: number
  dataUrl: string
}

export const LOGO_PRESET: CompressionOptions = {
  maxDimension: 1200,
  quality: 0.92,
  targetMimeType: 'image/webp',
}

export const PHOTO_PRESET: CompressionOptions = {
  maxDimension: 1920,
  quality: 0.82,
  targetMimeType: 'image/webp',
}

/**
 * Compress and convert an image file to WebP using HTML5 Canvas.
 */
export async function compressImageToWebp(
  file: File,
  options: CompressionOptions = LOGO_PRESET,
): Promise<CompressionResult> {
  const maxDimension = options.maxDimension ?? 512
  const quality = options.quality ?? 0.85
  const targetMimeType = options.targetMimeType ?? 'image/webp'

  const imageSource = await loadImageElement(file)
  const { width: srcWidth, height: srcHeight } = imageSource

  let targetWidth = srcWidth
  let targetHeight = srcHeight

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight)
    targetWidth = Math.max(1, Math.round(targetWidth * ratio))
    targetHeight = Math.max(1, Math.round(targetHeight * ratio))
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) {
    throw new Error('Canvas 2D context could not be acquired.')
  }

  // Smooth downscaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b)
        else reject(new Error('Failed to encode image to WebP blob.'))
      },
      targetMimeType,
      quality,
    )
  })

  const dataUrl = canvas.toDataURL(targetMimeType, quality)

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    originalSize: file.size,
    compressedSize: blob.size,
    dataUrl,
  }
}

/**
 * Helper to safely load a File into an HTMLImageElement across all modern browsers.
 */
function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image file into memory.'))
    }

    img.src = url
  })
}

/**
 * Human-readable byte formatting for UI badges.
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}
