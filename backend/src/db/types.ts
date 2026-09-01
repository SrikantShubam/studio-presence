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
export type DemoWorkflowState = 'generated' | 'review_failed' | 'review_passed' | 'sent' | 'opened' | 'editor_opened' | 'edited_locally' | 'activation_requested' | 'expired' | 'payment_confirmed' | 'activated' | 'domain_live' | 'lost' | 'removed'
export type PaidDraftState = 'draft' | 'published' | 'discarded' | 'rolled_back'

export type ProspectContact = {
  id: string
  tenant_id: string
  email_lower: string
  email_display: string
  first_seen_at: string
  last_seen_at: string
  source: string
}

export type TenantEmailGrant = {
  tenant_id: string
  email_lower: string
  email_display: string
  user_id: string | null
  granted_by: string
  granted_at: string
  revoked_at: string | null
}

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

export type I18nOverride = {
  tenant_id: string
  locale: string
  patch: Record<string, unknown>
  updated_at: string
  updated_by: string | null
}

export type ProspectDemo = {
  id: string
  tenant_id: string
  prospect_name: string | null
  prospect_contact: string | null
  workflow_state: DemoWorkflowState
  base_revision: string
  provenance: Record<string, unknown>
  review_notes: string | null
  sent_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export type PaidContentDraft = {
  id: string
  tenant_id: string
  source_demo_id: string | null
  base_revision: string
  patch: Record<string, unknown>
  state: PaidDraftState
  created_by: string | null
  published_by: string | null
  created_at: string
  published_at: string | null
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
      i18n_overrides: Table<I18nOverride>
      prospect_demos: Table<ProspectDemo>
      paid_content_drafts: Table<PaidContentDraft>
      operator_audit_events: Table<Record<string, unknown>>
      operator_users: Table<Record<string, unknown>>
      prospect_contacts: Table<ProspectContact>
      tenant_email_grants: Table<TenantEmailGrant>
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
      get_i18n_overrides: {
        Args: { p_tenant_slug: string; p_locale: string }
        Returns: Record<string, unknown>
      }
      is_operator: { Args: Record<never, never>; Returns: boolean }
      operator_list_demos: { Args: { p_state?: DemoWorkflowState | null }; Returns: ProspectDemo[] }
      operator_update_demo_state: { Args: { p_demo_id: string; p_state: DemoWorkflowState; p_notes?: string | null }; Returns: ProspectDemo }
      operator_grant_owner: { Args: { p_tenant_id: string; p_user_id: string }; Returns: boolean }
      operator_revoke_owner: { Args: { p_tenant_id: string; p_user_id: string }; Returns: boolean }
      operator_import_paid_draft: { Args: { p_tenant_id: string; p_source_demo_id?: string | null; p_base_revision: string; p_patch: Record<string, unknown> }; Returns: string }
      operator_publish_paid_draft: { Args: { p_draft_id: string }; Returns: boolean }
      record_demo_contact: { Args: { p_tenant_slug: string }; Returns: boolean }
      claim_pending_tenant_access: { Args: Record<never, never>; Returns: number }
      operator_grant_email: { Args: { p_tenant_id: string; p_email: string }; Returns: boolean }
      operator_revoke_email: { Args: { p_tenant_id: string; p_email: string }; Returns: boolean }
      operator_list_email_grants: { Args: { p_tenant_id: string }; Returns: TenantEmailGrant[] }
      operator_open_demo: { Args: { p_tenant_id: string; p_days?: number }; Returns: boolean }
      operator_grant_email_by_slug: { Args: { p_tenant_slug: string; p_email: string }; Returns: boolean }
      operator_revoke_email_by_slug: { Args: { p_tenant_slug: string; p_email: string }; Returns: boolean }
      submit_paid_draft: { Args: { p_tenant_slug: string; p_base_revision: string; p_patch: Record<string, unknown> }; Returns: string }
      claim_operator_access: { Args: Record<never, never>; Returns: boolean }
      get_demo_window: { Args: { p_tenant_slug: string }; Returns: Array<{ available: boolean; base_revision: string; expires_at: string | null }> }
    }
    Enums: {
      lead_source: LeadSource
      lead_status: LeadStatus
      tenant_tier: TenantTier
      tenant_status: TenantStatus
      demo_workflow_state: DemoWorkflowState
      paid_draft_state: PaidDraftState
    }
    CompositeTypes: Record<never, never>
  }
}
