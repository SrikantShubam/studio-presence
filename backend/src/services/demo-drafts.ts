import { z } from 'zod'
import type { Db } from '../db/scoped'
import { validateEditablePatch } from './panel'

const patchSchema = z.record(z.string(), z.unknown()).default({})

export async function importPaidDraft(db: Db, input: { tenantId: string; demoId?: string | null; baseRevision: string; patch: unknown }) {
  const patch = validateEditablePatch(patchSchema.parse(input.patch))
  const { data, error } = await db.rpc('operator_import_paid_draft', {
    p_tenant_id: input.tenantId,
    p_source_demo_id: input.demoId ?? null,
    p_base_revision: input.baseRevision,
    p_patch: patch,
  })
  if (error || !data) throw new Error('Could not import the paid draft.')
  return data
}

export async function publishPaidDraft(db: Db, draftId: string): Promise<void> {
  const { error } = await db.rpc('operator_publish_paid_draft', { p_draft_id: draftId })
  if (error) throw new Error('Could not publish the paid draft.')
}

export async function submitPaidDraft(db: Db, input: { tenantSlug: string; baseRevision: string; patch: unknown }) {
  const patch = validateEditablePatch(patchSchema.parse(input.patch))
  const { data, error } = await db.rpc('submit_paid_draft', {
    p_tenant_slug: input.tenantSlug,
    p_base_revision: input.baseRevision,
    p_patch: patch,
  })
  if (error || !data) throw new Error('Could not submit the local demo draft.')
  return data
}

export const demoDrafts = { importPaidDraft, publishPaidDraft, submitPaidDraft }
