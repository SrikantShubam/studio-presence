import { headers } from 'next/headers'
import { AdminCard } from '../../components'

const ALLOWED_TYPES = new Set(['email', 'signup', 'recovery', 'invite'])

function originFromHeaders(host: string | null, proto: string | null) {
  return `${proto ?? 'http'}://${host ?? 'localhost:3000'}`
}

export default async function ConfirmAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string; token_hash?: string; type?: string }>
}) {
  const { redirect_to: redirectTo, token_hash: tokenHash, type } = await searchParams
  const headerStore = await headers()
  const origin = originFromHeaders(
    headerStore.get('x-forwarded-host') ?? headerStore.get('host'),
    headerStore.get('x-forwarded-proto'),
  )

  let finishHref = `${origin}/login?error=auth-invalid`
  if (redirectTo && tokenHash) {
    try {
      const target = new URL(redirectTo)
      if (target.origin === origin) {
        target.searchParams.set('token_hash', tokenHash)
        target.searchParams.set('type', ALLOWED_TYPES.has(type ?? '') ? type ?? 'email' : 'email')
        finishHref = target.toString()
      }
    } catch {
      finishHref = `${origin}/login?error=auth-invalid`
    }
  }

  return (
    <main className="min-h-screen bg-admin-bg px-4 py-6 text-admin-ink sm:flex sm:items-center sm:justify-center">
      <AdminCard className="mx-auto flex w-full max-w-md flex-col gap-5 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Secure sign-in</p>
          <h1 className="mt-2 text-2xl font-semibold text-admin-ink">Finish signing in</h1>
          <p className="mt-3 text-sm leading-6 text-admin-muted">
            This extra step protects your one-time link from email scanners. Continue only if you requested access.
          </p>
        </div>
        <a
          href={finishHref}
          className="flex min-h-12 items-center justify-center rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-on-primary"
        >
          Finish sign-in
        </a>
      </AdminCard>
    </main>
  )
}
