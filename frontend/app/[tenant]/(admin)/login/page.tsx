import Image from 'next/image'
import { notFound } from 'next/navigation'
import { loadClientConfig, ConfigError } from '@studio/backend'
import { LoginForm } from './LoginForm'

/**
 * `/login`, serving both the panel and the dashboard.
 *
 * Per docs/product/prompts/admin-universal/01-login.md: one screen, one design,
 * for every client and every tier — only the branding (logo, studio name, this
 * tenant's WhatsApp number) is tenant-specific. Where the user lands AFTER
 * signing in depends on tier, decided in auth/callback/route.ts, not here.
 *
 * A centred single card is the one place in the product where that layout is
 * correct — per the brief, "there is genuinely nothing else on the page."
 */

const ERROR_MESSAGES: Record<string, string> = {
  'missing-code': 'That link looks incomplete. Request a new one below.',
  'link-expired': 'That link has expired or was already used. Request a new one below.',
  'no-email': 'Something went wrong on our side. Request a new link below.',
  'no-tenant': "This email isn't linked to a site yet. Message us on WhatsApp and we'll sort it out.",
  'wrong-tenant': 'This email is linked to more than one site. Message us on WhatsApp and we’ll sort it out.',
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { tenant } = await params
  const { error: errorCode } = await searchParams

  let config
  try {
    config = loadClientConfig(tenant)
  } catch (e) {
    if (e instanceof ConfigError) notFound()
    throw e
  }

  const digits = config.business.whatsapp.replace(/[^\d]/g, '')
  const whatsappHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent("Hi, I'm having trouble signing in to my site.")}`
    : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-admin-border bg-admin-surface p-6">
        <div className="mb-6 flex items-center gap-2">
          {config.brand.logo && (
            <Image
              src={config.brand.logo}
              alt=""
              width={28}
              height={28}
              className="rounded"
            />
          )}
          <span className="text-sm font-medium text-admin-ink">{config.business.name}</span>
        </div>

        <h1 className="mb-6 text-xl font-semibold text-admin-ink">Sign in to your site</h1>

        {errorCode && ERROR_MESSAGES[errorCode] && (
          <p className="mb-4 text-sm text-admin-alert">{ERROR_MESSAGES[errorCode]}</p>
        )}

        <LoginForm whatsappHref={whatsappHref} />
      </div>
    </main>
  )
}
