'use client'

import { useEffect, useState } from 'react'
import { PLATFORM_BRAND } from '@/lib/platform-brand'
import { AdminButton, AdminCard, AdminChip, AdminMetric, AdminShell, AdminTextInput } from '../components'

type Demo = { id: string; tenant_id: string; prospect_name: string | null; prospect_contact: string | null; workflow_state: string; expires_at: string | null }
type Draft = { id: string; tenant_id: string; base_revision: string; state: string; created_at: string }

export function SuperAdminConsole({ tenant }: { tenant: string }) {
  const [demos, setDemos] = useState<Demo[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [accessState, setAccessState] = useState<string | null>(null)

  async function load() {
    const response = await fetch('/api/admin/demos', { cache: 'no-store' })
    const body = await response.json() as { demos?: Demo[]; error?: string }
    if (!response.ok) throw new Error(body.error ?? 'Could not load demo queue.')
    setDemos(body.demos ?? [])
    const draftResponse = await fetch('/api/admin/drafts', { cache: 'no-store' })
    const draftBody = await draftResponse.json() as { drafts?: Draft[]; error?: string }
    if (!draftResponse.ok) throw new Error(draftBody.error ?? 'Could not load paid drafts.')
    setDrafts(draftBody.drafts ?? [])
  }

  async function publishDraft(draftId: string) {
    setBusy(draftId)
    try {
      const response = await fetch('/api/admin/drafts/publish', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ draftId }) })
      const body = await response.json() as { error?: string }
      if (!response.ok) throw new Error(body.error ?? 'Could not publish draft.')
      await load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not publish draft.') } finally { setBusy(null) }
  }

  useEffect(() => { void load().catch((reason: Error) => setError(reason.message)) }, [])

  async function update(id: string, state: 'review_passed' | 'sent' | 'expired' | 'removed') {
    setBusy(id)
    try {
      const response = await fetch('/api/admin/demos', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, state }) })
      if (!response.ok) throw new Error('Could not update demo.')
      await load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update demo.') } finally { setBusy(null) }
  }

  async function changeAccess(action: 'grant' | 'revoke') {
    if (!email.trim()) return
    setAccessState('Working...')
    try {
      const response = await fetch('/api/admin/access', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tenantSlug: tenant, email: email.trim(), action }) })
      const body = await response.json() as { error?: string }
      if (!response.ok) throw new Error(body.error ?? 'Could not update access.')
      setAccessState(action === 'grant' ? 'Access granted.' : 'Access revoked.')
    } catch (reason) { setAccessState(reason instanceof Error ? reason.message : 'Could not update access.') }
  }

  const expiringSoon = demos.filter((demo) => isExpiringSoon(demo.expires_at)).length
  const activeDemos = demos.filter((demo) => demo.workflow_state !== 'expired' && demo.workflow_state !== 'removed').length
  const pendingDrafts = drafts.filter((draft) => draft.state === 'draft').length

  return (
    <AdminShell spacious>
      <AdminCard className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">{PLATFORM_BRAND}</p>
            <h1 className="mt-1 text-2xl font-semibold text-admin-ink">Operator Console</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
              Manage demo lifecycle, tenant access, pending customer drafts, and audit-facing actions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminChip tone="primary">System online</AdminChip>
            <AdminChip>{tenant}</AdminChip>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AdminMetric label="active demos" value={activeDemos} tone="primary" />
          <AdminMetric label="expiring soon" value={expiringSoon} tone={expiringSoon > 0 ? 'alert' : 'neutral'} />
          <AdminMetric label="pending drafts" value={pendingDrafts} />
          <AdminMetric label="queue total" value={demos.length + drafts.length} />
        </div>
      </AdminCard>

      {error && <p className="mt-5 text-sm text-admin-alert">{error}</p>}

      <AdminCard className="p-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-admin-ink">Tenant access</h2>
          <p className="text-sm text-admin-muted">Grant or revoke paid panel access for this tenant by customer email.</p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <AdminTextInput value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="customer@example.com" />
          <AdminButton onClick={() => void changeAccess('grant')}>Grant access</AdminButton>
          <AdminButton variant="danger" onClick={() => void changeAccess('revoke')}>Revoke access</AdminButton>
        </div>
        {accessState && <p className="mt-3 text-sm text-admin-muted">{accessState}</p>}
      </AdminCard>

      <AdminCard className="overflow-hidden">
        <div className="border-b border-admin-border p-4">
          <h2 className="font-semibold text-admin-ink">Demo queue</h2>
          <p className="mt-1 text-sm text-admin-muted">Move prospects through review, sent, expired, or removed lifecycle states.</p>
        </div>
        {demos.map((demo) => (
          <div key={demo.id} className="grid gap-3 border-b border-admin-border p-4 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-admin-ink">{demo.prospect_name ?? demo.prospect_contact ?? demo.id}</p>
                <AdminChip tone={demo.workflow_state === 'expired' || demo.workflow_state === 'removed' ? 'alert' : 'primary'}>
                  {demo.workflow_state}
                </AdminChip>
              </div>
              <p className="mt-1 text-sm text-admin-muted">{demo.prospect_contact ?? 'No contact'} · expires {formatDate(demo.expires_at)}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex">
              <AdminButton variant="secondary" disabled={busy === demo.id} onClick={() => void update(demo.id, 'sent')}>Send</AdminButton>
              <AdminButton variant="danger" disabled={busy === demo.id} onClick={() => void update(demo.id, 'expired')}>Expire</AdminButton>
              <AdminButton variant="secondary" disabled={busy === demo.id} onClick={() => void update(demo.id, 'removed')}>Remove</AdminButton>
            </div>
          </div>
        ))}
        {demos.length === 0 && <p className="p-4 text-sm text-admin-muted">No demos in the queue.</p>}
      </AdminCard>

      <AdminCard className="overflow-hidden">
        <div className="border-b border-admin-border p-4"><h2 className="font-semibold text-admin-ink">Paid drafts</h2><p className="mt-1 text-sm text-admin-muted">Customer-submitted drafts stay private until you publish them.</p></div>
        {drafts.map((draft) => (
          <div key={draft.id} className="flex flex-col gap-3 border-b border-admin-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-admin-ink">{draft.tenant_id}</p>
                <AdminChip tone={draft.state === 'draft' ? 'primary' : 'neutral'}>{draft.state}</AdminChip>
              </div>
              <p className="mt-1 text-sm text-admin-muted">Revision {draft.base_revision} · {formatDate(draft.created_at)}</p>
            </div>
            <AdminButton variant="secondary" disabled={busy === draft.id || draft.state !== 'draft'} onClick={() => void publishDraft(draft.id)}>Publish</AdminButton>
          </div>
        ))}
        {drafts.length === 0 && <p className="p-4 text-sm text-admin-muted">No paid drafts submitted.</p>}
      </AdminCard>

      <AdminCard className="p-4">
        <h2 className="font-semibold text-admin-ink">Audit activity</h2>
        <div className="mt-4 flex flex-col gap-3">
          <AuditLine label="Access changes" value={accessState ?? 'No access action in this session.'} />
          <AuditLine label="Draft publication" value={pendingDrafts > 0 ? `${pendingDrafts} drafts waiting for review.` : 'No draft publication pending.'} />
          <AuditLine label="Demo lifecycle" value={`${activeDemos} active demos under operator control.`} />
        </div>
      </AdminCard>
    </AdminShell>
  )
}

function formatDate(value: string | null): string {
  if (!value) return 'not set'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
}

function isExpiringSoon(value: string | null): boolean {
  if (!value) return false
  const expires = new Date(value).getTime()
  const now = Date.now()
  return expires >= now && expires <= now + 1000 * 60 * 60 * 24 * 2
}

function AuditLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-admin-border pt-3 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">{label}</p>
      <p className="text-sm text-admin-ink">{value}</p>
    </div>
  )
}
