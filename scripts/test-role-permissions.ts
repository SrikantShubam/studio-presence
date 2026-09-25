import assert from 'node:assert/strict'
import {
  canWorkspaceRole,
  getWorkspaceCapabilities,
  type WorkspaceRole,
} from '../backend/src/auth/permissions'

const roles: WorkspaceRole[] = ['owner', 'editor', 'viewer']

assert.deepEqual(getWorkspaceCapabilities('owner'), {
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
})

assert.deepEqual(getWorkspaceCapabilities('editor'), {
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
})

assert.deepEqual(getWorkspaceCapabilities('viewer'), {
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
})

assert.equal(canWorkspaceRole('owner', 'leadAssign'), true)
assert.equal(canWorkspaceRole('editor', 'leadAssign'), false)
assert.equal(canWorkspaceRole('viewer', 'leadStatusUpdate'), true)

for (const role of roles) {
  assert.equal(getWorkspaceCapabilities(role).leadView, true)
}

console.log('role permission matrix passed')
