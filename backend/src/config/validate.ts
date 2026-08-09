import { z } from 'zod'
import { clientConfigSchema } from './schema'
import type { ClientConfig } from './types'

/**
 * Validation, in two layers.
 *
 * Zod handles shape — is this field a string, is that phone number E.164. This
 * file handles the rules that span fields, which is where the rules that actually
 * matter live: a demo site indexed by Google under a client's name, a custom
 * domain attached before the balance cleared, an inquiry form posting to an env
 * var nobody set.
 *
 * Every message here names the field and says what to do. An error a non-author
 * cannot act on is a bug in the error, and these get read by whoever is deploying
 * at 11pm, not by whoever wrote them.
 */

export type Severity = 'error' | 'warning'

export type Issue = {
  path: string
  message: string
  severity: Severity
}

export type ValidationResult =
  | { ok: true; config: ClientConfig; warnings: Issue[] }
  | { ok: false; issues: Issue[] }

export type ValidateOptions = {
  /**
   * Resolve image paths against this directory. Omit to skip the check — it needs
   * a filesystem, so it runs at build and in scripts, never at request time.
   */
  publicDir?: string
  /** Env vars available. Omit to skip the `accessKeyEnv` existence check. */
  env?: Record<string, string | undefined>
  /** `fs.existsSync`, injected so this module stays importable in edge runtimes. */
  fileExists?: (absPath: string) => boolean
}

// ---------------------------------------------------------------------------
// Zod issue formatting
// ---------------------------------------------------------------------------

function formatZodIssues(error: z.ZodError): Issue[] {
  return error.issues.map((i) => ({
    path: i.path.length ? i.path.join('.') : '(root)',
    message: i.message,
    severity: 'error' as const,
  }))
}

// ---------------------------------------------------------------------------
// Cross-field rules
// ---------------------------------------------------------------------------

function crossFieldIssues(c: ClientConfig, opts: ValidateOptions): Issue[] {
  const issues: Issue[] = []
  const err = (path: string, message: string) =>
    issues.push({ path, message, severity: 'error' })
  const warn = (path: string, message: string) =>
    issues.push({ path, message, severity: 'warning' })

  const isPublic = c.status === 'live'

  // --- The payment gate ----------------------------------------------------
  // Both halves of this are commercial, not technical. A demo indexed under the
  // client's name is a real problem for them; a custom domain live before the
  // balance clears is a real problem for us.

  if (!isPublic && !c.seo.noindex) {
    err(
      'seo.noindex',
      `must be true while status is "${c.status}". A demo indexed by Google under the client's name is hard to undo — set noindex, or set status to "live" if this site is actually paid for and shipping.`,
    )
  }

  if (c.domain.customDomain && !isPublic) {
    err(
      'domain.customDomain',
      `is set to "${c.domain.customDomain}" but status is "${c.status}". A custom domain attaches only at status "live" — that is the payment gate, and it is deliberate.`,
    )
  }

  if (c.status === 'archived' && c.domain.customDomain) {
    warn(
      'domain.customDomain',
      'is still set on an archived client. Detach it before the domain renewal falls due.',
    )
  }

  // --- Sections whose config promises something it cannot deliver ----------

  const s = c.sections

  if (s.reviews?.enabled && !s.reviews.googlePlaceId) {
    err(
      'sections.reviews.googlePlaceId',
      'is required when reviews are enabled — without a Place ID there is nothing to fetch. Find it via the Google Places ID finder, or set reviews.enabled to false.',
    )
  }

  if (s.inquiryForm?.enabled) {
    const key = s.inquiryForm.accessKeyEnv
    if (!key) {
      err(
        'sections.inquiryForm.accessKeyEnv',
        'is required when the inquiry form is enabled. Name the env var holding this client\'s Web3Forms key, e.g. "WEB3FORMS_ASHISH" — never the key itself.',
      )
    } else if (opts.env && !opts.env[key]) {
      // An error only once the site is live. Nobody has every client's form key
      // in their local environment, and failing a whole demo build over that
      // trains people to ignore the check — which is worse than the gap.
      const msg = `names env var "${key}", which is not set. The form would render and silently post nowhere — a lost enquiry looks exactly like no enquiry.`
      if (isPublic) err('sections.inquiryForm.accessKeyEnv', msg)
      else warn('sections.inquiryForm.accessKeyEnv', msg)
    }
  }

  if (s.instagram?.enabled && s.instagram.embedPostUrls.length === 0) {
    warn(
      'sections.instagram.embedPostUrls',
      'is empty, so the Instagram strip will not render. Its whole job is proving the studio is working right now — either add posts or disable it.',
    )
  }

  if (s.estimate?.enabled && !s.estimate.ratePerSqft) {
    err(
      'sections.estimate.ratePerSqft',
      'is required when the estimate calculator is enabled — with no rate table it cannot produce a range.',
    )
  }

  if (s.videoTour?.enabled && !s.videoTour.url) {
    err('sections.videoTour.url', 'is required when the video tour section is enabled.')
  }

  if (s.companyProfile?.enabled && !s.companyProfile.pdf) {
    err('sections.companyProfile.pdf', 'is required when the company profile download is enabled.')
  }

  // --- Portfolio -----------------------------------------------------------

  const projects = s.portfolio.projects
  if (s.portfolio.enabled && c.tier !== 't0' && projects.length < 3) {
    err(
      'sections.portfolio.projects',
      `has ${projects.length} entries; ${c.tier} needs at least 3. A one-project portfolio reads worse than none — it suggests the studio has done one job.`,
    )
  }

  const slugs = projects.map((p) => p.slug)
  const dupes = slugs.filter((v, i) => slugs.indexOf(v) !== i)
  if (dupes.length) {
    err(
      'sections.portfolio.projects[].slug',
      `duplicate slugs: ${[...new Set(dupes)].join(', ')}. Each project needs a unique slug — duplicates silently collide at /portfolio/[slug].`,
    )
  }

  const missingDuration = projects.filter((p) => !p.duration).length
  if (missingDuration > 0 && isPublic) {
    warn(
      'sections.portfolio.projects[].duration',
      `${missingDuration} of ${projects.length} projects have no duration. In this vertical it says "we finish on time", which is the buyer's actual fear — worth collecting.`,
    )
  }

  // --- Team ----------------------------------------------------------------

  if (s.team?.detailPages) {
    const noSlug = s.team.members.filter((m) => !m.slug).length
    if (noSlug > 0) {
      err(
        'sections.team.members[].slug',
        `${noSlug} member(s) have no slug but team.detailPages is on. Each member needs one to get a /team/[slug] page.`,
      )
    }
  }

  // --- Quick actions promising a link that does not exist ------------------

  if (s.quickActions?.enabled) {
    const acts = s.quickActions.actions
    if (acts.includes('directions') && !c.business.address.mapsEmbedUrl) {
      err(
        'sections.quickActions.actions',
        'includes "directions" but business.address.mapsEmbedUrl is not set. A directions button that goes nowhere is worse than no button.',
      )
    }
    if (acts.includes('instagram') && !s.instagram?.handle) {
      err(
        'sections.quickActions.actions',
        'includes "instagram" but sections.instagram.handle is not set.',
      )
    }
  }

  // --- Live sites are held to a higher bar ---------------------------------

  if (isPublic) {
    if (c.internal.demoWatermark) {
      err(
        'internal.demoWatermark',
        'is still true on a live site. The client is paying; remove the watermark.',
      )
    }
    if (!c.business.email) {
      warn('business.email', 'is not set on a live site.')
    }
  }

  // --- Asset paths ---------------------------------------------------------

  if (opts.publicDir && opts.fileExists) {
    for (const { path, value } of collectAssetPaths(c)) {
      const abs = `${opts.publicDir.replace(/[/\\]$/, '')}${value}`
      if (!opts.fileExists(abs)) {
        err(path, `references "${value}", which does not exist under ${opts.publicDir}.`)
      }
    }
  }

  return issues
}

/** Every asset path in the config, with the field it came from. */
function collectAssetPaths(c: ClientConfig): Array<{ path: string; value: string }> {
  const out: Array<{ path: string; value: string }> = []
  const add = (path: string, value: string | undefined | null) => {
    if (typeof value === 'string' && value.startsWith('/')) out.push({ path, value })
  }

  add('brand.logo', c.brand.logo)
  add('brand.favicon', c.brand.favicon)
  add('brand.ogImage', c.brand.ogImage)

  const s = c.sections
  add('sections.hero.image', s.hero.image)
  add('sections.about.image', s.about?.image)

  s.portfolio.projects.forEach((p, i) => {
    add(`sections.portfolio.projects[${i}].cover`, p.cover)
    p.images.forEach((img, j) => add(`sections.portfolio.projects[${i}].images[${j}]`, img))
  })

  s.services?.items.forEach((item, i) => add(`sections.services.items[${i}].image`, item.image))
  s.team?.members.forEach((m, i) => add(`sections.team.members[${i}].image`, m.image))
  s.testimonials?.items.forEach((t, i) => add(`sections.testimonials.items[${i}].image`, t.image))
  s.beforeAfter?.pairs.forEach((p, i) => {
    add(`sections.beforeAfter.pairs[${i}].before`, p.before)
    add(`sections.beforeAfter.pairs[${i}].after`, p.after)
  })
  s.journal?.posts.forEach((p, i) => add(`sections.journal.posts[${i}].cover`, p.cover))
  s.caseStudy?.items.forEach((cs, i) =>
    cs.images.forEach((img, j) => add(`sections.caseStudy.items[${i}].images[${j}]`, img)),
  )
  add('sections.companyProfile.pdf', s.companyProfile?.pdf)

  return out
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

/**
 * Validate a tier-resolved config. Pass the output of `applyTierDefaults`, not
 * raw JSON — the cross-field rules assume defaults have already landed.
 */
export function validateClientConfig(
  input: unknown,
  opts: ValidateOptions = {},
): ValidationResult {
  const parsed = clientConfigSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, issues: formatZodIssues(parsed.error) }
  }

  const found = crossFieldIssues(parsed.data, opts)
  const errors = found.filter((i) => i.severity === 'error')
  const warnings = found.filter((i) => i.severity === 'warning')

  if (errors.length) return { ok: false, issues: [...errors, ...warnings] }
  return { ok: true, config: parsed.data, warnings }
}

/** Human-readable report. Used by the check scripts and the build gate. */
export function formatIssues(issues: Issue[]): string {
  if (!issues.length) return ''
  return issues
    .map((i) => {
      const tag = i.severity === 'error' ? 'ERROR  ' : 'warning'
      return `  ${tag}  ${i.path}\n           ${i.message}`
    })
    .join('\n\n')
}
