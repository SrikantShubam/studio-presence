import { interpolate, type ClientConfig, type SectionConfig } from '@studio/backend'
import type { SectionComponentProps } from '@/sections/registry'
import { EditorialIcon, type EditorialIconName } from '@/lib/icons'
import { FadeUpItem, Stagger } from '@/lib/motion'

type Action = SectionConfig<'quickActions'>['actions'][number]

const ACTION_LABELS: Record<Action, string> = {
  whatsapp: 'WHATSAPP',
  call: 'CALL',
  directions: 'DIRECTIONS',
  instagram: 'INSTAGRAM',
}

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
  return <EditorialIcon name={name} className="h-[19px] w-[19px]" />
}

export function QuickActions({ config, site }: SectionComponentProps<'quickActions'>) {
  if (!config?.enabled || !config.actions?.length) return null

  const resolved = config.actions
    .map((action) => ({ action, href: actionHref(action, site) }))
    .filter((item): item is { action: Action; href: string } => Boolean(item.href))

  if (!resolved.length) return null

  return (
    <Stagger
      className="grid grid-cols-4 border-t border-b border-accent bg-surface md:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))] lg:grid-cols-[2fr_1fr_1fr_1fr]"
      aria-label="Quick actions"
    >
      {resolved.map(({ action, href }, index) => {
        const isWhatsapp = action === 'whatsapp'
        const mobileRightBorder = index < resolved.length - 1 ? 'border-r' : ''

        return (
          <FadeUpItem
            key={action}
            className={`min-w-0 ${mobileRightBorder} md:border-r md:last:border-r-0`}
          >
          <a
            href={href}
            aria-label={ACTION_LABELS[action]}
            className={`flex min-h-[76px] w-full flex-col items-center justify-center gap-1.5 px-1.5 py-3 text-center transition-colors md:min-h-[132px] md:flex-row md:gap-3 md:px-[clamp(18px,3vw,48px)] md:py-[26px] ${
              isWhatsapp ? 'bg-ink text-surface hover:bg-accent' : 'text-ink hover:bg-muted/15'
            }`}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center md:h-10 md:w-10">
              <ActionIcon action={action} />
            </span>
            {isWhatsapp ? (
              <span className="grid gap-[5px]">
                <span className="text-[9px] font-medium uppercase tracking-[0.08em] md:text-sm md:tracking-[0.2em]">WHATSAPP</span>
                <span className="hidden text-[10.5px] uppercase tracking-[0.12em] text-surface/60 md:block">
                  FASTEST REPLY · {site.business.phone}
                </span>
              </span>
            ) : (
              <span className="text-[9px] font-medium uppercase tracking-[0.08em] md:text-[clamp(10.5px,1.1vw,11.5px)] md:tracking-[0.18em]">
                {ACTION_LABELS[action]}
              </span>
            )}
          </a>
          </FadeUpItem>
        )
      })}
    </Stagger>
  )
}
