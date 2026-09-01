import type { SectionComponentProps } from '@/sections/registry'
import { localeHref, localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'

export function CtaBand({ config, site }: SectionComponentProps<'ctaBand'>) {
  if (!config?.enabled || !config.headline) return null

  const locale = publicLocaleFromSite(site)
  const href = site.sections.estimate?.enabled ? localeHref('/estimate', locale) : '#contact'
  return (
    <section className="border-t border-accent bg-ink px-5 py-16 text-surface sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row md:items-end">
        <h2 className={`m-0 max-w-3xl font-display text-[clamp(42px,8vw,104px)] font-light leading-[0.95] ${localeRoleClass(locale, 'sectionTitle')}`}>{config.headline}</h2>
        {config.ctaLabel && <a className={`inline-flex border border-cta bg-cta px-6 py-4 font-medium text-ink hover:bg-surface hover:text-ink ${localeRoleClass(locale, 'button')}`} href={href}>{config.ctaLabel}</a>}
      </div>
    </section>
  )
}
