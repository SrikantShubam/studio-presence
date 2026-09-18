import { redirect } from 'next/navigation'
import { AuthError, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { OnboardingForm } from './OnboardingForm'
import { ThemeToggle } from '../[tenant]/(admin)/ThemeToggle'

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
  return <main className="min-h-screen bg-admin-bg px-4 py-8 text-admin-ink"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-end gap-4"><ThemeToggle /></div><h1 className="mt-8 text-4xl font-semibold tracking-tight">Let’s make this studio yours.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-admin-muted">A few focused answers are enough to personalize the preview. You can refine the details later.</p><div className="mt-8 rounded-lg border border-admin-border bg-admin-surface p-5 sm:p-8"><OnboardingForm initialEmail={userData.user.email ?? ''} /></div></div></main>
}
