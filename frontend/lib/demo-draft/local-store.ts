import type { LocalDraft } from './patch'

function storageKey(tenant: string, baseRevision: string) {
  return `studio-presence:demo-draft:${tenant}:${baseRevision}`
}

export function readLocalDraft(tenant: string, baseRevision: string): LocalDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(tenant, baseRevision))
    return raw ? (JSON.parse(raw) as LocalDraft) : null
  } catch {
    return null
  }
}

export function writeLocalDraft(draft: LocalDraft) {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey(draft.tenant, draft.baseRevision), JSON.stringify(draft))
}

export function clearLocalDraft(tenant: string, baseRevision: string) {
  if (typeof window !== 'undefined') window.localStorage.removeItem(storageKey(tenant, baseRevision))
}
