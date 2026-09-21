'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'admin-theme'

export const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='dark'||t==='light'){document.documentElement.dataset.adminTheme=t}}catch(e){}})()`

type ThemePreference = 'light' | 'dark'

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('dark')

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // Storage may be unavailable in a private browser context.
    }
    setPreference(themePreferenceFromStorage(stored))
  }, [])

  function changePreference(next: ThemePreference) {
    setPreference(next)
    document.documentElement.dataset.adminTheme = next
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage may be unavailable in a private browser context.
    }
  }

  const switchToLight = preference === 'dark'
  return (
    <button
      type="button"
      aria-label={switchToLight ? 'Switch to light theme' : 'Switch to dark theme'}
      title={switchToLight ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => changePreference(switchToLight ? 'light' : 'dark')}
      className="inline-flex size-11 items-center justify-center border border-admin-border bg-admin-bg text-admin-ink hover:bg-admin-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary"
    >
      {switchToLight ? <Sun aria-hidden="true" className="size-4" /> : <Moon aria-hidden="true" className="size-4" />}
    </button>
  )
}

function themePreferenceFromStorage(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark') return value
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}