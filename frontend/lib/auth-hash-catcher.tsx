'use client'

import { useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Confirm-email links sometimes land on `/` with a hash session
 * (`#access_token=...`) instead of `/auth/callback?code=`. Pick that up and
 * send the owner into `/admin`.
 */
export function AuthHashCatcher() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('access_token') && !hash.includes('refresh_token')) return

    const supabase = createSupabaseBrowserClient()
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace('/admin')
    })
  }, [])

  return null
}
