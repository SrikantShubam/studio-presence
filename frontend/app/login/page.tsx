import { LoginForm } from '../[tenant]/(admin)/login/LoginForm'

const ERROR_MESSAGES: Record<string, string> = {
  'missing-code': 'That link looks incomplete. Request a new one below.',
  'link-expired': 'That link has expired or was already used. Request a new one below.',
  'no-email': 'Something went wrong on our side. Request a new link below.',
  'no-tenant': "This email isn't linked to a site yet. Ask the operator to grant access.",
  'wrong-tenant': 'This email is linked to more than one site. A tenant picker is not available yet.',
}

export default async function PlatformLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error: errorCode } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-admin-border bg-admin-surface p-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-muted">
          Studio Presence
        </p>
        <h1 className="mb-6 text-xl font-semibold text-admin-ink">Sign in to your dashboard</h1>

        {errorCode && ERROR_MESSAGES[errorCode] && (
          <p className="mb-4 text-sm text-admin-alert">{ERROR_MESSAGES[errorCode]}</p>
        )}

        <LoginForm whatsappHref={null} />
      </div>
    </main>
  )
}
