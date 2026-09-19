import { redirect } from 'next/navigation'
import { AuthError, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NO_FLASH_SCRIPT, ThemeToggle } from '../[tenant]/(admin)/ThemeToggle'
import { OnboardingForm } from './OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient()
  const [{ data: userData }, { data: sessionData }] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()])
  if (!userData.user || !sessionData.session) redirect('/login?next=/onboarding')
  try {
    const { tenant } = await requireTenant({ id: userData.user.id, email: userData.user.email ?? '', accessToken: sessionData.session.access_token })
    redirect(`/${tenant.slug}/dashboard`)
  } catch (error) {
    if (!(error instanceof AuthError) || error.code !== 'no-tenant') throw error
  }
  return (
    <main aria-labelledby="onboarding-title" className="min-h-screen bg-admin-bg text-admin-ink">
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-admin-border pb-5" aria-label="Onboarding header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-admin-muted">Studio Presence</p>
            <p className="mt-1 text-sm text-admin-muted">Workspace setup</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid flex-1 gap-6 py-7 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] lg:gap-12 lg:py-10">
          <section className="flex flex-col justify-between lg:sticky lg:top-8 lg:h-[calc(100vh-8rem)]" aria-labelledby="onboarding-title">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-primary">A focused start</p>
              <h1 id="onboarding-title" className="mt-4 max-w-lg text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Let’s make this studio yours.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-admin-muted">
                A few focused answers are enough to personalise the preview. You can refine the details later.
              </p>
            </div>

            <div className="mt-8 hidden rounded-xl border border-admin-border bg-admin-primary-soft p-5 lg:block">
              <p className="text-sm font-semibold text-admin-ink">You’re in control</p>
              <p className="mt-2 text-sm leading-6 text-admin-muted">Your answers save as you move between stages, so you can pause and return whenever you need.</p>
            </div>
          </section>

          <section aria-labelledby="onboarding-form-title" className="min-w-0 px-0 py-6 md:rounded-xl md:border md:border-admin-border md:bg-admin-surface md:p-6 lg:p-8">
            <OnboardingForm initialEmail={userData.user.email ?? ''} />
          </section>
        </div>
      </div>
    </main>
  )
}
