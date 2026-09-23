import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NO_FLASH_SCRIPT } from './ThemeToggle'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      {children}
    </>
  )
}
