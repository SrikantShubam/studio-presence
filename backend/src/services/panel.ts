import { z } from 'zod'
import { clientConfigSchema } from '../config/schema'
import { loadClientConfig, mergePatch } from '../config/load'
import type { Db } from '../db/scoped'

/**
 * The panel's write channel — see `backend/SPEC.md` §4.1.
 *
 * THE SCOPE RULE, enforced here and nowhere else that actually matters: content
 * is theirs, structure is ours. `ALLOWLIST` below is the real boundary. A panel
 * UI that hides every other control is a nice-to-have; this is what stops a
 * browser devtools session from patching `template` or `tier` directly against
 * the API.
 *
 * Every allowlisted field's validator is pulled from `clientConfigSchema` itself
 * (via `.shape`), never hand-duplicated — a phone number that's valid here is
 * valid because it's the *same* schema `backend/src/config/schema.ts` uses, so
 * the two cannot drift apart the way two independent regexes eventually would.
 */

type Json = Record<string, unknown>

export class PanelError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'PanelError'
  }
}

/** A save that touched a non-allowlisted field or an invalid value for one. */
export class PanelScopeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PanelScopeError'
  }
}

/**
 * Unwraps a `.optional()`-wrapped ZodObject down to its `.shape`, as a plain
 * dictionary. This is introspection over the contract, not part of it — the
 * loose typing here is deliberate, the runtime shapes are what get validated.
 */
function shapeOf(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> {
  const unwrapped =
    typeof (schema as { unwrap?: () => z.ZodTypeAny }).unwrap === 'function'
      ? (schema as unknown as { unwrap: () => z.ZodTypeAny }).unwrap()
      : schema
  return (unwrapped as z.ZodObject<z.ZodRawShape>).shape as Record<string, z.ZodTypeAny>
}

const businessShape = shapeOf(clientConfigSchema.shape.business)
const sectionsShape = shapeOf(clientConfigSchema.shape.sections)
const heroShape = shapeOf(sectionsShape.hero!)
const portfolioShape = shapeOf(sectionsShape.portfolio!)
const servicesShape = shapeOf(sectionsShape.services!)
const aboutShape = shapeOf(sectionsShape.about!)
const testimonialsShape = shapeOf(sectionsShape.testimonials!)
const instagramShape = shapeOf(sectionsShape.instagram!)

/**
 * dot-path → the exact Zod schema that path must satisfy. The field list is
 * `backend/SPEC.md` §4.1's allowlist, mapped to their real schema.ts locations:
 * phone, WhatsApp, email, hours, address, hero image, projects, about, services,
 * testimonials, Instagram picks.
 */
const ALLOWLIST: Record<string, z.ZodTypeAny> = {
  'business.phone': businessShape.phone!,
  'business.whatsapp': businessShape.whatsapp!,
  'business.email': businessShape.email!,
  'business.hours': businessShape.hours!,
  'business.address': businessShape.address!,
  'sections.hero.image': heroShape.image!,
  'sections.portfolio.projects': portfolioShape.projects!,
  'sections.about.heading': aboutShape.heading!,
  'sections.about.body': aboutShape.body!,
  'sections.services.items': servicesShape.items!,
  'sections.testimonials.items': testimonialsShape.items!,
  'sections.instagram.embedPostUrls': instagramShape.embedPostUrls!,
}

export type AllowlistedField = keyof typeof ALLOWLIST

export function allowlistedFields(): AllowlistedField[] {
  return Object.keys(ALLOWLIST) as AllowlistedField[]
}

function getAtPath(obj: unknown, path: string[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined
    return (acc as Json)[key]
  }, obj)
}

function setAtPath(target: Json, path: string[], value: unknown): Json {
  const [head, ...rest] = path
  if (!head) return target

  if (rest.length === 0) {
    return { ...target, [head]: value }
  }

  const nested = typeof target[head] === 'object' && target[head] !== null ? (target[head] as Json) : {}
  return { ...target, [head]: setAtPath(nested, rest, value) }
}

async function readPatch(db: Db, tenantId: string): Promise<Json> {
  const { data, error } = await db
    .from('client_overrides')
    .select('patch')
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (error) throw new PanelError('Could not load saved edits.', error)
  return (data?.patch as Json) ?? {}
}

/**
 * The panel's read side: the current, resolved value of every editable field
 * (base config + existing override applied), plus the raw patch row so the
 * caller can tell "never edited" from "edited back to the original value".
 */
export async function getEditableConfig(
  db: Db,
  tenant: { id: string; slug: string },
): Promise<{ current: Record<AllowlistedField, unknown>; patch: Json }> {
  const patch = await readPatch(db, tenant.id)
  const resolved = loadClientConfig(tenant.slug, { override: patch })

  const current = {} as Record<AllowlistedField, unknown>
  for (const field of allowlistedFields()) {
    current[field] = getAtPath(resolved, field.split('.'))
  }

  return { current, patch }
}

/**
 * The panel's write side.
 *
 * `changes` is a flat map of allowlisted dot-path → new value — e.g.
 * `{ "business.phone": "+91...", "sections.about.body": "..." }`. Any key not on
 * the allowlist, or any value that fails that field's own schema, fails the
 * *whole* call. A save must never partially apply: silently saving the good keys
 * and dropping the bad one looks like success and isn't.
 *
 * The new values are merged into the tenant's existing patch (`mergePatch` —
 * patch wins, arrays replace rather than concatenate, same semantics
 * `backend/src/config/load.ts` uses everywhere else), not written over it. A
 * save of just the phone number must not erase a previously-saved project edit.
 */
export async function saveEditableConfig(
  db: Db,
  tenant: { id: string; slug: string },
  updatedBy: string,
  changes: Record<string, unknown>,
): Promise<{ patch: Json }> {
  const badKeys = Object.keys(changes).filter((key) => !(key in ALLOWLIST))
  if (badKeys.length > 0) {
    throw new PanelScopeError(
      `These fields cannot be edited from the panel: ${badKeys.join(', ')}. Layout, colours, ` +
        `template, tier and structure are not owner-editable.`,
    )
  }

  let delta: Json = {}
  for (const [key, rawValue] of Object.entries(changes)) {
    const schema = ALLOWLIST[key]
    if (!schema) throw new PanelScopeError(`These fields cannot be edited from the panel: ${key}.`)

    const result = schema.safeParse(rawValue)
    if (!result.success) {
      const issue = result.error.issues[0]?.message ?? 'invalid value'
      throw new PanelScopeError(`"${key}" is not valid: ${issue}.`)
    }
    delta = setAtPath(delta, key.split('.'), result.data)
  }

  const existingPatch = await readPatch(db, tenant.id)
  const mergedPatch = mergePatch(existingPatch, delta) as Json

  const { error } = await db.from('client_overrides').upsert({
    tenant_id: tenant.id,
    patch: mergedPatch,
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
  })

  if (error) throw new PanelError('Could not save changes.', error)

  return { patch: mergedPatch }
}

export const panel = {
  getEditableConfig,
  saveEditableConfig,
  allowlistedFields,
}
