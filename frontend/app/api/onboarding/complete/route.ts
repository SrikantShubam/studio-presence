import { NextResponse } from 'next/server'
import { resolveClientConfig, createScopedClient } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { OnboardingDraft } from '@/lib/onboarding/types'
import { parseOnboardingDraftInput, suggestedIntroduction, validateOnboardingDraft } from '@/lib/onboarding/validation'

function slugFromName(name: string): string {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'studio'
}

function configFromDraft(draft: OnboardingDraft, slug: string) {
  const area = draft.serviceAreas[0] ?? 'Service coverage'
  const services = [...draft.services.filter((service) => service !== 'Other service'), ...(draft.otherService ? [draft.otherService] : [])]
  return resolveClientConfig(slug, {
    slug,
    tier: 't0',
    template: 'editorial',
    status: 'demo',
    vertical: 'interior-design',
    business: {
      name: draft.studioName,
      phone: draft.primaryPhone,
      whatsapp: draft.whatsapp,
      ...(draft.publicEmail ? { email: draft.publicEmail } : {}),
      address: { locality: area, city: 'Service coverage', state: 'Service coverage' },
      serviceAreas: draft.serviceAreas,
    },
    domain: { demoSubdomain: slug },
    sections: {
      hero: { enabled: true, headline: draft.studioName, sub: draft.introduction || suggestedIntroduction(draft) },
      portfolio: { enabled: true, projects: [] },
      ...(services.length ? { services: { enabled: true, items: services.map((title) => ({ title, blurb: `${title} from ${draft.studioName}.` })) } } : {}),
    },
    seo: { title: draft.studioName, description: draft.introduction || suggestedIntroduction(draft), noindex: true },
    internal: { notes: 'Organic onboarding demo. Address fields represent service coverage only; no office location or map pin is inferred.' },
  })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const [{ data: userData }, { data: sessionData }] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()])
  if (!userData.user || !sessionData.session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = parseOnboardingDraftInput(body)
  if (Object.keys(parsed.errors).length) {
    return NextResponse.json({ error: 'Please correct the highlighted fields.', fields: parsed.errors }, { status: 422 })
  }

  const result = validateOnboardingDraft(parsed.draft)
  if (Object.keys(result.errors).length) return NextResponse.json({ error: 'Please correct the highlighted fields.', fields: result.errors }, { status: 422 })

  const slug = slugFromName(result.draft.studioName)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost'
  const hostname = `${slug}.${rootDomain}`
  let config
  try { config = configFromDraft(result.draft, slug) } catch { return NextResponse.json({ error: 'The preview could not be assembled from these details.' }, { status: 422 }) }

  const db = createScopedClient(sessionData.session.access_token)
  const { data, error } = await db.rpc('complete_onboarding', { p_requested_slug: slug, p_name: result.draft.studioName, p_hostname: hostname, p_config: config, p_source: 'organic' })
  if (error || !data?.[0]) {
    const status = error?.code === '42501' ? 403 : error?.code === '23505' ? 409 : 400
    return NextResponse.json({ error: error?.message || 'Onboarding could not be completed.' }, { status })
  }
  return NextResponse.json({ dashboardPath: `/${data[0].tenant_slug}/dashboard`, hostname: data[0].hostname })
}
