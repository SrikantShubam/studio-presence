import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PLATFORM_BRAND } from '@/lib/platform-brand'
import { AdminCard, AdminMetric, AdminShell } from '../[tenant]/(admin)/components'
import { SignOutButton } from '../[tenant]/(admin)/SignOutButton'

const DEMO_COPY = {
  eyebrow: 'Platform demo',
  title: 'A calm workspace for your studio.',
  description: 'This is sample content only. Website edits stay in this browser until an operator connects your studio to a real tenant workspace.',
  sampleNotice: 'Sample data is on',
  sampleDescription: 'These numbers are illustrative and are not connected to any studio or customer account.',
}

const DEMO_METRICS = [
  { label: 'enquiries', value: '14', note: 'sample total', tone: 'primary' as const },
  { label: 'not contacted', value: '6', note: 'sample follow-up', tone: 'alert' as const },
  { label: 'qualified', value: '4', note: 'sample pipeline', tone: 'neutral' as const },
  { label: 'won', value: '1', note: 'sample outcome', tone: 'neutral' as const },
]

export default async function PlatformDemoPage() {
  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const { data: sessionData } = await supabase.auth.getSession()

  if (!userData.user?.email || !sessionData.session) redirect('/login')

  return (
    <main className="min-h-screen bg-admin-bg text-admin-ink">
      <header className="border-b border-admin-border bg-admin-surface px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-admin-ink">{PLATFORM_BRAND}</p>
            <p className="text-xs text-admin-muted">{DEMO_COPY.eyebrow}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <AdminShell spacious>
        <AdminCard className="border-admin-alert bg-admin-alert-soft p-5">
          <p className="text-sm font-semibold text-admin-ink">{DEMO_COPY.sampleNotice}</p>
          <p className="mt-1 text-sm text-admin-muted">{DEMO_COPY.sampleDescription}</p>
        </AdminCard>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <AdminCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">{DEMO_COPY.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-admin-ink">{DEMO_COPY.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-admin-muted">{DEMO_COPY.description}</p>

            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {DEMO_METRICS.map((metric) => <AdminMetric key={metric.label} {...metric} />)}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Next step</p>
            <h2 className="mt-2 text-lg font-semibold text-admin-ink">Connect your studio</h2>
            <p className="mt-3 text-sm leading-6 text-admin-muted">When onboarding is ready, an operator can connect this account to the correct studio workspace.</p>
          </AdminCard>
        </section>
      </AdminShell>
    </main>
  )
}
