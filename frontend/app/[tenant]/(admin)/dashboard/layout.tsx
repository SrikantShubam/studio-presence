import type { ReactNode } from 'react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  AuthError,
  canAccessDashboard,
  ConfigError,
  loadClientConfig,
  requireTenant,
} from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { signOut } from '../actions'
import { DashboardTabs } from './DashboardTabs'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  let tenantContext
  try {
    tenantContext = await requireTenant({
      id: user.id,
      email: user.email,
      accessToken: session.access_token,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return <ProvisioningGap message={e.message} />
    }
    throw e
  }

  let branding
  try {
    branding = loadClientConfig(tenantContext.tenant.slug)
  } catch (e) {
    if (e instanceof ConfigError) return <ProvisioningGap message="This site's config is invalid." />
    throw e
  }

  if (branding.slug !== tenantSlug) {
    redirect('/login')
  }

  if (!canAccessDashboard(tenantContext.tenant)) {
    redirect('/panel')
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-ink">
      <header className="border-b border-admin-border bg-admin-surface px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {branding.brand.logo && (
              <Image src={branding.brand.logo} alt="" width={24} height={24} className="rounded" />
            )}
            <span className="truncate text-sm font-medium text-admin-ink">{branding.business.name}</span>
          </div>

          <DashboardTabs />

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-admin-border bg-admin-bg text-sm font-semibold text-admin-ink">
              {initialsFor(user.email)}
            </span>
            <form action={signOut}>
              <button type="submit" className="min-h-12 rounded-lg px-2 text-sm font-medium text-admin-muted">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

function initialsFor(email: string): string {
  const name = email.split('@')[0] ?? ''
  const parts = name.split(/[._-]+/).filter(Boolean)
  const letters = (parts.length > 1 ? parts.slice(0, 2) : [name.slice(0, 2)])
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
  return letters || 'O'
}

function ProvisioningGap({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-admin-border bg-admin-surface p-6">
        <h1 className="mb-2 text-lg font-semibold text-admin-ink">Almost there</h1>
        <p className="mb-4 text-sm text-admin-muted">{message}</p>
        <form action={signOut}>
          <button type="submit" className="min-h-12 text-sm font-medium text-admin-primary">
            Sign out and try a different email
          </button>
        </form>
      </div>
    </main>
  )
}
