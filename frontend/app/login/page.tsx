import { ThemeToggle } from '../[tenant]/(admin)/ThemeToggle'
import { LoginForm } from '../[tenant]/(admin)/login/LoginForm'
import { AUTH_ERROR_MESSAGES } from '@/lib/auth-messages'
import { PLATFORM_BRAND } from '@/lib/platform-brand'

const PLATFORM_LOGIN_COPY = {
  eyebrow: 'Universal access',
  title: 'Access your Studio Presence workspace.',
  description: 'Use Google or a one-time email link. Your studio workspace is selected after we verify your account.',
  demoLabel: 'Platform demo',
  demoTitle: 'Explore the product before your studio is connected.',
  demoDescription: 'Unlinked accounts enter a clearly labelled demo with local-only sample content. Real studio data remains membership-gated.',
}

export default async function PlatformLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error: errorCode, next } = await searchParams

  return (
    <main className="min-h-screen bg-admin-bg px-4 py-5 text-admin-ink lg:flex lg:items-center lg:justify-center">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-lg border border-admin-border bg-admin-surface lg:min-h-[40rem] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex min-h-[32rem] flex-col justify-between border-b border-admin-border bg-admin-primary-soft p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-admin-ink">{PLATFORM_BRAND}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-admin-muted">{PLATFORM_LOGIN_COPY.demoLabel}</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="my-10 max-w-xl">
            <h2 className="text-4xl font-semibold leading-tight text-admin-ink sm:text-5xl">{PLATFORM_LOGIN_COPY.demoTitle}</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-admin-muted">{PLATFORM_LOGIN_COPY.demoDescription}</p>
          </div>

          <div className="grid max-w-md grid-cols-3 gap-2 text-xs">
            <div className="rounded border border-admin-border bg-admin-bg/70 p-3"><p className="font-semibold text-admin-ink">Preview</p><p className="mt-1 text-admin-muted">local edits</p></div>
            <div className="rounded border border-admin-border bg-admin-bg/70 p-3"><p className="font-semibold text-admin-ink">Verify</p><p className="mt-1 text-admin-muted">your email</p></div>
            <div className="rounded border border-admin-border bg-admin-bg/70 p-3"><p className="font-semibold text-admin-ink">Connect</p><p className="mt-1 text-admin-muted">when ready</p></div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">{PLATFORM_LOGIN_COPY.eyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-admin-ink">{PLATFORM_LOGIN_COPY.title}</h1>
              <p className="mt-3 text-sm leading-6 text-admin-muted">{PLATFORM_LOGIN_COPY.description}</p>
            </div>

            {errorCode && AUTH_ERROR_MESSAGES[errorCode] && (
              <p className="mb-4 rounded-lg border border-admin-alert bg-admin-alert-soft px-3 py-2 text-sm font-medium text-admin-alert">
                {AUTH_ERROR_MESSAGES[errorCode]}
              </p>
            )}

            <LoginForm whatsappHref={null} nextPath={next} />
          </div>
        </section>
      </div>
    </main>
  )
}
