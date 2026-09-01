import { interpolate } from '@studio/backend'
import type { SectionComponentProps } from '@/sections/registry'
import { chromeCopy, localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'

export function StickyMobileCta({ config, site }: SectionComponentProps<'stickyMobileCta'>) {
  if (!config?.enabled) return null

  const digits = site.business.whatsapp.replace(/\D/g, '')
  if (!digits) return null

  const message = interpolate(site.cta.whatsappMessage, site)
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
  const locale = publicLocaleFromSite(site)

  return (
    <div className={`fixed inset-x-0 bottom-0 z-20 border-t border-ink bg-cta px-4 py-3 text-center font-medium text-ink md:hidden ${localeRoleClass(locale, 'button')}`}>
      <a className="block min-h-11 content-center break-words" href={href}>
        {chromeCopy[locale].stickyCta.label}
      </a>
    </div>
  )
}
