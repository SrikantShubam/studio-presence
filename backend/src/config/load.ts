import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { applyTierDefaults } from './resolve'
import { formatIssues, validateClientConfig, type ValidateOptions } from './validate'
import type { ClientConfig } from './types'

/**
 * Loading a client config.
 *
 *   clients/<slug>.json  →  merge override patch  →  apply tier defaults  →  validate
 *
 * The order is not arbitrary. Overrides merge before tier resolution so that a
 * panel edit which turns a section on gets that section's tier defaults applied
 * to it, and tier resolution runs before validation so the cross-field rules see
 * the config as it will actually render.
 *
 * The override patch is the panel's write channel. `clients/*.json` is committed
 * to git and Vercel's filesystem is read-only at runtime, so the panel cannot
 * write the file back — the file is the seed and the database holds the diff.
 * See `backend/SPEC.md` §4.1.
 */

export class ConfigError extends Error {
  constructor(
    public readonly slug: string,
    public readonly report: string,
  ) {
    super(`Config for "${slug}" is invalid:\n\n${report}\n`)
    this.name = 'ConfigError'
  }
}

type Json = Record<string, unknown>

function isRecord(v: unknown): v is Json {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Deep merge, patch wins.
 *
 * Arrays replace rather than concatenate — deliberately. If an owner removes a
 * project in the panel, a concatenating merge would resurrect it, and they would
 * have no way to delete anything.
 */
export function mergePatch(base: unknown, patch: unknown): unknown {
  if (!isRecord(base) || !isRecord(patch)) return patch === undefined ? base : patch

  const out: Json = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    out[key] = isRecord(value) && isRecord(base[key]) ? mergePatch(base[key], value) : value
  }
  return out
}

export type ResolveOptions = ValidateOptions & {
  /** Panel edits, from `client_overrides.patch`. */
  override?: unknown
}

/**
 * Pure resolution — no filesystem. Given raw JSON and an optional patch, produce
 * a validated config or throw with a readable report.
 */
export function resolveClientConfig(
  slug: string,
  raw: unknown,
  opts: ResolveOptions = {},
): ClientConfig {
  const merged = opts.override ? mergePatch(raw, opts.override) : raw
  const withDefaults = applyTierDefaults(merged)
  const result = validateClientConfig(withDefaults, opts)

  if (!result.ok) throw new ConfigError(slug, formatIssues(result.issues))

  if (result.warnings.length && process.env.NODE_ENV !== 'production') {
    console.warn(`\nConfig warnings for "${slug}":\n\n${formatIssues(result.warnings)}\n`)
  }

  return result.config
}

/**
 * Find the repo root by walking up from the working directory.
 *
 * Not `import.meta.dirname` — that is undefined once this module is bundled by
 * Next, which is exactly where it is needed most. Not a bare `process.cwd()`
 * either, because that is the repo root when a script runs and `frontend/` when
 * the dev server does.
 *
 * Walking up for the marker directory is the only approach that holds in both.
 */
let cachedRoot: string | null = null

function repoRoot(): string {
  if (cachedRoot) return cachedRoot

  let dir = process.cwd()
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'clients')) && existsSync(join(dir, 'backend'))) {
      cachedRoot = dir
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  throw new Error(
    `Could not find the repo root from ${process.cwd()}. Expected an ancestor directory ` +
      `containing both clients/ and backend/.`,
  )
}

export function defaultClientsDir(): string {
  return join(repoRoot(), 'clients')
}

export function defaultPublicDir(): string {
  return join(repoRoot(), 'frontend', 'public')
}

export function listClientSlugs(clientsDir = defaultClientsDir()): string[] {
  if (!existsSync(clientsDir)) return []
  return readdirSync(clientsDir)
    .filter((f) => f.endsWith('.json') && !f.endsWith('.schema.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort()
}

/**
 * Read and resolve one client from disk.
 *
 * Asset-path and env checks are on by default here, because this is the path the
 * build gate uses and those are exactly the failures worth catching before a
 * deploy rather than after.
 */
export function loadClientConfig(slug: string, opts: ResolveOptions = {}): ClientConfig {
  const clientsDir = defaultClientsDir()
  const file = join(clientsDir, `${slug}.json`)

  if (!existsSync(file)) {
    const available = listClientSlugs(clientsDir)
    throw new ConfigError(
      slug,
      `  ERROR    (file)\n           No config at clients/${slug}.json.` +
        (available.length ? ` Available: ${available.join(', ')}.` : ''),
    )
  }

  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    throw new ConfigError(
      slug,
      `  ERROR    (json)\n           clients/${slug}.json is not valid JSON: ${(e as Error).message}`,
    )
  }

  return resolveClientConfig(slug, raw, {
    publicDir: defaultPublicDir(),
    env: process.env,
    fileExists: existsSync,
    ...opts,
  })
}
