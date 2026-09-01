# Demo-First Admin Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the demo-first operating platform: temporary prospect demos, browser-local demo editing, super-admin review/conversion/access control, and paid draft publishing.

**Architecture:** Keep `clients/*.json` as the seed and `client_overrides` as the paid persistent override layer. Add separate demo lifecycle tables/services for prospect operations, plus a client-side local draft path that never calls the paid `/panel` write API until activation. Keep `tenant.status` as the commercial/rendering gate and introduce separate workflow states for demo operations. Operator write actions use narrow `SECURITY DEFINER` RPCs that first verify `public.is_operator()`; service-role clients remain banned from request paths.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Supabase Auth/Postgres/RLS, Zod, existing `@studio/backend` workspace services.

---

## Scope And File Map

Do not edit frozen paths listed in `AGENTS.md`: `backend/src/config/**`, `frontend/sections/registry.ts`, `docs/product/SPEC.md`, or `clients/*.json`.

Primary files to create:

- `backend/supabase/migrations/0005_demo_first_admin_platform.sql` — demo lifecycle, operator audit, draft revisions, and RLS.
- `backend/src/services/demo-lifecycle.ts` — backend service for super-admin demo operations.
- `backend/src/services/demo-drafts.ts` — validation and conversion of browser-local patches into paid drafts.
- `backend/src/services/access-control.ts` — operator-only grant/revoke/transfer helpers.
- `frontend/lib/demo-draft/local-store.ts` — IndexedDB/localStorage draft persistence adapter.
- `frontend/lib/demo-draft/patch.ts` — base revision and patch merge helpers.
- `frontend/app/[tenant]/(admin)/demo-editor/page.tsx` — prospect-facing local-only editor route.
- `frontend/app/[tenant]/(admin)/demo-editor/DemoEditor.tsx` — demo editor UI.
- `frontend/app/[tenant]/(admin)/demo-editor/local-actions.ts` — activation handoff helpers, no backend save.
- `frontend/app/[tenant]/(admin)/super/page.tsx` — super-admin dashboard entry.
- `frontend/app/[tenant]/(admin)/super/SuperAdminConsole.tsx` — super-admin queue UI.
- `frontend/app/api/admin/demos/route.ts` — list/create/update demo lifecycle entries.
- `frontend/app/api/admin/demos/[demoId]/route.ts` — review/send/expire/extend/remove demo.
- `frontend/app/api/admin/access/route.ts` — grant/revoke/transfer owner access.
- `frontend/app/api/admin/drafts/route.ts` — import validated paid draft after activation through operator RPC.
- `scripts/test-demo-lifecycle.ts` — database-level lifecycle/RLS checks.

Primary files to modify:

- `backend/src/db/types.ts` — add demo/admin/draft table types.
- `backend/src/index.ts` — export new services.
- `frontend/app/[tenant]/(admin)/panel/PanelEditor.tsx` — extract reusable field editor pieces where needed.
- `frontend/app/api/[tenant]/panel/route.ts` — leave paid write path intact; add shared validation only if imported from backend service.
- `scripts/check-tenant-isolation.ts` — include new admin API paths in service-role boundary checks.
- `package.json` — add `test:demo-lifecycle` script.

## Phase 1: Database And Types

### Task 1: Add Demo Lifecycle Schema

**Files:**
- Create: `backend/supabase/migrations/0005_demo_first_admin_platform.sql`
- Modify: `backend/src/db/types.ts`
- Test: `scripts/test-demo-lifecycle.ts`

- [ ] **Step 1: Write the failing database test skeleton**

Create `scripts/test-demo-lifecycle.ts`:

```ts
import { createServiceRoleClient } from '../backend/src/db/service-role'
import { createAnonClient, createScopedClient } from '../backend/src/db/scoped'
import { heading, fail } from './_report'

const NAME = 'test:demo-lifecycle'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'
const stamp = process.env.DEMO_TEST_STAMP ?? 'demotest'

const admin = createServiceRoleClient()
const failures: string[] = []

function assert(label: string, condition: boolean, detail: string): void {
  if (condition) {
    console.log(`  ${GREEN}ok${RESET}    ${label}`)
  } else {
    console.log(`  ${RED}FAIL${RESET}  ${label}`)
    console.log(`        ${detail}`)
    failures.push(label)
  }
}

async function main() {
  heading(NAME)

  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .insert({ slug: `${stamp}-studio`, name: `${stamp} Studio`, tier: 't1', status: 'demo' })
    .select()
    .single()
  if (tenantError || !tenant) throw new Error(`creating tenant: ${tenantError?.message}`)

  try {
    const { data: demo, error: demoError } = await admin
      .from('prospect_demos')
      .insert({
        tenant_id: tenant.id,
        prospect_name: 'Demo Prospect',
        prospect_contact: '+919000000000',
        workflow_state: 'generated',
        sent_at: null,
        expires_at: null,
        base_revision: 'base-1',
        provenance: { source: 'test' },
      })
      .select()
      .single()

    assert('service role can create a prospect demo', !demoError && !!demo, demoError?.message ?? 'no row')

    const anon = createAnonClient()
    const { data: anonRows } = await anon.from('prospect_demos').select('*')
    assert('anonymous users cannot enumerate prospect demos', (anonRows ?? []).length === 0, `anon read ${(anonRows ?? []).length} rows`)

    const { data: user, error: userError } = await admin.auth.admin.createUser({
      email: `${stamp}@example.test`,
      password: `${stamp}-Aa1!-not-real`,
      email_confirm: true,
    })
    if (userError || !user.user) throw new Error(`creating user: ${userError?.message}`)

    try {
      const signedIn = await anon.auth.signInWithPassword({
        email: `${stamp}@example.test`,
        password: `${stamp}-Aa1!-not-real`,
      })
      if (signedIn.error || !signedIn.data.session) throw new Error(`signing in: ${signedIn.error?.message}`)

      const scoped = createScopedClient(signedIn.data.session.access_token)
      const { data: scopedRows } = await scoped.from('prospect_demos').select('*')
      assert('ordinary authenticated users cannot enumerate prospect demos', (scopedRows ?? []).length === 0, `user read ${(scopedRows ?? []).length} rows`)
    } finally {
      await admin.auth.admin.deleteUser(user.user.id)
    }
  } finally {
    await admin.from('tenants').delete().eq('id', tenant.id)
  }

  if (failures.length) fail(NAME, `${failures.length} lifecycle check(s) failed.`)
  console.log(`${GREEN}PASS${RESET}  demo lifecycle isolation holds at the database\n`)
}

main().catch((e) => fail(NAME, (e as Error).message))
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test:demo-lifecycle
```

Expected: script missing until Task 1 Step 5 adds it, or database error that `prospect_demos` does not exist.

- [ ] **Step 3: Add migration**

Create `backend/supabase/migrations/0005_demo_first_admin_platform.sql`:

```sql
create type demo_workflow_state as enum (
  'generated',
  'review_failed',
  'review_passed',
  'sent',
  'opened',
  'editor_opened',
  'edited_locally',
  'activation_requested',
  'expired',
  'payment_confirmed',
  'activated',
  'domain_live',
  'lost',
  'removed'
);

create type operator_audit_action as enum (
  'demo_created',
  'demo_reviewed',
  'demo_sent',
  'demo_extended',
  'demo_expired',
  'demo_removed',
  'activation_requested',
  'payment_confirmed',
  'owner_granted',
  'owner_revoked',
  'owner_transferred',
  'draft_imported',
  'draft_published',
  'draft_rolled_back',
  'domain_launched',
  'tenant_archived'
);

create table prospect_demos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  prospect_name text,
  prospect_contact text,
  workflow_state demo_workflow_state not null default 'generated',
  base_revision text not null,
  provenance jsonb not null default '{}'::jsonb,
  review_notes text,
  sent_at timestamptz,
  expires_at timestamptz,
  opened_at timestamptz,
  editor_opened_at timestamptz,
  activation_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prospect_demos_state_idx on prospect_demos (workflow_state, created_at desc);
create index prospect_demos_tenant_idx on prospect_demos (tenant_id);
create index prospect_demos_expiry_idx on prospect_demos (expires_at) where expires_at is not null;

create table paid_content_drafts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  source_demo_id uuid references prospect_demos on delete set null,
  base_revision text not null,
  patch jsonb not null default '{}'::jsonb,
  state text not null default 'draft',
  created_by uuid references auth.users,
  published_by uuid references auth.users,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  constraint paid_content_drafts_state_check check (state in ('draft', 'published', 'discarded', 'rolled_back'))
);

create index paid_content_drafts_tenant_idx on paid_content_drafts (tenant_id, created_at desc);

create table operator_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users,
  tenant_id uuid references tenants on delete set null,
  prospect_demo_id uuid references prospect_demos on delete set null,
  action operator_audit_action not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index operator_audit_events_tenant_idx on operator_audit_events (tenant_id, created_at desc);
create index operator_audit_events_demo_idx on operator_audit_events (prospect_demo_id, created_at desc);

alter table prospect_demos enable row level security;
alter table paid_content_drafts enable row level security;
alter table operator_audit_events enable row level security;

-- No anon or ordinary authenticated policies. These tables are operated by
-- server-side admin code and narrow RPCs added later.
```

- [ ] **Step 4: Update hand-written database types**

Modify `backend/src/db/types.ts` with:

```ts
export type DemoWorkflowState =
  | 'generated'
  | 'review_failed'
  | 'review_passed'
  | 'sent'
  | 'opened'
  | 'editor_opened'
  | 'edited_locally'
  | 'activation_requested'
  | 'expired'
  | 'payment_confirmed'
  | 'activated'
  | 'domain_live'
  | 'lost'
  | 'removed'

export type OperatorAuditAction =
  | 'demo_created'
  | 'demo_reviewed'
  | 'demo_sent'
  | 'demo_extended'
  | 'demo_expired'
  | 'demo_removed'
  | 'activation_requested'
  | 'payment_confirmed'
  | 'owner_granted'
  | 'owner_revoked'
  | 'owner_transferred'
  | 'draft_imported'
  | 'draft_published'
  | 'draft_rolled_back'
  | 'domain_launched'
  | 'tenant_archived'

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
  opened_at: string | null
  editor_opened_at: string | null
  activation_requested_at: string | null
  created_at: string
  updated_at: string
}

export type PaidContentDraft = {
  id: string
  tenant_id: string
  source_demo_id: string | null
  base_revision: string
  patch: Record<string, unknown>
  state: 'draft' | 'published' | 'discarded' | 'rolled_back'
  created_by: string | null
  published_by: string | null
  created_at: string
  published_at: string | null
}

export type OperatorAuditEvent = {
  id: string
  actor_user_id: string | null
  tenant_id: string | null
  prospect_demo_id: string | null
  action: OperatorAuditAction
  payload: Record<string, unknown>
  created_at: string
}
```

Add table entries:

```ts
prospect_demos: Table<ProspectDemo>
paid_content_drafts: Table<PaidContentDraft>
operator_audit_events: Table<OperatorAuditEvent>
```

Add enum entries:

```ts
demo_workflow_state: DemoWorkflowState
operator_audit_action: OperatorAuditAction
```

- [ ] **Step 5: Add npm script**

Modify `package.json`:

```json
"test:demo-lifecycle": "node --env-file-if-exists=.env --import tsx scripts/test-demo-lifecycle.ts"
```

- [ ] **Step 6: Run database test**

Run:

```bash
npm run test:demo-lifecycle
```

Expected: PASS after migration is applied to the active Supabase database.

- [ ] **Step 7: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

## Phase 2: Backend Services

### Task 2: Implement Demo Lifecycle Service

**Files:**
- Create: `backend/src/services/demo-lifecycle.ts`
- Modify: `backend/src/index.ts`
- Test: `scripts/test-demo-lifecycle.ts`

- [ ] **Step 1: Extend test for lifecycle transitions**

In `scripts/test-demo-lifecycle.ts`, after creating a demo, add service-role updates that prove valid states can be written:

```ts
const { error: sentError } = await admin
  .from('prospect_demos')
  .update({
    workflow_state: 'sent',
    sent_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })
  .eq('id', demo.id)

assert('demo can move to sent with expiry', !sentError, sentError?.message ?? 'transition failed')
```

- [ ] **Step 2: Create service**

Create `backend/src/services/demo-lifecycle.ts`:

```ts
import type { Db } from '../db/scoped'
import type { DemoWorkflowState, ProspectDemo } from '../db/types'

export class DemoLifecycleError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'DemoLifecycleError'
  }
}

type AdminDb = Db

const SEND_DAYS = 7
const UNSENT_HARD_CAP_DAYS = 14

function isoAfterDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

async function audit(
  db: AdminDb,
  input: {
    actorUserId?: string | null
    tenantId?: string | null
    demoId?: string | null
    action:
      | 'demo_created'
      | 'demo_reviewed'
      | 'demo_sent'
      | 'demo_extended'
      | 'demo_expired'
      | 'demo_removed'
      | 'activation_requested'
      | 'payment_confirmed'
    payload?: Record<string, unknown>
  },
): Promise<void> {
  const { error } = await db.from('operator_audit_events').insert({
    actor_user_id: input.actorUserId ?? null,
    tenant_id: input.tenantId ?? null,
    prospect_demo_id: input.demoId ?? null,
    action: input.action,
    payload: input.payload ?? {},
  })
  if (error) throw new DemoLifecycleError('Could not write audit event.', error)
}

export async function listDemos(db: AdminDb, state?: DemoWorkflowState): Promise<ProspectDemo[]> {
  let query = db.from('prospect_demos').select('*').order('created_at', { ascending: false }).limit(100)
  if (state) query = query.eq('workflow_state', state)
  const { data, error } = await query
  if (error) throw new DemoLifecycleError('Could not list demos.', error)
  return (data ?? []) as ProspectDemo[]
}

export async function createDemo(
  db: AdminDb,
  input: {
    tenantId: string
    prospectName?: string | null
    prospectContact?: string | null
    baseRevision: string
    provenance: Record<string, unknown>
    actorUserId?: string | null
  },
): Promise<ProspectDemo> {
  const { data, error } = await db
    .from('prospect_demos')
    .insert({
      tenant_id: input.tenantId,
      prospect_name: input.prospectName ?? null,
      prospect_contact: input.prospectContact ?? null,
      workflow_state: 'generated',
      base_revision: input.baseRevision,
      provenance: input.provenance,
      expires_at: isoAfterDays(UNSENT_HARD_CAP_DAYS),
    })
    .select()
    .single()
  if (error || !data) throw new DemoLifecycleError('Could not create demo.', error)
  await audit(db, {
    actorUserId: input.actorUserId,
    tenantId: input.tenantId,
    demoId: data.id,
    action: 'demo_created',
  })
  return data as ProspectDemo
}

export async function markReviewed(
  db: AdminDb,
  demoId: string,
  passed: boolean,
  reviewNotes: string,
  actorUserId?: string | null,
): Promise<ProspectDemo> {
  const nextState: DemoWorkflowState = passed ? 'review_passed' : 'review_failed'
  const { data, error } = await db
    .from('prospect_demos')
    .update({ workflow_state: nextState, review_notes: reviewNotes, updated_at: new Date().toISOString() })
    .eq('id', demoId)
    .select()
    .single()
  if (error || !data) throw new DemoLifecycleError('Could not review demo.', error)
  await audit(db, {
    actorUserId,
    tenantId: data.tenant_id,
    demoId,
    action: 'demo_reviewed',
    payload: { passed, reviewNotes },
  })
  return data as ProspectDemo
}

export async function markSent(db: AdminDb, demoId: string, actorUserId?: string | null): Promise<ProspectDemo> {
  const now = new Date().toISOString()
  const { data, error } = await db
    .from('prospect_demos')
    .update({ workflow_state: 'sent', sent_at: now, expires_at: isoAfterDays(SEND_DAYS), updated_at: now })
    .eq('id', demoId)
    .select()
    .single()
  if (error || !data) throw new DemoLifecycleError('Could not mark demo sent.', error)
  await audit(db, { actorUserId, tenantId: data.tenant_id, demoId, action: 'demo_sent' })
  return data as ProspectDemo
}

export async function markActivationRequested(db: AdminDb, demoId: string): Promise<ProspectDemo> {
  const now = new Date().toISOString()
  const { data, error } = await db
    .from('prospect_demos')
    .update({ workflow_state: 'activation_requested', activation_requested_at: now, updated_at: now })
    .eq('id', demoId)
    .select()
    .single()
  if (error || !data) throw new DemoLifecycleError('Could not request activation.', error)
  await audit(db, { tenantId: data.tenant_id, demoId, action: 'activation_requested' })
  return data as ProspectDemo
}

export const demoLifecycle = {
  listDemos,
  createDemo,
  markReviewed,
  markSent,
  markActivationRequested,
}
```

- [ ] **Step 3: Export service**

Modify `backend/src/index.ts`:

```ts
export * from './services/demo-lifecycle'
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

## Phase 3: Local Demo Draft Engine

### Task 3: Build Browser-Local Draft Storage

**Files:**
- Create: `frontend/lib/demo-draft/local-store.ts`
- Create: `frontend/lib/demo-draft/patch.ts`
- Test: `frontend/lib/demo-draft/patch.test.ts` if the repo has a test runner; otherwise add type-level checks and run typecheck.

- [ ] **Step 1: Create patch helpers**

Create `frontend/lib/demo-draft/patch.ts`:

```ts
export type DemoPatch = Record<string, unknown>

export type LocalDemoDraft = {
  tenant: string
  baseRevision: string
  patch: DemoPatch
  updatedAt: string
}

export function draftKey(tenant: string, baseRevision: string): string {
  return `studio-presence:demo-draft:${tenant}:${baseRevision}`
}

export function changedPatch<T extends Record<string, unknown>>(initial: T, draft: T): DemoPatch {
  const patch: DemoPatch = {}
  for (const key of Object.keys(draft)) {
    if (JSON.stringify(initial[key]) !== JSON.stringify(draft[key])) {
      patch[key] = draft[key]
    }
  }
  return patch
}

export function applyFlatPatch<T extends Record<string, unknown>>(base: T, patch: DemoPatch): T {
  return { ...base, ...patch }
}
```

- [ ] **Step 2: Create local storage adapter**

Create `frontend/lib/demo-draft/local-store.ts`:

```ts
import { draftKey, type DemoPatch, type LocalDemoDraft } from './patch'

export function loadLocalDemoDraft(tenant: string, baseRevision: string): LocalDemoDraft | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(draftKey(tenant, baseRevision))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as LocalDemoDraft
    if (parsed.tenant !== tenant || parsed.baseRevision !== baseRevision) return null
    if (!parsed.patch || typeof parsed.patch !== 'object' || Array.isArray(parsed.patch)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveLocalDemoDraft(tenant: string, baseRevision: string, patch: DemoPatch): LocalDemoDraft {
  if (typeof window === 'undefined') {
    throw new Error('Local demo drafts can only be saved in the browser.')
  }
  const draft: LocalDemoDraft = {
    tenant,
    baseRevision,
    patch,
    updatedAt: new Date().toISOString(),
  }
  window.localStorage.setItem(draftKey(tenant, baseRevision), JSON.stringify(draft))
  return draft
}

export function clearLocalDemoDraft(tenant: string, baseRevision: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(draftKey(tenant, baseRevision))
}

export function exportLocalDemoDraft(tenant: string, baseRevision: string): string | null {
  const draft = loadLocalDemoDraft(tenant, baseRevision)
  return draft ? JSON.stringify(draft, null, 2) : null
}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

## Phase 4: Demo Editor UI

### Task 4: Add Local-Only Demo Editor Route

**Files:**
- Create: `frontend/app/[tenant]/(admin)/demo-editor/page.tsx`
- Create: `frontend/app/[tenant]/(admin)/demo-editor/DemoEditor.tsx`
- Create: `frontend/app/[tenant]/(admin)/demo-editor/local-actions.ts`
- Modify: `frontend/app/[tenant]/(admin)/panel/PanelEditor.tsx` only if extracting shared components is necessary.

- [ ] **Step 1: Create server page that loads editable base values**

Create `frontend/app/[tenant]/(admin)/demo-editor/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { ConfigError, loadClientConfig, panel } from '@studio/backend'
import { DemoEditor } from './DemoEditor'

export default async function DemoEditorPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params

  try {
    const config = loadClientConfig(tenant)
    const current: Record<string, unknown> = {}
    for (const field of panel.allowlistedFields()) {
      const value = field.split('.').reduce<unknown>((acc, key) => {
        if (!acc || typeof acc !== 'object') return undefined
        return (acc as Record<string, unknown>)[key]
      }, config)
      current[field] = value
    }

    return (
      <DemoEditor
        tenant={tenant}
        baseRevision={`${config.slug}:${config.status}`}
        current={current}
        expiresAt={null}
      />
    )
  } catch (e) {
    if (e instanceof ConfigError) notFound()
    throw e
  }
}
```

- [ ] **Step 2: Create local-only editor shell**

Create `frontend/app/[tenant]/(admin)/demo-editor/DemoEditor.tsx` with the same field set as `PanelEditor`, but:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { applyFlatPatch, changedPatch } from '@/lib/demo-draft/patch'
import { clearLocalDemoDraft, loadLocalDemoDraft, saveLocalDemoDraft } from '@/lib/demo-draft/local-store'

type Props = {
  tenant: string
  baseRevision: string
  current: Record<string, unknown>
  expiresAt: string | null
}

export function DemoEditor({ tenant, baseRevision, current, expiresAt }: Props) {
  const stored = typeof window !== 'undefined' ? loadLocalDemoDraft(tenant, baseRevision) : null
  const [draft, setDraft] = useState<Record<string, unknown>>(() =>
    stored ? applyFlatPatch(current, stored.patch) : current,
  )
  const patch = useMemo(() => changedPatch(current, draft), [current, draft])
  const dirty = Object.keys(patch).length > 0

  function update(field: string, value: unknown) {
    const next = { ...draft, [field]: value }
    setDraft(next)
    saveLocalDemoDraft(tenant, baseRevision, changedPatch(current, next))
  }

  function resetAll() {
    clearLocalDemoDraft(tenant, baseRevision)
    setDraft(current)
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 pb-28 sm:px-6 lg:py-8">
      <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <p className="text-sm font-medium text-admin-muted">Demo preview</p>
        <h1 className="text-xl font-semibold text-admin-ink">Make this preview feel like yours</h1>
        <p className="mt-2 text-sm text-admin-muted">
          This is a private 7-day preview. Your edits are saved only in this browser and are not published or uploaded.
          Paid activation saves the approved version and puts it on your domain.
        </p>
        {expiresAt && <p className="mt-2 text-sm text-admin-muted">Preview expires on {expiresAt}.</p>}
      </section>

      <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">
          Phone number
          <input
            value={String(draft['business.phone'] ?? '')}
            onChange={(e) => update('business.phone', e.target.value)}
            className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary"
          />
        </label>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-admin-border bg-admin-surface p-3">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-admin-ink">
            {dirty ? 'Applied to this preview. Not published yet.' : 'No local preview changes.'}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" onClick={resetAll} className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-ink">
              Reset preview
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I edited my ${tenant} demo and want to keep this version.`)}`}
              className="flex min-h-12 items-center justify-center rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-on-primary"
            >
              Keep this version
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
```

Then expand the body by reusing/extracting the full field controls from `PanelEditor.tsx`, preserving the local-only `update()` behavior above.

- [ ] **Step 3: Create local actions file**

Create `frontend/app/[tenant]/(admin)/demo-editor/local-actions.ts`:

```ts
export function activationMessage(tenant: string): string {
  return `I edited my ${tenant} demo and want to keep this version.`
}
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

## Phase 5: Activation Import And Paid Drafts

### Task 5: Validate Local Patch Into Paid Draft

**Files:**
- Create: `backend/src/services/demo-drafts.ts`
- Modify: `backend/src/index.ts`
- Create: `frontend/app/api/admin/drafts/route.ts`

- [ ] **Step 1: Create backend draft service**

Create `backend/src/services/demo-drafts.ts`. This service contains shared validation only; it must not import `db/service-role` and must not write to the database directly from request paths.

```ts
import { panel, PanelScopeError } from './panel'

export class DemoDraftError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'DemoDraftError'
  }
}

export function validateDemoPatch(input: Record<string, unknown>): Record<string, unknown> {
  const allowed = new Set(panel.allowlistedFields())
  const badKeys = Object.keys(input).filter((key) => !allowed.has(key as never))
  if (badKeys.length) {
    throw new PanelScopeError(`These fields cannot be imported: ${badKeys.join(', ')}.`)
  }
  return input
}

export const demoDrafts = {
  validateDemoPatch,
}
```

- [ ] **Step 2: Export service**

Modify `backend/src/index.ts`:

```ts
export * from './services/demo-drafts'
```

- [ ] **Step 3: Create admin draft import route**

Create `frontend/app/api/admin/drafts/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createScopedClient, demoDrafts, PanelScopeError } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const bodySchema = z.object({
  tenantId: z.string().uuid(),
  sourceDemoId: z.string().uuid().nullable(),
  baseRevision: z.string().min(1),
  patch: z.record(z.string(), z.unknown()),
})

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  if (!user || !session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid-request' }, { status: 400 })

  try {
    const patch = demoDrafts.validateDemoPatch(parsed.data.patch)
    const db = createScopedClient(session.access_token)
    const { data, error } = await db.rpc('operator_import_paid_draft', {
      p_tenant_id: parsed.data.tenantId,
      p_source_demo_id: parsed.data.sourceDemoId,
      p_base_revision: parsed.data.baseRevision,
      p_patch: patch,
    })
    if (error) return NextResponse.json({ error: 'import-failed' }, { status: 403 })
    return NextResponse.json({ id: data })
  } catch (e) {
    if (e instanceof PanelScopeError) return NextResponse.json({ error: e.message }, { status: 400 })
    throw e
  }
}
```

Review note: this route must not import `createServiceRoleClient`. Operator authorization and privileged writes happen inside `operator_import_paid_draft`.

- [ ] **Step 4: Run tenant isolation check**

Run:

```bash
npm run check:tenant-isolation
```

Expected: PASS. Any service-role import in `frontend/app/**` or `backend/src/services/**` is a plan failure.

## Phase 6: Super-Admin Access Control

### Task 6: Add Operator Authorization And Access Control

**Files:**
- Modify: `backend/supabase/migrations/0005_demo_first_admin_platform.sql`
- Create: `backend/src/services/access-control.ts`
- Modify: `backend/src/index.ts`
- Create: `frontend/app/api/admin/access/route.ts`

- [ ] **Step 1: Add operator table to migration**

Append to migration:

```sql
create table operator_users (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'operator',
  created_at timestamptz not null default now(),
  constraint operator_users_role_check check (role in ('operator', 'super_admin'))
);

alter table operator_users enable row level security;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from operator_users
    where user_id = auth.uid()
  )
$$;

revoke all on function public.is_operator() from public;
grant execute on function public.is_operator() to authenticated;

create or replace function public.operator_import_paid_draft(
  p_tenant_id uuid,
  p_source_demo_id uuid,
  p_base_revision text,
  p_patch jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_operator() then
    raise exception 'operator access required' using errcode = 'insufficient_privilege';
  end if;

  insert into paid_content_drafts (
    tenant_id,
    source_demo_id,
    base_revision,
    patch,
    state,
    created_by
  ) values (
    p_tenant_id,
    p_source_demo_id,
    p_base_revision,
    p_patch,
    'draft',
    auth.uid()
  )
  returning id into v_id;

  insert into operator_audit_events (
    actor_user_id,
    tenant_id,
    prospect_demo_id,
    action,
    payload
  ) values (
    auth.uid(),
    p_tenant_id,
    p_source_demo_id,
    'draft_imported',
    jsonb_build_object('draft_id', v_id)
  );

  return v_id;
end;
$$;

revoke all on function public.operator_import_paid_draft(uuid, uuid, text, jsonb) from public;
grant execute on function public.operator_import_paid_draft(uuid, uuid, text, jsonb) to authenticated;

create or replace function public.operator_grant_owner(
  p_tenant_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_operator() then
    raise exception 'operator access required' using errcode = 'insufficient_privilege';
  end if;

  insert into tenant_members (tenant_id, user_id, role)
  values (p_tenant_id, p_user_id, 'owner')
  on conflict (user_id, tenant_id) do update set role = excluded.role;

  insert into operator_audit_events (actor_user_id, tenant_id, action, payload)
  values (auth.uid(), p_tenant_id, 'owner_granted', jsonb_build_object('user_id', p_user_id));
end;
$$;

revoke all on function public.operator_grant_owner(uuid, uuid) from public;
grant execute on function public.operator_grant_owner(uuid, uuid) to authenticated;

create or replace function public.operator_revoke_owner(
  p_tenant_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_operator() then
    raise exception 'operator access required' using errcode = 'insufficient_privilege';
  end if;

  delete from tenant_members
  where tenant_id = p_tenant_id
    and user_id = p_user_id;

  insert into operator_audit_events (actor_user_id, tenant_id, action, payload)
  values (auth.uid(), p_tenant_id, 'owner_revoked', jsonb_build_object('user_id', p_user_id));
end;
$$;

revoke all on function public.operator_revoke_owner(uuid, uuid) from public;
grant execute on function public.operator_revoke_owner(uuid, uuid) to authenticated;
```

- [ ] **Step 2: Create access-control service**

Create `backend/src/services/access-control.ts`:

```ts
import type { Db } from '../db/scoped'

export class AccessControlError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'AccessControlError'
  }
}

export async function assertOperator(db: Db): Promise<void> {
  const { data, error } = await db.rpc('is_operator')
  if (error) throw new AccessControlError('Could not verify operator.', error)
  if (data !== true) throw new AccessControlError('Operator access required.')
}

export const accessControl = {
  assertOperator,
}
```

- [ ] **Step 3: Export service**

Modify `backend/src/index.ts`:

```ts
export * from './services/access-control'
```

- [ ] **Step 4: Protect admin routes**

In every `frontend/app/api/admin/**` route, verify there is a session and call `accessControl.assertOperator(createScopedClient(session.access_token))` before any operator RPC.

```ts
const scoped = await createSupabaseServerClient()
const { data: { session } } = await scoped.auth.getSession()
if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
```

Use the existing `createScopedClient` from `@studio/backend`:

```ts
const operatorDb = createScopedClient(session.access_token)
await accessControl.assertOperator(operatorDb)
```

- [ ] **Step 5: Create access API route**

Create `frontend/app/api/admin/access/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { accessControl, createScopedClient } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('grant'), tenantId: z.string().uuid(), userId: z.string().uuid() }),
  z.object({ action: z.literal('revoke'), tenantId: z.string().uuid(), userId: z.string().uuid() }),
])

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  if (!user || !session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid-request' }, { status: 400 })

  await accessControl.assertOperator(createScopedClient(session.access_token))
  const db = createScopedClient(session.access_token)

  if (parsed.data.action === 'grant') {
    const { error } = await db.rpc('operator_grant_owner', { p_tenant_id: parsed.data.tenantId, p_user_id: parsed.data.userId })
    if (error) return NextResponse.json({ error: 'grant-failed' }, { status: 403 })
  } else {
    const { error } = await db.rpc('operator_revoke_owner', { p_tenant_id: parsed.data.tenantId, p_user_id: parsed.data.userId })
    if (error) return NextResponse.json({ error: 'revoke-failed' }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 6: Run checks**

Run:

```bash
npm run check:tenant-isolation
npm run typecheck
```

Expected: PASS. No admin route imports `@studio/backend/db/service-role`.

## Phase 7: Super Admin Console

### Task 7: Build Super-Admin Queue UI

**Files:**
- Create: `frontend/app/[tenant]/(admin)/super/page.tsx`
- Create: `frontend/app/[tenant]/(admin)/super/SuperAdminConsole.tsx`
- Create: `frontend/app/api/admin/demos/route.ts`
- Create: `frontend/app/api/admin/demos/[demoId]/route.ts`

- [ ] **Step 1: Create demos list API**

Create `frontend/app/api/admin/demos/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { accessControl, createScopedClient } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const db = createScopedClient(session.access_token)
  await accessControl.assertOperator(db)
  const state = request.nextUrl.searchParams.get('state') ?? undefined
  const { data, error } = await db.rpc('operator_list_demos', { p_state: state ?? null })
  if (error) return NextResponse.json({ error: 'list-failed' }, { status: 403 })
  return NextResponse.json({ rows: data ?? [] })
}
```

- [ ] **Step 2: Create single-demo action API**

Create `frontend/app/api/admin/demos/[demoId]/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { accessControl, createScopedClient } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('review'), passed: z.boolean(), notes: z.string().default('') }),
  z.object({ action: z.literal('send') }),
  z.object({ action: z.literal('activate') }),
])

export async function PATCH(request: NextRequest, context: { params: Promise<{ demoId: string }> }) {
  const { demoId } = await context.params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  if (!user || !session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const db = createScopedClient(session.access_token)
  await accessControl.assertOperator(db)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid-request' }, { status: 400 })

  const { data, error } = await db.rpc('operator_update_demo_state', {
    p_demo_id: demoId,
    p_action: parsed.data.action,
    p_passed: parsed.data.action === 'review' ? parsed.data.passed : null,
    p_notes: parsed.data.action === 'review' ? parsed.data.notes : null,
  })
  if (error) return NextResponse.json({ error: 'update-failed' }, { status: 403 })
  return NextResponse.json({ row: data })
}
```

Before wiring these routes, add matching `operator_list_demos` and `operator_update_demo_state` functions to `0005_demo_first_admin_platform.sql`. Both functions must call `public.is_operator()` first and must write `operator_audit_events`.

- [ ] **Step 3: Create super-admin page**

Create `frontend/app/[tenant]/(admin)/super/page.tsx`:

```tsx
import { SuperAdminConsole } from './SuperAdminConsole'

export default function SuperAdminPage() {
  return <SuperAdminConsole />
}
```

- [ ] **Step 4: Create console UI**

Create `frontend/app/[tenant]/(admin)/super/SuperAdminConsole.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

type DemoRow = {
  id: string
  tenant_id: string
  prospect_name: string | null
  prospect_contact: string | null
  workflow_state: string
  expires_at: string | null
  created_at: string
}

export function SuperAdminConsole() {
  const [rows, setRows] = useState<DemoRow[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/admin/demos', { cache: 'no-store' })
    if (!response.ok) {
      setError('Could not load demo queue.')
      return
    }
    const body = (await response.json()) as { rows: DemoRow[] }
    setRows(body.rows)
  }

  useEffect(() => {
    void load()
  }, [])

  async function act(id: string, action: 'send' | 'activate') {
    await fetch(`/api/admin/demos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    await load()
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <header>
        <p className="text-sm font-medium text-admin-muted">Super admin</p>
        <h1 className="text-2xl font-semibold text-admin-ink">Demo operations</h1>
      </header>
      {error && <p className="text-sm text-admin-alert">{error}</p>}
      <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-admin-border text-admin-muted">
            <tr>
              <th className="p-3">Prospect</th>
              <th className="p-3">State</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-admin-border last:border-b-0">
                <td className="p-3 text-admin-ink">{row.prospect_name ?? row.prospect_contact ?? row.id}</td>
                <td className="p-3 text-admin-muted">{row.workflow_state}</td>
                <td className="p-3 text-admin-muted">{row.expires_at ?? 'Not sent'}</td>
                <td className="flex gap-2 p-3">
                  <button className="min-h-10 rounded-lg border border-admin-border px-3 text-admin-ink" onClick={() => void act(row.id, 'send')}>
                    Send
                  </button>
                  <button className="min-h-10 rounded-lg bg-admin-primary px-3 text-admin-on-primary" onClick={() => void act(row.id, 'activate')}>
                    Activation requested
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

## Phase 8: Publishing And Rollback

### Task 8: Publish Paid Drafts To Client Overrides

**Files:**
- Modify: `backend/src/services/demo-drafts.ts`
- Create: `frontend/app/api/admin/drafts/[draftId]/publish/route.ts`

- [ ] **Step 1: Add publish function**

In `backend/src/services/demo-drafts.ts`, add a small request-safe RPC wrapper:

```ts
export async function publishPaidDraft(
  db: Db,
  input: { draftId: string },
): Promise<{ patch: Record<string, unknown> }> {
  const { data, error } = await db.rpc('operator_publish_paid_draft', { p_draft_id: input.draftId })
  if (error) throw new DemoDraftError('Could not publish draft.', error)
  return { patch: (data as Record<string, unknown>) ?? {} }
}
```

Add to export object:

```ts
publishPaidDraft,
```

- [ ] **Step 2: Create publish route**

Create `frontend/app/api/admin/drafts/[draftId]/publish/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { accessControl, createScopedClient, demoDrafts } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(_request: Request, context: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await context.params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  if (!user || !session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const db = createScopedClient(session.access_token)
  await accessControl.assertOperator(db)
  const result = await demoDrafts.publishPaidDraft(db, { draftId })
  return NextResponse.json(result)
}
```

Add `operator_publish_paid_draft(p_draft_id uuid)` to `0005_demo_first_admin_platform.sql`. It must call `public.is_operator()`, merge the draft patch into `client_overrides`, mark the draft `published`, and write a `draft_published` audit event.

- [ ] **Step 3: Run checks**

Run:

```bash
npm run check:tenant-isolation
npm run typecheck
```

Expected: PASS.

## Phase 9: Verification And Pilot Readiness

### Task 9: End-To-End Checks

**Files:**
- Modify: `scripts/check-tenant-isolation.ts`
- Modify: `package.json`
- Optional Create: `scripts/test-demo-editor-local.ts`

- [ ] **Step 1: Add check script coverage for admin routes**

Verify `scripts/check-tenant-isolation.ts` scans:

```ts
'frontend/app/api/admin/**/*.{ts,tsx}'
```

Expected: any service-role use in request paths fails. There is no admin-route exception.

- [ ] **Step 2: Run full static checks**

Run:

```bash
npm run check:all
```

Expected: PASS.

- [ ] **Step 3: Manual local QA**

Run:

```bash
npm run dev --workspace frontend
```

Open:

```text
http://ashish.localhost:3000/demo-editor
```

Expected:

- Demo editor loads without Supabase login.
- Copy says edits are saved only in this browser.
- Editing a field changes the local preview state.
- Refresh keeps the local draft on the same browser.
- Reset clears the local draft.
- No request is made to `/api/[tenant]/panel` from demo editor.

- [ ] **Step 4: Paid panel regression QA**

Open:

```text
http://ashish.localhost:3000/panel
```

Expected:

- Paid panel still requires login.
- Paid panel still calls `/api/[tenant]/panel`.
- No demo-local copy appears in paid panel.

- [ ] **Step 5: Super-admin QA**

Open:

```text
http://ashish.localhost:3000/super
```

Expected:

- Non-operator gets unauthorized/forbidden.
- Operator sees demo queue.
- Send and activation requested actions update workflow state.
- Audit events are written.

## Commit Plan

Use small commits:

1. `feat: add demo lifecycle schema`
2. `feat: add demo lifecycle services`
3. `feat: add local demo draft storage`
4. `feat: add local-only demo editor`
5. `feat: add activation draft import`
6. `feat: add operator access controls`
7. `feat: add super admin demo queue`
8. `feat: publish paid drafts`
9. `test: verify demo admin platform`

Do not commit unrelated dirty worktree changes.
