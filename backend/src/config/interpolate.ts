import type { ClientConfig } from './types'

/**
 * Resolves `{{business.name}}` and friends inside a config string field.
 *
 * Documented in `docs/product/config-schema.md` ("Template variables") as a
 * convention every string field is supposed to support, mainly
 * `cta.whatsappMessage` and `seo.*` — but nothing ever implemented it. Found
 * by actually clicking the WhatsApp button ticket 01 built: the prefilled
 * message read literally "Hi {{business.name}}, I saw your website..." A
 * check couldn't have caught this — it's a real network request producing
 * correct-looking HTML with a broken value inside it, invisible to
 * `check:hardcode` or `check:placeholder` alike.
 *
 * Lives in the config layer, not in any one section, because every section
 * that reads a `site`-level string field needs the same substitution — three
 * sections independently reinventing it is exactly the pattern-drift
 * `docs/build/prompts/sonnet-batch-review.md`'s gate exists to catch.
 */

const VARS: Record<string, (site: ClientConfig) => string> = {
  'business.name': (site) => site.business.name,
  'business.locality': (site) => site.business.address.locality,
  'business.ownerName': (site) => site.business.ownerName ?? site.business.name,
}

export function interpolate(template: string, site: ClientConfig): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
    const resolve = VARS[key]
    return resolve ? resolve(site) : match
  })
}
