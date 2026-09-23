'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { authCallbackUrl } from '@/lib/platform-auth'

export function InvitationEntry({ token, tenantSlug, studioName, logoUrl }: { token: string; tenantSlug?: string; studioName?: string; logoUrl?: string | null }) {
  const [status, setStatus] = useState<'idle' | 'opening' | 'error'>('idle')
  const nextPath = tenantSlug ? `/invite/${token}?tenant=${encodeURIComponent(tenantSlug)}` : `/invite/${token}`
  const authenticatedNextPath = withAuthenticatedInvite(nextPath)

  async function continueWithGoogle() {
    setStatus('opening')
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authCallbackUrl(window.location.origin, { next: authenticatedNextPath }),
      },
    })
    if (error) setStatus('error')
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-admin-bg px-5 text-admin-ink">
      <section className="w-full max-w-md border border-admin-border bg-admin-surface p-6 sm:p-8">
        <div className="flex items-center gap-3">
          {logoUrl ? <img src={logoUrl} alt="" className="size-12 rounded-lg border border-admin-border object-contain" /> : null}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-admin-primary">Private workspace</p>
            {studioName ? <p className="mt-1 text-sm font-semibold text-admin-ink">{studioName}</p> : null}
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Your place in the studio</h1>
        <p className="mt-3 text-sm leading-6 text-admin-muted">A considered invitation is waiting for you. Continue with the account that received it.</p>
        <div className="mt-7 grid gap-3">
          <button
            type="button"
            disabled={status === 'opening'}
            onClick={() => void continueWithGoogle()}
            className="min-h-12 rounded-full bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary disabled:opacity-60"
          >
            {status === 'opening' ? 'Opening…' : 'Continue with Google'}
          </button>
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-admin-border bg-admin-bg px-4 text-sm font-semibold text-admin-ink"
          >
            Continue with email
          </Link>
        </div>
        {status === 'error' && <p className="mt-4 text-sm text-admin-alert">Google is unavailable. Continue with email.</p>}
      </section>
    </main>
  )
}

export function InvitationSessionReset({ token, tenantSlug, studioName, logoUrl, email }: { token: string; tenantSlug?: string; studioName?: string; logoUrl?: string | null; email: string }) {
  const [error, setError] = useState<string | null>(null)
  const nextPath = tenantSlug ? `/invite/${token}?tenant=${encodeURIComponent(tenantSlug)}` : `/invite/${token}`

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    void supabase.auth.signOut().then(({ error: signOutError }) => {
      if (signOutError) {
        setError('We could not switch accounts automatically. Sign out and open the invitation again.')
        return
      }
      window.location.replace(nextPath)
    })
  }, [nextPath])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-admin-bg px-5 text-admin-ink">
      <section className="w-full max-w-md border border-admin-border bg-admin-surface p-6 sm:p-8">
        <div className="flex items-center gap-3">
          {logoUrl ? <img src={logoUrl} alt="" className="size-12 rounded-lg border border-admin-border object-contain" /> : null}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-admin-primary">Switching accounts</p>
            {studioName ? <p className="mt-1 text-sm font-semibold text-admin-ink">{studioName}</p> : null}
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-semibold">This invitation is for another account.</h1>
        <p className="mt-3 text-sm leading-6 text-admin-muted">You are currently signed in as {email}. We are signing out this browser session so you can join with the invited email address.</p>
        {error && <p className="mt-4 text-sm text-admin-alert">{error}</p>}
      </section>
    </main>
  )
}

function withAuthenticatedInvite(nextPath: string): string {
  const query = nextPath.includes('?') ? '&' : '?'
  return `${nextPath}${query}auth=1`
}