/**
 * Every `clients/*.json` loads, resolves and validates.
 *
 * This is the build gate. A malformed config must fail here rather than render a
 * broken page on a client's subdomain — the failure is cheap now and expensive
 * once a prospect has the link.
 */

import { existsSync } from 'node:fs'
import {
  ConfigError,
  defaultPublicDir,
  listClientSlugs,
  loadClientConfig,
} from '../backend/src/config/index'
import { heading, report, type Finding } from './_report'

const NAME = 'check:config'

const slugs = listClientSlugs()
if (slugs.length === 0) {
  heading(NAME)
  console.log('\nNo client configs found in clients/. Nothing to check.\n')
  process.exit(0)
}

const findings: Finding[] = []

for (const slug of slugs) {
  try {
    const config = loadClientConfig(slug, {
      publicDir: defaultPublicDir(),
      fileExists: existsSync,
      env: process.env,
    })

    // The slug in the file must match its filename, or the deploy script targets
    // the wrong subdomain — a silent failure that only shows up in production.
    if (config.slug !== slug) {
      findings.push({
        file: `clients/${slug}.json`,
        message: `slug field is "${config.slug}" but the file is named "${slug}.json".`,
        fix: `Rename the file to ${config.slug}.json, or change the slug field to "${slug}". The deploy script keys the subdomain off this.`,
      })
    }
  } catch (e) {
    if (e instanceof ConfigError) {
      findings.push({
        file: `clients/${slug}.json`,
        message: e.report.trim(),
        fix: 'Fix the fields above. Run `npm run check:config` again.',
      })
    } else {
      throw e
    }
  }
}

report(NAME, findings, slugs.length)
