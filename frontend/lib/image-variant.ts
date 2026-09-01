export type ImageVariantSize = 'sm' | 'md' | 'lg'

/** Maps a config asset path to a Sharp-generated WebP at a fixed width. */
export function imageVariant(src: string, size: ImageVariantSize): string {
  if (!src.startsWith('/clients/')) return src
  const query = src.indexOf('?')
  const clean = query >= 0 ? src.slice(0, query) : src
  if (clean.includes('/variants/')) return src
  const slash = clean.lastIndexOf('/')
  if (slash < 0) return src
  const dir = clean.slice(0, slash)
  const base = clean.slice(slash + 1).replace(/\.[^.]+$/, '')
  return `${dir}/variants/${size}/${base}.webp`
}
