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

function compactLines(lines: Array<string | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line)).join('\n')
}

export async function sendOwnerLeadNotification(input: OwnerLeadNotificationInput): Promise<void> {
  if (!input.to) throw new Error('tenant business email is not configured')

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')

  const from = process.env.RESEND_FROM_EMAIL ?? 'Studio Presence <onboarding@resend.dev>'
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

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `New website enquiry: ${input.leadId}`,
      text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}`)
  }
}
