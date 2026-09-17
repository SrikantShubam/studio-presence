type HCaptchaVerification = {
  ok: boolean
  hostname?: string
  errorCodes?: string[]
}

type VerifyHCaptchaOptions = {
  token: string
  remoteIp?: string | null
}

export async function verifyHCaptchaToken({ token, remoteIp }: VerifyHCaptchaOptions): Promise<HCaptchaVerification> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  if (!secret || !token) return { ok: false, errorCodes: ['missing-input'] }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const response = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })
    if (!response.ok) return { ok: false, errorCodes: [`http-${response.status}`] }

    const result = (await response.json()) as HCaptchaVerification
    return {
      ok: result.ok === true,
      hostname: result.hostname,
      errorCodes: result.errorCodes,
    }
  } catch {
    return { ok: false, errorCodes: ['verification-unavailable'] }
  }
}
