import { NextResponse, type NextRequest } from 'next/server'
import { LeadWriteError, leads, publicLeadInputSchema } from '@studio/backend'
import { z } from 'zod'

const VISITOR_ERROR = 'Something went wrong, please call us instead'

type RouteContext = {
  params: Promise<{ tenant: string }>
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
    console.error('Lead write failed', {
      tenant,
      error: safeError(e),
      kind: e instanceof z.ZodError ? 'validation' : e instanceof LeadWriteError ? 'write' : 'unknown',
    })

    return NextResponse.json({ message: VISITOR_ERROR }, { status: 502 })
  }
}
