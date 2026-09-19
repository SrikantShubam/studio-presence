import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-admin-muted">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-admin-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  )
}

export function AdminLinkButton({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: ComponentPropsWithoutRef<'a'> & { children: ReactNode; variant?: 'primary' | 'secondary'; className?: string }) {
  const variantClass = variant === 'primary'
    ? 'border border-admin-primary bg-admin-primary text-admin-on-primary hover:opacity-90'
    : 'border border-admin-border bg-admin-surface text-admin-ink hover:border-admin-primary hover:text-admin-primary'

  return <a className={'inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface ' + variantClass + ' ' + className} {...props}>{children}</a>
}


export function AdminShell({ children, spacious = false }: { children: ReactNode; spacious?: boolean }) {
  return (
    <div className={`mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 ${spacious ? 'py-8' : 'py-5'} pb-10 sm:px-6 lg:gap-6 lg:px-8 lg:py-9`}>
      {children}
    </div>
  )
}

export function AdminCard({
  children,
  className = '',
  ...props
}: ComponentPropsWithoutRef<'section'> & { children: ReactNode }) {
  return <section className={`rounded-xl border border-admin-border bg-admin-surface ${className}`} {...props}>{children}</section>
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
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-2xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em]">{label}</p>
      {note && <p className="mt-1 text-xs text-admin-muted">{note}</p>}
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
    <span className={`inline-flex min-h-7 items-center rounded-md px-2 text-xs font-semibold uppercase tracking-[0.08em] ${toneClass}`}>
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
      className={`min-h-11 rounded-md px-3 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${className}`}
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
      className={`min-h-11 rounded-md border border-admin-border bg-admin-bg px-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface motion-reduce:transition-none ${className}`}
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
