import { ResetPasswordForm } from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-admin-bg px-4 py-6 text-admin-ink sm:flex sm:items-center sm:justify-center">
      <section className="mx-auto w-full max-w-md rounded-lg border border-admin-border bg-admin-surface p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Secure account recovery</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-admin-ink">Choose a new password.</h1>
        <p className="mt-3 text-sm leading-6 text-admin-muted">Use at least 12 characters. After saving, we will route you to the workspace your account is authorized to access.</p>
        <div className="mt-7"><ResetPasswordForm /></div>
      </section>
    </main>
  )
}
