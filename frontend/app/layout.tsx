import type { ReactNode } from 'react'
import './globals.css'

/**
 * Root layout.
 *
 * Deliberately thin — it knows nothing about any tenant. Tenant-scoped chrome and
 * token injection live in `app/[tenant]/layout.tsx`, because middleware rewrites
 * every request to `/[tenant]/...` and that is the first place a slug exists.
 *
 * `suppressHydrationWarning` is on <html> because the tenant layer sets style
 * attributes there, and on <body> because browser extensions (Grammarly, etc.)
 * inject attributes before React hydrates. That mismatch is expected and not ours.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
