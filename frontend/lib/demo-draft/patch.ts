export type LocalDraft = {
  tenant: string
  baseRevision: string
  changes: Record<string, unknown>
  updatedAt: string
}

export function mergeLocalPatch(current: Record<string, unknown>, delta: Record<string, unknown>) {
  return { ...current, ...delta }
}

export function createLocalDraft(tenant: string, baseRevision: string, changes: Record<string, unknown>): LocalDraft {
  return { tenant, baseRevision, changes: { ...changes }, updatedAt: new Date().toISOString() }
}
