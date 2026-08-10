import type { SectionComponentProps } from '@/sections/registry'
import { TestimonialsCards } from './TestimonialsCards'
import { TestimonialsCarousel } from './TestimonialsCarousel'

export function Testimonials({ config, variant }: SectionComponentProps<'testimonials'>) {
  if (!config?.enabled || !config.items?.length) return null

  switch (variant) {
    case 'carousel':
      return <TestimonialsCarousel config={config} />
    case 'cards':
    default:
      return <TestimonialsCards config={config} />
  }
}
