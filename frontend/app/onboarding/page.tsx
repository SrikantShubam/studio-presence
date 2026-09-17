import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PLATFORM_BRAND } from '@/lib/platform-brand'
import { OnboardingForm } from './OnboardingForm'
import { ThemeToggle } from '../[tenant]/(admin)/ThemeToggle'

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect('/login?next=/onboarding')
  return <main className="min-h-screen bg-admin-bg px-4 py-8 text-admin-ink"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold">{PLATFORM_BRAND}</p><ThemeToggle /></div><h1 className="mt-8 text-4xl font-semibold tracking-tight">Let’s make this studio yours.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-admin-muted">A few focused answers are enough to personalize the preview. You can refine the details later.</p><div className="mt-8 rounded-lg border border-admin-border bg-admin-surface p-5 sm:p-8"><OnboardingForm /></div></div></main>
}
