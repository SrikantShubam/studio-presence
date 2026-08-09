/**
 * No placeholder text escapes to a client.
 *
 * Two different bars, deliberately.
 *
 * In components, scaffolding text is always wrong — `Lorem`, `TODO`, a leftover
 * `FIXME`. Those are never intentional.
 *
 * In client configs the bar depends on `status`. Visibly-sample content is
 * correct on a demo: a plausible fake testimonial that reaches a prospect is
 * worse than an obvious placeholder, because it can be believed. The same string
 * on a `live` site is a defect — the client is paying and their real content
 * should be in.
 */

import { readFileSync, globSync } from 'node:fs'
import { join, relative } from 'node:path'
import { listClientSlugs, loadClientConfig, defaultClientsDir } from '../backend/src/config/index'
import { report, type Finding } from './_report'

const NAME = 'check:placeholder'
const ROOT = join(import.meta.dirname, '..')

/** Never acceptable, anywhere, at any status. */
const SCAFFOLDING = [
  { re: /\bLorem\s+ipsum\b/i, what: 'Lorem ipsum' },
  { re: /\bTODO\b(?!\.md)/, what: 'TODO' },
  { re: /\bFIXME\b/, what: 'FIXME' },
  { re: /\bXXX\b/, what: 'XXX marker' },
  { re: /\bplaceholder text\b/i, what: 'the words "placeholder text"' },
]

/** Fine on a demo, a defect on a live site. */
const SAMPLE_MARKERS = [
  /\bsample\b/i,
  /\breplace before\b/i,
  /\byour (?:text|content|name) here\b/i,
  /\blipsum\b/i,
]

/** Template variables the config layer knows how to interpolate. */
const KNOWN_VARS = new Set([
  'business.name',
  'business.locality',
  'business.city',
  'business.ownerName',
  'business.phone',
])

const findings: Finding[] = []

// --- Components -----------------------------------------------------------

const componentFiles = ['frontend/sections/**/*.{ts,tsx}', 'frontend/components/**/*.{ts,tsx}', 'frontend/app/**/*.tsx']
  .flatMap((p) => globSync(p, { cwd: ROOT }))
  .map((f) => join(ROOT, f))

for (const abs of componentFiles) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/')
  readFileSync(abs, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const { re, what } of SCAFFOLDING) {
        if (re.test(line)) {
          findings.push({
            file: rel,
            line: i + 1,
            message: `Scaffolding text: ${what}.`,
            fix: 'Remove it. If the value belongs to the client, read it from config instead.',
          })
        }
      }
    })
}

// --- Client configs -------------------------------------------------------

const slugs = listClientSlugs()

for (const slug of slugs) {
  const file = `clients/${slug}.json`
  const rawText = readFileSync(join(defaultClientsDir(), `${slug}.json`), 'utf8')

  let status = 'demo'
  try {
    status = loadClientConfig(slug).status
  } catch {
    // check:config owns reporting broken configs. Assume the strictest reading
    // here rather than skipping the file entirely.
    status = 'live'
  }

  rawText.split('\n').forEach((line, i) => {
    for (const { re, what } of SCAFFOLDING) {
      if (re.test(line)) {
        findings.push({
          file,
          line: i + 1,
          message: `Scaffolding text: ${what}.`,
          fix: 'Replace with the client\'s real content, or with content that visibly reads as a sample.',
        })
      }
    }

    if (status === 'live') {
      for (const re of SAMPLE_MARKERS) {
        if (re.test(line)) {
          findings.push({
            file,
            line: i + 1,
            message: `Sample content on a site with status "live": ${line.trim().slice(0, 80)}`,
            fix: 'A paying client\'s site cannot ship sample copy. Replace it, or move status back to "sold" until the real content is in.',
          })
          break
        }
      }
    }

    // Unresolved or misspelled template variables.
    for (const m of line.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
      const name = m[1]
      if (name && !KNOWN_VARS.has(name)) {
        findings.push({
          file,
          line: i + 1,
          message: `Unknown template variable {{${name}}} — it will render literally.`,
          fix: `Known variables: ${[...KNOWN_VARS].join(', ')}. Fix the name, or add it to KNOWN_VARS in scripts/check-placeholder.ts if it is genuinely new.`,
        })
      }
    }
  })
}

report(NAME, findings, componentFiles.length + slugs.length)
