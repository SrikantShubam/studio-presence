import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  AuthError,
  ConfigError,
  requireTenant,
  type ClientConfig,
} from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { loadPublicTenantConfig, loadTenantWorkspaceConfig } from '@/lib/tenant-config'
import { signOut } from '../actions'
import { ThemeToggle } from '../ThemeToggle'
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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthenticated = Boolean(user?.email && session)

  let branding: ClientConfig | null = null

  if (isAuthenticated && user?.email && session) {
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

    if (tenantContext.tenant.slug !== tenantSlug) {
      return (
        <TenantMismatchNotice
          userEmail={user.email ?? ''}
          currentSlug={tenantContext.tenant.slug}
          targetSlug={tenantSlug}
        />
      )
    }

    try {
      branding = await loadTenantWorkspaceConfig(
        tenantContext.tenant.slug,
        tenantContext.tenant.id,
        session.access_token,
      )
    } catch (e) {
      if (e instanceof ConfigError) return <ProvisioningGap message="This site's config is invalid." />
      throw e
    }
  } else {
    // Unauthenticated visit: allow demo preview if the tenant is a demo studio
    try {
      branding = await loadPublicTenantConfig(tenantSlug)
    } catch {
      branding = null
    }

    if (!branding || branding.status !== 'demo') {
      redirect(`/login?next=/${encodeURIComponent(tenantSlug)}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-ink lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-admin-border bg-admin-surface px-5 py-6 lg:flex lg:flex-col">
        <div className="flex min-w-0 items-center gap-3">
          {branding.brand.logo ? (
            <Image src={branding.brand.logo} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-primary text-xs font-bold text-admin-on-primary" aria-hidden="true">
              {initialsFor(branding.business.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-admin-ink">{branding.business.name}</p>
          </div>
        </div>

        <div className="mt-8">
          <DashboardTabs orientation="side" />
        </div>

        <div className="mt-auto border-t border-admin-border pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-admin-muted">Workspace</p>
          <p className="mt-2 text-sm leading-6 text-admin-muted">Manage enquiries, update the public site, and review visitor signals.</p>
          <Link
            href={'/' + tenantSlug}
            target="_blank"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-admin-border px-3 text-sm font-semibold text-admin-ink transition-colors motion-reduce:transition-none hover:border-admin-primary hover:text-admin-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-admin-surface"
          >
            Open public site
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-admin-border bg-admin-surface px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                {branding.brand.logo ? (
                  <Image src={branding.brand.logo} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-primary text-[0.65rem] font-bold text-admin-on-primary" aria-hidden="true">
                    {initialsFor(branding.business.name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-admin-ink">{branding.business.name}</p>
                </div>
              </div>

              <div className="hidden min-w-0 lg:block" aria-hidden="true" />

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <ThemeToggle />
                {isAuthenticated && user?.email ? (
                  <>
                    <span className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-admin-border bg-admin-raised text-sm font-semibold text-admin-ink" aria-label={`Signed in as ${user.email}`}>
                      {initialsFor(user.email)}
                    </span>
                    <form action={signOut}>
                      <button type="submit" className="min-h-11 rounded-lg px-2 text-sm font-medium text-admin-muted transition-colors motion-reduce:transition-none hover:bg-admin-raised hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary">
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="hidden min-h-11 items-center justify-center rounded-lg border border-admin-border bg-admin-raised px-2.5 text-xs font-semibold uppercase tracking-wider text-admin-muted sm:inline-flex">
                      Demo
                    </span>
                    <Link
                      href={`/login?next=/${encodeURIComponent(tenantSlug)}/dashboard`}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-admin-primary px-3 text-sm font-semibold text-admin-on-primary transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary"
                    >
                      Sign in
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-1 lg:hidden">
              <DashboardTabs orientation="top" />
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}

function initialsFor(value: string): string {
  const email = value.includes('@') ? value : value.replace(/\s+/g, '.')
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
      <div className="w-full max-w-sm rounded-xl border border-admin-border bg-admin-surface p-6">
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

function TenantMismatchNotice({
  userEmail,
  currentSlug,
  targetSlug,
}: {
  userEmail: string
  currentSlug: string
  targetSlug: string
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-md rounded-xl border border-admin-border bg-admin-surface p-6">
        <h1 className="mb-2 text-lg font-semibold text-admin-ink">Different workspace</h1>
        <p className="mb-4 text-sm text-admin-muted">
          You are signed in as <span className="font-medium text-admin-ink">{userEmail}</span>, which is linked to{' '}
          <span className="font-medium text-admin-ink">{currentSlug}</span>, but requested workspace{' '}
          <span className="font-medium text-admin-ink">{targetSlug}</span>.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/${currentSlug}/dashboard`}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary"
          >
            Go to your studio dashboard
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-admin-border px-4 text-sm font-semibold text-admin-ink"
            >
              Sign out to switch account
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
