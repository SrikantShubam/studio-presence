import Link from 'next/link'
import { rootDomain } from '@/lib/platform-domain'

export default function PlatformHomePage() {
  const ashishLoginUrl = `https://ashish.${rootDomain()}/login`

  return (
    <main className="min-h-screen bg-admin-bg px-4 py-10 text-admin-ink">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl flex-col justify-center gap-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-muted">
            Studio Presence
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your website dashboard is ready for review.
          </h1>
          <p className="mt-4 text-base leading-7 text-admin-muted">
            Sign in to open your dashboard, review enquiries, and launch the public site preview for your studio.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-admin-primary px-5 text-base font-semibold text-admin-on-primary"
          >
            Sign in
          </Link>
          <a
            href={ashishLoginUrl}
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-admin-border bg-admin-surface px-5 text-base font-semibold text-admin-ink"
          >
            Open Ashish login
          </a>
        </div>
      </section>
    </main>
  )
}
