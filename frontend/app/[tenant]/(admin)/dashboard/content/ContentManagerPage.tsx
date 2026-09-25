import { redirect } from 'next/navigation'
import { AuthError, createAnonClient, demoAccess, listWorkspaceMembers, loadPublicClientConfig, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PanelEditor, type Field } from '../../panel/PanelEditor'

export async function ContentManagerPage({
  tenant,
  initialSection = 'homepage',
}: {
  tenant: string
  initialSection?: string
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user?.email || !session) redirect('/login')

  try {
    const tenantContext = await requireTenant({
      id: user.id,
      email: user.email,
      accessToken: session.access_token,
    })
    if (tenantContext.tenant.slug === tenant) {
      const members = await listWorkspaceMembers(tenantContext.db, tenantContext.tenant.id)
      const role = members.find((member) => member.user_id === user.id)?.role
      if (role !== 'owner' && role !== 'editor') redirect('/' + tenant + '/dashboard/enquiries')
      const window = await demoAccess.getDemoWindow(createAnonClient(), tenant)
      return <PanelEditor tenant={tenant} baseRevision={window?.base_revision ?? `${tenant}:seed`} initialSection={initialSection} />
    }
  } catch (e) {
    if (!(e instanceof AuthError) || e.code !== 'no-tenant') throw e
  }

  const window = await demoAccess.getDemoWindow(createAnonClient(), tenant)
  if (!window?.available) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl items-center px-4 py-12">
        <section className="rounded-xl border border-admin-border bg-admin-surface p-6">
          <p className="text-sm text-admin-muted">Demo unavailable</p>
          <h1 className="mt-2 text-2xl font-semibold text-admin-ink">This preview has ended</h1>
          <p className="mt-3 text-sm text-admin-muted">Contact Studio Presence by Vector Veda if you would like a fresh preview or a customer plan.</p>
        </section>
      </main>
    )
  }

  const config = await loadPublicClientConfig(tenant)
  const initialContent: Partial<Record<Field, unknown>> = {
    'business.phone': config.business.phone,
    'business.whatsapp': config.business.whatsapp,
    'business.email': config.business.email,
    'business.hours': config.business.hours,
    'business.address': config.business.address,
    'business.tagline': config.business.tagline,
    'business.ownerName': config.business.ownerName,
    'business.serviceAreas': config.business.serviceAreas,
    'cta.whatsappMessage': config.cta.whatsappMessage,
    'seo.title': config.seo.title,
    'seo.description': config.seo.description,
    'seo.keywords': config.seo.keywords,
    'legal.privacyPolicyDoc': config.legal.privacyPolicyDoc,
    'legal.termsDoc': config.legal.termsDoc,
    'sections.hero.image': config.sections.hero?.image,
    'sections.hero.headline': config.sections.hero?.headline,
    'sections.hero.sub': config.sections.hero?.sub,
    'sections.hero.ctaLabel': config.sections.hero?.ctaLabel,
    'sections.hero.categories': config.sections.hero?.categories,
    'sections.quickActions.actions': config.sections.quickActions?.actions,
    'sections.trustBar.stats': config.sections.trustBar?.stats,
    'sections.portfolio.projects': config.sections.portfolio?.projects,
    'sections.portfolio.introText': config.sections.portfolio?.introText,
    'sections.portfolio.rangeEnd': config.sections.portfolio?.rangeEnd,
    'sections.portfolio.categoryHeaders': config.sections.portfolio?.categoryHeaders,
    'sections.about.heading': config.sections.about?.heading,
    'sections.about.body': config.sections.about?.body,
    'sections.about.image': config.sections.about?.image,
    'sections.process.steps': config.sections.process?.steps,
    'sections.services.items': config.sections.services?.items,
    'sections.testimonials.items': config.sections.testimonials?.items,
    'sections.instagram.handle': config.sections.instagram?.handle,
    'sections.instagram.embedPostUrls': config.sections.instagram?.embedPostUrls,
    'sections.faq.items': config.sections.faq?.items,
    'sections.ctaBand.headline': config.sections.ctaBand?.headline,
    'sections.ctaBand.ctaLabel': config.sections.ctaBand?.ctaLabel,
    'sections.footer.reassuranceLine': config.sections.footer?.reassuranceLine,
    'sections.footer.socials': config.sections.footer?.socials,
    'sections.team.intro': config.sections.team?.intro,
    'sections.team.members': config.sections.team?.members,
    'sections.team.groups': config.sections.team?.groups,
    'sections.team.workshop': config.sections.team?.workshop,
    'sections.beforeAfter.pairs': config.sections.beforeAfter?.pairs,
    'sections.awards.items': config.sections.awards?.items,
    'sections.caseStudy.items': config.sections.caseStudy?.items,
    'sections.locations.offices': config.sections.locations?.offices,
    'sections.locations.otherLocationsNote': config.sections.locations?.otherLocationsNote,
    'sections.videoTour.url': config.sections.videoTour?.url,
    'sections.companyProfile.pdf': config.sections.companyProfile?.pdf,
    'sections.journal.intro': config.sections.journal?.intro,
    'sections.journal.topics': config.sections.journal?.topics,
    'sections.journal.posts': config.sections.journal?.posts,
    'sections.news.press': config.sections.news?.press,
    'sections.news.items': config.sections.news?.items,
    'sections.careers.intro': config.sections.careers?.intro,
    'sections.careers.studioPhoto': config.sections.careers?.studioPhoto,
    'sections.careers.lookFor': config.sections.careers?.lookFor,
    'sections.careers.emptyState': config.sections.careers?.emptyState,
    'sections.careers.applyProcess': config.sections.careers?.applyProcess,
    'sections.careers.roles': config.sections.careers?.roles,
    'sections.areas.items': config.sections.areas?.items,
    'sections.estimate.enabled': config.sections.estimate?.enabled,
    'sections.estimate.ratePerSqft': config.sections.estimate?.ratePerSqft,
    'sections.estimate.intro': config.sections.estimate?.intro,
    'sections.estimate.area': config.sections.estimate?.area,
    'sections.estimate.homeTypes': config.sections.estimate?.homeTypes,
    'sections.estimate.finishLevels': config.sections.estimate?.finishLevels,
    'sections.estimate.resultNote': config.sections.estimate?.resultNote,
    'sections.estimate.included': config.sections.estimate?.included,
  }

  return <PanelEditor tenant={tenant} mode="local" baseRevision={window.base_revision} initialContent={initialContent} initialSection={initialSection} />
}
