import Image from 'next/image'
import type { SectionConfig } from '@studio/backend'

export type Testimonial = SectionConfig<'testimonials'>['items'][number]
export type TestimonialsConfig = SectionConfig<'testimonials'>

export function testimonialKey(item: Testimonial, index: number): string {
  return `${item.author}-${index}`
}

export function TestimonialPhoto({
  item,
  size = 'small',
}: {
  item: Testimonial
  size?: 'small' | 'large'
}) {
  if (!item.image) return null

  return (
    <span
      className={`relative block shrink-0 overflow-hidden bg-hairline ${
        size === 'large'
          ? 'h-[clamp(38px,4vw,46px)] w-[clamp(38px,4vw,46px)] rounded-full'
          : 'h-9 w-9'
      }`}
    >
      <Image
        src={item.image}
        alt={item.author}
        fill
        sizes={size === 'large' ? '46px' : '36px'}
        className={size === 'large' ? 'object-cover grayscale' : 'object-cover'}
      />
    </span>
  )
}

export function TestimonialByline({
  item,
  align = 'left',
  showRule = false,
}: {
  item: Testimonial
  align?: 'left' | 'center'
  showRule?: boolean
}) {
  return (
    <span
      className={`flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 ${
        align === 'center' ? 'justify-center text-center' : ''
      }`}
    >
      <span className="break-words text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
        {item.author}
      </span>
      {item.context && (
        <>
          {showRule && <span className="hidden h-px w-5 shrink-0 bg-accent sm:block" aria-hidden />}
          <span className="break-words text-[10px] font-normal uppercase tracking-[0.16em] text-accent">
            {item.context}
          </span>
        </>
      )}
    </span>
  )
}
