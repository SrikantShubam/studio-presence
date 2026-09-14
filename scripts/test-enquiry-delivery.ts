import assert from 'node:assert/strict'
import { buildOwnerAlertEmail, classifyDeliveryResult, sendOwnerLeadNotification } from '../backend/src/services/notify'
import { fail, heading } from './_report'

async function main() {
  heading('test:enquiry-delivery')
  const originalFetch = globalThis.fetch
  const originalApiKey = process.env.RESEND_API_KEY
  const originalFrom = process.env.RESEND_FROM_EMAIL
  const originalTestRecipient = process.env.RESEND_TEST_RECIPIENT

  const email = buildOwnerAlertEmail({
    leadId: 'lead-1',
    tenantSlug: 'tenant-a',
    name: 'Lead One',
    phone: '+919876543210',
    email: 'reply@example.test',
    source: 'form',
    sourcePage: '/contact',
  })
  assert.match(email.subject, /New website enquiry/)
  assert.equal(email.replyTo, 'reply@example.test')
  assert.doesNotMatch(email.text, /exactly-once/i)

  assert.deepEqual(classifyDeliveryResult({ ok: false, status: 503 }), { status: 'pending', retryable: true, error: 'provider returned 503' })
  assert.deepEqual(classifyDeliveryResult({ ok: false, status: 400 }), { status: 'failed', retryable: false, error: 'provider returned 400' })
  try {
    process.env.RESEND_API_KEY = 'test-resend-key'
    delete process.env.RESEND_FROM_EMAIL
    await assert.rejects(
      sendOwnerLeadNotification({
        leadId: 'lead-missing-sender',
        to: 'owner@example.test',
        tenantSlug: 'tenant-a',
        name: 'Lead Missing Sender',
        phone: '+919876543210',
        source: 'form',
        sourcePage: '/contact',
      }),
      /RESEND_FROM_EMAIL is not set/,
    )

    process.env.RESEND_API_KEY = 'test-resend-key'
    process.env.RESEND_FROM_EMAIL = 'Studio Presence <sender@example.test>'
    delete process.env.RESEND_TEST_RECIPIENT
    let calls = 0
    globalThis.fetch = (async () => {
      calls += 1
      return {
        ok: false,
        status: 403,
        json: async () => ({ message: 'You can only send testing emails to your own email address' }),
      } as Response
    }) as typeof fetch

    await assert.rejects(
      sendOwnerLeadNotification({
        leadId: 'lead-2',
        to: 'owner@example.test',
        tenantSlug: 'tenant-a',
        name: 'Lead Two',
        phone: '+919876543210',
        source: 'form',
        sourcePage: '/contact',
      }),
      /Resend returned 403/,
    )
    assert.equal(calls, 1, 'sandbox mode does not reroute without RESEND_TEST_RECIPIENT')

    process.env.RESEND_TEST_RECIPIENT = 'test-recipient@example.test'
    const recipients: string[] = []
    globalThis.fetch = (async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { to: string }
      recipients.push(body.to)
      return recipients.length === 1
        ? ({
            ok: false,
            status: 403,
            json: async () => ({ message: 'You can only send testing emails to your own email address' }),
          } as Response)
        : ({ ok: true, status: 200, json: async () => ({ id: 'email-1' }) } as Response)
    }) as typeof fetch

    await sendOwnerLeadNotification({
      leadId: 'lead-3',
      to: 'owner@example.test',
      tenantSlug: 'tenant-a',
      name: 'Lead Three',
      phone: '+919876543210',
      source: 'form',
      sourcePage: '/contact',
      })
    assert.deepEqual(recipients, ['owner@example.test', 'test-recipient@example.test'])
  } finally {
    globalThis.fetch = originalFetch
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalApiKey
    if (originalFrom === undefined) delete process.env.RESEND_FROM_EMAIL
    else process.env.RESEND_FROM_EMAIL = originalFrom
    if (originalTestRecipient === undefined) delete process.env.RESEND_TEST_RECIPIENT
    else process.env.RESEND_TEST_RECIPIENT = originalTestRecipient
  }

  console.log('\x1b[32mPASS\x1b[0m  enquiry delivery behavior\n')
}

main().catch((e) => fail('test:enquiry-delivery', (e as Error).message))
