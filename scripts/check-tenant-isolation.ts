/**
 * The service-role client never reaches a request path.
 *
 * Tenant isolation is enforced by Postgres RLS, which only works if queries carry
 * the user's token. The service-role key bypasses RLS entirely — that is its
 * purpose, and it is correct for migrations and the deploy script. Reachable from
 * a route handler, it is the mechanism by which one studio reads another studio's
 * enquiries.
 *
 * This failure is invisible in testing. The app returns the right rows because
 * the developer wrote the right WHERE clause; nothing indicates the database
 * would not have stopped the wrong one. It surfaces the day someone refactors
 * that clause away.
 *
 * So it gets a check rather than a code-review convention.
 */

import { readFileSync, globSync } from 'node:fs'
import { join, relative } from 'node:path'
import { report, type Finding } from './_report'

const NAME = 'check:tenant-isolation'
const ROOT = join(import.meta.dirname, '..')

/** Anything reachable while serving a request. */
const REQUEST_PATHS = [
  'frontend/app/**/*.{ts,tsx}',
  'frontend/middleware.ts',
  'backend/src/services/**/*.ts',
]

/** Where bypassing RLS is legitimate. */
const ALLOWED = ['backend/src/db/service-role.ts', 'scripts/', 'backend/supabase/']

type Rule = { re: RegExp; message: string; fix: string }

const RULES: Rule[] = [
  {
    re: /SUPABASE_SERVICE_ROLE_KEY/,
    message: 'reads SUPABASE_SERVICE_ROLE_KEY.',
    fix: 'Use the RLS-scoped client from backend/src/db instead. The service-role key bypasses every row-level policy — it belongs in migrations and scripts, never in a path that serves a signed-in user.',
  },
  {
    re: /from\s+['"](?:@studio\/backend\/)?db\/service-role['"]|service-role/,
    message: 'imports the service-role client.',
    fix: 'Import createScopedClient from backend/src/db and pass the request\'s access token. RLS then does the isolation, rather than a WHERE clause somebody has to remember to write.',
  },
  {
    re: /\.rpc\(\s*['"][^'"]*['"]\s*,[\s\S]*?service_role/,
    message: 'calls an RPC with service_role.',
    fix: 'Route it through the scoped client.',
  },
  {
    re: /auth\s*:\s*\{[^}]*persistSession\s*:\s*false[^}]*\}[\s\S]{0,120}serviceRole/i,
    message: 'constructs a session-less Supabase client that looks like a service-role client.',
    fix: 'Use backend/src/db/scoped.ts.',
  },
]

const files = REQUEST_PATHS.flatMap((p) => globSync(p, { cwd: ROOT })).map((f) => join(ROOT, f))
const findings: Finding[] = []

for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/')
  if (ALLOWED.some((a) => rel.startsWith(a))) continue

  const lines = readFileSync(abs, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        findings.push({ file: rel, line: i + 1, message: rule.message, fix: rule.fix })
      }
    }
  })
}

report(NAME, findings, files.length)
