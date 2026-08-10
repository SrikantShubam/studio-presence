import type { SectionComponentProps } from '@/sections/registry'

function gridCols(count: number): string {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3'
  return 'grid-cols-2 lg:grid-cols-4'
}

function dividerClasses(index: number, count: number): string {
  if (count === 1) return ''

  if (count === 2) {
    return index === 0 ? '' : 'border-t border-hairline sm:border-t-0 sm:border-l'
  }

  if (count === 3) {
    return index === 0 ? '' : 'border-t border-hairline sm:border-t-0 sm:border-l'
  }

  if (index === 0) return ''
  if (index === 1) return 'border-l border-hairline'
  if (index === 2) return 'border-t border-hairline lg:border-t-0 lg:border-l'
  return 'border-t border-l border-hairline lg:border-t-0'
}

export function TrustBar({ config }: SectionComponentProps<'trustBar'>) {
  if (!config?.enabled || !config.stats?.length) return null

  const stats = config.stats.slice(0, 4)

  return (
    <section id="trust-bar" className="border-y border-hairline bg-surface text-ink">
      <div className={`grid ${gridCols(stats.length)}`}>
        {stats.map((stat, index) => (
          <div
            key={`${stat.value}-${stat.label}`}
            className={`min-w-0 px-5 py-10 text-center sm:px-8 sm:py-12 lg:py-16 ${dividerClasses(
              index,
              stats.length,
            )}`}
          >
            <p className="m-0 break-all font-display text-[clamp(42px,6vw,76px)] font-light leading-none tracking-tight text-ink">
              {stat.value}
            </p>
            <p className="mx-auto mt-4 max-w-xs break-words text-[10.5px] font-medium uppercase leading-relaxed tracking-[0.2em] text-accent">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
