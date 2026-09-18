export const PASSWORD_MIN_LENGTH = 12

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'missing-code': 'That link looks incomplete. Request a new one below.',
  'link-expired': 'That link has expired or was already used. Request a fresh link below.',
  'auth-pkce': 'This link was opened in a different browser or device. Request a new link and open it in the same browser where you entered your email.',
  'auth-invalid': 'That sign-in link was invalid or incomplete. Request a new link below.',
  'auth-unreachable': 'The sign-in service is temporarily unavailable. Wait a moment and try again.',
  'invalid-credentials': 'Unable to sign in with those details.',
  'unconfirmed-email': 'Unable to sign in with those details.',
  'recovery-sent': 'If an account exists for that email, recovery instructions are on the way.',
  'password-too-short': `Your password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  'no-email': 'Something went wrong on our side. Try again below.',
  'no-tenant': 'This email is not linked to a studio yet. Continue to onboarding to set one up.',
  'wrong-tenant': 'This email is linked to more than one studio. Contact the team so we can route you safely.',
  'retired-tenant': 'This workspace link is no longer active. Sign in again to continue.',
}

export function isValidPassword(password: string): boolean {
  return password.trim().length >= PASSWORD_MIN_LENGTH
}

const ALLOWED_NEXT_PREFIXES = ['/admin', '/dashboard', '/panel']

export function safeAuthNextPath(next: string | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/dashboard'

  const path = next.split(/[?#]/, 1)[0] ?? next
  if (ALLOWED_NEXT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return next
  }

  return '/dashboard'
}

function configuredOrigins(): Set<string> {
  const values = [
    process.env.NEXT_PUBLIC_AUTH_ORIGIN,
    process.env.NEXT_PUBLIC_ALLOWED_AUTH_ORIGINS,
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    'https://candidate.srikantshubams-projects.vercel.app',
    'https://preview.srikantshubams-projects.vercel.app',
  ]
    .flatMap((value) => (value ?? '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return new Set(
    values.flatMap((value) => {
      try {
        return [new URL(value.startsWith('http') ? value : `https://${value}`).origin]
      } catch {
        return []
      }
    }),
  )
}

export function isAllowedAuthOrigin(origin: string, allowed = configuredOrigins()): boolean {
  try {
    const parsed = new URL(origin)
    if (allowed.has(parsed.origin)) return true
    if (
      parsed.hostname === 'candidate.srikantshubams-projects.vercel.app' ||
      parsed.hostname === 'preview.srikantshubams-projects.vercel.app' ||
      parsed.hostname.endsWith('.srikantshubams-projects.vercel.app')
    ) {
      return true
    }
    return (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' ||
        parsed.hostname.endsWith('.localhost') ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname === '::1')
    )
  } catch {
    return false
  }
}
