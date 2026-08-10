import type { SectionComponentProps } from '@/sections/registry'
import { ServicesCompact } from './ServicesCompact'
import { ServicesDetailed } from './ServicesDetailed'

export function Services({ config, variant }: SectionComponentProps<'services'>) {
  if (!config?.enabled || !config.items?.length) return null

  switch (variant) {
    case 'compact':
      return <ServicesCompact config={config} />
    case 'detailed':
    default:
      return <ServicesDetailed config={config} />
  }
}
