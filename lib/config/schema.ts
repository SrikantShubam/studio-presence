import { z } from 'zod'

/**
 * THE CONTRACT.
 *
 * Every client site is one JSON file validated against this. This schema is the
 * single most important artifact in the codebase — types, JSON Schema, runtime
 * validation and the future intake assembler are all derived from it, so there is
 * no second place for the shape to drift to.
 *
 * Scope note: this covers the full T3 superset even though only T1 is built. That
 * is deliberate. Retrofitting a section flag into a schema that never anticipated
 * it is the expensive mistake; declaring a flag whose component doesn't exist yet
 * costs nothing.
 *
 * DO NOT EDIT to make a component compile. If a section needs a field that isn't
 * here, that is a contract change — it gets discussed, added here first, and the
 * component follows.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** E.164, India. `+91` plus ten digits. */
const phone = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, 'must be E.164 with a +91 prefix, e.g. +919876543210')

const slug = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'lowercase letters, digits and hyphens only')

const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'must be a hex colour, e.g. #141414')

/** A path under `public/`. Existence on disk is checked separately, at build. */
const assetPath = z.string().regex(/^\//, 'must be an absolute path under public/, starting with /')

const url = z.string().url()

/**
 * Every section shares this. `enabled` is necessary but never sufficient — a
 * section with an empty content array still renders nothing. See SPEC.md §4.
 */
const sectionBase = { enabled: z.boolean().default(false) }

// ---------------------------------------------------------------------------
// Business
// ---------------------------------------------------------------------------

const address = z.object({
  line1: z.string().optional(),
  locality: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  mapsEmbedUrl: url.optional(),
})

const business = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  ownerName: z.string().optional(),
  phone,
  whatsapp: phone,
  email: z.string().email().optional(),
  yearFounded: z.number().int().min(1900).max(2100).optional(),
  address,
  serviceAreas: z.array(z.string()).default([]),
  hours: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Brand, domain
// ---------------------------------------------------------------------------

const brand = z.object({
  logo: assetPath.optional(),
  favicon: assetPath.optional(),
  ogImage: assetPath.optional(),
  /**
   * Partial override of the identity's colours. Partial on purpose: a client
   * brand is rarely a complete design system, and the identity fills the gaps.
   */
  palette: z
    .object({
      ink: hexColor.optional(),
      accent: hexColor.optional(),
      cta: hexColor.optional(),
      surface: hexColor.optional(),
      muted: hexColor.optional(),
      hairline: hexColor.optional(),
    })
    .optional(),
})

const domain = z.object({
  demoSubdomain: slug,
  customDomain: z.string().nullable().default(null),
  procuredByUs: z.boolean().default(false),
  renewalDue: z.string().nullable().default(null),
})

// ---------------------------------------------------------------------------
// Sections — T1
// ---------------------------------------------------------------------------

const hero = z.object({
  ...sectionBase,
  variant: z.enum(['standard', 'full-bleed', 'video', 'split']).optional(),
  headline: z.string().min(1),
  sub: z.string().optional(),
  image: assetPath.optional(),
  /** `video` variant only. Ignored by the others. */
  videoUrl: url.optional(),
  ctaLabel: z.string().optional(),
})

const quickActions = z.object({
  ...sectionBase,
  /** Which of the four to show. Directions needs `business.address.mapsEmbedUrl`. */
  actions: z
    .array(z.enum(['whatsapp', 'call', 'directions', 'instagram']))
    .default(['whatsapp', 'call', 'directions']),
})

const trustBar = z.object({
  ...sectionBase,
  stats: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .max(4)
    .default([]),
})

const services = z.object({
  ...sectionBase,
  variant: z.enum(['compact', 'detailed']).optional(),
  items: z
    .array(
      z.object({
        title: z.string(),
        blurb: z.string(),
        image: assetPath.optional(),
        slug: slug.optional(),
      }),
    )
    .default([]),
})

const project = z.object({
  title: z.string(),
  slug,
  cover: assetPath,
  images: z.array(assetPath).default([]),
  blurb: z.string().optional(),
  location: z.string().optional(),
  /**
   * Optional but push hard for it at intake. In this vertical it says "we finish
   * on time", which is the buyer's actual fear — a direct trust signal.
   */
  duration: z.string().optional(),
  projectType: z.enum(['residential', 'commercial', 'office', 'retail']).optional(),
  area: z.string().optional(),
  category: slug.optional(),
})

const portfolio = z.object({
  ...sectionBase,
  variant: z.enum(['grid', 'carousel']).optional(),
  /** T2+. Turns each project into `/portfolio/[slug]`. */
  detailPages: z.boolean().default(false),
  /** No upper limit. A studio with 40 projects lists 40. */
  projects: z.array(project).default([]),
})

const about = z.object({
  ...sectionBase,
  heading: z.string().optional(),
  /**
   * Optional so that raising a client's tier never fails the build for want of
   * copy. The section renders nothing without it, which is the correct outcome —
   * an empty About block is invisible, a build error blocks the whole site.
   */
  body: z.string().optional(),
  image: assetPath.optional(),
})

const process = z.object({
  ...sectionBase,
  steps: z
    .array(z.object({ title: z.string(), body: z.string(), duration: z.string().optional() }))
    .max(6)
    .default([]),
})

const testimonials = z.object({
  ...sectionBase,
  variant: z.enum(['cards', 'carousel']).optional(),
  items: z
    .array(
      z.object({
        quote: z.string(),
        author: z.string(),
        context: z.string().optional(),
        image: assetPath.optional(),
      }),
    )
    .default([]),
})

const instagram = z.object({
  ...sectionBase,
  handle: z.string().optional(),
  /**
   * Hand-picked post URLs, rendered via `instagram_oembed`. There is no live feed
   * at any tier — the Basic Display API shut down in Dec 2024. Never persist or
   * derive from the metadata oEmbed returns; render their embed HTML and nothing
   * else.
   */
  embedPostUrls: z.array(url).max(6).default([]),
})

const faq = z.object({
  ...sectionBase,
  items: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
})

const contact = z.object({ ...sectionBase })
const map = z.object({ ...sectionBase })

const ctaBand = z.object({
  ...sectionBase,
  headline: z.string().optional(),
  ctaLabel: z.string().optional(),
  placements: z.array(z.enum(['mid-page', 'pre-footer'])).default(['pre-footer']),
})

const stickyMobileCta = z.object({ ...sectionBase })

const footer = z.object({
  ...sectionBase,
  variant: z.enum(['expanded', 'compact']).optional(),
  reassuranceLine: z.string().optional(),
  socials: z
    .array(z.object({ label: z.string(), href: url }))
    .default([]),
})

const team = z.object({
  ...sectionBase,
  /** T3 turns each member into `/team/[slug]`. */
  detailPages: z.boolean().default(false),
  members: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        slug: slug.optional(),
        image: assetPath.optional(),
        bio: z.string().optional(),
      }),
    )
    .default([]),
})

// ---------------------------------------------------------------------------
// Sections — T2
// ---------------------------------------------------------------------------

const beforeAfter = z.object({
  ...sectionBase,
  pairs: z
    .array(z.object({ before: assetPath, after: assetPath, caption: z.string().optional() }))
    .default([]),
})

const reviews = z.object({
  ...sectionBase,
  googlePlaceId: z.string().nullable().default(null),
  /** Build-time fetch, capped at 5. Never a client-side call — it leaks the key. */
  fetchAtBuild: z.boolean().default(true),
})

const awards = z.object({
  ...sectionBase,
  items: z
    .array(z.object({ title: z.string(), issuer: z.string().optional(), year: z.number().optional() }))
    .default([]),
})

const inquiryForm = z.object({
  ...sectionBase,
  provider: z.literal('web3forms').default('web3forms'),
  /**
   * Name of the env var holding the key. Never the key itself.
   * Optional in the schema, required by validate.ts once `enabled` is true —
   * a form that posts nowhere is worse than no form.
   */
  accessKeyEnv: z.string().optional(),
  fields: z
    .array(z.enum(['name', 'phone', 'email', 'roomType', 'budget', 'timeline', 'message']))
    .default(['name', 'phone', 'roomType', 'budget', 'timeline']),
})

const estimate = z.object({
  ...sectionBase,
  /** Rate table drives the calculator. Config-driven so it never needs a code edit. */
  ratePerSqft: z
    .object({ basic: z.number(), standard: z.number(), premium: z.number() })
    .optional(),
})

// ---------------------------------------------------------------------------
// Sections — T3
// ---------------------------------------------------------------------------

const caseStudy = z.object({
  ...sectionBase,
  items: z
    .array(
      z.object({
        slug,
        title: z.string(),
        problem: z.string(),
        approach: z.string(),
        outcome: z.string(),
        images: z.array(assetPath).default([]),
      }),
    )
    .default([]),
})

const locations = z.object({
  ...sectionBase,
  offices: z
    .array(z.object({ slug, name: z.string(), address, phone: phone.optional() }))
    .default([]),
})

const videoTour = z.object({ ...sectionBase, url: url.optional() })

const companyProfile = z.object({ ...sectionBase, pdf: assetPath.optional() })

const journal = z.object({
  ...sectionBase,
  posts: z
    .array(
      z.object({
        slug,
        title: z.string(),
        date: z.string(),
        body: z.string(),
        cover: assetPath.optional(),
      }),
    )
    .default([]),
})

const news = z.object({
  ...sectionBase,
  items: z
    .array(
      z.object({
        slug,
        title: z.string(),
        date: z.string(),
        outlet: z.string().optional(),
        href: url.optional(),
        body: z.string().optional(),
      }),
    )
    .default([]),
})

const careers = z.object({
  ...sectionBase,
  roles: z
    .array(z.object({ slug, title: z.string(), location: z.string(), body: z.string() }))
    .default([]),
})

// ---------------------------------------------------------------------------
// Cross-cutting
// ---------------------------------------------------------------------------

const cta = z.object({
  /** `{{business.name}}` and friends interpolate here. */
  whatsappMessage: z.string().default('Hi, I saw your website and I would like to discuss a project.'),
  stickyOnMobile: z.boolean().default(true),
  showCallButton: z.boolean().default(true),
})

const seo = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).default([]),
  localBusinessSchema: z.boolean().default(true),
  sitemap: z.boolean().default(true),
  /** Forced true whenever status is demo or sold. See validate.ts. */
  noindex: z.boolean().default(true),
})

const integrations = z.object({
  umami: z
    .object({ enabled: z.boolean().default(false), siteId: z.string().nullable().default(null) })
    .default({ enabled: false, siteId: null }),
  searchConsole: z.object({ enabled: z.boolean().default(false) }).default({ enabled: false }),
  uptimeMonitor: z.object({ enabled: z.boolean().default(false) }).default({ enabled: false }),
  gbpManaged: z.boolean().default(false),
  /** T3. Flag ships now; the screens are deferred until a real T3 sale. */
  leadDashboard: z.object({ enabled: z.boolean().default(false) }).default({ enabled: false }),
  /** T3. Ops-driven review solicitation. */
  reviewRequestFlow: z.object({ enabled: z.boolean().default(false) }).default({ enabled: false }),
})

const i18n = z
  .object({
    enabled: z.boolean().default(false),
    defaultLocale: z.string().default('en'),
    locales: z.array(z.string()).default(['en']),
  })
  .default({ enabled: false, defaultLocale: 'en', locales: ['en'] })

const legal = z.object({
  privacyPolicy: z.boolean().default(true),
  terms: z.boolean().default(true),
  dataRetentionNote: z.string().optional(),
})

const internal = z
  .object({
    demoWatermark: z.boolean().default(true),
    createdAt: z.string().optional(),
    leadSource: z.string().optional(),
    paymentStatus: z.enum(['none', 'deposit', 'paid']).default('none'),
    notes: z.string().default(''),
  })
  .default({ demoWatermark: true, paymentStatus: 'none', notes: '' })

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export const TIERS = ['t0', 't1', 't2', 't3'] as const
export const STATUSES = ['demo', 'sold', 'live', 'archived'] as const
export const IDENTITIES = ['editorial', 'premium', 'warm-contemporary', 'bold-modern'] as const

export const sectionsSchema = z.object({
  hero,
  quickActions: quickActions.optional(),
  trustBar: trustBar.optional(),
  services: services.optional(),
  portfolio,
  about: about.optional(),
  process: process.optional(),
  testimonials: testimonials.optional(),
  instagram: instagram.optional(),
  faq: faq.optional(),
  contact: contact.optional(),
  map: map.optional(),
  ctaBand: ctaBand.optional(),
  stickyMobileCta: stickyMobileCta.optional(),
  footer: footer.optional(),
  team: team.optional(),

  beforeAfter: beforeAfter.optional(),
  reviews: reviews.optional(),
  awards: awards.optional(),
  inquiryForm: inquiryForm.optional(),
  estimate: estimate.optional(),

  caseStudy: caseStudy.optional(),
  locations: locations.optional(),
  videoTour: videoTour.optional(),
  companyProfile: companyProfile.optional(),
  journal: journal.optional(),
  news: news.optional(),
  careers: careers.optional(),
})

export const clientConfigSchema = z.object({
  $schema: z.string().optional(),
  slug,
  tier: z.enum(TIERS),
  /** Identity slugs, not letters. There is no template "B". */
  template: z.enum(IDENTITIES).default('editorial'),
  status: z.enum(STATUSES),
  vertical: z.string().default('interior-design'),

  business,
  brand: brand.default({}),
  domain,
  sections: sectionsSchema,
  cta: cta.default({
    whatsappMessage: 'Hi, I saw your website and I would like to discuss a project.',
    stickyOnMobile: true,
    showCallButton: true,
  }),
  seo,
  integrations: integrations.default({
    umami: { enabled: false, siteId: null },
    searchConsole: { enabled: false },
    uptimeMonitor: { enabled: false },
    gbpManaged: false,
    leadDashboard: { enabled: false },
    reviewRequestFlow: { enabled: false },
  }),
  i18n,
  legal: legal.default({ privacyPolicy: true, terms: true }),
  internal,
})
