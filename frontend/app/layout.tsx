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
 * attributes there; without it React complains about a mismatch that is expected
 * and correct.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
