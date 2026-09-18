import assert from 'node:assert/strict'
import { createServiceRoleClient } from '../backend/src/db/service-role.js'
import { resolveClientConfig } from '../backend/src/config/index.js'
import { createAnonClient, createScopedClient } from '../backend/src/db/scoped.js'

console.log('Testing live onboarding against Supabase...')

const admin = createServiceRoleClient()
const testEmail = `probe-${Date.now()}@example.test`
const testPassword = 'TestPassword123!'
const testSlug = `probe-studio-${Date.now()}`
const testHostname = `${testSlug}.localhost`

let testUserId: string | null = null
let testTenantId: string | null = null

try {
  // 1. Create temporary test user
  console.log('1. Creating test user:', testEmail)
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  })

  if (userError || !userData.user) {
    throw new Error(`Failed to create test user: ${userError?.message}`)
  }
  testUserId = userData.user.id

  // 2. Sign in as test user to get access token
  const anon = createAnonClient()
  const { data: sessionData, error: signInError } = await anon.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (signInError || !sessionData.session) {
    throw new Error(`Failed to sign in as test user: ${signInError?.message}`)
  }
  const userClient = createScopedClient(sessionData.session.access_token)

  // 3. Test draft saving via RLS
  console.log('2. Testing onboarding draft upsert...')
  const draftPayload = { studioName: 'Live Probe Studio', city: 'Delhi NCR', services: ['Interior design'] }
  const { error: draftError } = await userClient.from('onboarding_drafts').upsert({
    user_id: testUserId,
    payload: draftPayload,
    updated_at: new Date().toISOString(),
  })
  assert.equal(draftError, null, `Draft upsert error: ${draftError?.message}`)

  // Verify draft read
  const { data: draftRead, error: readError } = await userClient
    .from('onboarding_drafts')
    .select('payload')
    .eq('user_id', testUserId)
    .single()
  assert.equal(readError, null)
  assert.deepEqual(draftRead.payload, draftPayload)
  console.log('✔ Onboarding draft RLS verified.')

  // 4. Test complete_onboarding RPC
  console.log('3. Testing complete_onboarding RPC...')
  const config = resolveClientConfig(testSlug, {
    slug: testSlug,
    tier: 't0',
    template: 'editorial',
    status: 'demo',
    vertical: 'interior-design',
    business: {
      name: 'Live Probe Studio',
      phone: '+919876543210',
      whatsapp: '+919876543210',
      address: { locality: 'South Delhi', city: 'Delhi NCR', state: 'Delhi' },
      serviceAreas: ['South Delhi'],
    },
    domain: { demoSubdomain: testSlug },
    sections: {
      hero: { enabled: true, headline: 'Live Probe Studio', sub: 'Thoughtful spaces.' },
      portfolio: { enabled: true, projects: [] },
    },
    seo: { title: 'Live Probe Studio', description: 'Thoughtful spaces.', noindex: true },
    internal: { notes: 'Automated live test' },
  })

  const { data: rpcData, error: rpcError } = await userClient.rpc('complete_onboarding', {
    p_requested_slug: testSlug,
    p_name: 'Live Probe Studio',
    p_hostname: testHostname,
    p_config: config,
    p_source: 'organic',
  })

  assert.equal(rpcError, null, `complete_onboarding RPC error: ${rpcError?.message}`)
  assert.ok(rpcData && rpcData.length > 0)
  testTenantId = rpcData[0].tenant_id
  assert.equal(rpcData[0].tenant_slug, testSlug)
  assert.equal(rpcData[0].hostname, testHostname)
  console.log('✔ complete_onboarding RPC executed successfully! Allocated tenant:', rpcData[0].tenant_slug)

  // 5. Test public config retrieval by hostname
  console.log('4. Testing get_public_tenant_config_by_hostname...')
  const { data: publicConfigData, error: publicConfigError } = await anon.rpc('get_public_tenant_config_by_hostname', {
    p_hostname: testHostname,
  })
  assert.equal(publicConfigError, null, `public config RPC error: ${publicConfigError?.message}`)
  assert.ok(publicConfigData && publicConfigData.length > 0)
  assert.equal(publicConfigData[0].tenant_slug, testSlug)
  assert.equal(publicConfigData[0].config.slug, testSlug)
  // Internal notes must be stripped
  assert.equal(publicConfigData[0].config.internal, undefined)
  console.log('✔ Public hostname lookup verified (internal metadata cleanly stripped).')

  console.log('\n🎉 FULL LIVE DATABASE ONBOARDING FLOW PASSED 100%!')
} finally {
  // Clean up test tenant & user
  console.log('\nCleaning up test artifacts...')
  if (testTenantId) {
    await admin.from('tenants').delete().eq('id', testTenantId)
  }
  if (testUserId) {
    await admin.auth.admin.deleteUser(testUserId)
  }
  console.log('Clean up complete.')
}
