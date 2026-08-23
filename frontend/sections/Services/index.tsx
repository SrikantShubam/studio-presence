import type { SectionComponentProps } from '@/sections/registry'
import { ServicesCompact } from './ServicesCompact'
import { ServicesDetailed } from './ServicesDetailed'

export function Services({ config, site, variant }: SectionComponentProps<'services'>) {
  if (!config?.enabled || !config.items?.length) return null

  switch (variant) {
    case 'compact':
      return <ServicesCompact config={config} site={site} />
    case 'detailed':
    default:
      return <ServicesDetailed config={config} site={site} />
  }
}
