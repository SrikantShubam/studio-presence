'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Magic-link sign-in, per docs/product/prompts/admin-universal/01-login.md.
 *
 * No password field, ever — AGENTS.md and the design brief both say so, for the
 * same reason: this user is not going to remember one, and a reset flow is a
 * support ticket we would rather not own.
 *
 * `emailRedirectTo` is built from `window.location.origin` rather than a fixed
 * env var, because it must point back at THIS tenant's subdomain
 * (ashish.vectorveda.online/auth/callback), and that host is only known in the
 * browser. The callback route lives at (admin)/auth/callback and resolves the
 * tenant itself once a session exists.
 */

const RESEND_SECONDS = 30

type Props = {
  whatsappHref: string | null
}

export function LoginForm({ whatsappHref }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const supabase = useRef(createSupabaseBrowserClient()).current

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function sendLink(targetEmail: string) {
    setStatus('sending')
    setError(null)

    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (sendError) {
      setStatus('error')
      setError('Something went wrong sending the link. Try again in a moment.')
      return
    }

    setStatus('sent')
    setCooldown(RESEND_SECONDS)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    void sendLink(email.trim())
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-base text-admin-ink">Check your email.</p>
          <p className="text-base text-admin-ink">
            We sent a link to <span className="font-semibold">{email}</span>.
          </p>
        </div>
        <p className="text-sm text-admin-muted">The link works for 15 minutes.</p>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={() => void sendLink(email)}
            className="text-left text-sm font-medium text-admin-primary disabled:text-admin-muted disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus('idle')
              setCooldown(0)
            }}
            className="text-left text-sm font-medium text-admin-muted"
          >
            Use a different email
          </button>
        </div>

        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="pt-2 text-sm text-admin-muted underline"
          >
            Trouble signing in? Message us on WhatsApp
          </a>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-admin-ink">
          Email address
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-4 text-base text-admin-ink outline-none focus:border-admin-primary"
        />
      </div>

      {error && <p className="text-sm text-admin-alert">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-surface disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
      </button>

      <p className="text-sm text-admin-muted">We&rsquo;ll send you a link. No password to remember.</p>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="pt-2 text-sm text-admin-muted underline"
        >
          Trouble signing in? Message us on WhatsApp
        </a>
      )}
    </form>
  )
}
