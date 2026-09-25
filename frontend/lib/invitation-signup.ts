'use client'

export type InvitationSignupErrorCode =
  | 'invalid_invitation'
  | 'expired_invitation'
  | 'revoked_invitation'
  | 'wrong_email'
  | 'account_exists'
  | 'invalid_password'
  | 'rate_limited'
  | 'unavailable'

type InvitationSignupResponse =
  | { ok: true }
  | { ok: false; code: InvitationSignupErrorCode }

export function invitationTokenFromPath(nextPath: string | undefined): string | null {
  if (!nextPath) return null
  try {
    const url = new URL(nextPath, window.location.origin)
    const match = url.pathname.match(/^\/invite\/([A-Za-z0-9_-]+)$/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

export function invitationSignupMessage(code: InvitationSignupErrorCode): string {
  switch (code) {
    case 'wrong_email':
      return 'Use the email address that received this invitation.'
    case 'expired_invitation':
      return 'This invitation has expired. Ask the workspace owner to send a new one.'
    case 'revoked_invitation':
      return 'This invitation was revoked. Ask the workspace owner to send a new one.'
    case 'account_exists':
      return 'This email already has an account. Choose Sign in to continue.'
    case 'invalid_password':
      return 'Choose a stronger password and try again.'
    case 'rate_limited':
      return 'Too many attempts. Wait a few minutes, then try again.'
    case 'invalid_invitation':
      return 'This invitation link is invalid. Ask the workspace owner to send a new one.'
    default:
      return 'We could not create your invited account. Try again in a moment.'
  }
}

export async function createInvitationAccount(input: {
  token: string
  email: string
  password: string
}): Promise<InvitationSignupResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) throw new Error('Supabase browser configuration is missing.')

  const response = await fetch(`${supabaseUrl}/functions/v1/invitation-signup`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  const result = await response.json().catch(() => null) as InvitationSignupResponse | null
  if (result && typeof result === 'object' && 'ok' in result) return result
  if (response.status === 429) return { ok: false, code: 'rate_limited' }
  return { ok: false, code: 'unavailable' }
}
