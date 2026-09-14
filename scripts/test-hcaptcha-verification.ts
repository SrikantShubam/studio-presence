import assert from 'node:assert/strict'
import { verifyHCaptchaToken } from '../frontend/lib/hcaptcha/server'

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  } as Response
}

{
  let postedBody = ''
  const result = await verifyHCaptchaToken({
    token: 'token-ok',
    remoteIp: '203.0.113.1',
    secret: 'secret-ok',
    fetchImpl: async (_url, init) => {
      postedBody = String(init?.body)
      return jsonResponse({ success: true, hostname: 'localhost', challenge_ts: '2026-09-11T00:00:00Z' })
    },
  })
  assert.deepEqual(result, {
    ok: true,
    provider: 'hcaptcha',
    hostname: 'localhost',
    challengeTs: '2026-09-11T00:00:00Z',
  })
  assert.match(postedBody, /secret=secret-ok/)
  assert.match(postedBody, /response=token-ok/)
  assert.match(postedBody, /remoteip=203\.0\.113\.1/)
}

{
  const result = await verifyHCaptchaToken({
    token: 'bad-token',
    secret: 'secret-ok',
    fetchImpl: async () => jsonResponse({ success: false, 'error-codes': ['invalid-input-response'] }),
  })
  assert.deepEqual(result, {
    ok: false,
    reason: 'provider_rejected',
    errorCodes: ['invalid-input-response'],
  })
}

{
  const result = await verifyHCaptchaToken({ token: ' ', secret: 'secret-ok' })
  assert.deepEqual(result, { ok: false, reason: 'missing_token' })
}

{
  const result = await verifyHCaptchaToken({ token: 'token-ok', secret: '' })
  assert.deepEqual(result, { ok: false, reason: 'missing_secret' })
}

{
  const result = await verifyHCaptchaToken({
    token: 'token-ok',
    secret: 'secret-ok',
    fetchImpl: async () => {
      throw new Error('network down')
    },
  })
  assert.deepEqual(result, { ok: false, reason: 'provider_unavailable' })
}

{
  let aborted = false
  const result = await verifyHCaptchaToken({
    token: 'token-ok',
    secret: 'secret-ok',
    timeoutMs: 1,
    fetchImpl: async (_url, init) => {
      const signal = init?.signal as AbortSignal | undefined
      await new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          aborted = true
          reject(new DOMException('aborted', 'AbortError'))
        })
      })
      return jsonResponse({ success: true })
    },
  })
  assert.equal(aborted, true)
  assert.deepEqual(result, { ok: false, reason: 'provider_unavailable' })
}

console.log('PASS hCaptcha server verification contract')
