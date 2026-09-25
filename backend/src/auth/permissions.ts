import type { TenantMemberRole } from '../db/types'

export type WorkspaceRole = TenantMemberRole

export type WorkspaceCapability =
  | 'contentEdit'
  | 'contentPublish'
  | 'leadView'
  | 'leadCreate'
  | 'leadStatusUpdate'
  | 'leadNotesWrite'
  | 'leadAssign'
  | 'calculatorManage'
  | 'digitalCardManage'
  | 'integrationsManage'
  | 'membersManage'

export type WorkspaceCapabilities = Record<WorkspaceCapability, boolean>

const OWNER_CAPABILITIES: WorkspaceCapabilities = {
  contentEdit: true,
  contentPublish: true,
  leadView: true,
  leadCreate: true,
  leadStatusUpdate: true,
  leadNotesWrite: true,
  leadAssign: true,
  calculatorManage: true,
  digitalCardManage: true,
  integrationsManage: true,
  membersManage: true,
}

const EDITOR_CAPABILITIES: WorkspaceCapabilities = {
  contentEdit: true,
  contentPublish: true,
  leadView: true,
  leadCreate: false,
  leadStatusUpdate: true,
  leadNotesWrite: true,
  leadAssign: false,
  calculatorManage: false,
  digitalCardManage: false,
  integrationsManage: false,
  membersManage: false,
}

const VIEWER_CAPABILITIES: WorkspaceCapabilities = {
  contentEdit: false,
  contentPublish: false,
  leadView: true,
  leadCreate: false,
  leadStatusUpdate: true,
  leadNotesWrite: true,
  leadAssign: false,
  calculatorManage: false,
  digitalCardManage: false,
  integrationsManage: false,
  membersManage: false,
}

const CAPABILITIES_BY_ROLE: Record<WorkspaceRole, WorkspaceCapabilities> = {
  owner: OWNER_CAPABILITIES,
  editor: EDITOR_CAPABILITIES,
  viewer: VIEWER_CAPABILITIES,
}

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Studio owner',
  editor: 'Website & content manager',
  viewer: 'Lead coordinator',
}

export function getWorkspaceCapabilities(role: WorkspaceRole): WorkspaceCapabilities {
  return { ...CAPABILITIES_BY_ROLE[role] }
}

export function canWorkspaceRole(role: WorkspaceRole, capability: WorkspaceCapability): boolean {
  return CAPABILITIES_BY_ROLE[role][capability]
}

export function canUpdateLeadWork(
  role: WorkspaceRole,
  assignedTo: string | null | undefined,
  userId: string,
): boolean {
  if (role === 'owner' || role === 'viewer') return true
  return role === 'editor' && assignedTo === userId
}
