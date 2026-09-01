import Link from 'next/link'
import type { ClientConfig } from '@studio/backend'
import { ClipLine, FadeUp, HomeSection } from '@/lib/motion'
import { HeroNav } from '@/sections/Hero/HeroNav'
import { renderableSections } from '@/sections/registry'

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  eyebrow: 'Legal —',
  title: { lead: 'Privacy', accent: '& Terms' },
  tabs: { privacy: 'Privacy policy', terms: 'Terms of work' },
  questions: 'Questions about this',
}
const pagePad = 'px-[clamp(20px,5vw,64px)]'

function addressText(site: ClientConfig): string {
  const { address } = site.business
  return [address.line1, address.locality, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(', ')
}

export function LegalDoc({ site, kind }: { site: ClientConfig; kind: 'privacy' | 'terms' }) {
  const doc = kind === 'privacy' ? site.legal.privacyPolicyDoc : site.legal.termsDoc
  const closing = renderableSections(site, ['footer'])
  const retention = site.legal.dataRetentionNote?.trim()

  if (!doc) return null

  return (
    <article className="overflow-x-clip bg-surface text-ink">
      <HeroNav
        businessName={site.business.name}
        phone={site.business.phone}
        tone="on-surface"
        inner
        services={site.sections.services?.items}
      />
      <HomeSection first>
        <section className={`${pagePad} pb-[clamp(28px,3.4vw,44px)] pt-[clamp(44px,6vw,84px)]`}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="mb-[clamp(18px,2.6vw,28px)] m-0 grid gap-1.5 text-[10.5px] font-normal uppercase leading-[1.6] tracking-[0.24em] text-accent">
                <ClipLine>{copy.eyebrow}</ClipLine>
                <ClipLine delay={0.05}>{site.business.name}</ClipLine>
              </p>
              <h1 className="m-0 font-display text-[clamp(38px,7vw,88px)] font-light uppercase leading-[0.9] tracking-[-0.03em] text-ink">
                <ClipLine>{copy.title.lead}</ClipLine>
                <ClipLine className="ml-[0.55em] block text-accent" delay={0.08}>
                  {copy.title.accent}
                </ClipLine>
              </h1>
            </div>
            <span className="pb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{doc.updated}</span>
          </div>
        </section>
      </HomeSection>
      <section className={pagePad}>
        <div className="flex flex-wrap gap-[clamp(20px,3vw,44px)] border-b border-accent">
          <Link
            href="/privacy"
            className={`min-h-11 py-3 text-[clamp(12px,1.4vw,15px)] uppercase tracking-[0.16em] ${
              kind === 'privacy' ? 'border-b-2 border-accent text-ink' : 'border-b-2 border-transparent text-muted'
            }`}
          >
            {copy.tabs.privacy}
          </Link>
          <Link
            href="/terms"
            className={`min-h-11 py-3 text-[clamp(12px,1.4vw,15px)] uppercase tracking-[0.16em] ${
              kind === 'terms' ? 'border-b-2 border-accent text-ink' : 'border-b-2 border-transparent text-muted'
            }`}
          >
            {copy.tabs.terms}
          </Link>
        </div>
      </section>
      <HomeSection>
        <section className={`${pagePad} pb-[clamp(56px,8vw,100px)] pt-[clamp(40px,5vw,72px)]`}>
          <div className="max-w-[34em]">
            <p className="m-0 text-pretty text-[clamp(16px,1.8vw,19px)] leading-[1.6] text-ink">{doc.lead}</p>
            {doc.sections.map((section, index) => (
              <FadeUp key={section.title} className="mt-[clamp(36px,4.5vw,56px)]">
                <div className="flex items-baseline gap-4 border-b border-hairline pb-3">
                  <span className="text-[clamp(11px,1.2vw,13px)] font-medium tracking-[0.2em] text-accent">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="m-0 text-[clamp(17px,1.9vw,21px)] font-normal uppercase tracking-[0.04em]">{section.title}</h2>
                </div>
                <div className="mt-5 grid gap-[18px]">
                  {section.paragraphs.map((part) => (
                    <p key={part.slice(0, 36)} className="m-0 text-pretty text-base leading-[1.75] text-body">
                      {part}
                    </p>
                  ))}
                </div>
                {section.bullets.length ? (
                  <ul className="mt-[18px] mb-0 grid list-disc gap-2.5 pl-[1.1em] text-base leading-[1.7] text-body">
                    {section.bullets.map((item) => (
                      <li key={item.slice(0, 36)} className="text-pretty">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {kind === 'privacy' && section.title === 'HOW LONG WE KEEP IT' && retention ? (
                  <p className="mt-[18px] mb-0 text-pretty text-base leading-[1.75] text-body">{retention}</p>
                ) : null}
              </FadeUp>
            ))}
            <div className="mt-[clamp(44px,5.5vw,72px)] border-t border-accent pt-6">
              <span className="block text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{copy.questions}</span>
              <p className="mt-4 mb-0 text-pretty text-base leading-[1.75] text-body">
                Write to{' '}
                {site.business.email ? (
                  <a href={`mailto:${site.business.email}`} className="text-ink hover:text-accent">
                    {site.business.email}
                  </a>
                ) : (
                  site.business.phone
                )}{' '}
                or call {site.business.phone}. {site.business.name}, {addressText(site)}.
              </p>
            </div>
          </div>
        </section>
      </HomeSection>
      {closing.map(({ key, Component, config, variant }) => (
        <HomeSection key={key}>
          <Component config={config as never} site={site} variant={variant} />
        </HomeSection>
      ))}
    </article>
  )
}
