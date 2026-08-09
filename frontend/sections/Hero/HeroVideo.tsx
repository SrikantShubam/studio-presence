import type { ClientConfig, SectionConfig } from '@studio/backend'
import { HeroContent } from './HeroContent'
import { HeroNav } from './HeroNav'

/**
 * Video — same full-bleed footprint as the photo variant, but the backdrop is
 * a muted, looping walkthrough instead of a static photograph. Falls back to
 * `config.image` as a poster/still when `videoUrl` is absent, so a client who
 * hasn't supplied a video yet still gets a working hero rather than a blank
 * one — `enabled: true` with an incomplete video shouldn't read as broken.
 *
 * No player chrome — no play button, no scrubber — per the design brief: this
 * has to read as ambient background motion, not an embedded player. The
 * "sound off" mark is the only signal that it's a video at all.
 *
 * Matches `design/reference/editorial/hero-video-format.html`.
 */
export function HeroVideo({ config, site }: { config: SectionConfig<'hero'>; site: ClientConfig }) {
  return (
    <section id="hero" className="relative min-h-[min(860px,100vh)] overflow-hidden bg-ink">
      {config.videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={config.videoUrl}
          poster={config.image}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        config.image && (
          // Plain <img>, not next/image: this is a still-frame fallback for when
          // videoUrl is absent, not the primary asset path — not worth the
          // optimisation machinery for a rarely-hit branch.
          <img
            src={config.image}
            alt={`${config.headline} — hero photograph`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/15 to-ink/60" />

      <div className="relative">
        <HeroNav businessName={site.business.name} phone={site.business.phone} tone="on-photo" />
      </div>

      <div className="relative px-5 py-10 sm:px-8 sm:py-16 md:pb-24">
        <div className="max-w-3xl">
          <HeroContent config={config} site={site} tone="on-photo" headingSize="display" />
        </div>
      </div>

      <div className="absolute right-5 bottom-6 flex items-center gap-2.5 text-surface/85 sm:right-8 sm:bottom-11">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M11 5 6 9H3v6h3l5 4V5z" />
          <path d="M16 9l5 6M21 9l-5 6" />
        </svg>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Sound off</span>
      </div>
    </section>
  )
}
