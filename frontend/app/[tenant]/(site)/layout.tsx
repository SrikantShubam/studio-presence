import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ConfigError, loadPublicClientConfig } from '@studio/backend'
import { getTokenSet, tokensToCssVars } from '@/lib/tokens'

/**
 * Tenant layout — where a client's identity becomes CSS.
 *
 * THIS IS THE ONE PLACE IN THE CODEBASE WHERE A `style` ATTRIBUTE IS CORRECT.
 * `AGENTS.md` forbids them everywhere else and `check:hardcode` enforces that.
 * The exception exists because the values are not known until a config is read at
 * request time: identity tokens merged with the client's palette override. A
 * Tailwind class cannot express "whatever colour this particular client chose".
 *
 * What makes it work is the indirection. This sets `--t-ink`; `globals.css` maps
 * `--color-ink` to `var(--t-ink)` inside `@theme inline`; components write
 * `text-ink` and never see a hex code. Switching a client from Editorial to
 * Premium changes one string in one JSON file and every section follows.
 *
 * If a section ever needs a colour this layer does not provide, the answer is a
 * new token — never a literal in the component.
 */

type Props = {
  children: ReactNode
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params

  let config
  try {
    config = await loadPublicClientConfig(tenant)
  } catch {
    return { title: 'Not found' }
  }

  return {
    title: config.seo.title,
    description: config.seo.description,
    keywords: config.seo.keywords,
    // Belt and braces with the middleware header. A demo indexed under the
    // client's own name is expensive to undo and cheap to prevent twice.
    robots: config.seo.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: config.seo.title,
      description: config.seo.description,
      images: config.brand.ogImage ? [config.brand.ogImage] : undefined,
    },
  }
}

export default async function TenantLayout({ children, params }: Props) {
  const { tenant } = await params

  let config
  try {
    config = await loadPublicClientConfig(tenant)
  } catch (e) {
    if (e instanceof ConfigError) {
      // A broken config must never render half a site on a client's subdomain.
      // In development the message is the fastest route to the actual field;
      // in production it is a 404, because a stack trace on a client's domain
      // is worse than a missing page.
      if (process.env.NODE_ENV !== 'production') throw e
      notFound()
    }
    throw e
  }

  const tokens = getTokenSet(config.template)
  const cssVars = tokensToCssVars(tokens, config.brand.palette)

  // Demo and sold builds carry a watermark. Driven by status, never set by hand —
  // `check:config` refuses to let a live site keep it.
  const watermark = config.status !== 'live' && config.internal.demoWatermark

  return (
    <div
      style={cssVars as React.CSSProperties}
      data-template={config.template}
      data-tier={config.tier}
      data-watermark={watermark ? 'true' : undefined}
      className="min-h-screen bg-surface text-ink font-body"
    >
      {children}
    </div>
  )
}
