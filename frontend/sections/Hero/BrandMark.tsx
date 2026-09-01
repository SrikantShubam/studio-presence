function initialsFor(businessName: string): string {
  const initials = businessName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return initials || businessName.slice(0, 2).toUpperCase()
}

export function BrandMark({
  businessName,
  className = '',
}: {
  businessName: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={`relative grid size-12 shrink-0 place-items-center overflow-hidden border border-current font-display text-sm font-medium leading-none tracking-[0.08em] ${className}`}
    >
      <span className="absolute left-2 top-2 h-4 w-px bg-current" />
      <span className="absolute left-2 top-2 h-px w-5 bg-current" />
      <span className="absolute bottom-2 right-2 h-4 w-px bg-current" />
      <span className="absolute bottom-2 right-2 h-px w-5 bg-current" />
      <span>{initialsFor(businessName)}</span>
    </span>
  )
}
