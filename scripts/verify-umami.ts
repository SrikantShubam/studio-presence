/**
 * Prove the real Umami integration works end to end: login via
 * UMAMI_USERNAME/UMAMI_PASSWORD, fetch visitStats and topProjectPaths for a
 * real website ID, print what came back.
 *
 * Never hardcode the website ID here - it's not a secret, but it's
 * per-deployment and belongs on the command line, not baked into a committed
 * script.
 *
 *   npx tsx scripts/verify-umami.ts <websiteId>
 */

import { createUmamiClient } from '../backend/src/services/umami'

async function main() {
  const siteId = process.argv[2]
  if (!siteId) {
    console.error('Usage: npx tsx scripts/verify-umami.ts <websiteId>')
    process.exit(1)
  }

  const client = createUmamiClient(siteId)

  console.log('Logging in and fetching visitStats()...')
  const visits = await client.visitStats()
  console.log('visitStats:', visits)

  console.log('\nFetching topProjectPaths() (reuses the cached login token)...')
  const paths = await client.topProjectPaths()
  console.log('topProjectPaths:', paths.length ? paths : '(empty - no /portfolio/* traffic yet, which is expected for a fresh site)')

  console.log('\nOK - login, token reuse, and both endpoints all worked.')
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? e.message : e)
  process.exit(1)
})
