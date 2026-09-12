import type { LeadSource } from '../db/types'

type OwnerLeadNotificationInput = {
  leadId: string
  to: string | undefined
  tenantSlug: string
  name: string
  phone: string
  email?: string | null
  locality?: string | null
  projectType?: string | null
  budgetBand?: string | null
  timeline?: string | null
  message?: string | null
  source: LeadSource
  sourcePage?: string | null
}

export type OwnerAlertEmail = {
  subject: string
  text: string
  replyTo?: string
}

function compactLines(lines: Array<string | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line)).join('\n')
}

export function buildOwnerAlertEmail(input: Omit<OwnerLeadNotificationInput, 'to'> & { tenantSlug: string }): OwnerAlertEmail {
  const text = compactLines([
    `Lead ID: ${input.leadId}`,
    `Tenant: ${input.tenantSlug}`,
    '',
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    input.email ? `Email: ${input.email}` : null,
    input.locality ? `Locality: ${input.locality}` : null,
    input.projectType ? `Project type: ${input.projectType}` : null,
    input.budgetBand ? `Budget: ${input.budgetBand}` : null,
    input.timeline ? `Timeline: ${input.timeline}` : null,
    input.message ? `Message: ${input.message}` : null,
    '',
    `Source: ${input.source}`,
    input.sourcePage ? `Source page: ${input.sourcePage}` : null,
  ])

  return {
    subject: `New website enquiry: ${input.leadId}`,
    text,
    ...(input.email ? { replyTo: input.email } : {}),
  }
}

export function classifyDeliveryResult(result: { ok: boolean; status?: number }): {
  status: 'sent' | 'pending' | 'failed'
  retryable: boolean
  error: string | null
} {
  if (result.ok) return { status: 'sent', retryable: false, error: null }
  const status = result.status ?? 0
  const retryable = status === 408 || status === 429 || status >= 500 || status === 0
  return {
    status: retryable ? 'pending' : 'failed',
    retryable,
    error: `provider returned ${status}`,
  }
}

export async function sendOwnerLeadNotification(input: OwnerLeadNotificationInput): Promise<void> {
  if (!input.to) throw new Error('tenant business email is not configured')
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  const from = process.env.RESEND_FROM_EMAIL ?? 'Studio Presence <onboarding@resend.dev>'
  const email = buildOwnerAlertEmail(input)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: email.subject,
      text: email.text,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    }),
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string }
    if (response.status === 403 && errorBody.message?.includes('testing emails')) {
      const match = errorBody.message.match(/\(([^)]+)\)/)
      const fallbackTo = match?.[1] || process.env.RESEND_TEST_RECIPIENT || 'vector.veda.dev@gmail.com'
      const retryResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: fallbackTo,
          subject: `[Sandbox Preview for ${input.to}] ${email.subject}`,
          text: `[Note: Sent to your developer address because the sending domain is in Resend sandbox mode. Intended recipient: ${input.to}]\n\n${email.text}`,
          ...(email.replyTo ? { reply_to: email.replyTo } : {}),
        }),
      })
      if (retryResponse.ok) return
    }
    throw new Error(`Resend returned ${response.status}`)
  }
}
