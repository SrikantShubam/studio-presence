import type { Db } from '../db/scoped'
import type { WorkspacePreferences } from '../db/types'

export class WorkspacePreferencesError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'WorkspacePreferencesError'
  }
}

export const DEFAULT_WORKSPACE_PREFERENCES: Omit<WorkspacePreferences, 'tenant_id' | 'updated_at' | 'updated_by'> = {
  new_lead_alerts: true,
  weekly_digest: true,
  timezone: 'Asia/Kolkata',
}

export function isValidWorkspaceTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export type WorkspacePreferenceValues = Omit<
  WorkspacePreferences,
  'tenant_id' | 'updated_at' | 'updated_by'
>

function valuesFrom(row: WorkspacePreferences | null): WorkspacePreferenceValues {
  return {
    new_lead_alerts: row?.new_lead_alerts ?? DEFAULT_WORKSPACE_PREFERENCES.new_lead_alerts,
    weekly_digest: row?.weekly_digest ?? DEFAULT_WORKSPACE_PREFERENCES.weekly_digest,
    timezone: row?.timezone && isValidWorkspaceTimezone(row.timezone)
      ? row.timezone
      : DEFAULT_WORKSPACE_PREFERENCES.timezone,
  }
}

export async function getWorkspacePreferences(db: Db, tenantId: string): Promise<WorkspacePreferenceValues> {
  const { data, error } = await db
    .from('workspace_preferences')
    .select('tenant_id, new_lead_alerts, weekly_digest, timezone, updated_at, updated_by')
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (error) throw new WorkspacePreferencesError('Could not load workspace notification preferences.', error)
  return valuesFrom(data)
}

export async function saveWorkspacePreferences(
  db: Db,
  tenantId: string,
  updatedBy: string,
  values: WorkspacePreferenceValues,
): Promise<WorkspacePreferenceValues> {
  if (!isValidWorkspaceTimezone(values.timezone)) {
    throw new WorkspacePreferencesError('Invalid workspace timezone.')
  }

  const { data, error } = await db
    .from('workspace_preferences')
    .upsert({
      tenant_id: tenantId,
      ...values,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .select('tenant_id, new_lead_alerts, weekly_digest, timezone, updated_at, updated_by')
    .single()

  if (error) throw new WorkspacePreferencesError('Could not save workspace notification preferences.', error)
  return valuesFrom(data)
}

export const workspacePreferences = {
  get: getWorkspacePreferences,
  save: saveWorkspacePreferences,
}
