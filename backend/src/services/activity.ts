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
  const name = input.displayName?.trim() || 'Workspace member'
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
  if (leftSource !== rightSource) return rightSource - leftSource

  return right.eventId.localeCompare(left.eventId)
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

export type WorkspaceActivityPage = {
  events: NormalizedActivityEvent[]
  nextCursor: string | null
}

export type WorkspaceActivityOptions = {
  limit?: number
  cursor?: string
  leadId?: string
  currentActor?: ActivityActorInput
}

function actorIdFromPayload(payload: Record<string, unknown>): string | null {
  return typeof payload.actor_user_id === 'string' ? payload.actor_user_id : null
}

function safeActivityPayload(source: ActivitySource, payload: Record<string, unknown>): Record<string, unknown> {
  if (source !== 'tenant_membership_events') return payload
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !/(email|token|secret|password)/i.test(key)),
  )
}

function eventEntity(type: ActivityEventType): NormalizedActivityEvent['entityType'] {
  if (type.startsWith('lead_')) return 'lead'
  if (type.startsWith('member_')) return type.includes('invitation') ? 'invitation' : 'member'
  if (type === 'analytics_monthly_summary') return 'analytics'
  return 'workspace'
}

function leadEventText(type: ActivityEventType, leadName: string, payload: Record<string, unknown>) {
  switch (type) {
    case 'lead_created': return { title: 'New enquiry', description: `${leadName} sent a new enquiry.` }
    case 'lead_assigned': return { title: 'Lead assigned', description: `${leadName} was assigned.` }
    case 'lead_reassigned': return { title: 'Lead reassigned', description: `${leadName} was reassigned.` }
    case 'lead_status_changed': return { title: 'Lead status changed', description: `${leadName} moved from ${String(payload.from ?? 'unknown')} to ${String(payload.to ?? 'unknown')}.` }
    case 'lead_note_updated': return { title: 'Lead note updated', description: `A note on ${leadName} was updated.` }
    default: return { title: 'Lead activity', description: `Activity was recorded for ${leadName}.` }
  }
}

function membershipEventText(type: ActivityEventType): { title: string; description: string } {
  switch (type) {
    case 'member_invitation_created': return { title: 'Team invitation', description: 'A team invitation was sent.' }
    case 'member_invitation_accepted': return { title: 'Team member joined', description: 'A team invitation was accepted.' }
    case 'member_invitation_revoked': return { title: 'Team invitation revoked', description: 'A pending team invitation was revoked.' }
    case 'member_role_changed': return { title: 'Team role changed', description: 'A team member role was changed.' }
    case 'member_removed': return { title: 'Team member removed', description: 'A team member was removed.' }
    default: return { title: 'Team activity', description: 'Workspace membership changed.' }
  }
}

export async function listWorkspaceActivity(
  db: import('../db/scoped').Db,
  tenantId: string,
  options: WorkspaceActivityOptions = {},
): Promise<WorkspaceActivityPage> {
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 50)
  const cursor = options.cursor ? decodeActivityCursor(options.cursor) : null
  const sourceRange = (source: ActivitySource): 'lt' | 'lte' | 'same' | null => {
    if (!cursor) return null
    const sourceRank = ACTIVITY_SOURCE_ORDER[source]
    const cursorRank = ACTIVITY_SOURCE_ORDER[cursor.source]
    if (sourceRank < cursorRank) return 'lt'
    if (sourceRank > cursorRank) return 'lte'
    return 'same'
  }

  const leadQuery = db.from('lead_events').select('*').eq('tenant_id', tenantId)
  const membershipQuery = db.from('tenant_membership_events').select('*').eq('tenant_id', tenantId)
  const workspaceQuery = db.from('workspace_activity_events').select('*').eq('tenant_id', tenantId)
  for (const [source, query] of [['lead_events', leadQuery], ['tenant_membership_events', membershipQuery], ['workspace_activity_events', workspaceQuery]] as const) {
    const range = sourceRange(source)
    if (range === 'lt') query.lt('created_at', cursor!.createdAt)
    if (range === 'lte') query.lte('created_at', cursor!.createdAt)
    if (range === 'same') query.or(`created_at.lt.${cursor!.createdAt},and(created_at.eq.${cursor!.createdAt},id.gt.${cursor!.eventId})`)
  }
  const [leadResult, membershipResult, workspaceResult, membersResult] = await Promise.all([
    leadQuery.order('created_at', { ascending: false }).order('id', { ascending: true }).limit(limit),
    membershipQuery.order('created_at', { ascending: false }).order('id', { ascending: true }).limit(limit),
    workspaceQuery.order('created_at', { ascending: false }).order('id', { ascending: true }).limit(limit),
    db.rpc('list_tenant_members', { p_tenant_id: tenantId }),
  ])
  if (leadResult.error) throw new Error(`Could not load lead activity: ${leadResult.error.message}`)
  if (membershipResult.error) throw new Error(`Could not load membership activity: ${membershipResult.error.message}`)
  if (workspaceResult.error) throw new Error(`Could not load workspace activity: ${workspaceResult.error.message}`)
  if (membersResult.error) throw new Error(`Could not load activity actors: ${membersResult.error.message}`)

  const leadRows = (leadResult.data ?? []) as Array<{ id: string; lead_id: string; tenant_id: string; type: string; payload: Record<string, unknown>; created_at: string }>
  const leadIds = [...new Set(leadRows.map((row) => row.lead_id))]
  const leadsResult = leadIds.length
    ? await db.from('leads').select('id, name').in('id', leadIds)
    : { data: [], error: null }
  if (leadsResult.error) throw new Error(`Could not load activity leads: ${leadsResult.error.message}`)
  const leadNames = new Map((leadsResult.data ?? []).map((lead) => [lead.id, lead.name]))
  const actors = new Map((membersResult.data ?? []).map((member) => {
    const isCurrentActor = options.currentActor?.userId === member.user_id
    return [member.user_id, formatActivityActor({
      userId: member.user_id,
      displayName: isCurrentActor
        ? options.currentActor?.displayName ?? member.display_name
        : member.display_name,
      email: isCurrentActor
        ? options.currentActor?.email ?? member.email
        : member.email,
      avatarUrl: isCurrentActor ? options.currentActor?.avatarUrl : null,
    })]
  }))
  if (options.currentActor?.userId && !actors.has(options.currentActor.userId)) {
    actors.set(options.currentActor.userId, formatActivityActor(options.currentActor))
  }
  const fallbackActor = formatActivityActor({})
  const events: NormalizedActivityEvent[] = []

  for (const row of leadRows) {
    const type = mapLeadEventType(row.type)
    if (!type) continue
    const text = leadEventText(type, leadNames.get(row.lead_id) ?? 'Lead', row.payload)
    events.push({ source: 'lead_events', eventId: row.id, createdAt: row.created_at, type, tenantId, actor: actors.get(actorIdFromPayload(row.payload) ?? '') ?? fallbackActor, title: text.title, description: text.description, entityType: eventEntity(type), entityId: row.lead_id, payload: safeActivityPayload('lead_events', row.payload) })
  }

  for (const row of (membershipResult.data ?? []) as Array<{ id: string; tenant_id: string; actor_user_id: string | null; target_user_id: string | null; invitation_id: string | null; type: string; payload: Record<string, unknown>; created_at: string }>) {
    const type = mapMembershipEventType(row.type)
    if (!type) continue
    const text = membershipEventText(type)
    const entityId = row.target_user_id ?? row.invitation_id
    events.push({ source: 'tenant_membership_events', eventId: row.id, createdAt: row.created_at, type, tenantId, actor: actors.get(row.actor_user_id ?? '') ?? fallbackActor, title: text.title, description: text.description, entityType: eventEntity(type), entityId, payload: safeActivityPayload('tenant_membership_events', row.payload) })
  }

  for (const row of (workspaceResult.data ?? []) as Array<{ id: string; tenant_id: string; actor_user_id: string | null; event_type: string; entity_type: string | null; entity_id: string | null; payload: Record<string, unknown>; created_at: string }>) {
    if (!ACTIVITY_EVENT_TYPES.includes(row.event_type as ActivityEventType)) continue
    const type = row.event_type as ActivityEventType
    events.push({ source: 'workspace_activity_events', eventId: row.id, createdAt: row.created_at, type, tenantId, actor: actors.get(row.actor_user_id ?? '') ?? fallbackActor, title: type === 'content_published' ? 'Website published' : 'Monthly analytics summary', description: type === 'content_published' ? 'Website content was published.' : 'A completed-month website report is available.', entityType: eventEntity(type), entityId: row.entity_id, payload: safeActivityPayload('workspace_activity_events', row.payload) })
  }

  const filtered = events
    .filter((event) => !options.leadId || (event.entityType === 'lead' && event.entityId === options.leadId))
    .filter((event) => !cursor || isOlderActivityPosition(event, cursor))
    .sort((left, right) => compareActivityPositions(right, left))
  const page = filtered.slice(0, limit)
  return {
    events: page,
    nextCursor: filtered.length > limit && page.length ? encodeActivityCursor(page.at(-1)!) : null,
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
