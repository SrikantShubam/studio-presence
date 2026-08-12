'use client'

import { useEffect, useState } from 'react'

/**
 * Light/dark switch for the admin screens.
 *
 * Three states, not two: "no choice yet" is distinct from light and dark, and
 * follows the operating system. Only once the owner actually presses this does
 * a choice get written to localStorage and stamped on <html>, which is what the
 * `[data-admin-theme]` rules in globals.css key off. Until then the CSS media
 * query decides and this component simply reports what the OS picked.
 *
 * The theme is NOT read during render. The server has no way to know it, so
 * doing that would hydrate light-then-flip. Instead the inline script in
 * `layout.tsx` stamps the attribute before first paint, and this component only
 * catches up in an effect — hence the null state and the reserved-size button.
 */

type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'admin-theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // Private mode / storage disabled. Fall through to the OS preference.
    }

    if (stored === 'dark' || stored === 'light') {
      setTheme(stored)
      return
    }

    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.adminTheme = next

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Preference just won't survive a reload. The page itself still switches.
    }
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={theme === null}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-admin-border bg-admin-surface text-admin-muted transition-colors hover:border-admin-primary hover:text-admin-primary"
    >
      {theme === null ? <span className="block h-5 w-5" /> : isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M20 13.4A8.4 8.4 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4z" />
    </svg>
  )
}
