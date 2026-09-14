export type HCaptchaVerification =
  | { ok: true; provider: 'hcaptcha'; hostname?: string; challengeTs?: string }
  | { ok: false; reason: 'missing_secret' | 'missing_token' | 'provider_rejected' | 'provider_unavailable'; errorCodes?: string[] }

type HCaptchaSiteVerifyResponse = {
  success?: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

export async function verifyHCaptchaToken({
  token,
  remoteIp,
  secret = process.env.HCAPTCHA_SECRET_KEY,
  fetchImpl = fetch,
  timeoutMs = 5000,
}: {
  token: string
  remoteIp?: string | null
  secret?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}): Promise<HCaptchaVerification> {
  const responseToken = token.trim()
  if (!responseToken) return { ok: false, reason: 'missing_token' }
  if (!secret?.trim()) return { ok: false, reason: 'missing_secret' }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', responseToken)
  if (remoteIp?.trim()) body.set('remoteip', remoteIp.trim())

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    })
    const data = (await response.json()) as HCaptchaSiteVerifyResponse
    if (!response.ok || !data.success) {
      return {
        ok: false,
        reason: 'provider_rejected',
        errorCodes: data['error-codes'] ?? [],
      }
    }
    return {
      ok: true,
      provider: 'hcaptcha',
      hostname: data.hostname,
      challengeTs: data.challenge_ts,
    }
  } catch {
    return { ok: false, reason: 'provider_unavailable' }
  } finally {
    clearTimeout(timeout)
  }
}
