/** Turns a locality name like "Boring Road" into "boring-road" for `/areas/[locality]`. */
export function areaSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
