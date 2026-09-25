import Image from 'next/image'
import { notFound } from 'next/navigation'
import { loadPublicClientConfig, ConfigError } from '@studio/backend'
import { ThemeToggle } from '../ThemeToggle'
import { LoginForm } from './LoginForm'
import { PLATFORM_BRAND } from '@/lib/platform-brand'
import { AUTH_ERROR_MESSAGES } from '@/lib/auth-messages'

/**
 * `/login`, serving both the panel and the dashboard.
 *
 * Per docs/product/prompts/admin-universal/01-login.md: one screen, one design,
 * for every client and every tier — only the branding (logo, studio name, this
 * tenant's WhatsApp number) is tenant-specific. Where the user lands AFTER
 * signing in depends on tier, decided in auth/callback/route.ts, not here.
 *
 * The screen uses platform branding for authentication, while the left preview
 * can still remind the visitor which tenant site they are trying to access.
 */

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { tenant } = await params
  const { error: errorCode, next } = await searchParams

  let config
  try {
    config = await loadPublicClientConfig(tenant)
  } catch (e) {
    if (e instanceof ConfigError) notFound()
    throw e
  }

  const digits = config.business.whatsapp.replace(/[^\d]/g, '')
  const heroImage = config.sections.hero?.image
  const whatsappHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent("Hi, I'm having trouble signing in to my site.")}`
    : null

  return (
    <main className="min-h-screen bg-admin-bg px-4 py-5 text-admin-ink lg:flex lg:items-center lg:justify-center">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-lg border border-admin-border bg-admin-surface lg:min-h-[40rem] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex min-h-[32rem] flex-col justify-between overflow-hidden border-b border-admin-border p-5 sm:p-7 lg:border-b-0 lg:border-r">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-admin-primary-soft" />
          )}
          <div className="absolute inset-0 bg-admin-bg/70" />
          <div className="absolute inset-0 bg-admin-bg/30" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-admin-ink">{PLATFORM_BRAND}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-admin-muted">Customer access</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="relative z-10 my-10 flex flex-1 items-center">
            <div className="max-w-xl">
              <div className="mb-5 flex items-center gap-3">
                {config.brand.logo && <Image src={config.brand.logo} alt="" width={44} height={44} className="rounded-lg" />}
                <div>
                  <p className="text-sm font-semibold text-admin-ink">{config.business.name}</p>
                  <p className="text-xs text-admin-muted">Preview workspace</p>
                </div>
              </div>

              <h2 className="max-w-lg text-5xl font-semibold leading-tight text-admin-ink">Step inside the site before it goes live.</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-admin-muted">
                Try the customer experience, capture the lead, then unlock paid publishing only after operator approval.
              </p>

              <div className="mt-8 grid max-w-md grid-cols-3 gap-2 text-xs">
                <div className="rounded border border-admin-border bg-admin-bg/70 p-3">
                  <p className="font-semibold text-admin-ink">Preview</p>
                  <p className="mt-1 text-admin-muted">local edits</p>
                </div>
                <div className="rounded border border-admin-border bg-admin-bg/70 p-3">
                  <p className="font-semibold text-admin-ink">Grant</p>
                  <p className="mt-1 text-admin-muted">by email</p>
                </div>
                <div className="rounded border border-admin-border bg-admin-bg/70 p-3">
                  <p className="font-semibold text-admin-ink">Publish</p>
                  <p className="mt-1 text-admin-muted">paid only</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-admin-muted">
            <span>Product Designer</span>
            <span>2026</span>
            <span>Vector Veda</span>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Login and sign up</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-admin-ink">Access Studio Presence.</h1>
              <p className="mt-3 text-sm leading-6 text-admin-muted">
                Google is fastest. Email and password access stays available for personal, work, or temporary addresses.
              </p>
            </div>

            {errorCode && AUTH_ERROR_MESSAGES[errorCode] && (
              <p className="mb-4 rounded-lg border border-admin-alert bg-admin-alert-soft px-3 py-2 text-sm font-medium text-admin-alert">
                {AUTH_ERROR_MESSAGES[errorCode]}
              </p>
            )}

            <LoginForm whatsappHref={whatsappHref} tenant={tenant} nextPath={next} />
          </div>
        </section>
      </div>
    </main>
  )
}
