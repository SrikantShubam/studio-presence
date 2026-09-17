import { NextResponse, type NextRequest } from 'next/server'
import { LeadWriteError, leads, publicLeadInputSchema, sendOwnerLeadNotification } from '@studio/backend'
import { z } from 'zod'
import { verifyHCaptchaToken } from '@/lib/hcaptcha/server'
import { loadPublicClientConfigForLocale } from '@/lib/i18n'

const VISITOR_ERROR = 'Something went wrong, please call us instead'

type RouteContext = {
  params: Promise<{ tenant: string }>
}

function visitorIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwardedFor || request.headers.get('x-real-ip') || null
}

function safeError(e: unknown): string {
  if (e instanceof LeadWriteError && e.cause) return safeError(e.cause)
  if (typeof e === 'object' && e && 'message' in e) {
    const message = (e as { message: unknown }).message
    if (typeof message === 'string') return message
  }
  return e instanceof Error ? e.message : 'unknown error'
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { tenant } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Please send a valid enquiry.' }, { status: 400 })
  }

  const captchaToken =
    typeof body === 'object' && body && 'captchaToken' in body && typeof (body as { captchaToken: unknown }).captchaToken === 'string'
      ? (body as { captchaToken: string }).captchaToken.trim()
      : ''

  if (captchaToken && process.env.HCAPTCHA_SECRET_KEY) {
    const captcha = await verifyHCaptchaToken({
      token: captchaToken,
      remoteIp: visitorIp(request),
    })
    if (!captcha.ok) {
      return NextResponse.json({ message: 'Verification failed. Please try again.' }, { status: 400 })
    }
  }

  const parsed = publicLeadInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please check the enquiry details and try again.' },
      { status: 400 },
    )
  }

  try {
    const result = await leads.create({ tenantSlug: tenant, ...parsed.data })
    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    const errText = safeError(e)
    console.error('Lead write failed', {
      tenant,
      error: errText,
      kind: e instanceof z.ZodError ? 'validation' : e instanceof LeadWriteError ? 'write' : 'unknown',
    })

    if (errText.includes('capture_not_allowed')) {
      // Demo / staging tenant: database capture is restricted to live sites by policy,
      // but we deliver the enquiry alert directly so test queries and prospect demos work.
      const requestId = request.headers.get('idempotency-key') ?? crypto.randomUUID()
      let clientSite
      try {
        clientSite = await loadPublicClientConfigForLocale(tenant)
      } catch {
        // ignore
      }

      if (process.env.RESEND_API_KEY && clientSite?.business?.email) {
        try {
          await sendOwnerLeadNotification({
            leadId: `demo-${requestId.slice(0, 8)}`,
            to: clientSite.business.email,
            tenantSlug: tenant,
            name: parsed.data.name,
            phone: parsed.data.phone,
            email: parsed.data.email,
            locality: parsed.data.locality,
            projectType: parsed.data.projectType,
            budgetBand: parsed.data.budgetBand,
            timeline: parsed.data.timeline,
            message: parsed.data.message,
            source: parsed.data.source,
            sourcePage: parsed.data.sourcePage,
          })
        } catch (mailErr) {
          console.error('Demo enquiry email dispatch failed:', mailErr)
        }
      }

      return NextResponse.json(
        { leadId: `demo-${requestId}`, status: 'demo_received' },
        { status: 201 },
      )
    }

    return NextResponse.json({ message: VISITOR_ERROR }, { status: 502 })
  }
}
