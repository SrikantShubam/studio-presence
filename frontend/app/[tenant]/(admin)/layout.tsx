import type { ReactNode } from 'react'
import { NO_FLASH_SCRIPT } from './ThemeToggle'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      {children}
    </>
  )
}
