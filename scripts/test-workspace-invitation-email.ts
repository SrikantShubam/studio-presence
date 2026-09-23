import assert from 'node:assert/strict'
import { sendWorkspaceInvitation } from '../backend/src/services/memberships.ts'

process.env.BREVO_API_KEY = 'brevo-test-key'
process.env.BREVO_FROM_EMAIL = 'contact@vectorveda.online'
process.env.BREVO_FROM_NAME = 'Studio Presence'
delete process.env.RESEND_API_KEY
delete process.env.RESEND_FROM_EMAIL

const originalFetch = globalThis.fetch
let capturedRequest: { url: string; init?: RequestInit } | undefined

try {
  globalThis.fetch = async (input, init) => {
    capturedRequest = { url: String(input), init }
    return new Response(JSON.stringify({ messageId: 'brevo-message-123' }), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    })
  }

  await sendWorkspaceInvitation({
    to: 'invitee@example.test',
    studioName: 'Ashish Interiors',
    inviterName: 'Workspace Owner',
    role: 'editor',
    inviteUrl: 'https://ashish-interiors.candidate.example/invite/token-123',
  })

  assert.equal(capturedRequest?.url, 'https://api.brevo.com/v3/smtp/email')
  assert.equal(capturedRequest?.init?.method, 'POST')
  assert.equal((capturedRequest?.init?.headers as Record<string, string>)['api-key'], 'brevo-test-key')
  assert.equal((capturedRequest?.init?.headers as Record<string, string>)['content-type'], 'application/json')
  assert.equal((capturedRequest?.init?.headers as Record<string, string>).accept, 'application/json')

  const payload = JSON.parse(String(capturedRequest?.init?.body)) as Record<string, unknown>
  assert.deepEqual(payload.sender, { email: 'contact@vectorveda.online', name: 'Studio Presence' })
  assert.deepEqual(payload.to, [{ email: 'invitee@example.test' }])
  assert.equal(payload.subject, 'Join Ashish Interiors')
  assert.match(String(payload.textContent), /token-123/)
  assert.match(String(payload.htmlContent), /token-123/)

  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'sender rejected' }), { status: 400 })
  await assert.rejects(
    sendWorkspaceInvitation({
      to: 'invitee@example.test',
      studioName: 'Ashish Interiors',
      inviterName: 'Workspace Owner',
      role: 'viewer',
      inviteUrl: 'https://ashish-interiors.candidate.example/invite/token-456',
    }),
    /Brevo rejected the invitation email \(400\): sender rejected/,
  )
} finally {
  globalThis.fetch = originalFetch
}

console.log('Workspace invitation Brevo transport tests passed.')
