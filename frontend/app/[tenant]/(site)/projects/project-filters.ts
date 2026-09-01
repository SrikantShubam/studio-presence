export const PROJECT_FILTER_IDS = ['all', 'residential', 'commercial', 'hospitality', 'retail'] as const

export type ProjectFilterId = (typeof PROJECT_FILTER_IDS)[number]

export function isProjectFilterId(value: string): value is ProjectFilterId {
  return PROJECT_FILTER_IDS.includes(value as ProjectFilterId)
}
