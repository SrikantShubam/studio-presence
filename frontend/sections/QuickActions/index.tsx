import { interpolate, type ClientConfig, type SectionConfig } from '@studio/backend'
import type { SectionComponentProps } from '@/sections/registry'

/**
 * Matches `design/reference/editorial/home-sections/quick-actions.html`, with
 * one adaptation the fragment couldn't specify: its
 * `grid-template-columns:{{ quickCols }}` is a value Claude Design's own
 * runtime computed per viewport, and that logic isn't part of what
 * `docs/build/tasks/01-quick-actions.md` could hand over — the design split
 * kept the static markup, not the responsive-columns script. Verified against
 * a real browser at 375px rather than guessed: an icon-beside-label row for
 * "DIRECTIONS" doesn't fit three-per-row at that width no matter how the
 * columns are sized, because a single unbroken word can't wrap. Secondary
 * actions go icon-above-label instead, which needs only the label's width,
 * not icon + gap + label — the standard shape for this exact constraint.
 * WhatsApp keeps the reference's horizontal, two-line, dark-background
 * treatment throughout, since it never triggered the overflow.
 */

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

/**
 * Tailwind class, not an inline style. `check:hardcode` flags any dynamic
 * `style={{...}}` regardless of content — grid columns included — because the
 * one sanctioned exception is `app/[tenant]/(site)/layout.tsx`'s token
 * injection, nothing else. At most 3 secondary actions exist (four possible
 * actions minus WhatsApp), so this is a closed, small mapping, same pattern
 * as `frontend/sections/Hero/index.tsx`'s variant dispatch.
 */
function secondaryGridCols(count: number): string {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  return 'grid-cols-3'
}

function ActionIcon({ action }: { action: Action }) {
  if (action === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4L3 21z" />
        <path d="M8.6 9.2c.4 2.2 2.4 4.2 4.6 4.6l1.2-1.4 2.4 1.1-.5 2c-2.9.6-7.9-3.5-8.4-7.1l2-.5 1.1 2.4-1.2 1.3" />
      </svg>
    )
  }

  if (action === 'call') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
      </svg>
    )
  }

  if (action === 'directions') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function QuickActions({ config, site }: SectionComponentProps<'quickActions'>) {
  if (!config?.enabled || !config.actions?.length) return null

  const resolved = config.actions
    .map((action) => ({ action, href: actionHref(action, site) }))
    .filter((item): item is { action: Action; href: string } => Boolean(item.href))

  if (!resolved.length) return null

  const whatsapp = resolved.find((a) => a.action === 'whatsapp')
  const secondary = resolved.filter((a) => a.action !== 'whatsapp')

  return (
    <section
      id="quick-actions"
      className="flex flex-col border-b border-accent bg-surface sm:flex-row"
      aria-label="Quick actions"
    >
      {whatsapp && (
        <a
          href={whatsapp.href}
          aria-label={ACTION_LABELS.whatsapp}
          className="flex min-h-11 items-center gap-4 border-b border-accent bg-ink px-5 py-6 text-surface transition-colors hover:bg-accent sm:flex-[1.3] sm:border-r sm:border-b-0 sm:px-8"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center border border-surface/45">
            <ActionIcon action="whatsapp" />
          </span>
          <span className="grid gap-1">
            <span className="text-sm font-medium tracking-[0.2em]">WHATSAPP</span>
            <span className="text-[10.5px] tracking-[0.12em] text-surface/60">
              FASTEST REPLY · {site.business.phone}
            </span>
          </span>
        </a>
      )}

      {secondary.length > 0 && (
        <div className={`grid flex-1 ${secondaryGridCols(secondary.length)}`}>
          {secondary.map(({ action, href }, index) => (
            <a
              key={action}
              href={href}
              aria-label={ACTION_LABELS[action]}
              className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-2 px-2 py-5 text-center text-ink transition-colors hover:bg-muted/15 ${
                index === secondary.length - 1 ? '' : 'border-r border-hairline'
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-accent">
                <ActionIcon action={action} />
              </span>
              <span className="text-[10.5px] font-medium uppercase tracking-[0.16em]">
                {ACTION_LABELS[action]}
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
