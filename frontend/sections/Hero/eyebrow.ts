import type { ClientConfig } from '@studio/backend'

/**
 * Composes the small uppercase eyebrow line — one of Editorial's five
 * signature devices, and the thing that gives the full-bleed, video and
 * standard variants a second device beyond the two-tone wordmark (every page
 * needs at least two, per `00-identity-system.md`).
 *
 * Every word in it comes from real config — `vertical`, `address.city`,
 * `yearFounded` — not from a per-client copy field. There's no `eyebrow`
 * field in the schema and there shouldn't be one: this line is a structural
 * composition, the same category/locality/founding-year fact pattern for
 * every client, not something an owner writes.
 */

const VERTICAL_LABELS: Record<string, string> = {
  'interior-design': 'Interior Design Studio',
}

function verticalLabel(vertical: string): string {
  if (VERTICAL_LABELS[vertical]) return VERTICAL_LABELS[vertical]
  return `${vertical.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Studio`
}

export function heroEyebrowLines(site: ClientConfig): string[] {
  const lines: string[] = [`${verticalLabel(site.vertical)},`]

  const city = site.business.address.city
  const since = site.business.yearFounded ? `SINCE ${site.business.yearFounded}` : null
  const second = [city, since].filter(Boolean).join(' · ')

  if (second) lines.push(second.toUpperCase())

  return lines
}
