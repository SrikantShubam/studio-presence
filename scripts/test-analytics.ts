import assert from 'node:assert/strict'
import { createServiceRoleClient } from '../backend/src/db/service-role'
import { createAnonClient, createScopedClient, type Db } from '../backend/src/db/scoped'
import type { LeadSource } from '../backend/src/db/types'
import {
  enquiryStats,
  monthlyTrend,
  sourceBreakdown,
  visitStats,
  topProjects,
  type UmamiClient,
} from '../backend/src/services/analytics'
import { heading, fail } from './_report'

type LeadRow = {
  id: string
  source: LeadSource
  created_at: string
}

type QueryState = {
  table: string
  select?: string
  count?: 'exact'
  head?: boolean
  gte?: string
  lt?: string
  order?: { column: string; ascending: boolean }
}

class FakeLeadsQuery {
  private readonly state: QueryState

  constructor(private readonly rows: LeadRow[], table: string) {
    this.state = { table }
  }

  select(select: string, options: { count?: 'exact'; head?: boolean } = {}) {
    this.state.select = select
    this.state.count = options.count
    this.state.head = options.head
    return this
  }

  gte(column: string, value: string) {
    assert.equal(column, 'created_at')
    this.state.gte = value
    return this
  }

  lt(column: string, value: string) {
    assert.equal(column, 'created_at')
    this.state.lt = value
    return this
  }

  order(column: string, options: { ascending: boolean }) {
    this.state.order = { column, ascending: options.ascending }
    return this
  }

  then(resolve: (value: unknown) => void) {
    const rows = this.rows.filter((row) => {
      if (this.state.gte && row.created_at < this.state.gte) return false
      if (this.state.lt && row.created_at >= this.state.lt) return false
      return true
    })

    if (this.state.head) {
      resolve({ count: rows.length, error: null })
      return
    }

    if (this.state.select === 'source,id.count()') {
      const counts = new Map<LeadSource, number>()
      for (const row of rows) counts.set(row.source, (counts.get(row.source) ?? 0) + 1)
      const data = [...counts.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
      resolve({ data, error: null })
      return
    }

    resolve({ data: rows, error: null })
  }
}

function fakeDb(rows: LeadRow[]): Db {
  return {
    from(table: string) {
      assert.equal(table, 'leads')
      return new FakeLeadsQuery(rows, table)
    },
  } as unknown as Db
}

function iso(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString()
}

async function analyticsUnitChecks() {
  const now = new Date(Date.UTC(2026, 7, 11))
  const rows: LeadRow[] = [
    { id: '1', source: 'whatsapp', created_at: iso(2026, 7, 1) },
    { id: '2', source: 'whatsapp', created_at: iso(2026, 7, 2) },
    { id: '3', source: 'form', created_at: iso(2026, 7, 3) },
    { id: '4', source: 'estimate', created_at: iso(2026, 6, 20) },
    { id: '5', source: 'call', created_at: iso(2026, 4, 20) },
  ]

  assert.deepEqual(await enquiryStats(fakeDb(rows), 'tenant-a', now), {
    thisMonth: 3,
    lastMonth: 1,
  })

  assert.deepEqual(await monthlyTrend(fakeDb(rows), 'tenant-a', now), [
    { month: '2026-03', count: 0 },
    { month: '2026-04', count: 0 },
    { month: '2026-05', count: 1 },
    { month: '2026-06', count: 0 },
    { month: '2026-07', count: 1 },
    { month: '2026-08', count: 3 },
  ])

  assert.deepEqual(await monthlyTrend(fakeDb([]), 'tenant-a', now), [
    { month: '2026-03', count: 0 },
    { month: '2026-04', count: 0 },
    { month: '2026-05', count: 0 },
    { month: '2026-06', count: 0 },
    { month: '2026-07', count: 0 },
    { month: '2026-08', count: 0 },
  ])

  assert.deepEqual(await sourceBreakdown(fakeDb(rows), 'tenant-a', now), [
    { source: 'whatsapp', label: 'WhatsApp button', count: 2 },
    { source: 'form', label: 'Enquiry form', count: 1 },
  ])

  const unreachableUmami: UmamiClient = {
    async visitStats() {
      throw new Error('network down')
    },
    async topProjectPaths() {
      throw new Error('network down')
    },
  }

  assert.equal(await visitStats(unreachableUmami), null)
  assert.deepEqual(
    await topProjects(
      fakeDb([]),
      'tenant-a',
      unreachableUmami,
      [
        { slug: 'kitchen', title: 'Kitchen' },
        { slug: 'villa', title: 'Villa' },
      ],
    ),
    [],
  )
}

async function analyticsRlsCheck() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.log('  skip  database isolation check: Supabase env vars are not set')
    return
  }

  const stamp = `analytics-${Date.now()}`
  const admin = createServiceRoleClient()
  const password = `${stamp}-Aa1!-not-real`
  const created: Array<{ tenantId: string; userId: string }> = []

  async function provision(suffix: string, leadCount: number) {
    const { data: tenant, error: tenantError } = await admin
      .from('tenants')
      .insert({ slug: `${stamp}-${suffix}`, name: `${stamp}-${suffix}`, tier: 't3', status: 'demo' })
      .select()
      .single()
    if (tenantError) throw tenantError

    const { data: user, error: userError } = await admin.auth.admin.createUser({
      email: `${stamp}-${suffix}@example.test`,
      password,
      email_confirm: true,
    })
    if (userError) throw userError

    const { error: memberError } = await admin
      .from('tenant_members')
      .insert({ tenant_id: tenant.id, user_id: user.user.id })
    if (memberError) throw memberError

    if (leadCount > 0) {
      const { error: leadError } = await admin.from('leads').insert(
        Array.from({ length: leadCount }, (_, index) => ({
          tenant_id: tenant.id,
          name: `${suffix} lead ${index}`,
          phone: '+919000000000',
          source: 'form' as const,
        })),
      )
      if (leadError) throw leadError
    }

    created.push({ tenantId: tenant.id, userId: user.user.id })
    return { tenant, user: user.user }
  }

  try {
    const a = await provision('a', 2)
    await provision('b', 5)

    const anon = createAnonClient()
    const { data: session, error: signInError } = await anon.auth.signInWithPassword({
      email: a.user.email!,
      password,
    })
    if (signInError || !session.session) throw signInError ?? new Error('missing session')

    const asA = createScopedClient(session.session.access_token)
    assert.deepEqual(await enquiryStats(asA, a.tenant.id), { thisMonth: 2, lastMonth: 0 })
  } finally {
    for (const { tenantId, userId } of created) {
      await admin.from('tenants').delete().eq('id', tenantId)
      await admin.auth.admin.deleteUser(userId)
    }
  }
}

async function main() {
  heading('test:analytics')
  await analyticsUnitChecks()
  await analyticsRlsCheck()
  console.log('\x1b[32mPASS\x1b[0m  analytics service behavior\n')
}

main().catch((e) => fail('test:analytics', (e as Error).message))
