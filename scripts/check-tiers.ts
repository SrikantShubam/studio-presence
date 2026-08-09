/**
 * The strip-down test, as an exit code.
 *
 * Every fixture is resolved at t0, t1, t2 and t3. Each must produce a valid
 * config, and each step up must switch on strictly more sections than the last —
 * with no code change anywhere, which is the point.
 *
 * This is the single acceptance test the whole architecture exists to pass. If it
 * fails, selling a T2 to a T1 client means a branch or a fork, and the business
 * model that assumed tiering was a JSON edit no longer holds.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  applyTierDefaults,
  defaultClientsDir,
  listClientSlugs,
  sectionsForTier,
  TIERS,
  validateClientConfig,
  formatIssues,
  type Tier,
} from '../backend/src/config/index'
import { heading, report, type Finding } from './_report'

const NAME = 'check:tiers'

const slugs = listClientSlugs()
if (slugs.length === 0) {
  heading(NAME)
  console.log('\nNo client configs found. Nothing to check.\n')
  process.exit(0)
}

const findings: Finding[] = []

/** Section keys that are on in a resolved config. */
function enabledSections(config: unknown): Set<string> {
  const sections = (config as { sections?: Record<string, { enabled?: boolean }> }).sections ?? {}
  return new Set(
    Object.entries(sections)
      .filter(([, v]) => v?.enabled === true)
      .map(([k]) => k),
  )
}

for (const slug of slugs) {
  const raw = JSON.parse(readFileSync(join(defaultClientsDir(), `${slug}.json`), 'utf8'))
  const file = `clients/${slug}.json`
  let previous: Set<string> | null = null
  let previousTier: Tier | null = null

  for (const tier of TIERS) {
    // Asset and env checks are deliberately off here. This test is about whether
    // tier resolution holds, not whether a hypothetical t3 version of a t1 client
    // has all its photos — that would fail for reasons unrelated to the thing
    // being tested.
    const candidate = applyTierDefaults({ ...raw, tier })
    const result = validateClientConfig(candidate)

    if (!result.ok) {
      findings.push({
        file,
        message: `does not produce a valid config at tier "${tier}":\n${formatIssues(result.issues)}`,
        fix: `Every fixture must be valid at every tier — that is what makes tiering a config change. Either give the fixture the content tier "${tier}" needs, or make the field optional in backend/src/config/schema.ts if it genuinely should not be required.`,
      })
      continue
    }

    const on = enabledSections(result.config)

    if (previous && previousTier) {
      const lost = [...previous].filter((s) => !on.has(s))
      if (lost.length) {
        findings.push({
          file,
          message: `going ${previousTier} → ${tier} switched OFF: ${lost.join(', ')}. Tiers are cumulative; a higher tier never removes a section.`,
          fix: 'Check TIER_SECTIONS in backend/src/config/resolve.ts — a key is probably listed at the wrong tier.',
        })
      }
      if (on.size === previous.size && tier !== 't0') {
        findings.push({
          file,
          message: `going ${previousTier} → ${tier} changed nothing. A tier the client cannot tell apart from the one below is one they will not pay the difference for.`,
          fix: 'Either the fixture lacks the content this tier unlocks, or TIER_SECTIONS has an empty step.',
        })
      }
    }

    // Every section the tier promises must actually be on.
    const promised = sectionsForTier(tier)
    const missing = promised.filter((s) => !on.has(s))
    if (missing.length) {
      findings.push({
        file,
        message: `tier "${tier}" should switch on ${missing.join(', ')} but they are off after resolution.`,
        fix: 'Either the fixture explicitly disables them — which is allowed and means this fixture is a poor tier test — or applyTierDefaults is not reaching them.',
      })
    }

    previous = on
    previousTier = tier
  }
}

report(NAME, findings, slugs.length * TIERS.length)
