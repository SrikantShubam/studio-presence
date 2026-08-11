/**
 * Database types, mirroring `supabase/migrations/0001_init.sql`.
 *
 * Hand-written for now rather than generated, because generation needs a live
 * connection and this is small enough to keep honest. If it grows, switch to
 * `supabase gen types typescript` — the moment these drift from the migration,
 * the compiler starts vouching for a shape the database does not have.
 */

export type LeadSource = 'whatsapp' | 'estimate' | 'form' | 'call' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
export type TenantTier = 't0' | 't1' | 't2' | 't3'
export type TenantStatus = 'demo' | 'sold' | 'live' | 'archived'

export type Tenant = {
  id: string
  slug: string
  name: string
  tier: TenantTier
  status: TenantStatus
  created_at: string
}

export type TenantMember = {
  user_id: string
  tenant_id: string
  role: string
  created_at: string
}

export type Lead = {
  id: string
  tenant_id: string
  name: string
  phone: string
  email: string | null
  locality: string | null
  project_type: string | null
  budget_band: string | null
  timeline: string | null
  message: string | null
  source: LeadSource
  source_page: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
  contacted_at: string | null
}

export type LeadEvent = {
  id: string
  lead_id: string
  tenant_id: string
  type: string
  payload: Record<string, unknown>
  created_at: string
}

export type ClientOverride = {
  tenant_id: string
  patch: Record<string, unknown>
  updated_at: string
  updated_by: string | null
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      tenants: Table<Tenant>
      tenant_members: Table<TenantMember>
      leads: Table<Lead>
      lead_events: Table<LeadEvent>
      client_overrides: Table<ClientOverride>
    }
    Views: Record<never, never>
    Functions: {
      submit_lead: {
        Args: {
          p_tenant_slug: string
          p_name: string
          p_phone: string
          p_email?: string | null
          p_locality?: string | null
          p_project_type?: string | null
          p_budget_band?: string | null
          p_timeline?: string | null
          p_message?: string | null
          p_source?: LeadSource
          p_source_page?: string | null
        }
        Returns: string
      }
      current_tenant_ids: {
        Args: Record<never, never>
        Returns: string[]
      }
      get_client_overrides: {
        Args: { p_tenant_slug: string }
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      lead_source: LeadSource
      lead_status: LeadStatus
      tenant_tier: TenantTier
      tenant_status: TenantStatus
    }
    CompositeTypes: Record<never, never>
  }
}
