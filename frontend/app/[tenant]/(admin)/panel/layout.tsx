import type { ReactNode } from 'react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { loadClientConfig, requireTenant, AuthError, ConfigError } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { signOut } from '../actions'

/**
 * The panel's auth gate.
 *
 * Every route under (admin)/panel passes through here first. Two failure modes,
 * handled differently on purpose:
 *
 *   - no session at all           → straight back to /login. The owner just
 *                                    needs to sign in; nothing to explain.
 *   - session, but requireTenant
 *     throws (AuthError)          → render an explanatory screen with a way
 *                                    out. This is a provisioning gap on our
 *                                    side, not something the owner did wrong,
 *                                    and a hard redirect back to /login would
 *                                    put them in a loop with no way to escape.
 *
 * Chrome here is deliberately minimal — logo, studio name, sign out. The full
 * client-panel design (docs/product/prompts/admin-universal/02-client-panel.md)
 * is its own ticket; this is only the gate everything else sits behind.
 */

export default async function PanelLayout({
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

  // Belt and braces: requireTenant resolves membership from the database, but
  // the URL slug and the resolved tenant should always agree. If they don't,
  // something upstream (the tenant map, a stale cookie) is inconsistent, and
  // rendering anyway risks showing one studio's panel under another's URL.
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

  return (
    <div className="min-h-screen bg-admin-bg">
      <header className="flex items-center justify-between border-b border-admin-border bg-admin-surface px-4 py-3">
        <div className="flex items-center gap-2">
          {branding.brand.logo && (
            <Image src={branding.brand.logo} alt="" width={24} height={24} className="rounded" />
          )}
          <span className="text-sm font-medium text-admin-ink">{branding.business.name}</span>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm font-medium text-admin-muted">
            Sign out
          </button>
        </form>
      </header>
      <main>{children}</main>
    </div>
  )
}

function ProvisioningGap({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-admin-border bg-admin-surface p-6">
        <h1 className="mb-2 text-lg font-semibold text-admin-ink">Almost there</h1>
        <p className="mb-4 text-sm text-admin-muted">{message}</p>
        <form action={signOut}>
          <button type="submit" className="text-sm font-medium text-admin-primary">
            Sign out and try a different email
          </button>
        </form>
      </div>
    </main>
  )
}
