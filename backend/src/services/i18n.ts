import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defaultClientsDir, mergePatch, type ClientConfig } from '../config/index'
import { createAnonClient, type Db } from '../db/scoped'

export type I18nLocale = 'hi'
type Json = Record<string, unknown>

export class I18nScopeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'I18nScopeError'
  }
}

export class I18nError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'I18nError'
  }
}

export type I18nCompletion = {
  locale: I18nLocale
  enabled: boolean
  translated: number
  total: number
  percent: number
  status: 'disabled' | 'incomplete' | 'published'
}

const SUPPORTED_LOCALES: readonly I18nLocale[] = ['hi']

const ALLOWED_TEXT_PATHS = new Set([
  'seo.title',
  'seo.description',
  'seo.keywords[]',
  'business.name',
  'business.tagline',
  'business.ownerName',
  'business.hours',
  'business.hoursExtra',
  'business.serviceAreas[]',
  'business.address.line1',
  'business.address.locality',
  'business.address.city',
  'business.address.state',
  'legal.dataRetentionNote',
  'legal.privacyPolicyDoc.lead',
  'legal.privacyPolicyDoc.updated',
  'legal.privacyPolicyDoc.sections[].title',
  'legal.privacyPolicyDoc.sections[].paragraphs[]',
  'legal.privacyPolicyDoc.sections[].bullets[]',
  'legal.termsDoc.lead',
  'legal.termsDoc.updated',
  'legal.termsDoc.sections[].title',
  'legal.termsDoc.sections[].paragraphs[]',
  'legal.termsDoc.sections[].bullets[]',
  'cta.whatsappMessage',
  'sections.hero.headline',
  'sections.hero.sub',
  'sections.hero.ctaLabel',
  'sections.hero.categories[]',
  'sections.trustBar.stats[].value',
  'sections.trustBar.stats[].label',
  'sections.services.items[].title',
  'sections.services.items[].blurb',
  'sections.services.items[].price.value',
  'sections.services.items[].price.unit',
  'sections.services.items[].price.note',
  'sections.services.items[].intro[]',
  'sections.services.items[].photos[].caption',
  'sections.services.items[].included[].title',
  'sections.services.items[].included[].body',
  'sections.services.items[].faq[].q',
  'sections.services.items[].faq[].a',
  'sections.portfolio.introText',
  'sections.portfolio.rangeEnd',
  'sections.portfolio.projects[].title',
  'sections.portfolio.projects[].blurb',
  'sections.portfolio.projects[].location',
  'sections.portfolio.projects[].duration',
  'sections.portfolio.projects[].area',
  'sections.portfolio.projects[].budget',
  'sections.portfolio.categoryHeaders[].lead',
  'sections.portfolio.categoryHeaders[].accent',
  'sections.portfolio.categoryHeaders[].lines[]',
  'sections.caseStudy.items[].title',
  'sections.caseStudy.items[].problem[]',
  'sections.caseStudy.items[].approachIntro',
  'sections.caseStudy.items[].decisions[].letter',
  'sections.caseStudy.items[].decisions[].title',
  'sections.caseStudy.items[].decisions[].body',
  'sections.caseStudy.items[].outcome[]',
  'sections.caseStudy.items[].stats[].value',
  'sections.caseStudy.items[].stats[].label',
  'sections.caseStudy.items[].quote.text',
  'sections.caseStudy.items[].quote.author',
  'sections.caseStudy.items[].quote.context',
  'sections.about.heading',
  'sections.about.body',
  'sections.process.steps[].title',
  'sections.process.steps[].body',
  'sections.process.steps[].duration',
  'sections.testimonials.items[].quote',
  'sections.testimonials.items[].author',
  'sections.testimonials.items[].context',
  'sections.faq.items[].q',
  'sections.faq.items[].a',
  'sections.ctaBand.headline',
  'sections.ctaBand.ctaLabel',
  'sections.footer.reassuranceLine',
  'sections.footer.socials[].label',
  'sections.beforeAfter.pairs[].caption',
  'sections.awards.items[].title',
  'sections.awards.items[].issuer',
  'sections.estimate.intro',
  'sections.estimate.homeTypes[].label',
  'sections.estimate.finishLevels[].label',
  'sections.estimate.finishLevels[].note',
  'sections.estimate.finishLevels[].weeks',
  'sections.estimate.resultNote',
  'sections.estimate.included[].title',
  'sections.estimate.included[].body',
  'sections.team.intro',
  'sections.team.members[].name',
  'sections.team.members[].role',
  'sections.team.members[].bio',
  'sections.team.members[].tenure',
  'sections.team.members[].line',
  'sections.team.members[].eyebrow',
  'sections.team.members[].body[]',
  'sections.team.members[].credentials[]',
  'sections.team.members[].projects[].title',
  'sections.team.groups[].label',
  'sections.team.groups[].count',
  'sections.team.groups[].people[].name',
  'sections.team.groups[].people[].role',
  'sections.team.workshop.title',
  'sections.team.workshop.body',
  'sections.team.workshop.photos[].caption',
  'sections.locations.offices[].name',
  'sections.locations.offices[].address.line1',
  'sections.locations.offices[].address.locality',
  'sections.locations.offices[].address.city',
  'sections.locations.offices[].address.state',
  'sections.locations.offices[].hours.weekday',
  'sections.locations.offices[].hours.saturday',
  'sections.locations.offices[].hours.sunday',
  'sections.locations.offices[].hours.note',
  'sections.locations.offices[].photo.caption',
  'sections.locations.offices[].findNote',
  'sections.locations.offices[].about.lead',
  'sections.locations.offices[].about.body[]',
  'sections.locations.offices[].about.stats[].value',
  'sections.locations.offices[].about.stats[].label',
  'sections.locations.offices[].team[].name',
  'sections.locations.offices[].team[].role',
  'sections.locations.otherLocationsNote',
  'sections.journal.intro',
  'sections.journal.topics[]',
  'sections.journal.posts[].title',
  'sections.journal.posts[].displayTitle.lead',
  'sections.journal.posts[].displayTitle.accent',
  'sections.journal.posts[].topic',
  'sections.journal.posts[].words',
  'sections.journal.posts[].excerpt',
  'sections.journal.posts[].author.name',
  'sections.journal.posts[].author.role',
  'sections.journal.posts[].author.line',
  'sections.journal.posts[].body[].text',
  'sections.journal.posts[].body[].type',
  'sections.journal.posts[].body[].lead',
  'sections.journal.posts[].body[].accent',
  'sections.journal.posts[].body[].items[]',
  'sections.journal.posts[].body[].caption',
  'sections.journal.posts[].related[].title',
  'sections.news.press[].publication',
  'sections.news.press[].publicationShort',
  'sections.news.press[].headline',
  'sections.news.press[].quote',
  'sections.news.items[].title',
  'sections.news.items[].headline',
  'sections.news.items[].category',
  'sections.news.items[].summary',
  'sections.news.items[].standfirst',
  'sections.news.items[].lead',
  'sections.news.items[].body[]',
  'sections.news.items[].pullquote',
  'sections.news.items[].pullattr',
  'sections.news.items[].subhead',
  'sections.news.items[].after[]',
  'sections.news.items[].related.title',
  'sections.news.items[].outlet',
  'sections.areas.items[].name',
  'sections.areas.items[].stats[].value',
  'sections.areas.items[].stats[].label',
  'sections.areas.items[].intro[]',
  'sections.areas.items[].nearby[]',
  'sections.areas.items[].cards[].title',
  'sections.areas.items[].cards[].body',
  'sections.areas.items[].cards[].meta',
  'sections.careers.intro[]',
  'sections.careers.studioPhoto.caption',
  'sections.careers.lookFor[].title',
  'sections.careers.lookFor[].body',
  'sections.careers.emptyState.title',
  'sections.careers.emptyState.body',
  'sections.careers.applyProcess.title',
  'sections.careers.applyProcess.sendTo',
  'sections.careers.applyProcess.subject',
  'sections.careers.applyProcess.sendItems[]',
  'sections.careers.applyProcess.next',
  'sections.careers.applyProcess.nextBody[]',
  'sections.careers.roles[].title',
  'sections.careers.roles[].location',
  'sections.careers.roles[].body',
  'sections.careers.roles[].type',
  'sections.careers.roles[].standfirst',
  'sections.careers.roles[].reportsTo',
  'sections.careers.roles[].salary',
  'sections.careers.roles[].starts',
  'sections.careers.roles[].duties[]',
  'sections.careers.roles[].requirements[]',
  'sections.careers.roles[].months[].span',
  'sections.careers.roles[].months[].text',
  'sections.careers.roles[].apply',
])

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function localeSupported(locale: string): locale is I18nLocale {
  return SUPPORTED_LOCALES.includes(locale as I18nLocale)
}

function seedPath(slug: string, locale: I18nLocale): string {
  return join(defaultClientsDir(), '..', 'content', 'i18n', slug, `${locale}.json`)
}

function pathLabel(parts: string[]): string {
  return parts.join('.').replace(/\.(\[\d+\])/g, '$1')
}

function normalisePath(parts: string[]): string {
  return pathLabel(parts).replace(/\[\d+\]/g, '[]')
}

function assertAllowedTextPath(parts: string[], value: unknown): void {
  const label = pathLabel(parts)
  if (typeof value !== 'string') {
    throw new I18nScopeError(`${label} must be translated text.`)
  }
  if (!ALLOWED_TEXT_PATHS.has(normalisePath(parts))) {
    throw new I18nScopeError(`${label} cannot be edited from a translation overlay.`)
  }
}

function walkOverlay(value: unknown, parts: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkOverlay(item, [...parts, `[${index}]`]))
    return
  }

  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      walkOverlay(child, [...parts, key])
    }
    return
  }

  assertAllowedTextPath(parts, value)
}

export function validateI18nPatch(value: unknown): Json {
  if (!isRecord(value)) throw new I18nScopeError('Translation overlay must be an object.')
  walkOverlay(value, [])
  return value
}

const STRUCTURAL_ARRAY_PATHS = new Set([
  'sections.trustBar.stats',
  'sections.services.items',
  'sections.portfolio.projects',
  'sections.portfolio.categoryHeaders',
  'sections.process.steps',
  'sections.testimonials.items',
  'sections.faq.items',
  'sections.footer.socials',
  'sections.estimate.homeTypes',
  'sections.estimate.finishLevels',
  'sections.estimate.included',
  'sections.team.members',
  'sections.team.groups',
  'sections.team.groups[].people',
  'sections.team.workshop.photos',
  'sections.caseStudy.items',
  'sections.locations.offices',
  'sections.locations.offices[].team',
  'sections.journal.posts',
  'sections.journal.posts[].related',
  'sections.news.press',
  'sections.news.items',
  'sections.careers.lookFor',
  'sections.careers.roles',
  'sections.areas.items',
])

function structuralArrayPath(parts: string[]): boolean {
  return STRUCTURAL_ARRAY_PATHS.has(normalisePath(parts))
}

function overlayValue(base: unknown, patch: unknown, parts: string[] = []): unknown {
  if (patch === undefined) return base
  if (Array.isArray(base) && Array.isArray(patch)) {
    const source = structuralArrayPath(parts) ? base : base.slice(0, patch.length)
    return source.map((item, index) => (index in patch ? overlayValue(item, patch[index], [...parts, `[${index}]`]) : item))
  }
  if (isRecord(base) && isRecord(patch)) {
    const out: Json = { ...base }
    for (const [key, value] of Object.entries(patch)) {
      out[key] = overlayValue(out[key], value, [...parts, key])
    }
    return out
  }
  return patch
}

export function applyI18nOverlay(site: ClientConfig, overlay: unknown): ClientConfig {
  const patch = validateI18nPatch(overlay)
  const translated = overlayValue(site, patch) as ClientConfig
  return {
    ...translated,
    i18n: {
      ...translated.i18n,
      enabled: true,
      defaultLocale: site.i18n.defaultLocale || 'en',
      locales: translated.i18n.locales.includes('hi') ? translated.i18n.locales : [...translated.i18n.locales, 'hi'],
    },
  }
}

export function loadI18nSeed(slug: string, locale: I18nLocale): Json | null {
  const file = seedPath(slug, locale)
  if (!existsSync(file)) return null
  return validateI18nPatch(JSON.parse(readFileSync(file, 'utf8')))
}

export async function fetchI18nOverridePatch(slug: string, locale: I18nLocale): Promise<Json | null> {
  const db = createAnonClient()
  const { data, error } = await db.rpc('get_i18n_overrides', { p_tenant_slug: slug, p_locale: locale })
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`I18n overrides unavailable for ${slug}/${locale}: ${error.message || 'Supabase request failed'}`)
    }
    return null
  }
  return validateI18nPatch(data ?? {})
}

export async function loadI18nOverlay(slug: string, locale: I18nLocale): Promise<Json | null> {
  const seed = loadI18nSeed(slug, locale)
  const override = await fetchI18nOverridePatch(slug, locale)
  const merged = mergePatch(seed ?? {}, override ?? {}) as Json
  return Object.keys(merged).length ? validateI18nPatch(merged) : null
}

export function i18nCompletion(overlay: unknown, locale: I18nLocale = 'hi'): I18nCompletion {
  let translated = 0
  walkOverlay(overlay, [])

  function count(value: unknown): void {
    if (typeof value === 'string') {
      if (value.trim()) translated += 1
      return
    }
    if (Array.isArray(value)) {
      value.forEach(count)
      return
    }
    if (isRecord(value)) {
      Object.values(value).forEach(count)
    }
  }

  count(overlay)
  const total = Math.max(translated, 1)
  return {
    locale,
    enabled: translated > 0,
    translated,
    total,
    percent: Math.round((translated / total) * 100),
    status: translated > 0 ? 'published' : 'disabled',
  }
}

export async function getI18nStatus(slug: string, locale: I18nLocale = 'hi'): Promise<I18nCompletion> {
  const overlay = await loadI18nOverlay(slug, locale)
  return overlay ? i18nCompletion(overlay, locale) : i18nCompletion({}, locale)
}

export async function getEditableI18n(
  db: Db,
  tenant: { id: string; slug: string },
  locale: I18nLocale,
): Promise<{ current: Json; patch: Json; status: I18nCompletion }> {
  const seed = loadI18nSeed(tenant.slug, locale) ?? {}
  const { data, error } = await db
    .from('i18n_overrides')
    .select('patch')
    .eq('tenant_id', tenant.id)
    .eq('locale', locale)
    .maybeSingle()

  if (error) throw new I18nError('Could not load Hindi content.', error)
  const patch = validateI18nPatch(data?.patch ?? {})
  const current = validateI18nPatch(mergePatch(seed, patch))
  return { current, patch, status: i18nCompletion(current, locale) }
}

export async function saveEditableI18n(
  db: Db,
  tenant: { id: string; slug: string },
  updatedBy: string,
  locale: I18nLocale,
  changes: unknown,
): Promise<{ patch: Json; status: I18nCompletion }> {
  const delta = validateI18nPatch(changes)
  const current = await getEditableI18n(db, tenant, locale)
  const mergedPatch = validateI18nPatch(mergePatch(current.patch, delta))

  const { error } = await db.from('i18n_overrides').upsert({
    tenant_id: tenant.id,
    locale,
    patch: mergedPatch,
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
  })

  if (error) throw new I18nError('Could not save Hindi content.', error)
  return { patch: mergedPatch, status: i18nCompletion(mergePatch(loadI18nSeed(tenant.slug, locale) ?? {}, mergedPatch), locale) }
}

export function parseI18nLocale(locale: string): I18nLocale | null {
  return localeSupported(locale) ? locale : null
}

export const i18nContent = {
  applyI18nOverlay,
  getEditableI18n,
  getI18nStatus,
  loadI18nOverlay,
  loadI18nSeed,
  parseI18nLocale,
  saveEditableI18n,
  validateI18nPatch,
}
