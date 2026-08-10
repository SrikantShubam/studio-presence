import type { SectionComponentProps } from '@/sections/registry'
import { PortfolioCarousel } from './PortfolioCarousel'
import { PortfolioGrid } from './PortfolioGrid'

export function Portfolio({ config, site, variant }: SectionComponentProps<'portfolio'>) {
  switch (variant) {
    case 'carousel':
      return <PortfolioCarousel config={config} site={site} />
    case 'grid':
    default:
      return <PortfolioGrid config={config} site={site} />
  }
}
