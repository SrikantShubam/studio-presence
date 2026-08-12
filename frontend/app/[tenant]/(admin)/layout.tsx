import type { ReactNode } from 'react'

/**
 * Shared shell for every admin route — panel, dashboard, login.
 *
 * Its only job is the theme. The dashboard and panel keep their own layouts for
 * chrome and auth; this sits above both so a single copy of the no-flash script
 * covers all of them, including the login screen, which has no layout of its own.
 *
 * WHY AN INLINE SCRIPT: the stored theme lives in localStorage, which the server
 * cannot read. Without this, every dark-mode load would paint light first and
 * then snap — the flash is worst on the login screen, which is the first thing
 * an owner ever sees. Running it here, before the admin markup streams, sets the
 * attribute ahead of first paint. It deliberately does nothing when no choice
 * has been stored: the `prefers-color-scheme` block in globals.css handles that
 * case, so the OS preference is honoured without any JavaScript at all.
 */

const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('admin-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.adminTheme=t}}catch(e){}})()`

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      {children}
    </>
  )
}
