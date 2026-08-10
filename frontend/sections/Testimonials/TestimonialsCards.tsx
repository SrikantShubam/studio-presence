import Image from 'next/image'
import type { TestimonialsConfig, Testimonial } from './shared'
import { TestimonialByline, TestimonialPhoto, testimonialKey } from './shared'

function FeaturedCard({ item }: { item: Testimonial }) {
  return (
    <article className="grid gap-7 border border-accent bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] lg:gap-10">
      {item.image && (
        <div className="relative aspect-[3/4] overflow-hidden bg-hairline">
          <Image src={item.image} alt={item.author} fill sizes="(min-width: 1024px) 28vw, 100vw" className="object-cover" />
        </div>
      )}

      <div className="flex min-w-0 flex-col justify-between gap-8">
        <blockquote className="m-0">
          <p className="m-0 text-pretty text-[clamp(18px,2.4vw,28px)] leading-relaxed text-ink">
            {item.quote}
          </p>
        </blockquote>
        <footer className="grid gap-3">
          <span className="h-px w-12 bg-cta" aria-hidden />
          <TestimonialByline item={item} />
        </footer>
      </div>
    </article>
  )
}

function SmallCard({ item, wide }: { item: Testimonial; wide: boolean }) {
  return (
    <article
      className={`flex min-w-0 flex-col justify-between gap-6 border border-hairline bg-surface p-6 ${
        wide ? 'md:col-span-2 md:flex-row md:items-end' : ''
      }`}
    >
      <blockquote className="m-0 min-w-0">
        <p className="m-0 max-w-prose text-pretty text-[15px] leading-loose text-muted">{item.quote}</p>
      </blockquote>
      <footer className="flex min-w-0 items-center gap-3">
        <TestimonialPhoto item={item} />
        <TestimonialByline item={item} />
      </footer>
    </article>
  )
}

export function TestimonialsCards({ config }: { config: TestimonialsConfig }) {
  if (!config.enabled || !config.items.length) return null

  const [featured, ...rest] = config.items
  if (!featured) return null

  return (
    <section id="testimonials" className="border-t border-accent bg-muted/10 px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
        <h2 className="m-0 font-display text-[clamp(42px,11vw,96px)] font-light uppercase leading-[0.88] tracking-tight">
          What Clients
          <span className="block pl-[0.55em] text-accent">Say</span>
        </h2>
      </div>

      <div className="grid min-w-0 gap-6">
        <FeaturedCard item={featured} />

        {rest.length > 0 && (
          <div className="grid min-w-0 gap-5 md:grid-cols-2">
            {rest.map((item, index) => (
              <SmallCard key={testimonialKey(item, index + 1)} item={item} wide={index === rest.length - 1 && rest.length % 2 === 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
