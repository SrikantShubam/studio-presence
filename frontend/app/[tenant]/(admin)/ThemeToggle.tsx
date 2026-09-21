'use client'

import { useEffect, useState } from 'react'
import { SunMoon } from 'lucide-react'

/**
 * System/light/dark theme preference for the admin screens.
 *
 * The system choice removes the explicit document override so the CSS media
 * query can follow the operating system. Light and dark stamp an explicit
 * attribute on <html>, which is what the `[data-admin-theme]` rules in
 * globals.css key off.
 *
 * The preference is NOT read during render. The server has no way to know it,
 * so doing that would hydrate light-then-flip. Instead the inline script in
 * `layout.tsx` stamps the attribute before first paint, and this component
 * catches up in an effect.
 */

type ThemePreference = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'admin-theme'

export const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='dark'||t==='light'){document.documentElement.dataset.adminTheme=t}}catch(e){}})()`

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system')

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // Private mode / storage disabled. Fall through to the OS preference.
    }

    setPreference(themePreferenceFromStorage(stored))
  }, [])

  function changePreference(next: ThemePreference) {
    setPreference(next)

    if (next === 'system') {
      document.documentElement.removeAttribute('data-admin-theme')
      try {
        window.localStorage.removeItem(THEME_STORAGE_KEY)
      } catch {
        // Storage disabled
      }
    } else {
      document.documentElement.dataset.adminTheme = next
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        // Storage disabled
      }
    }
  }

  return (
    <label className="flex min-h-11 items-center gap-2 text-xs font-medium text-admin-muted">
      <SunMoon aria-hidden="true" className="size-4" /><span className="sr-only">Theme</span>
      <select
        aria-label="Theme preference"
        value={preference}
        onChange={(event) => changePreference(event.target.value as ThemePreference)}
        className="min-h-11 rounded-none border border-admin-border bg-admin-surface px-2 text-sm font-medium text-admin-ink outline-none transition focus-visible:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary motion-reduce:transition-none"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  )
}

function themePreferenceFromStorage(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark') return value
  return 'system'
}
