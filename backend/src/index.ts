/**
 * `@studio/backend` — public surface.
 *
 * A workspace package, not a running service. `frontend/` imports it and exposes
 * thin route handlers; the deploy script and the future demo assembler import it
 * too, which is the reason it is a package at all.
 *
 * Note what is NOT exported here: `db/service-role`. Importing the client that
 * bypasses row-level security has to be a deliberate, visible act, and
 * `check:tenant-isolation` greps for exactly that import path.
 */

export * from './config/index'
export * from './db/index'
export * from './auth/index'
export * from './services/analytics'
export * from './services/umami'
export * from './services/leads'
export * from './services/panel'
