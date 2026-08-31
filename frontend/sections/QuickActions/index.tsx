import { interpolate, type ClientConfig, type SectionConfig } from '@studio/backend'
import type { SectionComponentProps } from '@/sections/registry'
import { chromeCopy, localeRoleClass, localeTextClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { EditorialIcon, type EditorialIconName } from '@/lib/icons'
import { FadeUpItem, Stagger } from '@/lib/motion'

type Action = SectionConfig<'quickActions'>['actions'][number]

function actionHref(action: Action, site: ClientConfig): string | null {
  switch (action) {
    case 'whatsapp': {
      const digits = site.business.whatsapp.replace(/\D/g, '')
      const message = interpolate(site.cta.whatsappMessage, site)
      return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null
    }
    case 'call':
      return site.business.phone ? `tel:${site.business.phone}` : null
    case 'directions':
      return site.business.address.mapsEmbedUrl ?? null
    case 'instagram': {
      const handle = site.sections.instagram?.handle?.replace(/^@/, '').trim()
      return handle ? `https://instagram.com/${handle}` : null
    }
  }
}

function ActionIcon({ action }: { action: Action }) {
  const name: EditorialIconName = action === 'whatsapp' ? 'message-circle' : action === 'call' ? 'phone' : action === 'directions' ? 'map-pin' : 'instagram'
  return <EditorialIcon name={name} className="h-[22px] w-[22px]" />
}

export function QuickActions({ config, site }: SectionComponentProps<'quickActions'>) {
  if (!config?.enabled || !config.actions?.length) return null
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].quickActions

  const resolved = config.actions
    .map((action) => ({ action, href: actionHref(action, site) }))
    .filter((item): item is { action: Action; href: string } => Boolean(item.href))

  if (!resolved.length) return null

  return (
    <Stagger
      className="grid grid-cols-1 border-t border-b border-accent bg-surface md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]"
      aria-label="Quick actions"
    >
      {resolved.map(({ action, href }) => {
        const isWhatsapp = action === 'whatsapp'
        return (
          <FadeUpItem
            key={action}
            className="min-w-0 border-b border-accent last:border-b-0 md:border-r md:last:border-r-0 lg:border-b-0"
          >
          <a
            href={href}
            aria-label={copy[action]}
            className={`flex min-h-[76px] w-full flex-row items-center justify-center gap-3 px-5 py-4 text-center transition-colors md:min-h-[132px] md:gap-3 md:px-[clamp(18px,3vw,48px)] md:py-[26px] ${
              isWhatsapp ? 'bg-ink text-surface hover:bg-accent' : 'text-ink hover:bg-muted/15'
            }`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center md:h-11 md:w-11">
              <ActionIcon action={action} />
            </span>
            {isWhatsapp ? (
              <span className="grid gap-[5px]">
                <h5 className={`ai-type-quick-action m-0 text-left font-medium ${locale === 'hi' ? localeRoleClass(locale, 'label') : localeTextClass(locale, 'uppercase tracking-[0.04em] md:tracking-[0.2em]')}`}>{copy.whatsapp}</h5>
                <h6 className={`ai-type-quick-action-detail m-0 hidden font-normal text-surface/60 md:block ${localeTextClass(locale, 'uppercase tracking-[0.12em]')}`}>
                  {copy.fastestReply} · {site.business.phone}
                </h6>
              </span>
            ) : (
              <h5 className={`ai-type-quick-action m-0 text-left text-[10px] font-medium ${locale === 'hi' ? localeRoleClass(locale, 'label') : localeTextClass(locale, 'uppercase tracking-[0.04em] md:tracking-[0.18em]')}`}>
                {copy[action]}
              </h5>
            )}
          </a>
          </FadeUpItem>
        )
      })}
    </Stagger>
  )
}
