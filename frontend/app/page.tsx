import Link from 'next/link'

import { PLATFORM_BRAND } from '@/lib/platform-brand'
import { PLATFORM_HOME_COPY } from '@/lib/platform-home'

export default function PlatformHomePage() {
  return (
    <main className="min-h-screen bg-admin-bg text-admin-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <p className="text-sm font-semibold tracking-tight">{PLATFORM_BRAND}</p>
        <Link
          href="/login"
          className="rounded-md border border-admin-border px-4 py-2 text-sm font-semibold text-admin-ink transition hover:bg-admin-surface"
        >
          {PLATFORM_HOME_COPY.primaryAction}
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-muted">{PLATFORM_HOME_COPY.eyebrow}</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-admin-ink sm:text-6xl">
            {PLATFORM_HOME_COPY.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-admin-muted">{PLATFORM_HOME_COPY.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-md bg-admin-primary px-5 py-3 text-sm font-semibold text-admin-primary-ink transition hover:opacity-90"
            >
              {PLATFORM_HOME_COPY.primaryAction}
            </Link>
            <Link
              href="/login?next=%2Fdemo"
              className="rounded-md border border-admin-border px-5 py-3 text-sm font-semibold text-admin-ink transition hover:bg-admin-surface"
            >
              {PLATFORM_HOME_COPY.secondaryAction}
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-admin-border bg-admin-surface p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-muted">{PLATFORM_BRAND}</p>
          <div className="mt-8 space-y-4">
            {[PLATFORM_HOME_COPY.featureOne, PLATFORM_HOME_COPY.featureTwo, PLATFORM_HOME_COPY.featureThree].map((feature, index) => (
              <div key={feature} className="flex items-start gap-4 border-b border-admin-border pb-4 last:border-b-0 last:pb-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-admin-primary-soft text-sm font-semibold text-admin-ink">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-admin-ink">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
