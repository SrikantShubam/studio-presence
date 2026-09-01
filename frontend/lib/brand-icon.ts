import type { TokenSet } from './tokens'

function initialsFor(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return initials || name.slice(0, 2).toUpperCase()
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function brandIconSvg({
  businessName,
  tokens,
  palette,
}: {
  businessName: string
  tokens: TokenSet
  palette?: Partial<TokenSet['colors']>
}): string {
  const colors = { ...tokens.colors, ...palette }
  const initials = escapeSvgText(initialsFor(businessName))

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${escapeSvgText(businessName)}">
  <rect width="512" height="512" fill="${colors.ink}"/>
  <rect x="56" y="56" width="400" height="400" fill="none" stroke="${colors.cta}" stroke-width="18"/>
  <path d="M118 162H238V82M394 350H274V430" fill="none" stroke="${colors.surface}" stroke-width="18" stroke-linecap="square"/>
  <path d="M164 350L256 152L348 350M202 270H310" fill="none" stroke="${colors.cta}" stroke-width="24" stroke-linecap="square" stroke-linejoin="miter"/>
  <text x="256" y="398" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="70" font-weight="700" letter-spacing="12" fill="${colors.surface}">${initials}</text>
</svg>`
}
