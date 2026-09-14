import { NextResponse, type NextRequest } from 'next/server'
import { LeadWriteError, leads, publicLeadInputSchema } from '@studio/backend'
import { z } from 'zod'
import { verifyHCaptchaToken } from '@/lib/hcaptcha/server'

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

  const captcha = await verifyHCaptchaToken({
    token: captchaToken,
    remoteIp: visitorIp(request),
  })
  if (!captcha.ok) {
    return NextResponse.json({ message: 'Verification failed. Please try again.' }, { status: 400 })
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

    return NextResponse.json({ message: VISITOR_ERROR }, { status: 502 })
  }
}
