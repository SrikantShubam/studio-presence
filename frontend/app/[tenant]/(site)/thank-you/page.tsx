import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { interpolate, loadPublicClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { ClipLine } from '@/lib/motion'
import { notFoundMeta, pageMeta } from '@/lib/page-meta'
import { HeroNav } from '@/sections/Hero/HeroNav'
import Link from 'next/link'

type Props = { params: Promise<{ tenant: string }> }

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  eyebrow: ['Enquiry received —', 'We have the note'],
  title: { lead: 'We have', accent: 'The note' },
  body: 'We reply within 24 hours. If it cannot wait, WhatsApp reaches the studio faster than the inbox.',
  whatsapp: 'Open WhatsApp',
  home: 'Back to the home page',
  links: [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/estimate', label: 'Calculate the estimate', needsEstimate: true },
    { href: '/locations', label: 'Visit the studio' },
  ],
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  try {
    const site = await loadPublicClientConfig(tenant)
    return {
      ...pageMeta(site, 'Message received', 'We have the enquiry. We reply within 24 hours.'),
      robots: { index: false, follow: false },
    }
  } catch {
    return notFoundMeta()
  }
}

function whatsappHref(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export default async function ThankYouPage({ params }: Props) {
  const { tenant } = await params

  let site
  try {
    site = await loadPublicClientConfig(tenant)
  } catch {
    notFound()
  }

  const name = site.business.name
  const phone = site.business.phone
  const city = site.business.address.city
  const wa = whatsappHref(site.business.whatsapp, interpolate(site.cta.whatsappMessage, site))
  const links = copy.links.filter((item) => !item.needsEstimate || site.sections.estimate?.enabled)

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-surface text-ink">
      <HeroNav
        businessName={site.business.name}
        phone={site.business.phone}
        tone="on-surface"
        inner
        services={site.sections.services?.items}
      />
      <main
        className={`grid flex-1 items-center gap-[clamp(32px,6vw,88px)] ${pagePad} py-[clamp(56px,10vw,140px)] min-[720px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]`}
      >
        <div className="min-w-0">
          <p className="mb-[clamp(20px,3vw,34px)] m-0 grid gap-1.5 text-[10.5px] font-normal uppercase leading-[1.6] tracking-[0.24em] text-accent">
            {copy.eyebrow.map((line, index) => (
              <ClipLine key={line} delay={index * 0.05}>
                {line}
              </ClipLine>
            ))}
          </p>
          <h1 className="m-0 font-display text-[clamp(46px,9vw,116px)] font-light uppercase leading-[0.88] tracking-[-0.03em] text-ink">
            <ClipLine>{copy.title.lead}</ClipLine>
            <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
              {copy.title.accent}
            </ClipLine>
          </h1>
          <p className="mt-[clamp(28px,4vw,44px)] mb-0 max-w-[26em] text-pretty text-[clamp(16px,1.8vw,19px)] leading-[1.6] text-body">
            {copy.body}
          </p>
          <div className="mt-[clamp(32px,4.5vw,52px)] flex flex-wrap items-center gap-3.5">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-3.5 bg-cta px-[34px] py-5 text-[clamp(10.5px,1.1vw,12px)] font-medium uppercase tracking-[0.18em] text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-20px)_100%,0_100%)] hover:bg-ink hover:text-cta"
              >
                {copy.whatsapp}
                <EditorialIcon name="arrow-up-right" className="h-3 w-3" />
              </a>
            ) : null}
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-[clamp(10.5px,1.1vw,12px)] font-medium uppercase tracking-[0.18em] text-ink hover:text-accent"
            >
              {copy.home}
            </Link>
          </div>
          <div className="mt-[clamp(32px,4vw,48px)] flex flex-wrap gap-x-[clamp(18px,2.6vw,32px)] gap-y-3 border-t border-accent pt-[22px] text-[11.5px] font-medium uppercase tracking-[0.18em]">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="text-ink hover:text-accent">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="relative hidden min-h-[340px] items-center justify-center min-[720px]:flex">
          <div className="pointer-events-none absolute bottom-[52px] left-[26px] right-[-26px] top-0 border border-accent" />
          <div className="relative mr-[26px] mt-[26px] grid aspect-[4/5] w-full max-w-[420px] place-items-center border border-hairline">
            <span className="font-display text-[clamp(96px,12vw,180px)] font-light uppercase leading-[0.8] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
              OK
            </span>
          </div>
        </div>
      </main>
      <div className="flex flex-wrap justify-between gap-[14px] bg-ink px-[clamp(20px,5vw,64px)] py-[22px] text-[10.5px] font-normal uppercase tracking-[0.16em] text-surface">
        <span>
          © {new Date().getFullYear()} {name}
          {city ? ` · ${city}` : ''}
        </span>
        {phone ? <span>{phone}</span> : null}
      </div>
    </div>
  )
}
