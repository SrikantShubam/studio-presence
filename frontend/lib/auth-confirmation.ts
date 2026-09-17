import type { EmailOtpType } from '@supabase/supabase-js'

const CONFIRMATION_TYPES = new Set<EmailOtpType>(['signup', 'email', 'email_change'])

export type ConfirmationRequest =
  | { kind: 'code'; code: string }
  | { kind: 'token_hash'; tokenHash: string; type: EmailOtpType }
  | { kind: 'session' }
  | { kind: 'invalid' }

export function confirmationRequest(params: URLSearchParams): ConfirmationRequest {
  const code = params.get('code')
  if (code) return { kind: 'code', code }

  const tokenHash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null
  if (tokenHash && type && CONFIRMATION_TYPES.has(type)) {
    return { kind: 'token_hash', tokenHash, type }
  }

  if (!tokenHash && !type) return { kind: 'session' }
  return { kind: 'invalid' }
}
