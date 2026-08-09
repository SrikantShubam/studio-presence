/**
 * Prove tenant isolation, against the database.
 *
 * Creates two tenants with an owner each, gives each a lead, then signs in as
 * owner A and checks what A can actually reach.
 *
 * The important detail is that this asserts against Postgres, not through the
 * application. An app that filters by tenant correctly returns exactly the same
 * rows as one protected by RLS — passing an app-level test tells you nothing
 * about whether the database would have stopped a query that forgot to filter.
 * This is the only test that distinguishes the two, and it is the difference
 * between a bug and a breach.
 *
 *   npx tsx scripts/test-rls.ts
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY — the setup has to create users and cross-tenant
 * data, which is precisely what RLS is meant to prevent. Cleans up after itself.
 */

import { createServiceRoleClient } from '../backend/src/db/service-role'
import { createAnonClient, createScopedClient } from '../backend/src/db/scoped'
import { heading, fail } from './_report'

const NAME = 'test:rls'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

const stamp = process.env.RLS_TEST_STAMP ?? 'rlstest'
const A = { slug: `${stamp}-alpha`, email: `${stamp}-alpha@example.test` }
const B = { slug: `${stamp}-beta`, email: `${stamp}-beta@example.test` }
const PASSWORD = `${stamp}-Aa1!-not-a-real-account`

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

async function provision(t: { slug: string; email: string }) {
  const { data: tenant, error: te } = await admin
    .from('tenants')
    .insert({ slug: t.slug, name: t.slug, tier: 't3', status: 'demo' })
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

  const { error: le } = await admin.from('leads').insert({
    tenant_id: tenant.id,
    name: `${t.slug} enquiry`,
    phone: '+919000000000',
    source: 'form',
  })
  if (le) throw new Error(`seeding lead for ${t.slug}: ${le.message}`)

  return { tenantId: tenant.id, userId: user.user.id }
}

async function cleanup(ids: Array<{ tenantId: string; userId: string }>) {
  for (const { tenantId, userId } of ids) {
    await admin.from('tenants').delete().eq('id', tenantId) // cascades
    await admin.auth.admin.deleteUser(userId)
  }
}

async function main() {
  heading(NAME)
  console.log('')

  const created: Array<{ tenantId: string; userId: string }> = []

  try {
    created.push(await provision(A))
    created.push(await provision(B))

    // A genuinely anonymous client — no Authorization header at all. Using a
    // scoped client with an empty token instead sends `Bearer `, which Supabase
    // rejects outright, so the anon path would never actually be exercised.
    const anon = createAnonClient()

    const { data: session, error: se } = await anon.auth.signInWithPassword({
      email: A.email,
      password: PASSWORD,
    })
    if (se || !session.session) throw new Error(`signing in as A: ${se?.message}`)

    const asA = createScopedClient(session.session.access_token)

    const { data: leads } = await asA.from('leads').select('*')
    const rows = leads ?? []
    assert(
      'A sees its own lead',
      rows.some((l) => l.name.startsWith(A.slug)),
      `A got ${rows.length} row(s) and none belonged to A. RLS may be denying too much.`,
    )
    assert(
      "A cannot see B's lead",
      !rows.some((l) => l.name.startsWith(B.slug)),
      `A can read B's enquiries. This is a data breach, not a bug — check the leads_select policy.`,
    )

    const { data: tenants } = await asA.from('tenants').select('*')
    assert(
      'A sees exactly one tenant',
      (tenants ?? []).length === 1,
      `A sees ${(tenants ?? []).length} tenants. Expected 1.`,
    )

    // Targeting B's row explicitly, which is what a compromised or buggy caller
    // would do. RLS must return nothing rather than trusting the filter.
    const { data: bDirect } = await asA
      .from('leads')
      .select('*')
      .eq('tenant_id', created[1]!.tenantId)
    assert(
      "A gets nothing when querying B's tenant_id directly",
      (bDirect ?? []).length === 0,
      `A retrieved ${(bDirect ?? []).length} of B's rows by asking for them by id.`,
    )

    // Writing into B's tenant must be refused.
    const { error: crossWrite } = await asA
      .from('lead_events')
      .insert({ lead_id: rows[0]?.id ?? '', tenant_id: created[1]!.tenantId, type: 'probe' })
    assert(
      "A cannot write into B's tenant",
      crossWrite !== null,
      'A inserted a row scoped to B. Check the lead_events_insert with-check clause.',
    )

    // A FRESH client for the anonymous assertions.
    //
    // Reusing `anon` would be wrong and quietly so: signInWithPassword leaves the
    // session on that client instance in memory, regardless of persistSession, so
    // every "anonymous" call would actually run as A. The first version of this
    // test did exactly that and reported anon reading two leads — which looked
    // like a missing policy and was really the test lying.
    const trulyAnon = createAnonClient()

    const { data: newLeadId, error: subErr } = await trulyAnon.rpc('submit_lead', {
      p_tenant_slug: A.slug,
      p_name: 'Anonymous visitor',
      p_phone: '+919111111111',
      p_source: 'whatsapp',
    })
    assert(
      'an anonymous visitor can submit a lead',
      !subErr && typeof newLeadId === 'string',
      `submit_lead failed: ${subErr?.message}`,
    )

    const { data: anonLeads } = await trulyAnon.from('leads').select('*')
    assert(
      'an anonymous visitor cannot read any lead',
      (anonLeads ?? []).length === 0,
      `anon read ${(anonLeads ?? []).length} rows. Every table policy should be scoped to authenticated.`,
    )

    const { data: anonTenants } = await trulyAnon.from('tenants').select('*')
    assert(
      'an anonymous visitor cannot enumerate tenants',
      (anonTenants ?? []).length === 0,
      `anon read ${(anonTenants ?? []).length} tenants. The client list is not public information.`,
    )

    const { error: anonWrite } = await trulyAnon
      .from('leads')
      .insert({ tenant_id: created[0]!.tenantId, name: 'direct', phone: '+919222222222' })
    assert(
      'an anonymous visitor cannot insert a lead directly',
      anonWrite !== null,
      'anon inserted straight into leads. submit_lead() should be the only way in.',
    )
  } finally {
    await cleanup(created)
  }

  console.log('')
  if (failures.length) {
    fail(NAME, `${failures.length} isolation check(s) failed. Do not ship until these pass.`)
  }
  console.log(`${GREEN}PASS${RESET}  tenant isolation holds at the database\n`)
}

main().catch((e) => fail(NAME, (e as Error).message))
