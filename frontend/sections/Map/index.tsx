import type { SectionComponentProps } from '@/sections/registry'

export function Map({ config, site }: SectionComponentProps<'map'>) {
  const address = site.business.address
  const embedUrl = address.mapsEmbedUrl?.trim()
  const addressLines = [
    address.line1,
    address.locality,
    address.city,
    address.state,
    address.pincode,
  ]
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line))

  if (!config?.enabled || !embedUrl || addressLines.length === 0) return null

  return (
    <section id="map" className="border-t border-accent bg-surface px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div>
          <p className="m-0 text-[10px] uppercase tracking-[0.24em] text-muted">{site.business.name}</p>
          <h2 className="mt-5 font-display text-[clamp(38px,6vw,76px)] font-light uppercase leading-[0.9]">
            {address.city}
          </h2>
          <address className="mt-6 max-w-sm not-italic text-sm leading-7 text-muted">
            {addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
        <div className="aspect-[16/10] overflow-hidden border border-accent bg-muted/10">
          <iframe
            className="h-full w-full border-0 grayscale"
            src={embedUrl}
            title={site.business.name}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
