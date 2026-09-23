'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { authCallbackUrl } from '@/lib/platform-auth'

export function InvitationEntry({ token }: { token: string }) {
  const [status, setStatus] = useState<'idle' | 'opening' | 'error'>('idle')
  const nextPath = `/invite/${token}`

  async function continueWithGoogle() {
    setStatus('opening')
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authCallbackUrl(window.location.origin, { next: nextPath }),
      },
    })
    if (error) setStatus('error')
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-admin-bg px-5 text-admin-ink">
      <section className="w-full max-w-md border border-admin-border bg-admin-surface p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-admin-primary">Private workspace</p>
        <h1 className="mt-3 text-3xl font-semibold">Your place in the studio</h1>
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