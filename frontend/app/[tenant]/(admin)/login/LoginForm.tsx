'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { authCallbackUrl } from '@/lib/platform-auth'

/**
 * Supabase sign-in, per docs/product/prompts/admin-universal/01-login.md.
 *
 * No password field, ever — AGENTS.md and the design brief both say so, for the
 * same reason: this user is not going to remember one, and a reset flow is a
 * support ticket we would rather not own.
 *
 * `emailRedirectTo` uses the configured canonical auth origin when available.
 * This matters on Vercel: a link created on one temporary deployment must not
 * return to a different deployment where the PKCE verifier cookie does not
 * exist. A tenant is carried as a hint only; membership is resolved server-side.
 */

const RESEND_SECONDS = 30

function messageForSendError(error: { code?: string; status?: number; message?: string }) {
  if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
    return 'Too many sign-in emails were requested. Wait a few minutes, then request one fresh link.'
  }
  return 'Something went wrong sending the link. Try again in a moment.'
}

function messageForOAuthError(error: { message?: string }) {
  if (error.message?.toLowerCase().includes('provider')) {
    return 'Google sign-in is not enabled for this Supabase project yet.'
  }
  return 'Something went wrong starting Google sign-in. Try again in a moment.'
}

type Props = {
  whatsappHref: string | null
  tenant?: string
  nextPath?: string
}

export function LoginForm({ whatsappHref, tenant, nextPath }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'oauth' | 'sending' | 'sent' | 'error'>('idle')
  const [intent, setIntent] = useState<'signin' | 'signup'>('signin')
  const [emailOpen, setEmailOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const supabase = useRef(createSupabaseBrowserClient()).current

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!active || !data.session) return
      window.location.replace(
        authCallbackUrl(window.location.origin, process.env.NEXT_PUBLIC_AUTH_ORIGIN, {
          tenant,
          next: nextPath,
        }),
      )
    })
    return () => {
      active = false
    }
  }, [nextPath, supabase, tenant])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function sendLink(targetEmail: string) {
    setStatus('sending')
    setError(null)

    const callback = authCallbackUrl(window.location.origin, process.env.NEXT_PUBLIC_AUTH_ORIGIN, {
      tenant,
      next: nextPath,
    })

    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        emailRedirectTo: callback,
        // Email entry alone never creates an authenticated session. Supabase
        // creates or signs in the account only after the one-time link is used.
        shouldCreateUser: true,
      },
    })

    if (sendError) {
      setStatus('error')
      setError(messageForSendError(sendError))
      setEmailOpen(true)
      return
    }

    setStatus('sent')
    setCooldown(RESEND_SECONDS)
  }

  async function continueWithGoogle() {
    setStatus('oauth')
    setError(null)

    const callback = authCallbackUrl(window.location.origin, process.env.NEXT_PUBLIC_AUTH_ORIGIN, {
      tenant,
      next: nextPath,
    })

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callback,
      },
    })

    if (oauthError) {
      setStatus('error')
      setError(messageForOAuthError(oauthError))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    void sendLink(email.trim())
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xl font-semibold text-admin-ink">Check your email.</p>
          <p className="text-base text-admin-ink">
            We sent a link to <span className="font-semibold">{email}</span>.
          </p>
        </div>
        <p className="text-sm text-admin-muted">
          The link is single-use. Open it in this same browser to finish sign-in.
        </p>

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

  const isSignup = intent === 'signup'

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 rounded-full border border-admin-border bg-admin-bg p-1">
        <button
          type="button"
          aria-pressed={intent === 'signin'}
          onClick={() => setIntent('signin')}
          className={
            intent === 'signin'
              ? 'min-h-10 rounded-full bg-admin-surface text-sm font-semibold text-admin-ink'
              : 'min-h-10 rounded-full text-sm font-semibold text-admin-muted'
          }
        >
          Sign in
        </button>
        <button
          type="button"
          aria-pressed={intent === 'signup'}
          onClick={() => setIntent('signup')}
          className={
            intent === 'signup'
              ? 'min-h-10 rounded-full bg-admin-surface text-sm font-semibold text-admin-ink'
              : 'min-h-10 rounded-full text-sm font-semibold text-admin-muted'
          }
        >
          Create account
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold leading-tight text-admin-ink">
          {isSignup ? 'Create your preview account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-admin-muted">
          {isSignup
            ? 'Use Google for the fastest setup. Your account can try local edits before paid access is granted.'
            : 'Use Google to continue without waiting for another email link.'}
        </p>
      </div>

      <button
        type="button"
        disabled={status === 'oauth'}
        onClick={() => void continueWithGoogle()}
        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-admin-primary px-4 text-base font-semibold text-admin-on-primary disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full bg-admin-on-primary text-sm font-bold text-admin-primary"
        >
          G
        </span>
        {status === 'oauth' ? 'Opening Google…' : 'Continue with Google'}
      </button>

      {error && (
        <p className="rounded-lg border border-admin-alert bg-admin-alert-soft px-3 py-2 text-sm font-medium text-admin-alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setEmailOpen((open) => !open)}
        className="flex min-h-11 items-center justify-between rounded-lg border border-admin-border bg-admin-bg px-4 text-sm font-semibold text-admin-ink"
      >
        <span>Use email link instead</span>
        <span className="text-admin-muted">{emailOpen ? 'Close' : 'Open'}</span>
      </button>

      {emailOpen && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-admin-border bg-admin-bg p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-admin-ink">
              Gmail, work, or personal email
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

          <button
            type="submit"
            disabled={status === 'sending' || status === 'oauth'}
            className="min-h-12 rounded-full border border-admin-border bg-admin-surface px-4 text-base font-semibold text-admin-ink disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Continue with email'}
          </button>

          <p className="text-sm text-admin-muted">
            Email links can cool down during repeated testing. Entering an email alone does not grant access.
          </p>
        </form>
      )}

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-admin-muted underline"
        >
          Trouble signing in? Message us on WhatsApp
        </a>
      )}
    </div>
  )
}
