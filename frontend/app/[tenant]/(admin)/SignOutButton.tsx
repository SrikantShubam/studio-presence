'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const [pending, setPending] = useState(false)

  async function signOut() {
    if (pending) return
    setPending(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.assign('/login')
  }

  return (
    <button type="button" onClick={() => void signOut()} disabled={pending} className="min-h-12 rounded-lg px-2 text-sm font-medium text-admin-muted disabled:opacity-60">
      {pending ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
