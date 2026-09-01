import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export function AdminShell({ children, spacious = false }: { children: ReactNode; spacious?: boolean }) {
  return (
    <div className={`mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 ${spacious ? 'py-8' : 'py-5'} pb-8 sm:px-6 lg:py-8`}>
      {children}
    </div>
  )
}

export function AdminCard({
  children,
  className = '',
  ...props
}: ComponentPropsWithoutRef<'section'> & { children: ReactNode }) {
  return <section className={`rounded-lg border border-admin-border bg-admin-surface ${className}`} {...props}>{children}</section>
}

export function AdminMetric({
  label,
  value,
  note,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  note?: string
  tone?: 'neutral' | 'primary' | 'alert'
}) {
  const toneClass =
    tone === 'alert'
      ? 'border-admin-alert bg-admin-alert-soft text-admin-alert'
      : tone === 'primary'
        ? 'border-admin-primary bg-admin-primary-soft text-admin-primary'
        : 'border-admin-border bg-admin-surface text-admin-ink'

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-2xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide">{label}</p>
      {note && <p className="mt-1 text-sm text-admin-muted">{note}</p>}
    </div>
  )
}

export function AdminChip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'primary' | 'alert'
}) {
  const toneClass =
    tone === 'alert'
      ? 'border-admin-alert bg-admin-alert-soft text-admin-alert'
      : tone === 'primary'
        ? 'border-admin-primary bg-admin-primary-soft text-admin-primary'
        : 'border-admin-border bg-admin-raised text-admin-muted'

  return (
    <span className={`inline-flex min-h-7 items-center rounded px-2 text-xs font-semibold uppercase tracking-wide ${toneClass}`}>
      {children}
    </span>
  )
}

export function AdminButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}) {
  const variantClass =
    variant === 'danger'
      ? 'border border-admin-alert text-admin-alert hover:bg-admin-alert-soft'
      : variant === 'secondary'
        ? 'border border-admin-border text-admin-ink hover:border-admin-primary hover:text-admin-primary'
        : 'bg-admin-primary text-admin-on-primary hover:opacity-90'

  return (
    <button
      type="button"
      className={`min-h-11 rounded px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminTextInput({
  label,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const input = (
    <input
      className={`min-h-11 rounded border border-admin-border bg-admin-bg px-3 text-sm text-admin-ink outline-none transition focus:border-admin-primary ${className}`}
      {...props}
    />
  )

  if (!label) return input

  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">
      {label}
      {input}
    </label>
  )
}
