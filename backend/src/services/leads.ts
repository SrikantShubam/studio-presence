import { z } from 'zod'
import { loadClientConfig } from '../config/index'
import { createAnonClient, type Db } from '../db/index'
import type { Lead, LeadStatus } from '../db/types'
import { sendOwnerLeadNotification } from './notify'

const requiredText = z.string().trim().min(1)
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .optional()

export const leadSourceSchema = z.enum(['whatsapp', 'estimate', 'form', 'call', 'other'])
export const leadStatusSchema = z.enum(['new', 'contacted', 'quoted', 'won', 'lost'])

export const publicLeadInputSchema = z.object({
  name: requiredText,
  phone: requiredText,
  email: optionalText.pipe(z.email().optional()),
  locality: optionalText,
  projectType: optionalText,
  budgetBand: optionalText,
  timeline: optionalText,
  message: optionalText,
  source: leadSourceSchema,
  sourcePage: optionalText,
})

export const createLeadInputSchema = publicLeadInputSchema.extend({
  tenantSlug: z.string().trim().regex(/^[a-z0-9-]+$/),
})

export type PublicLeadInput = z.infer<typeof publicLeadInputSchema>
export type CreateLeadInput = z.infer<typeof createLeadInputSchema>

export class LeadWriteError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'LeadWriteError'
  }
}

function assertSingleLead(row: Lead | null, error: { message: string } | null): Lead {
  if (error) throw new LeadWriteError('Lead operation failed.', error)
  if (!row) throw new LeadWriteError('Lead was not found.')
  return row
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'unknown error'
}

export async function create(input: CreateLeadInput): Promise<{ leadId: string }> {
  const parsed = createLeadInputSchema.parse(input)
  const db = createAnonClient()
  const args = {
    p_tenant_slug: parsed.tenantSlug,
    p_name: parsed.name,
    p_phone: parsed.phone,
    p_email: parsed.email ?? null,
    p_locality: parsed.locality ?? null,
    p_project_type: parsed.projectType ?? null,
    p_budget_band: parsed.budgetBand ?? null,
    p_timeline: parsed.timeline ?? null,
    p_message: parsed.message ?? null,
    p_source: parsed.source,
    p_source_page: parsed.sourcePage ?? null,
  }

  let leadId: string | null = null
  let lastError: unknown = null

  for (let attempt = 1; attempt <= 2; attempt++) {
    const { data, error } = await db.rpc('submit_lead', args)
    if (!error && data) {
      leadId = data
      break
    }

    lastError = error ?? new Error('submit_lead returned no lead id')
    console.error('Lead write attempt failed', {
      tenantSlug: parsed.tenantSlug,
      attempt,
      error: errorMessage(lastError),
    })
  }

  if (!leadId) {
    throw new LeadWriteError('Lead write failed.', lastError)
  }

  try {
    const config = loadClientConfig(parsed.tenantSlug)
    await sendOwnerLeadNotification({
      leadId,
      to: config.business.email,
      tenantSlug: parsed.tenantSlug,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      locality: parsed.locality,
      projectType: parsed.projectType,
      budgetBand: parsed.budgetBand,
      timeline: parsed.timeline,
      message: parsed.message,
      source: parsed.source,
      sourcePage: parsed.sourcePage,
    })
  } catch (e) {
    console.error('Lead notification failed', {
      leadId,
      tenantSlug: parsed.tenantSlug,
      error: errorMessage(e),
    })
  }

  return { leadId }
}

export async function list(db: Db, params: { status?: LeadStatus } = {}): Promise<Lead[]> {
  let query = db.from('leads').select('*').order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data, error } = await query
  if (error) throw new LeadWriteError('Lead list failed.', error)
  return data ?? []
}

export async function get(db: Db, leadId: string): Promise<Lead | null> {
  const { data, error } = await db.from('leads').select('*').eq('id', leadId).maybeSingle()
  if (error) throw new LeadWriteError('Lead lookup failed.', error)
  return data
}

export async function updateStatus(db: Db, leadId: string, status: LeadStatus): Promise<Lead> {
  const { data, error } = await db
    .from('leads')
    .update({ status })
    .eq('id', leadId)
    .select('*')
    .single()

  return assertSingleLead(data, error)
}

export async function addNote(db: Db, leadId: string, note: string): Promise<Lead> {
  const { data, error } = await db
    .from('leads')
    .update({ notes: note })
    .eq('id', leadId)
    .select('*')
    .single()

  return assertSingleLead(data, error)
}

export const leads = {
  create,
  list,
  get,
  updateStatus,
  addNote,
}
