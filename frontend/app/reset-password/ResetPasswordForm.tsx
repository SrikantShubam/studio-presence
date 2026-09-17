'use client'

import { useState, type FormEvent } from 'react'
import { AUTH_ERROR_MESSAGES, isValidPassword } from '@/lib/auth-policy'
import { authCallbackUrl } from '@/lib/platform-auth'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const supabase = createSupabaseBrowserClient()

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!isValidPassword(password)) {
      setError(AUTH_ERROR_MESSAGES['password-too-short'] ?? 'Choose a longer password.')
      return
    }
    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setPending(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setPending(false)
      setError('Unable to reset the password. Request a fresh recovery email and try again.')
      return
    }

    const { error: revokeError } = await supabase.auth.signOut({ scope: 'others' })
    if (revokeError) {
      setPending(false)
      setError('Your password was saved, but we could not finish securing the session. Sign in again.')
      return
    }
    await supabase.auth.refreshSession()
    window.location.replace(authCallbackUrl(window.location.origin))
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="text-sm font-medium text-admin-ink">New password</label>
        <input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 rounded-lg border border-admin-border bg-admin-bg px-4 text-base text-admin-ink outline-none focus:border-admin-primary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password-confirmation" className="text-sm font-medium text-admin-ink">Confirm new password</label>
        <input id="new-password-confirmation" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="min-h-12 rounded-lg border border-admin-border bg-admin-bg px-4 text-base text-admin-ink outline-none focus:border-admin-primary" />
      </div>
      {error && <p className="rounded-lg border border-admin-alert bg-admin-alert-soft px-3 py-2 text-sm font-medium text-admin-alert">{error}</p>}
      <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-admin-primary px-4 text-base font-semibold text-admin-on-primary disabled:opacity-60">{pending ? 'Saving…' : 'Save password'}</button>
    </form>
  )
}
