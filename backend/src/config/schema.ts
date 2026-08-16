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
  /** A short addition to `hours`, e.g. "Sunday by appointment". Not every studio needs one. */
  hoursExtra: z.string().optional(),
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
  /** The 2-3 verticals this studio serves, shown as small labels — e.g. "Apartments", "Offices". */
  categories: z.array(z.string()).max(3).default([]),
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

/**
 * A service's fields beyond `title`/`blurb`/`image` only matter once it has its
 * own `/services/[slug]` detail page — every one of them is optional so a
 * homepage-only service card never has to carry empty structure.
 */
const service = z.object({
  title: z.string(),
  blurb: z.string(),
  image: assetPath.optional(),
  slug: slug.optional(),
  price: z
    .object({ value: z.string(), unit: z.string().optional(), note: z.string().optional() })
    .optional(),
  intro: z.array(z.string()).default([]),
  photos: z.array(z.object({ image: assetPath, caption: z.string().optional() })).default([]),
  included: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  /** References `sections.portfolio.projects[].slug` — a worked example of this service. */
  linkedProjectSlug: slug.optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
})

const services = z.object({
  ...sectionBase,
  variant: z.enum(['compact', 'detailed']).optional(),
  items: z.array(service).default([]),
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
  /** e.g. "₹8–10 lakh" — a range, never an exact figure a neighbour could compare against theirs. */
  budget: z.string().optional(),
})

const portfolio = z.object({
  ...sectionBase,
  variant: z.enum(['grid', 'carousel']).optional(),
  /** T2+. Turns each project into `/portfolio/[slug]`. */
  detailPages: z.boolean().default(false),
  /** No upper limit. A studio with 40 projects lists 40. */
  projects: z.array(project).default([]),
  /** `/projects` index page only. */
  introText: z.string().optional(),
  /** e.g. "2026" — the end of the studio's project-history range shown on the index. */
  rangeEnd: z.string().optional(),
  /**
   * Descriptive copy per `project.category`/`projectType` value, shown at the top
   * of `/projects/[category]`. A category with projects but no header here still
   * lists them — this is decoration, not a gate.
   */
  categoryHeaders: z
    .array(
      z.object({
        category: z.string(),
        lead: z.string(),
        accent: z.string().optional(),
        lines: z.array(z.string()).default([]),
      }),
    )
    .default([]),
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
  intro: z.string().optional(),
  members: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        slug: slug.optional(),
        image: assetPath.optional(),
        bio: z.string().optional(),
        // The rest are detail-page fields, populated only for a member with a
        // `/team/[slug]` page — a member listed without one just has name/role/bio.
        tenure: z.string().optional(),
        line: z.string().optional(),
        eyebrow: z.string().optional(),
        body: z.array(z.string()).default([]),
        credentials: z.array(z.string()).default([]),
        projects: z
          .array(z.object({ slug, title: z.string(), image: assetPath.optional() }))
          .default([]),
      }),
    )
    .default([]),
  /** The wider team, grouped by department — "Design office", "Site supervision" and so on. */
  groups: z
    .array(
      z.object({
        label: z.string(),
        count: z.string().optional(),
        people: z
          .array(z.object({ name: z.string(), role: z.string(), image: assetPath.optional() }))
          .default([]),
      }),
    )
    .default([]),
  workshop: z
    .object({
      title: z.string().optional(),
      body: z.string().optional(),
      photos: z
        .array(z.object({ image: assetPath, caption: z.string().optional(), wide: z.boolean().optional() }))
        .default([]),
    })
    .optional(),
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
  /** The actual project types this studio offers, shown as a dropdown/checkbox list. */
  projectTypes: z.array(z.string()).default([]),
})

const estimate = z.object({
  ...sectionBase,
  /**
   * Flat fallback figures. `homeTypes`/`finishLevels` below is the model the
   * calculator actually renders when present — this stays for a studio that
   * hasn't set up the fuller pricing structure yet.
   */
  ratePerSqft: z
    .object({ basic: z.number(), standard: z.number(), premium: z.number() })
    .optional(),
  intro: z.string().optional(),
  area: z
    .object({
      min: z.number(),
      max: z.number(),
      step: z.number().optional(),
      default: z.number().optional(),
    })
    .optional(),
  /** Per-home-type price multiplier — e.g. a 1BHK vs. a duplex costs a different rate per sqft. */
  homeTypes: z.array(z.object({ id: z.string(), label: z.string(), factor: z.number() })).default([]),
  /** Named, described finish tiers — replaces the flat basic/standard/premium numbers above. */
  finishLevels: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        note: z.string().optional(),
        weeks: z.string().optional(),
        low: z.number().optional(),
        high: z.number().optional(),
      }),
    )
    .default([]),
  resultNote: z.string().optional(),
  included: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
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
        /** Paragraphs, in order. */
        problem: z.array(z.string()).default([]),
        approachIntro: z.string().optional(),
        /** The lettered highlight cards — "A. The layout", "B. The materials"... */
        decisions: z
          .array(z.object({ letter: z.string(), title: z.string(), body: z.string() }))
          .default([]),
        outcome: z.array(z.string()).default([]),
        stats: z.array(z.object({ value: z.string(), label: z.string() })).max(4).default([]),
        quote: z
          .object({
            text: z.string(),
            author: z.string(),
            context: z.string().optional(),
            image: assetPath.optional(),
          })
          .optional(),
        images: z.array(assetPath).default([]),
      }),
    )
    .default([]),
})

const locations = z.object({
  ...sectionBase,
  offices: z
    .array(
      z.object({
        slug,
        name: z.string(),
        address,
        phone: phone.optional(),
        hours: z
          .object({
            weekday: z.string().optional(),
            saturday: z.string().optional(),
            sunday: z.string().optional(),
            note: z.string().optional(),
          })
          .optional(),
        photo: z.object({ image: assetPath, caption: z.string().optional() }).optional(),
        /** How to actually find the door — landmark-based directions matter more than an address here. */
        findNote: z.string().optional(),
        about: z
          .object({
            lead: z.string().optional(),
            body: z.array(z.string()).default([]),
            stats: z.array(z.object({ value: z.string(), label: z.string() })).max(4).default([]),
          })
          .optional(),
        team: z
          .array(z.object({ name: z.string(), role: z.string(), image: assetPath.optional() }))
          .default([]),
        /** References `sections.portfolio.projects[].slug` — work delivered from this office. */
        projectSlugs: z.array(slug).default([]),
      }),
    )
    .default([]),
  /** Shown alongside a list of the studio's other offices, e.g. why a nearby city isn't covered yet. */
  otherLocationsNote: z.string().optional(),
})

const videoTour = z.object({ ...sectionBase, url: url.optional() })

const companyProfile = z.object({ ...sectionBase, pdf: assetPath.optional() })

const journal = z.object({
  ...sectionBase,
  intro: z.string().optional(),
  /** The filter chips on `/journal` — "Design", "Materials", "Process"... */
  topics: z.array(z.string()).default([]),
  posts: z
    .array(
      z.object({
        slug,
        title: z.string(),
        /** A shorter two-part display title for the post's own page — not derived from `title`, curated separately. */
        displayTitle: z.object({ lead: z.string(), accent: z.string() }).optional(),
        date: z.string(),
        topic: z.string().optional(),
        /** Display text, e.g. "1,200 words" — not a value to compute with. */
        words: z.string().optional(),
        excerpt: z.string().optional(),
        author: z
          .object({
            slug: slug.optional(),
            name: z.string(),
            role: z.string().optional(),
            image: assetPath.optional(),
            line: z.string().optional(),
          })
          .optional(),
        cover: assetPath.optional(),
        /**
         * Ordered content blocks — this is a real article, not a single body
         * string, and headings/bullets/a pullquote/an inline photo can appear
         * anywhere in it. A flat `body: string[]` plus separately-anchored
         * extras was tried and dropped: two unrelated pieces of content both
         * wanting "the third paragraph" as their anchor is exactly the kind of
         * conflict a plain ordered list does not have.
         */
        body: z
          .array(
            z.discriminatedUnion('type', [
              z.object({ type: z.literal('p'), text: z.string() }),
              z.object({ type: z.literal('h2'), lead: z.string(), accent: z.string() }),
              z.object({ type: z.literal('bullets'), items: z.array(z.string()) }),
              z.object({ type: z.literal('pullquote'), text: z.string() }),
              z.object({ type: z.literal('image'), image: assetPath, caption: z.string().optional() }),
            ]),
          )
          .default([]),
        /** True once a post has real body content. A stub with only an excerpt renders as "coming soon", not a broken article page. */
        full: z.boolean().default(false),
        related: z
          .array(z.object({ slug, title: z.string(), image: assetPath.optional() }))
          .default([]),
      }),
    )
    .default([]),
})

const news = z.object({
  ...sectionBase,
  /** Written about the studio elsewhere — leaves the site. */
  press: z
    .array(
      z.object({
        publication: z.string(),
        publicationShort: z.string().optional(),
        year: z.string().optional(),
        date: z.string().optional(),
        headline: z.string(),
        quote: z.string().optional(),
        url: url.optional(),
      }),
    )
    .default([]),
  /** The studio's own announcements — opens on this site, gets a `/news/[slug]` page. */
  items: z
    .array(
      z.object({
        slug,
        title: z.string(),
        headline: z.string().optional(),
        date: z.string(),
        year: z.string().optional(),
        category: z.string().optional(),
        summary: z.string().optional(),
        photo: assetPath.optional(),
        standfirst: z.string().optional(),
        lead: z.string().optional(),
        /** Paragraphs, in order. */
        body: z.array(z.string()).default([]),
        pullquote: z.string().optional(),
        pullattr: z.string().optional(),
        subhead: z.string().optional(),
        /** Paragraphs after the pullquote/subhead break, in order. */
        after: z.array(z.string()).default([]),
        related: z.object({ slug, title: z.string(), image: assetPath.optional() }).optional(),
        // Kept for a studio that only wants to link out rather than write a full article.
        outlet: z.string().optional(),
        href: url.optional(),
      }),
    )
    .default([]),
})

/**
 * Per-locality micro-pages, `/areas/[locality]`. `business.serviceAreas` is the
 * flat list of neighbourhood names shown in copy elsewhere; an entry here is
 * what actually gives one of them a real page — a name in `serviceAreas` with
 * no matching entry here has no page, which is the correct default rather than
 * a thin stub for every neighbourhood the studio has ever mentioned.
 */
const areas = z.object({
  ...sectionBase,
  items: z
    .array(
      z.object({
        slug,
        name: z.string(),
        stats: z.array(z.object({ value: z.string(), label: z.string() })).max(4).default([]),
        /** Paragraphs, in order. */
        intro: z.array(z.string()).default([]),
        /** Other neighbourhoods served near this one. */
        nearby: z.array(z.string()).default([]),
        cards: z
          .array(
            z.object({
              slug,
              title: z.string(),
              body: z.string().optional(),
              meta: z.string().optional(),
              image: assetPath.optional(),
            }),
          )
          .default([]),
      }),
    )
    .default([]),
})

const careers = z.object({
  ...sectionBase,
  /** Paragraphs, in order. */
  intro: z.array(z.string()).default([]),
  studioPhoto: z.object({ image: assetPath, caption: z.string().optional() }).optional(),
  /** The studio's hiring philosophy — a short list of what actually gets someone hired here. */
  lookFor: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  emptyState: z.object({ title: z.string().optional(), body: z.string().optional() }).optional(),
  applyProcess: z
    .object({
      title: z.string().optional(),
      sendTo: z.string().optional(),
      subject: z.string().optional(),
      sendItems: z.array(z.string()).default([]),
      next: z.string().optional(),
      nextBody: z.array(z.string()).default([]),
    })
    .optional(),
  roles: z
    .array(
      z.object({
        slug,
        title: z.string(),
        location: z.string(),
        body: z.string(),
        type: z.string().optional(),
        standfirst: z.string().optional(),
        reportsTo: z.string().optional(),
        salary: z.string().optional(),
        starts: z.string().optional(),
        duties: z.array(z.string()).default([]),
        requirements: z.array(z.string()).default([]),
        /** "The first six months", laid out as a short timeline. */
        months: z.array(z.object({ span: z.string(), text: z.string() })).default([]),
        apply: z.string().optional(),
      }),
    )
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

const legalDoc = z.object({
  lead: z.string().optional(),
  updated: z.string().optional(),
  sections: z
    .array(
      z.object({
        title: z.string(),
        paragraphs: z.array(z.string()).default([]),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
})

const legal = z.object({
  privacyPolicy: z.boolean().default(true),
  terms: z.boolean().default(true),
  dataRetentionNote: z.string().optional(),
  /** The actual document body. `privacyPolicy`/`terms` above still gate whether the page exists at all. */
  privacyPolicyDoc: legalDoc.optional(),
  termsDoc: legalDoc.optional(),
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
  areas: areas.optional(),
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
