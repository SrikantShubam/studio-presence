/**
 * Provision (or re-link) the `qa-owner` demo tenant to a real email address, so
 * a human can sign in through the actual magic-link flow — the one thing
 * automated review cannot stand in for.
 *
 * Usage:
 *   npm run provision:qa-owner -- you@example.com
 *
 * Idempotent: safe to re-run with a different email to hand the tenant to
 * someone else, or the same email to confirm the link still exists.
 *
 * To remove: delete this tenant's row (`tenants` table, cascades to
 * `tenant_members` and `client_overrides`) and `clients/qa-owner.json`.
 */

import { createServiceRoleClient } from '../backend/src/db/service-role'

const SLUG = 'qa-owner'

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npm run provision:qa-owner -- you@example.com')
    process.exit(1)
  }

  const admin = createServiceRoleClient()

  const { data: existingTenant, error: te } = await admin.from('tenants').select('id').eq('slug', SLUG).maybeSingle()
  if (te) throw new Error(`looking up tenant: ${te.message}`)

  let tenant = existingTenant
  if (!tenant) {
    const { data: created, error: ce } = await admin
      .from('tenants')
      .insert({ slug: SLUG, name: 'QA Owner Studio', tier: 't3', status: 'demo' })
      .select('id')
      .single()
    if (ce) throw new Error(`creating tenant: ${ce.message}`)
    tenant = created
    console.log(`Created tenant "${SLUG}" (${tenant.id})`)
  } else {
    console.log(`Reusing existing tenant "${SLUG}" (${tenant.id})`)
  }

  const { data: userList, error: le } = await admin.auth.admin.listUsers()
  if (le) throw new Error(`listing users: ${le.message}`)

  let user = userList.users.find((u) => u.email === email)
  if (!user) {
    const { data: created, error: ue } = await admin.auth.admin.createUser({ email, email_confirm: true })
    if (ue) throw new Error(`creating user: ${ue.message}`)
    user = created.user
    console.log(`Created user ${email} (${user.id})`)
  } else {
    console.log(`Reusing existing user ${email} (${user.id})`)
  }

  const { data: existingMembership } = await admin
    .from('tenant_members')
    .select('user_id')
    .eq('tenant_id', tenant.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existingMembership) {
    const { error: me } = await admin.from('tenant_members').insert({ user_id: user.id, tenant_id: tenant.id })
    if (me) throw new Error(`linking membership: ${me.message}`)
    console.log('Linked membership.')
  } else {
    console.log('Membership already exists.')
  }

  console.log('')
  console.log('Done. Next steps:')
  console.log('  1. npm run gen:tenant-map')
  console.log('  2. npm run dev   (or npm run dev --workspace frontend -- -p 3100)')
  console.log(`  3. Visit http://${SLUG}.localhost:<port>/login and sign in with ${email}`)
  console.log(`  4. Check that inbox for the magic-link email and click it`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
