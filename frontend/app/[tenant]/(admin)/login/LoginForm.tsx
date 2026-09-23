'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { AUTH_ERROR_MESSAGES, isValidPassword } from '@/lib/auth-policy'
import { authCallbackUrl } from '@/lib/platform-auth'

const RESEND_SECONDS = 30

function messageForAuthError(error: { status?: number; message?: string }, signup: boolean): string {
  if (error.status === 429) return 'Too many requests. Wait a few minutes, then try again.'
  if (error.message?.toLowerCase().includes('password')) {
    return AUTH_ERROR_MESSAGES['password-too-short'] ?? 'Choose a longer password.'
  }
  return signup ? 'Unable to create an account with those details.' : (AUTH_ERROR_MESSAGES['invalid-credentials'] ?? 'Unable to sign in with those details.')
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

type CompletedFlow = 'signup' | 'recovery'

export function LoginForm({ whatsappHref, tenant, nextPath }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [status, setStatus] = useState<'idle' | 'oauth' | 'submitting' | 'sent' | 'error'>('idle')
  const isInvite = Boolean(nextPath?.startsWith('/invite/'))
  const [intent, setIntent] = useState<'signin' | 'signup'>('signin')
  const [emailOpen, setEmailOpen] = useState(isInvite)
  const [completedFlow, setCompletedFlow] = useState<CompletedFlow>('signup')
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const supabase = useRef(createSupabaseBrowserClient()).current

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!active || !data.session) return
      window.location.replace(authCallbackUrl(window.location.origin, { tenant, next: nextPath }))
    })
    return () => {
      active = false
    }
  }, [nextPath, supabase, tenant])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  function confirmationUrl() {
    return authCallbackUrl(window.location.origin, {
      path: '/auth/confirm',
      tenant,
      next: nextPath,
    })
  }

  async function signIn() {
    setStatus('submitting')
    setError(null)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError || !data.session) {
      setStatus('error')
      setError(messageForAuthError(signInError ?? { message: 'No session' }, false))
      return
    }
    window.location.replace(authCallbackUrl(window.location.origin, { tenant, next: nextPath }))
  }

  async function signUp() {
    if (!isValidPassword(password)) {
      setStatus('error')
      setError(AUTH_ERROR_MESSAGES['password-too-short'] ?? 'Choose a longer password.')
      return
    }
    if (password !== confirmation) {
      setStatus('error')
      setError('Passwords do not match.')
      return
    }

    setStatus('submitting')
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: confirmationUrl() },
    })
    if (signUpError) {
      setStatus('error')
      setError(messageForAuthError(signUpError, true))
      return
    }
    if (data.session) {
      window.location.replace(authCallbackUrl(window.location.origin, { tenant, next: nextPath }))
      return
    }
    setCompletedFlow('signup')
    setStatus('sent')
    setCooldown(RESEND_SECONDS)
  }

  async function requestRecovery() {
    setStatus('submitting')
    setError(null)
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authCallbackUrl(window.location.origin, { path: '/auth/recovery' }),
    })
    if (recoveryError) {
      setStatus('error')
      setError(recoveryError.status === 429 ? 'Too many requests. Wait a few minutes, then try again.' : (AUTH_ERROR_MESSAGES['recovery-sent'] ?? 'If an account exists for that email, recovery instructions are on the way.'))
      return
    }
    setCompletedFlow('recovery')
    setStatus('sent')
    setCooldown(RESEND_SECONDS)
  }

  async function continueWithGoogle() {
    setStatus('oauth')
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: authCallbackUrl(window.location.origin, { tenant, next: nextPath }) },
    })
    if (oauthError) {
      setStatus('error')
      setError(messageForOAuthError(oauthError))
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    if (intent === 'signup') void signUp()
    else void signIn()
  }

  function resetForm() {
    setStatus('idle')
    setError(null)
    setCooldown(0)
  }

  if (status === 'sent') {
    const isRecovery = completedFlow === 'recovery'
    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xl font-semibold text-admin-ink">Check your email.</p>
          <p className="text-base text-admin-ink">
            {isRecovery ? 'If an account exists for that email, recovery instructions are on the way.' : 'Confirm your email to finish creating your account.'}
          </p>
        </div>
        <p className="text-sm text-admin-muted">The link is single-use. Open it in this same browser.</p>
        <button type="button" disabled={cooldown > 0} onClick={() => (isRecovery ? void requestRecovery() : void signUp())} className="text-left text-sm font-medium text-admin-primary disabled:cursor-not-allowed disabled:text-admin-muted">
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
        </button>
        <button type="button" onClick={resetForm} className="text-left text-sm font-medium text-admin-muted">Use a different email</button>
        {whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="pt-2 text-sm text-admin-muted underline">Trouble signing in? Message us on WhatsApp</a>}
      </div>
    )
  }

  const isSignup = intent === 'signup'

  return (
    <div className="flex flex-col gap-5">
      <button type="button" disabled={status === 'oauth'} onClick={() => void continueWithGoogle()} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-admin-primary px-4 text-base font-semibold text-admin-on-primary disabled:opacity-60">
        <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-admin-on-primary text-sm font-bold text-admin-primary">G</span>
        {status === 'oauth' ? 'Opening Google…' : 'Continue with Google'}
      </button>

      <div className="grid grid-cols-2 rounded-full border border-admin-border bg-admin-bg p-1">
        <button type="button" aria-pressed={intent === 'signin'} onClick={() => { setIntent('signin'); resetForm() }} className={intent === 'signin' ? 'min-h-10 rounded-full bg-admin-surface text-sm font-semibold text-admin-ink' : 'min-h-10 rounded-full text-sm font-semibold text-admin-muted'}>Sign in</button>
        <button type="button" aria-pressed={intent === 'signup'} onClick={() => { setIntent('signup'); resetForm() }} className={intent === 'signup' ? 'min-h-10 rounded-full bg-admin-surface text-sm font-semibold text-admin-ink' : 'min-h-10 rounded-full text-sm font-semibold text-admin-muted'}>Create account</button>
      </div>

      <button type="button" onClick={() => setEmailOpen((open) => !open)} className="flex min-h-11 items-center justify-between rounded-lg border border-admin-border bg-admin-bg px-4 text-sm font-semibold text-admin-ink">
        <span>Use email and password</span>
        <span className="text-admin-muted">{emailOpen ? 'Close' : 'Open'}</span>
      </button>

      {emailOpen && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-admin-border bg-admin-bg p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-admin-ink">Email address</label>
            <input id="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-4 text-base text-admin-ink outline-none focus:border-admin-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-admin-ink">Password</label>
            <input id="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-4 text-base text-admin-ink outline-none focus:border-admin-primary" />
          </div>
          {isSignup && <div className="flex flex-col gap-1.5"><label htmlFor="password-confirmation" className="text-sm font-medium text-admin-ink">Confirm password</label><input id="password-confirmation" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-4 text-base text-admin-ink outline-none focus:border-admin-primary" /></div>}

          {error && <p className="rounded-lg border border-admin-alert bg-admin-alert-soft px-3 py-2 text-sm font-medium text-admin-alert">{error}</p>}
          <button type="submit" disabled={status === 'submitting' || status === 'oauth'} className="min-h-12 rounded-full border border-admin-border bg-admin-surface px-4 text-base font-semibold text-admin-ink disabled:opacity-60">{status === 'submitting' ? 'Working…' : isSignup ? 'Create account' : 'Sign in with email'}</button>
          {!isSignup && <button type="button" disabled={!email.trim() || status === 'submitting'} onClick={() => void requestRecovery()} className="text-left text-sm font-medium text-admin-primary disabled:cursor-not-allowed disabled:text-admin-muted">Forgot password?</button>}
          <p className="text-sm text-admin-muted">Use at least 12 characters. We never create a studio or grant access during signup.</p>
        </form>
      )}

      {error && !emailOpen && <p className="rounded-lg border border-admin-alert bg-admin-alert-soft px-3 py-2 text-sm font-medium text-admin-alert">{error}</p>}
      {whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-sm text-admin-muted underline">Trouble signing in? Message us on WhatsApp</a>}
    </div>
  )
}
