import { z } from 'zod'

export const ACTIVITY_SOURCES = [
  'lead_events',
  'tenant_membership_events',
  'workspace_activity_events',
] as const

export type ActivitySource = (typeof ACTIVITY_SOURCES)[number]

/**
 * Stable customer-facing event vocabulary. Storage-specific event names stay
 * inside their source adapters and are never exposed to the UI.
 */
export const ACTIVITY_EVENT_TYPES = [
  'lead_created',
  'lead_assigned',
  'lead_reassigned',
  'lead_status_changed',
  'lead_note_updated',
  'member_invitation_created',
  'member_invitation_accepted',
  'member_invitation_revoked',
  'member_role_changed',
  'member_removed',
  'content_published',
  'analytics_monthly_summary',
] as const

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number]

/**
 * Source ownership is deliberately explicit. The normalized reader may merge
 * these sources, but it must not write copies of events into another source.
 */
export const ACTIVITY_SOURCE_OWNERSHIP: Readonly<{
  [K in ActivitySource]: readonly ActivityEventType[]
}> = {
  lead_events: [
    'lead_created',
    'lead_assigned',
    'lead_reassigned',
    'lead_status_changed',
    'lead_note_updated',
  ],
  tenant_membership_events: [
    'member_invitation_created',
    'member_invitation_accepted',
    'member_invitation_revoked',
    'member_role_changed',
    'member_removed',
  ],
  workspace_activity_events: [
    'content_published',
    'analytics_monthly_summary',
  ],
}

export const ACTIVITY_SOURCE_ORDER: Readonly<Record<ActivitySource, number>> = {
  lead_events: 0,
  tenant_membership_events: 1,
  workspace_activity_events: 2,
}

export type ActivityActorInput = {
  userId?: string | null
  displayName?: string | null
  email?: string | null
  avatarUrl?: string | null
}

export type ActivityActor = {
  userId: string | null
  name: string
  initials: string
  avatarUrl: string | null
}

function actorWords(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean)
}

export function formatActivityActor(input: ActivityActorInput): ActivityActor {
  const name = input.displayName?.trim() || input.email?.trim() || 'Workspace member'
  const words = actorWords(name)
  const initials = words.length > 1
    ? `${words[0]![0]}${words.at(-1)![0]}`
    : (words[0]?.slice(0, 2) || 'WM')

  return {
    userId: input.userId ?? null,
    name,
    initials: initials.toUpperCase(),
    avatarUrl: input.avatarUrl ?? null,
  }
}

export type ActivityPosition = {
  source: ActivitySource
  eventId: string
  createdAt: string
}

export type NormalizedActivityEvent = ActivityPosition & {
  type: ActivityEventType
  tenantId: string
  actor: ActivityActor
  title: string
  description: string
  entityType: 'lead' | 'member' | 'invitation' | 'workspace' | 'analytics'
  entityId: string | null
  payload: Record<string, unknown>
}

const cursorSchema = z.object({
  version: z.literal(1),
  source: z.enum(ACTIVITY_SOURCES),
  eventId: z.string().uuid(),
  createdAt: z.string().datetime({ offset: true }),
})

export type ActivityCursor = z.infer<typeof cursorSchema>

export class ActivityCursorError extends Error {
  constructor(message = 'Invalid activity cursor.') {
    super(message)
    this.name = 'ActivityCursorError'
  }
}

export function encodeActivityCursor(position: ActivityPosition): string {
  const parsed = cursorSchema.safeParse({ version: 1, ...position })
  if (!parsed.success) throw new ActivityCursorError()
  return Buffer.from(JSON.stringify(parsed.data), 'utf8').toString('base64url')
}

export function decodeActivityCursor(value: string): ActivityCursor {
  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as unknown
    const parsed = cursorSchema.safeParse(decoded)
    if (!parsed.success) throw new ActivityCursorError()
    return parsed.data
  } catch (error) {
    if (error instanceof ActivityCursorError) throw error
    throw new ActivityCursorError()
  }
}

/**
 * Positive means `left` is newer than `right`. This is the comparison used by
 * latest-first feeds and by cursor pagination for fetching older events.
 */
export function compareActivityPositions(left: ActivityPosition, right: ActivityPosition): number {
  const leftTime = Date.parse(left.createdAt)
  const rightTime = Date.parse(right.createdAt)
  if (leftTime !== rightTime) return leftTime - rightTime

  const leftSource = ACTIVITY_SOURCE_ORDER[left.source]
  const rightSource = ACTIVITY_SOURCE_ORDER[right.source]
  if (leftSource !== rightSource) return leftSource - rightSource

  return left.eventId.localeCompare(right.eventId)
}

export function isOlderActivityPosition(
  position: ActivityPosition,
  cursor: ActivityCursor,
): boolean {
  return compareActivityPositions(position, cursor) < 0
}

export function mapLeadEventType(type: string): ActivityEventType | null {
  switch (type) {
    case 'created':
      return 'lead_created'
    case 'assigned':
      return 'lead_assigned'
    case 'reassigned':
      return 'lead_reassigned'
    case 'status_changed':
      return 'lead_status_changed'
    case 'note_added':
    case 'note_updated':
      return 'lead_note_updated'
    default:
      return null
  }
}

export function mapMembershipEventType(type: string): ActivityEventType | null {
  switch (type) {
    case 'invitation_created':
      return 'member_invitation_created'
    case 'invitation_accepted':
      return 'member_invitation_accepted'
    case 'invitation_revoked':
      return 'member_invitation_revoked'
    case 'member_role_changed':
      return 'member_role_changed'
    case 'member_removed':
      return 'member_removed'
    default:
      return null
  }
}
