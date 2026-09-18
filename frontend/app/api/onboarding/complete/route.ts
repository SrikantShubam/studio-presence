import { NextResponse } from 'next/server'
import { resolveClientConfig, createScopedClient } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { OnboardingDraft } from '@/lib/onboarding/types'
import { parseOnboardingDraftInput, suggestedIntroduction, validateOnboardingDraft } from '@/lib/onboarding/validation'
import {
  ONBOARDING_ALLOCATION_CONFLICT_MESSAGE,
  onboardingRpcStatus,
  retrySerialization,
} from '@/lib/onboarding/retry'

function slugFromName(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'studio'
  )
}

const PALETTE_TEMPLATE_MAP: Record<string, 'editorial' | 'warm-contemporary' | 'bold-modern' | 'premium'> = {
  editorial: 'editorial',
  'warm-earth': 'warm-contemporary',
  'charcoal-modern': 'bold-modern',
  'monolith-dark': 'premium',
}

function configFromDraft(draft: OnboardingDraft, slug: string) {
  const area = draft.serviceAreas[0] || draft.primaryCity || 'Service coverage'
  const city = draft.primaryCity || 'Service coverage'
  const state = draft.primaryState || 'Service coverage'
  const services = [
    ...draft.services.filter((service) => service !== 'Other service'),
    ...(draft.otherService ? [draft.otherService] : []),
  ]

  const template = PALETTE_TEMPLATE_MAP[draft.palette || 'editorial'] || 'editorial'

  const cleanPhone = (raw: string) => {
    const digits = (raw || '').replace(/[^\d]/g, '')
    if (digits.startsWith('91') && digits.length === 12 && /^91[6-9]/.test(digits)) {
      return `+${digits}`
    }
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return `+91${digits}`
    }
    return '+919876543210'
  }

  const normalizedPhone = cleanPhone(draft.primaryPhone)
  const normalizedWhatsapp = cleanPhone(draft.whatsapp)

  return resolveClientConfig(slug, {
    slug,
    tier: 't0',
    template,
    status: 'demo',
    vertical: 'interior-design',
    business: {
      name: draft.studioName,
      phone: normalizedPhone,
      whatsapp: normalizedWhatsapp,
      ...(draft.publicEmail ? { email: draft.publicEmail } : {}),
      address: { locality: area, city, state },
      serviceAreas: draft.serviceAreas,
    },
    ...(draft.logoPath ? { brand: { logo: draft.logoPath } } : {}),
    domain: { demoSubdomain: slug },
    sections: {
      hero: {
        enabled: true,
        headline: draft.studioName,
        sub: draft.introduction || suggestedIntroduction(draft),
      },
      portfolio: { enabled: true, projects: [] },
      ...(services.length
        ? {
            services: {
              enabled: true,
              items: services.map((title) => ({
                title,
                blurb: `${title} from ${draft.studioName}.`,
              })),
            },
          }
        : {}),
    },
    seo: {
      title: draft.studioName,
      description: draft.introduction || suggestedIntroduction(draft),
      noindex: true,
    },
    internal: {
      notes:
        'Organic onboarding demo. Address fields represent service coverage only; no office location or map pin is inferred.',
    },
  })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const [{ data: userData }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])
  if (!userData.user || !sessionData.session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = parseOnboardingDraftInput(body)
  if (Object.keys(parsed.errors).length) {
    return NextResponse.json(
      { error: 'Please correct the highlighted fields.', fields: parsed.errors },
      { status: 422 },
    )
  }

  const result = validateOnboardingDraft(parsed.draft)
  if (Object.keys(result.errors).length) {
    return NextResponse.json(
      { error: 'Please correct the highlighted fields.', fields: result.errors },
      { status: 422 },
    )
  }

  const slug = slugFromName(result.draft.studioName)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost'
  const hostname = `${slug}.${rootDomain}`
  let config
  try {
    config = configFromDraft(result.draft, slug)
  } catch {
    return NextResponse.json(
      { error: 'The preview could not be assembled from these details.' },
      { status: 422 },
    )
  }

  const db = createScopedClient(sessionData.session.access_token)
  const { data, error } = await retrySerialization(async () =>
    db.rpc('complete_onboarding', {
      p_requested_slug: slug,
      p_name: result.draft.studioName,
      p_hostname: hostname,
      p_config: config,
      p_source: 'organic',
    }),
  )

  if (error || !data?.[0]) {
    const status = onboardingRpcStatus(error)
    const message =
      error?.code === '40001'
        ? ONBOARDING_ALLOCATION_CONFLICT_MESSAGE
        : error?.message || 'Onboarding could not be completed.'
    return NextResponse.json({ error: message }, { status })
  }

  // Redirect directly to the studio dashboard
  return NextResponse.json({
    dashboardPath: `/${data[0].tenant_slug}/dashboard`,
    hostname: data[0].hostname,
  })
}
