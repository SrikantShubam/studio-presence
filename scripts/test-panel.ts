/**
 * Prove the panel write-back path, against the database — both halves of it:
 *
 *   1. the scope boundary (ALLOWLIST in backend/src/services/panel.ts actually
 *      rejects a non-allowlisted field and an invalid value for an allowlisted
 *      one, and does so without partially applying the good keys)
 *   2. tenant isolation on client_overrides, asserted the same way test-rls.ts
 *      asserts it on leads — against Postgres directly, not through the app
 *
 * Also proves the end-to-end path this ticket exists for: a save through
 * panel.saveEditableConfig() is visible afterward through
 * loadPublicClientConfig() — the same anonymous path the public site itself
 * uses, via get_client_overrides() (0002_public_overrides_read.sql).
 *
 *   npx tsx scripts/test-panel.ts
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY and migration 0002 applied. Writes two
 * temporary clients/<slug>.json fixtures for the duration of the run — real
 * tenant slugs are needed because loadClientConfig() reads from disk — and
 * removes them (and the database rows) in a finally block either way.
 */

import { writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createServiceRoleClient } from '../backend/src/db/service-role'
import { createAnonClient, createScopedClient } from '../backend/src/db/scoped'
import { getEditableConfig, saveEditableConfig, PanelScopeError } from '../backend/src/services/panel'
import { loadPublicClientConfig, fetchClientOverridePatch } from '../backend/src/config/index'
import { heading, fail } from './_report'

const NAME = 'test:panel'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

const stamp = process.env.PANEL_TEST_STAMP ?? 'paneltest'
const A = { slug: `${stamp}-alpha`, email: `${stamp}-alpha@example.test` }
const B = { slug: `${stamp}-beta`, email: `${stamp}-beta@example.test` }
const PASSWORD = `${stamp}-Aa1!-not-a-real-account`

const admin = createServiceRoleClient()
const failures: string[] = []
const clientFiles: string[] = []

function assert(label: string, condition: boolean, detail: string): void {
  if (condition) {
    console.log(`  ${GREEN}ok${RESET}    ${label}`)
  } else {
    console.log(`  ${RED}FAIL${RESET}  ${label}`)
    console.log(`        ${detail}`)
    failures.push(label)
  }
}

function fixtureJson(slug: string) {
  return {
    $schema: './client.schema.json',
    slug,
    tier: 't0',
    template: 'editorial',
    status: 'demo',
    vertical: 'interior-design',
    business: {
      name: `${slug} studio`,
      phone: '+919000000001',
      whatsapp: '+919000000001',
      address: { locality: 'Test Locality', city: 'Patna', state: 'Bihar' },
    },
    domain: { demoSubdomain: slug },
    sections: {
      hero: { enabled: true, headline: `${slug} headline` },
      portfolio: { enabled: true, projects: [] },
    },
    seo: { title: `${slug} studio`, description: 'Temporary fixture for scripts/test-panel.ts.' },
  }
}

function writeFixture(slug: string) {
  const path = join(process.cwd(), 'clients', `${slug}.json`)
  writeFileSync(path, JSON.stringify(fixtureJson(slug), null, 2))
  clientFiles.push(path)
}

function removeFixtures() {
  for (const path of clientFiles) {
    if (existsSync(path)) rmSync(path)
  }
}

async function provision(t: { slug: string; email: string }) {
  writeFixture(t.slug)

  const { data: tenant, error: te } = await admin
    .from('tenants')
    .insert({ slug: t.slug, name: t.slug, tier: 't1', status: 'demo' })
    .select()
    .single()
  if (te) throw new Error(`creating tenant ${t.slug}: ${te.message}`)

  const { data: user, error: ue } = await admin.auth.admin.createUser({
    email: t.email,
    password: PASSWORD,
    email_confirm: true,
  })
  if (ue) throw new Error(`creating user ${t.email}: ${ue.message}`)

  const { error: me } = await admin
    .from('tenant_members')
    .insert({ user_id: user.user.id, tenant_id: tenant.id })
  if (me) throw new Error(`linking ${t.email}: ${me.message}`)

  return { tenantId: tenant.id, userId: user.user.id }
}

async function cleanup(ids: Array<{ tenantId: string; userId: string }>) {
  for (const { tenantId, userId } of ids) {
    await admin.from('tenants').delete().eq('id', tenantId) // cascades to client_overrides
    await admin.auth.admin.deleteUser(userId)
  }
  removeFixtures()
}

async function signIn(t: { email: string }) {
  const anon = createAnonClient()
  const { data, error } = await anon.auth.signInWithPassword({ email: t.email, password: PASSWORD })
  if (error || !data.session) throw new Error(`signing in as ${t.email}: ${error?.message}`)
  return createScopedClient(data.session.access_token)
}

async function main() {
  heading(NAME)
  console.log('')

  const created: Array<{ tenantId: string; userId: string }> = []

  try {
    const a = await provision(A)
    const b = await provision(B)
    created.push(a, b)

    const asA = await signIn(A)
    const asB = await signIn(B)

    // --- Scope boundary ---------------------------------------------------

    let scopeRejected = false
    try {
      await saveEditableConfig(asA, { id: a.tenantId, slug: A.slug }, a.userId, {
        'business.phone': '+919876543210',
        template: 'premium',
      })
    } catch (e) {
      scopeRejected = e instanceof PanelScopeError
    }
    assert(
      'saving a non-allowlisted field is rejected, whole call',
      scopeRejected,
      'Expected PanelScopeError for a patch containing "template".',
    )

    const afterRejectedSave = await getEditableConfig(asA, { id: a.tenantId, slug: A.slug })
    assert(
      "the rejected call's allowlisted field was NOT partially saved",
      afterRejectedSave.current['business.phone'] !== '+919876543210',
      'business.phone changed even though the whole call should have been rejected for the bad key.',
    )

    let invalidValueRejected = false
    try {
      await saveEditableConfig(asA, { id: a.tenantId, slug: A.slug }, a.userId, {
        'business.phone': 'not-a-phone-number',
      })
    } catch (e) {
      invalidValueRejected = e instanceof PanelScopeError
    }
    assert(
      'saving an invalid value for an allowlisted field is rejected',
      invalidValueRejected,
      'Expected PanelScopeError for an invalid phone number.',
    )

    // --- Merge, not replace -------------------------------------------------

    await saveEditableConfig(asA, { id: a.tenantId, slug: A.slug }, a.userId, {
      'business.phone': '+919876500001',
    })
    await saveEditableConfig(asA, { id: a.tenantId, slug: A.slug }, a.userId, {
      'sections.about.body': 'Updated about text for A.',
    })

    const afterTwoSaves = await getEditableConfig(asA, { id: a.tenantId, slug: A.slug })
    assert(
      'a later save does not erase an earlier save to a different field',
      afterTwoSaves.current['business.phone'] === '+919876500001' &&
        afterTwoSaves.current['sections.about.body'] === 'Updated about text for A.',
      `Got phone=${afterTwoSaves.current['business.phone']} body=${afterTwoSaves.current['sections.about.body']}`,
    )

    // --- Isolation, against Postgres directly -------------------------------

    await saveEditableConfig(asB, { id: b.tenantId, slug: B.slug }, b.userId, {
      'business.phone': '+919876500002',
    })

    let crossTenantRead: unknown = 'not attempted'
    try {
      const result = await getEditableConfig(asA, { id: b.tenantId, slug: B.slug })
      crossTenantRead = result.patch
    } catch {
      crossTenantRead = 'threw'
    }
    assert(
      "A's session cannot read B's client_overrides row",
      crossTenantRead === 'threw' || Object.keys(crossTenantRead as object).length === 0,
      `A read B's override patch: ${JSON.stringify(crossTenantRead)}. RLS should have returned nothing.`,
    )

    let crossTenantWriteBlocked = false
    try {
      await saveEditableConfig(asA, { id: b.tenantId, slug: B.slug }, a.userId, {
        'business.phone': '+919111111111',
      })
    } catch {
      crossTenantWriteBlocked = true
    }
    assert(
      "A's session cannot write into B's client_overrides row",
      crossTenantWriteBlocked,
      "A's save into B's tenant_id succeeded. Check the client_overrides_upsert with-check clause.",
    )

    const { data: bRowAfterAttack } = await admin
      .from('client_overrides')
      .select('patch')
      .eq('tenant_id', b.tenantId)
      .maybeSingle()
    assert(
      "B's phone was not overwritten by A's blocked attempt",
      (bRowAfterAttack?.patch as Record<string, unknown> | undefined)?.business &&
        (bRowAfterAttack!.patch as { business?: { phone?: string } }).business?.phone === '+919876500002',
      `B's stored patch: ${JSON.stringify(bRowAfterAttack?.patch)}`,
    )

    // --- End to end: anonymous read sees the same value the owner saved ----

    const anonPatch = await fetchClientOverridePatch(A.slug)
    assert(
      'the anonymous get_client_overrides() RPC returns the same patch the owner saved',
      (anonPatch as { business?: { phone?: string } } | undefined)?.business?.phone === '+919876500001',
      `Anonymous fetch returned: ${JSON.stringify(anonPatch)}`,
    )

    const publicConfig = await loadPublicClientConfig(A.slug)
    assert(
      "loadPublicClientConfig() — the public site's own loader — reflects the saved edit",
      publicConfig.business.phone === '+919876500001',
      `Public config phone: ${publicConfig.business.phone}`,
    )

    const anonForB = await fetchClientOverridePatch(B.slug)
    assert(
      "A's saved value never leaks into B's anonymous fetch",
      (anonForB as { business?: { phone?: string } } | undefined)?.business?.phone === '+919876500002',
      `Anonymous fetch for B returned: ${JSON.stringify(anonForB)}`,
    )

    const anonForUnknown = await fetchClientOverridePatch(`${stamp}-does-not-exist`)
    assert(
      'an unknown tenant slug returns an empty patch, not an error',
      anonForUnknown !== undefined && Object.keys(anonForUnknown as object).length === 0,
      `Got: ${JSON.stringify(anonForUnknown)}`,
    )
  } finally {
    await cleanup(created)
  }

  console.log('')
  if (failures.length) {
    fail(NAME, `${failures.length} panel check(s) failed. Do not ship until these pass.`)
  }
  console.log(`${GREEN}PASS${RESET}  panel write-back scope and isolation hold\n`)
}

main().catch((e) => fail(NAME, (e as Error).message))
