import assert from 'node:assert/strict'
import {
  ActivityCursorError,
  ACTIVITY_SOURCE_OWNERSHIP,
  compareActivityPositions,
  decodeActivityCursor,
  encodeActivityCursor,
  formatActivityActor,
  isOlderActivityPosition,
  mapLeadEventType,
  mapMembershipEventType,
} from '../backend/src/services/activity'

const position = {
  source: 'lead_events' as const,
  eventId: '00000000-0000-4000-8000-000000000001',
  createdAt: '2026-09-26T12:00:00.000Z',
}

const cursor = decodeActivityCursor(encodeActivityCursor(position))
assert.deepEqual(cursor, { version: 1, ...position })
assert.equal(isOlderActivityPosition({ ...position, createdAt: '2026-09-26T11:59:59.000Z' }, cursor), true)
assert.equal(compareActivityPositions(position, { ...position, source: 'workspace_activity_events' }), -2)
assert.deepEqual(formatActivityActor({ displayName: 'Ada Lovelace' }), {
  userId: null,
  name: 'Ada Lovelace',
  initials: 'AL',
  avatarUrl: null,
})
assert.deepEqual(formatActivityActor({ email: 'owner@example.com' }).initials, 'OW')
assert.equal(mapLeadEventType('created'), 'lead_created')
assert.equal(mapLeadEventType('unknown'), null)
assert.equal(mapMembershipEventType('member_role_changed'), 'member_role_changed')
assert.equal(mapMembershipEventType('unknown'), null)
assert.deepEqual(ACTIVITY_SOURCE_OWNERSHIP.workspace_activity_events, [
  'content_published',
  'analytics_monthly_summary',
])
assert.throws(
  () => decodeActivityCursor('not-a-cursor'),
  (error: unknown) => error instanceof ActivityCursorError,
)

console.log('Activity type and cursor tests passed.')
