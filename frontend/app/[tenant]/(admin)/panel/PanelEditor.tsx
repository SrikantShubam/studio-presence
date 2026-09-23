'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { createLocalDraft, type LocalDraft } from '@/lib/demo-draft/patch'
import { clearLocalDraft, readLocalDraft, writeLocalDraft } from '@/lib/demo-draft/local-store'
import { AdminCard, AdminChip, AdminMetric, AdminShell } from '../components'
import { ChevronDown } from 'lucide-react'

type Address = {
  line1?: string
  locality: string
  city: string
  state: string
  pincode?: string
  mapsEmbedUrl?: string
}

type Project = {
  title: string
  slug?: string
  cover?: string
  images?: string[]
  blurb?: string
  location?: string
  duration?: string
  projectType?: 'residential' | 'commercial' | 'office' | 'retail'
  area?: string
  category?: string
}

type Service = {
  title: string
  blurb: string
  image?: string
  slug?: string
  price?: { value?: string; unit?: string; note?: string }
  intro?: string[]
  included?: Array<{ title?: string; body?: string }>
  faq?: Array<{ q?: string; a?: string }>
}

type Testimonial = {
  quote: string
  author: string
  context?: string
  image?: string
}

type FaqItem = { q: string; a: string }
type SocialLink = { label: string; href: string }
type EstimateRates = { basic: number; standard: number; premium: number }
type EstimateArea = { min: number; max: number; step?: number; default?: number }
type EstimateHomeType = { id: string; label: string; factor: number }
type EstimateFinishLevel = { id: string; label: string; note?: string; weeks?: string; low?: number; high?: number }
type EstimateIncluded = { title: string; body: string }
type GenericRecord = Record<string, unknown>

export type EditableConfig = {
  'business.phone': string
  'business.whatsapp': string
  'business.email'?: string
  'business.hours'?: string
  'business.address': Address
  'business.tagline'?: string
  'business.ownerName'?: string
  'business.serviceAreas': string[]
  'cta.whatsappMessage': string
  'seo.title': string
  'seo.description': string
  'sections.hero.image'?: string
  'sections.hero.headline': string
  'sections.hero.sub'?: string
  'sections.hero.ctaLabel'?: string
  'sections.hero.categories': string[]
  'sections.quickActions.actions'?: string[]
  'sections.trustBar.stats'?: Array<{ value?: string; label?: string }>
  'sections.portfolio.projects': Project[]
  'sections.portfolio.introText'?: string
  'sections.portfolio.rangeEnd'?: string
  'sections.portfolio.categoryHeaders'?: GenericRecord[]
  'sections.about.heading'?: string
  'sections.about.body'?: string
  'sections.about.image'?: string
  'sections.process.steps'?: GenericRecord[]
  'sections.services.items'?: Service[]
  'sections.testimonials.items'?: Testimonial[]
  'sections.instagram.handle'?: string
  'sections.instagram.embedPostUrls'?: string[]
  'sections.faq.items'?: FaqItem[]
  'sections.ctaBand.headline'?: string
  'sections.ctaBand.ctaLabel'?: string
  'sections.footer.reassuranceLine'?: string
  'sections.footer.socials'?: SocialLink[]
  'sections.estimate.enabled'?: boolean
  'sections.estimate.ratePerSqft'?: EstimateRates
  'sections.estimate.intro'?: string
  'sections.estimate.area'?: EstimateArea
  'sections.estimate.homeTypes'?: EstimateHomeType[]
  'sections.estimate.finishLevels'?: EstimateFinishLevel[]
  'sections.estimate.resultNote'?: string
  'sections.estimate.included'?: EstimateIncluded[]
  'sections.team.intro'?: string
  'sections.team.members'?: GenericRecord[]
  'sections.team.groups'?: GenericRecord[]
  'sections.team.workshop'?: GenericRecord
  'sections.beforeAfter.pairs'?: GenericRecord[]
  'sections.awards.items'?: GenericRecord[]
  'sections.caseStudy.items'?: GenericRecord[]
  'sections.locations.offices'?: GenericRecord[]
  'sections.locations.otherLocationsNote'?: string
  'sections.videoTour.url'?: string
  'sections.companyProfile.pdf'?: string
  'sections.journal.intro'?: string
  'sections.journal.topics'?: string[]
  'sections.journal.posts'?: GenericRecord[]
  'sections.news.press'?: GenericRecord[]
  'sections.news.items'?: GenericRecord[]
  'sections.careers.intro'?: string[]
  'sections.careers.studioPhoto'?: GenericRecord
  'sections.careers.lookFor'?: GenericRecord[]
  'sections.careers.emptyState'?: GenericRecord
  'sections.careers.applyProcess'?: GenericRecord
  'sections.careers.roles'?: GenericRecord[]
  'sections.areas.items'?: GenericRecord[]
  'legal.privacyPolicyDoc'?: GenericRecord
  'legal.termsDoc'?: GenericRecord
  'seo.keywords'?: string[]
}

export type Field = keyof EditableConfig
type LoadState = 'loading' | 'ready' | 'error'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'
type LanguageState = 'idle' | 'loading' | 'ready' | 'saving' | 'saved' | 'error'
type HindiOverlay = {
  seo?: { title?: string; description?: string }
  business?: { hours?: string; serviceAreas?: string[]; address?: { city?: string; locality?: string; state?: string } }
  cta?: { whatsappMessage?: string }
  sections?: {
    hero?: { headline?: string; sub?: string; ctaLabel?: string; categories?: string[] }
    trustBar?: { stats?: Array<{ value?: string; label?: string }> }
    about?: { heading?: string; body?: string }
    services?: { items?: Array<Partial<Service>> }
    portfolio?: { introText?: string; rangeEnd?: string; projects?: Array<Partial<Project>> }
    faq?: { items?: Array<{ q?: string; a?: string }> }
    ctaBand?: { headline?: string; ctaLabel?: string }
    footer?: { reassuranceLine?: string }
    estimate?: {
      intro?: string
      homeTypes?: Array<{ id?: string; label?: string }>
      finishLevels?: Array<{ id?: string; label?: string; note?: string; weeks?: string }>
      resultNote?: string
      included?: Array<{ title?: string; body?: string }>
    }
  }
}

const FIELDS: Field[] = [
  'business.phone',
  'business.whatsapp',
  'business.email',
  'business.hours',
  'business.address',
  'business.tagline',
  'business.ownerName',
  'business.serviceAreas',
  'cta.whatsappMessage',
  'seo.title',
  'seo.description',
  'sections.hero.image',
  'sections.hero.headline',
  'sections.hero.sub',
  'sections.hero.ctaLabel',
  'sections.hero.categories',
  'sections.quickActions.actions',
  'sections.trustBar.stats',
  'sections.portfolio.projects',
  'sections.portfolio.introText',
  'sections.portfolio.rangeEnd',
  'sections.portfolio.categoryHeaders',
  'sections.about.heading',
  'sections.about.body',
  'sections.about.image',
  'sections.process.steps',
  'sections.services.items',
  'sections.testimonials.items',
  'sections.instagram.handle',
  'sections.instagram.embedPostUrls',
  'sections.faq.items',
  'sections.ctaBand.headline',
  'sections.ctaBand.ctaLabel',
  'sections.footer.reassuranceLine',
  'sections.footer.socials',
  'sections.estimate.enabled',
  'sections.estimate.ratePerSqft',
  'sections.estimate.intro',
  'sections.estimate.area',
  'sections.estimate.homeTypes',
  'sections.estimate.finishLevels',
  'sections.estimate.resultNote',
  'sections.estimate.included',
  'sections.team.intro',
  'sections.team.members',
  'sections.team.groups',
  'sections.team.workshop',
  'sections.beforeAfter.pairs',
  'sections.awards.items',
  'sections.caseStudy.items',
  'sections.locations.offices',
  'sections.locations.otherLocationsNote',
  'sections.videoTour.url',
  'sections.companyProfile.pdf',
  'sections.journal.intro',
  'sections.journal.topics',
  'sections.journal.posts',
  'sections.news.press',
  'sections.news.items',
  'sections.careers.intro',
  'sections.careers.studioPhoto',
  'sections.careers.lookFor',
  'sections.careers.emptyState',
  'sections.careers.applyProcess',
  'sections.careers.roles',
  'sections.areas.items',
  'legal.privacyPolicyDoc',
  'legal.termsDoc',
  'seo.keywords',
]

const EMPTY_ADDRESS: Address = { locality: '', city: '', state: '' }

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toAddress(value: unknown): Address {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_ADDRESS
  const raw = value as Partial<Address>
  return {
    line1: text(raw.line1),
    locality: text(raw.locality),
    city: text(raw.city),
    state: text(raw.state),
    pincode: text(raw.pincode),
    mapsEmbedUrl: text(raw.mapsEmbedUrl),
  }
}

function arrayOf<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function bool(value: unknown): boolean {
  return value === true
}

function estimateRates(value: unknown): EstimateRates {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { basic: 0, standard: 0, premium: 0 }
  const raw = value as Partial<EstimateRates>
  return {
    basic: Number(raw.basic ?? 0),
    standard: Number(raw.standard ?? 0),
    premium: Number(raw.premium ?? 0),
  }
}

export function normaliseCurrent(current: Partial<Record<Field, unknown>>): EditableConfig {
  return {
    'business.phone': text(current['business.phone']),
    'business.whatsapp': text(current['business.whatsapp']),
    'business.email': text(current['business.email']),
    'business.hours': text(current['business.hours']),
    'business.address': toAddress(current['business.address']),
    'business.tagline': text(current['business.tagline']),
    'business.ownerName': text(current['business.ownerName']),
    'business.serviceAreas': arrayOf<string>(current['business.serviceAreas']),
    'cta.whatsappMessage': text(current['cta.whatsappMessage']),
    'seo.title': text(current['seo.title']),
    'seo.description': text(current['seo.description']),
    'sections.hero.image': text(current['sections.hero.image']),
    'sections.hero.headline': text(current['sections.hero.headline']),
    'sections.hero.sub': text(current['sections.hero.sub']),
    'sections.hero.ctaLabel': text(current['sections.hero.ctaLabel']),
    'sections.hero.categories': arrayOf<string>(current['sections.hero.categories']).slice(0, 3),
    'sections.quickActions.actions': arrayOf<string>(current['sections.quickActions.actions']),
    'sections.trustBar.stats': arrayOf<{ value?: string; label?: string }>(current['sections.trustBar.stats']),
    'sections.portfolio.projects': arrayOf<Project>(current['sections.portfolio.projects']),
    'sections.portfolio.introText': text(current['sections.portfolio.introText']),
    'sections.portfolio.rangeEnd': text(current['sections.portfolio.rangeEnd']),
    'sections.portfolio.categoryHeaders': arrayOf<GenericRecord>(current['sections.portfolio.categoryHeaders']),
    'sections.about.heading': text(current['sections.about.heading']),
    'sections.about.body': text(current['sections.about.body']),
    'sections.about.image': text(current['sections.about.image']),
    'sections.process.steps': arrayOf<GenericRecord>(current['sections.process.steps']),
    'sections.services.items': arrayOf<Service>(current['sections.services.items']),
    'sections.testimonials.items': arrayOf<Testimonial>(current['sections.testimonials.items']),
    'sections.instagram.handle': text(current['sections.instagram.handle']),
    'sections.instagram.embedPostUrls': arrayOf<string>(current['sections.instagram.embedPostUrls']).slice(0, 6),
    'sections.faq.items': arrayOf<FaqItem>(current['sections.faq.items']),
    'sections.ctaBand.headline': text(current['sections.ctaBand.headline']),
    'sections.ctaBand.ctaLabel': text(current['sections.ctaBand.ctaLabel']),
    'sections.footer.reassuranceLine': text(current['sections.footer.reassuranceLine']),
    'sections.footer.socials': arrayOf<SocialLink>(current['sections.footer.socials']),
    'sections.estimate.enabled': bool(current['sections.estimate.enabled']),
    'sections.estimate.ratePerSqft': estimateRates(current['sections.estimate.ratePerSqft']),
    'sections.estimate.intro': text(current['sections.estimate.intro']),
    'sections.estimate.area': current['sections.estimate.area'] as EstimateArea | undefined,
    'sections.estimate.homeTypes': arrayOf<EstimateHomeType>(current['sections.estimate.homeTypes']),
    'sections.estimate.finishLevels': arrayOf<EstimateFinishLevel>(current['sections.estimate.finishLevels']),
    'sections.estimate.resultNote': text(current['sections.estimate.resultNote']),
    'sections.estimate.included': arrayOf<EstimateIncluded>(current['sections.estimate.included']),
    'sections.team.intro': text(current['sections.team.intro']),
    'sections.team.members': arrayOf<GenericRecord>(current['sections.team.members']),
    'sections.team.groups': arrayOf<GenericRecord>(current['sections.team.groups']),
    'sections.team.workshop': objectOrUndefined(current['sections.team.workshop']),
    'sections.beforeAfter.pairs': arrayOf<GenericRecord>(current['sections.beforeAfter.pairs']),
    'sections.awards.items': arrayOf<GenericRecord>(current['sections.awards.items']),
    'sections.caseStudy.items': arrayOf<GenericRecord>(current['sections.caseStudy.items']),
    'sections.locations.offices': arrayOf<GenericRecord>(current['sections.locations.offices']),
    'sections.locations.otherLocationsNote': text(current['sections.locations.otherLocationsNote']),
    'sections.videoTour.url': text(current['sections.videoTour.url']),
    'sections.companyProfile.pdf': text(current['sections.companyProfile.pdf']),
    'sections.journal.intro': text(current['sections.journal.intro']),
    'sections.journal.topics': arrayOf<string>(current['sections.journal.topics']),
    'sections.journal.posts': arrayOf<GenericRecord>(current['sections.journal.posts']),
    'sections.news.press': arrayOf<GenericRecord>(current['sections.news.press']),
    'sections.news.items': arrayOf<GenericRecord>(current['sections.news.items']),
    'sections.careers.intro': arrayOf<string>(current['sections.careers.intro']),
    'sections.careers.studioPhoto': objectOrUndefined(current['sections.careers.studioPhoto']),
    'sections.careers.lookFor': arrayOf<GenericRecord>(current['sections.careers.lookFor']),
    'sections.careers.emptyState': objectOrUndefined(current['sections.careers.emptyState']),
    'sections.careers.applyProcess': objectOrUndefined(current['sections.careers.applyProcess']),
    'sections.careers.roles': arrayOf<GenericRecord>(current['sections.careers.roles']),
    'sections.areas.items': arrayOf<GenericRecord>(current['sections.areas.items']),
    'legal.privacyPolicyDoc': objectOrUndefined(current['legal.privacyPolicyDoc']),
    'legal.termsDoc': objectOrUndefined(current['legal.termsDoc']),
    'seo.keywords': arrayOf<string>(current['seo.keywords']),
  }
}

function objectOrUndefined(value: unknown): GenericRecord | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as GenericRecord
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function projectSlug(title: string, fallback: number): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `project-${fallback + 1}`
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= items.length) return items
  const copy = [...items]
  const item = copy[index]
  const nextItem = copy[nextIndex]
  if (item === undefined || nextItem === undefined) return items
  copy[index] = nextItem
  copy[nextIndex] = item
  return copy
}

function fieldSummary(count: number, empty: string): string {
  if (count === 0) return empty
  if (count === 1) return '1 item'
  return `${count} items`
}

type PanelEditorProps = {
  tenant: string
  mode?: 'paid' | 'local'
  initialContent?: Partial<Record<Field, unknown>>
  baseRevision?: string
  initialSection?: string
}

export function PanelEditor({ tenant, mode = 'paid', initialContent, baseRevision = 'seed', initialSection = 'homepage' }: PanelEditorProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [activationState, setActivationState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [activationError, setActivationError] = useState('')
  const [initial, setInitial] = useState<EditableConfig | null>(null)
  const [draft, setDraft] = useState<EditableConfig | null>(null)
  const [open, setOpen] = useState<string | null>(initialSection)
  const [languageState, setLanguageState] = useState<LanguageState>('idle')
  const [languageError, setLanguageError] = useState('')
  const [hindiDraft, setHindiDraft] = useState<HindiOverlay>({})
  const [hindiJson, setHindiJson] = useState('{}')
  const [hindiStatus, setHindiStatus] = useState<{ translated: number; status: string } | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoadState('loading')
      setLoadError('')

      try {
        let current: EditableConfig
        if (mode === 'local') {
          const seed = normaliseCurrent(initialContent ?? {})
          const local = readLocalDraft(tenant, baseRevision)
          current = { ...seed, ...(local?.changes as Partial<EditableConfig> | undefined) }
        } else {
          const response = await fetch(`/api/${tenant}/panel`, { cache: 'no-store' })
          if (!response.ok) throw new Error('Could not load your saved website content.')
          const body = (await response.json()) as { current?: Partial<Record<Field, unknown>> }
          current = normaliseCurrent(body.current ?? {})
        }
        if (!active) return
        setInitial(current)
        setDraft(current)
        setLoadState('ready')
      } catch {
        if (!active) return
        setLoadError('Could not load your website content. Refresh the page and try again.')
        setLoadState('error')
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [baseRevision, initialContent, mode, tenant])

  useEffect(() => {
    if (mode !== 'paid') return
    let active = true
    async function loadHindi() {
      setLanguageState('loading')
      setLanguageError('')
      try {
        const response = await fetch(`/api/${tenant}/panel/i18n/hi`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Could not load Hindi content.')
        const body = (await response.json()) as { current?: HindiOverlay; status?: { translated: number; status: string } }
        if (!active) return
        const current = body.current ?? {}
        setHindiDraft(current)
        setHindiJson(JSON.stringify(current, null, 2))
        setHindiStatus(body.status ?? null)
        setLanguageState('ready')
      } catch (error) {
        if (!active) return
        setLanguageError(error instanceof Error ? error.message : 'Could not load Hindi content.')
        setLanguageState('error')
      }
    }
    void loadHindi()
    return () => {
      active = false
    }
  }, [mode, tenant])

  const changes = useMemo(() => {
    const out: Partial<Record<Field, unknown>> = {}
    if (!initial || !draft) return out

    for (const field of FIELDS) {
      if (!sameValue(initial[field], draft[field])) out[field] = draft[field]
    }

    return out
  }, [draft, initial])

  const dirty = Object.keys(changes).length > 0

  useEffect(() => {
    if (mode !== 'local' || !initial || !draft) return
    const localDraft: LocalDraft = createLocalDraft(tenant, baseRevision, changes)
    writeLocalDraft(localDraft)
  }, [baseRevision, changes, draft, initial, mode, tenant])

  function update<K extends Field>(field: K, value: EditableConfig[K]) {
    setDraft((current) => (current ? { ...current, [field]: value } : current))
    setSaveState('idle')
    setSaveError('')
  }

  async function save() {
    if (!dirty || saveState === 'saving') return
    setSaveState('saving')
    setSaveError('')

    if (mode === 'local') {
      setSaveState('saved')
      return
    }

    try {
      const response = await fetch(`/api/${tenant}/panel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'Could not save changes, please try again.')
      }

      if (draft) setInitial(draft)
      setSaveState('saved')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save changes, please try again.')
      setSaveState('error')
    }
  }

  async function submitLocalDraft() {
    const local = readLocalDraft(tenant, baseRevision)
    if (!local || Object.keys(local.changes).length === 0) {
      setActivationState('error')
      setActivationError('There is no local demo draft to submit.')
      return
    }

    setActivationState('sending')
    setActivationError('')
    try {
      const response = await fetch(`/api/${tenant}/panel/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseRevision, patch: local.changes }),
      })
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) throw new Error(body.error || 'Could not submit the local demo draft.')
      setActivationState('sent')
    } catch (error) {
      setActivationState('error')
      setActivationError(error instanceof Error ? error.message : 'Could not submit the local demo draft.')
    }
  }

  function updateHindi(next: HindiOverlay) {
    setHindiDraft(next)
    setHindiJson(JSON.stringify(next, null, 2))
    if (languageState === 'saved') setLanguageState('ready')
  }

  async function saveHindi() {
    if (languageState === 'saving') return
    setLanguageState('saving')
    setLanguageError('')
    try {
      const payload = JSON.parse(hindiJson) as HindiOverlay
      const response = await fetch(`/api/${tenant}/panel/i18n/hi`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = (await response.json().catch(() => ({}))) as { error?: string; status?: { translated: number; status: string } }
      if (!response.ok) throw new Error(body.error || 'Could not save Hindi content.')
      setHindiDraft(payload)
      setHindiJson(JSON.stringify(payload, null, 2))
      setHindiStatus(body.status ?? null)
      setLanguageState('saved')
    } catch (error) {
      setLanguageError(error instanceof Error ? error.message : 'Could not save Hindi content.')
      setLanguageState('error')
    }
  }

  function discard() {
    if (mode === 'local') clearLocalDraft(tenant, baseRevision)
    setDraft(initial)
    setSaveState('idle')
    setSaveError('')
  }

  if (loadState === 'loading') {
    return <PanelShell title="Website content" message="Loading your editable website content..." />
  }

  if (loadState === 'error' || !draft) {
    return <PanelShell title="Website content" message={loadError} alert />
  }

  const projects = draft['sections.portfolio.projects']
  const services = draft['sections.services.items'] ?? []
  const testimonials = draft['sections.testimonials.items'] ?? []
  const posts = draft['sections.instagram.embedPostUrls'] ?? []
  const aboutText = draft['sections.about.body'] ?? ''
  const socials = draft['sections.footer.socials'] ?? []
  const faqs = draft['sections.faq.items'] ?? []
  const estimateRates = draft['sections.estimate.ratePerSqft'] ?? { basic: 0, standard: 0, premium: 0 }
  const estimateHomeTypes = draft['sections.estimate.homeTypes'] ?? []
  const estimateFinishLevels = draft['sections.estimate.finishLevels'] ?? []
  const contentAreas = contentTree(draft)

  return (
    <div data-content-manager>
    <AdminShell>
      <AdminCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">
                {mode === 'local' ? 'Local demo content' : 'Website Content'}
              </p>
              <AdminChip tone={mode === 'local' ? 'alert' : 'primary'}>{mode === 'local' ? 'unpublished' : 'live saves'}</AdminChip>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-admin-ink">{mode === 'local' ? 'Try editing your site' : 'Manage every enabled page'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
              {mode === 'local'
                ? 'Changes stay in this browser only. Paid access turns these same controls into global website updates.'
                : 'Pick a page or section, edit its content, then preview the public page in English or Hindi. Structure stays locked.'}
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink hover:border-admin-primary hover:text-admin-primary"
          >
            View site
          </a>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AdminMetric label="projects" value={projects.length} tone="primary" />
          <AdminMetric label="services" value={services.length} />
          <AdminMetric label="testimonials" value={testimonials.length} />
          <AdminMetric label="social posts" value={posts.filter(Boolean).length} />
        </div>
      </AdminCard>

      <section className="grid gap-5 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <AdminCard className="self-start overflow-hidden xl:sticky xl:top-5">
          <div className="border-b border-admin-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Page tree</p>
            <h2 className="mt-1 text-base font-semibold text-admin-ink">Editable surfaces</h2>
          </div>
          <nav className="grid p-2 text-sm font-medium">
            {contentAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setOpen(area.id)}
                className={`min-h-11 rounded px-3 text-left transition ${
                  open === area.id ? 'bg-admin-primary-soft text-admin-primary' : 'text-admin-muted hover:bg-admin-raised hover:text-admin-ink'
                }`}
              >
                <span className="block">{area.label}</span>
                <span className="block text-xs font-normal opacity-80">{area.group}</span>
              </button>
            ))}
          </nav>
        </AdminCard>

        <div className="grid gap-4">

      <SectionCard
        id="homepage"
        title="Homepage"
        summary={draft['sections.hero.headline'] || 'Edit hero copy and the main button.'}
        open={open === 'homepage'}
        onToggle={() => setOpen(open === 'homepage' ? null : 'homepage')}
      >
        <TextInput label="Hero headline" value={draft['sections.hero.headline']} onChange={(value) => update('sections.hero.headline', value)} />
        <TextArea label="Hero subtext" value={draft['sections.hero.sub'] ?? ''} onChange={(value) => update('sections.hero.sub', value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Main button label" value={draft['sections.hero.ctaLabel'] ?? ''} onChange={(value) => update('sections.hero.ctaLabel', value)} />
          <TextInput label="Studio tagline" value={draft['business.tagline'] ?? ''} onChange={(value) => update('business.tagline', value)} />
        </div>
        <TextArea
          label="Hero categories"
          value={draft['sections.hero.categories'].join('\n')}
          hint="One category per line. The public hero shows up to three."
          onChange={(value) => update('sections.hero.categories', value.split('\n').map((item) => item.trim()).filter(Boolean).slice(0, 3))}
        />
      </SectionCard>

      <SectionCard
        id="trust"
        title="Trust stats"
        summary={fieldSummary((draft['sections.trustBar.stats'] ?? []).length, 'No trust stats yet.')}
        open={open === 'trust'}
        onToggle={() => setOpen(open === 'trust' ? null : 'trust')}
      >
        <JsonField label="Trust stat cards" value={draft['sections.trustBar.stats'] ?? []} onChange={(value) => update('sections.trustBar.stats', arrayOf<GenericRecord>(value))} />
      </SectionCard>

      <SectionCard
        id="process"
        title="Process"
        summary={fieldSummary((draft['sections.process.steps'] ?? []).length, 'No process steps yet.')}
        open={open === 'process'}
        onToggle={() => setOpen(open === 'process' ? null : 'process')}
      >
        <JsonField label="Process steps" value={draft['sections.process.steps'] ?? []} onChange={(value) => update('sections.process.steps', arrayOf<GenericRecord>(value))} />
      </SectionCard>

      <SectionCard
        id="settings"
        title="CTA and socials"
        summary={draft['cta.whatsappMessage'] || 'Set button behavior and public social links.'}
        open={open === 'settings'}
        onToggle={() => setOpen(open === 'settings' ? null : 'settings')}
      >
        <TextArea
          label="WhatsApp starter message"
          value={draft['cta.whatsappMessage']}
          hint="This text is pre-filled when visitors tap WhatsApp."
          onChange={(value) => update('cta.whatsappMessage', value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="CTA band headline" value={draft['sections.ctaBand.headline'] ?? ''} onChange={(value) => update('sections.ctaBand.headline', value)} />
          <TextInput label="CTA band button" value={draft['sections.ctaBand.ctaLabel'] ?? ''} onChange={(value) => update('sections.ctaBand.ctaLabel', value)} />
        </div>
        <TextArea label="Footer reassurance line" value={draft['sections.footer.reassuranceLine'] ?? ''} onChange={(value) => update('sections.footer.reassuranceLine', value)} />
        <div className="grid gap-3">
          {socials.map((social, index) => (
            <div key={`${social.label}-${index}`} className="grid gap-3 rounded-lg border border-admin-border p-3 sm:grid-cols-[1fr_1fr_auto]">
              <TextInput
                label="Social label"
                value={social.label}
                onChange={(label) => {
                  const copy = [...socials]
                  copy[index] = { ...social, label }
                  update('sections.footer.socials', copy)
                }}
              />
              <TextInput
                label="Social link"
                value={social.href}
                onChange={(href) => {
                  const copy = [...socials]
                  copy[index] = { ...social, href }
                  update('sections.footer.socials', copy)
                }}
              />
              <button type="button" onClick={() => update('sections.footer.socials', socials.filter((_, i) => i !== index))} className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-alert sm:self-end">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary" onClick={() => update('sections.footer.socials', [...socials, { label: 'Instagram', href: 'https://instagram.com/' }])}>
          Add social link
        </button>
      </SectionCard>

      <SectionCard
        id="estimate"
        title="Estimate calculator"
        summary={draft['sections.estimate.enabled'] ? 'Calculator is enabled.' : 'Calculator is disabled.'}
        open={open === 'estimate'}
        onToggle={() => setOpen(open === 'estimate' ? null : 'estimate')}
      >
        <label className="flex min-h-12 items-center gap-3 rounded-lg border border-admin-border px-3 text-base font-medium text-admin-ink">
          <input type="checkbox" checked={Boolean(draft['sections.estimate.enabled'])} onChange={(event) => update('sections.estimate.enabled', event.target.checked)} />
          Enable estimate calculator page and estimate CTAs
        </label>
        <TextArea label="Calculator introduction" value={draft['sections.estimate.intro'] ?? ''} onChange={(value) => update('sections.estimate.intro', value)} />
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberInput label="Basic rate per sqft" value={estimateRates.basic} onChange={(basic) => update('sections.estimate.ratePerSqft', { ...estimateRates, basic })} />
          <NumberInput label="Standard rate per sqft" value={estimateRates.standard} onChange={(standard) => update('sections.estimate.ratePerSqft', { ...estimateRates, standard })} />
          <NumberInput label="Premium rate per sqft" value={estimateRates.premium} onChange={(premium) => update('sections.estimate.ratePerSqft', { ...estimateRates, premium })} />
        </div>
        <div className="grid gap-3">
          {estimateHomeTypes.map((homeType, index) => (
            <div key={`${homeType.id}-${index}`} className="grid gap-3 rounded-lg border border-admin-border p-3 sm:grid-cols-[1fr_1fr_auto]">
              <TextInput
                label="Home type"
                value={homeType.label}
                onChange={(label) => {
                  const copy = [...estimateHomeTypes]
                  copy[index] = { ...homeType, label, id: homeType.id || projectSlug(label, index) }
                  update('sections.estimate.homeTypes', copy)
                }}
              />
              <NumberInput
                label="Multiplier"
                value={homeType.factor}
                step="0.01"
                onChange={(factor) => {
                  const copy = [...estimateHomeTypes]
                  copy[index] = { ...homeType, factor }
                  update('sections.estimate.homeTypes', copy)
                }}
              />
              <button type="button" onClick={() => update('sections.estimate.homeTypes', estimateHomeTypes.filter((_, i) => i !== index))} className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-alert sm:self-end">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary" onClick={() => update('sections.estimate.homeTypes', [...estimateHomeTypes, { id: `home-${estimateHomeTypes.length + 1}`, label: 'New home type', factor: 1 }])}>
          Add home type
        </button>
        <div className="grid gap-3">
          {estimateFinishLevels.map((finish, index) => (
            <div key={`${finish.id}-${index}`} className="grid gap-3 rounded-lg border border-admin-border p-3 sm:grid-cols-2">
              <TextInput
                label="Finish level"
                value={finish.label}
                onChange={(label) => {
                  const copy = [...estimateFinishLevels]
                  copy[index] = { ...finish, label, id: finish.id || projectSlug(label, index) }
                  update('sections.estimate.finishLevels', copy)
                }}
              />
              <TextInput
                label="Timeline"
                value={finish.weeks ?? ''}
                onChange={(weeks) => {
                  const copy = [...estimateFinishLevels]
                  copy[index] = { ...finish, weeks }
                  update('sections.estimate.finishLevels', copy)
                }}
              />
              <NumberInput
                label="Low multiplier"
                value={finish.low ?? 1}
                step="0.01"
                onChange={(low) => {
                  const copy = [...estimateFinishLevels]
                  copy[index] = { ...finish, low }
                  update('sections.estimate.finishLevels', copy)
                }}
              />
              <NumberInput
                label="High multiplier"
                value={finish.high ?? 1}
                step="0.01"
                onChange={(high) => {
                  const copy = [...estimateFinishLevels]
                  copy[index] = { ...finish, high }
                  update('sections.estimate.finishLevels', copy)
                }}
              />
              <TextArea
                label="Finish note"
                value={finish.note ?? ''}
                onChange={(note) => {
                  const copy = [...estimateFinishLevels]
                  copy[index] = { ...finish, note }
                  update('sections.estimate.finishLevels', copy)
                }}
              />
              <button type="button" onClick={() => update('sections.estimate.finishLevels', estimateFinishLevels.filter((_, i) => i !== index))} className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-alert">
                Remove finish
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary" onClick={() => update('sections.estimate.finishLevels', [...estimateFinishLevels, { id: `finish-${estimateFinishLevels.length + 1}`, label: 'New finish', low: 1, high: 1 }])}>
          Add finish level
        </button>
        <TextArea label="Result note" value={draft['sections.estimate.resultNote'] ?? ''} onChange={(value) => update('sections.estimate.resultNote', value)} />
        <div className="rounded-lg border border-admin-border bg-admin-bg p-4">
          <p className="text-sm font-semibold text-admin-ink">Live preview</p>
          <p className="mt-2 text-sm text-admin-muted">
            1,000 sqft at standard rate currently starts around Rs {Math.round((estimateRates.standard || 0) * (estimateHomeTypes[0]?.factor ?? 1) * (estimateFinishLevels[0]?.low ?? 1)).toLocaleString('en-IN')}.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        id="languages"
        title="Hindi language"
        summary={
          mode !== 'paid'
            ? 'Available after paid access.'
            : hindiStatus
              ? `${hindiStatus.translated} translated fields · ${hindiStatus.status}`
              : 'Load and edit Hindi public-site copy.'
        }
        open={open === 'languages'}
        onToggle={() => setOpen(open === 'languages' ? null : 'languages')}
      >
        {mode !== 'paid' ? (
          <p className="text-sm text-admin-muted">Hindi editing is available in the paid dashboard because it saves to the tenant override store.</p>
        ) : languageState === 'loading' ? (
          <p className="text-sm text-admin-muted">Loading Hindi content...</p>
        ) : (
          <>
            {languageState === 'error' && <p className="text-sm font-medium text-admin-alert">{languageError}</p>}
            {languageState === 'saved' && <p className="text-sm font-medium text-admin-primary">Hindi content saved.</p>}
            <div className="flex flex-wrap gap-2 rounded-lg border border-admin-border bg-admin-bg p-3">
              <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
                Preview English
              </a>
              <a href="/hi" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary">
                Preview Hindi
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Hindi SEO title"
                value={hindiDraft.seo?.title ?? ''}
                onChange={(title) => updateHindi({ ...hindiDraft, seo: { ...hindiDraft.seo, title } })}
              />
              <TextInput
                label="Hindi SEO description"
                value={hindiDraft.seo?.description ?? ''}
                onChange={(description) => updateHindi({ ...hindiDraft, seo: { ...hindiDraft.seo, description } })}
              />
              <TextInput
                label="Hindi hero headline"
                value={hindiDraft.sections?.hero?.headline ?? ''}
                onChange={(headline) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, hero: { ...hindiDraft.sections?.hero, headline } } })}
              />
              <TextInput
                label="Hindi hero subtext"
                value={hindiDraft.sections?.hero?.sub ?? ''}
                onChange={(sub) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, hero: { ...hindiDraft.sections?.hero, sub } } })}
              />
              <TextInput
                label="Hindi hero button"
                value={hindiDraft.sections?.hero?.ctaLabel ?? ''}
                onChange={(ctaLabel) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, hero: { ...hindiDraft.sections?.hero, ctaLabel } } })}
              />
              <TextInput
                label="Hindi city"
                value={hindiDraft.business?.address?.city ?? ''}
                onChange={(city) => updateHindi({ ...hindiDraft, business: { ...hindiDraft.business, address: { ...hindiDraft.business?.address, city } } })}
              />
            </div>
            <TextArea
              label="Hindi service areas"
              value={(hindiDraft.business?.serviceAreas ?? []).join('\n')}
              hint="One area per line."
              onChange={(value) => updateHindi({ ...hindiDraft, business: { ...hindiDraft.business, serviceAreas: value.split('\n').map((item) => item.trim()).filter(Boolean) } })}
            />
            <TextArea
              label="Hindi WhatsApp message"
              value={hindiDraft.cta?.whatsappMessage ?? ''}
              onChange={(whatsappMessage) => updateHindi({ ...hindiDraft, cta: { ...hindiDraft.cta, whatsappMessage } })}
            />
            <TextInput
              label="Hindi about heading"
              value={hindiDraft.sections?.about?.heading ?? ''}
              onChange={(heading) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, about: { ...hindiDraft.sections?.about, heading } } })}
            />
            <TextArea
              label="Hindi about text"
              value={hindiDraft.sections?.about?.body ?? ''}
              onChange={(body) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, about: { ...hindiDraft.sections?.about, body } } })}
            />
            <div className="grid gap-3">
              {(hindiDraft.sections?.services?.items ?? []).map((service, index) => (
                <div key={index} className="rounded-lg border border-admin-border p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextInput
                      label={`Hindi service ${index + 1} title`}
                      value={service.title ?? ''}
                      onChange={(title) => {
                        const items = [...(hindiDraft.sections?.services?.items ?? [])]
                        items[index] = { ...service, title }
                        updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, services: { items } } })
                      }}
                    />
                    <TextInput
                      label={`Hindi service ${index + 1} blurb`}
                      value={service.blurb ?? ''}
                      onChange={(blurb) => {
                        const items = [...(hindiDraft.sections?.services?.items ?? [])]
                        items[index] = { ...service, blurb }
                        updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, services: { items } } })
                      }}
                    />
                    <TextInput
                      label={`Hindi service ${index + 1} price`}
                      value={service.price?.value ?? ''}
                      onChange={(value) => {
                        const items = [...(hindiDraft.sections?.services?.items ?? [])]
                        items[index] = { ...service, price: { ...service.price, value } }
                        updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, services: { items } } })
                      }}
                    />
                    <TextInput
                      label={`Hindi service ${index + 1} price note`}
                      value={service.price?.note ?? ''}
                      onChange={(note) => {
                        const items = [...(hindiDraft.sections?.services?.items ?? [])]
                        items[index] = { ...service, price: { ...service.price, note } }
                        updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, services: { items } } })
                      }}
                    />
                  </div>
                  <TextArea
                    label={`Hindi service ${index + 1} intro paragraphs`}
                    value={(service.intro ?? []).join('\n\n')}
                    onChange={(value) => {
                      const items = [...(hindiDraft.sections?.services?.items ?? [])]
                      items[index] = { ...service, intro: value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) }
                      updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, services: { items } } })
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(hindiDraft.sections?.trustBar?.stats ?? []).map((stat, index) => (
                <TextInput
                  key={index}
                  label={`Hindi trust stat ${index + 1} label`}
                  value={stat.label ?? ''}
                  onChange={(label) => {
                    const stats = [...(hindiDraft.sections?.trustBar?.stats ?? [])]
                    stats[index] = { ...stat, label }
                    updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, trustBar: { stats } } })
                  }}
                />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(hindiDraft.sections?.faq?.items ?? []).map((item, index) => (
                <div key={index} className="rounded-lg border border-admin-border p-3">
                  <TextInput
                    label={`Hindi FAQ ${index + 1} question`}
                    value={item.q ?? ''}
                    onChange={(q) => {
                      const items = [...(hindiDraft.sections?.faq?.items ?? [])]
                      items[index] = { ...item, q }
                      updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, faq: { items } } })
                    }}
                  />
                  <TextArea
                    label={`Hindi FAQ ${index + 1} answer`}
                    value={item.a ?? ''}
                    onChange={(a) => {
                      const items = [...(hindiDraft.sections?.faq?.items ?? [])]
                      items[index] = { ...item, a }
                      updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, faq: { items } } })
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Hindi CTA band headline"
                value={hindiDraft.sections?.ctaBand?.headline ?? ''}
                onChange={(headline) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, ctaBand: { ...hindiDraft.sections?.ctaBand, headline } } })}
              />
              <TextInput
                label="Hindi CTA band button"
                value={hindiDraft.sections?.ctaBand?.ctaLabel ?? ''}
                onChange={(ctaLabel) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, ctaBand: { ...hindiDraft.sections?.ctaBand, ctaLabel } } })}
              />
            </div>
            <TextArea
              label="Hindi footer reassurance"
              value={hindiDraft.sections?.footer?.reassuranceLine ?? ''}
              onChange={(reassuranceLine) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, footer: { ...hindiDraft.sections?.footer, reassuranceLine } } })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextArea
                label="Hindi estimate intro"
                value={hindiDraft.sections?.estimate?.intro ?? ''}
                onChange={(intro) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, estimate: { ...hindiDraft.sections?.estimate, intro } } })}
              />
              <TextArea
                label="Hindi estimate result note"
                value={hindiDraft.sections?.estimate?.resultNote ?? ''}
                onChange={(resultNote) => updateHindi({ ...hindiDraft, sections: { ...hindiDraft.sections, estimate: { ...hindiDraft.sections?.estimate, resultNote } } })}
              />
            </div>
            <button
              type="button"
              onClick={() => void saveHindi()}
              disabled={languageState === 'saving'}
              className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary disabled:opacity-60"
            >
              {languageState === 'saving' ? 'Saving Hindi...' : 'Save Hindi content'}
            </button>
          </>
        )}
      </SectionCard>

      <SectionCard
        id="contact"
        title="Contact details"
        summary={draft['business.phone'] || 'Add the phone number visitors should call.'}
        open={open === 'contact'}
        onToggle={() => setOpen(open === 'contact' ? null : 'contact')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Phone number" value={draft['business.phone']} onChange={(value) => update('business.phone', value)} />
          <TextInput
            label="WhatsApp number"
            value={draft['business.whatsapp']}
            onChange={(value) => update('business.whatsapp', value)}
            hint="This is where enquiries from your site will arrive."
          />
          <TextInput label="Email" type="email" value={draft['business.email'] ?? ''} onChange={(value) => update('business.email', value)} />
          <TextInput label="Working hours" value={draft['business.hours'] ?? ''} onChange={(value) => update('business.hours', value)} />
        </div>
        <AddressEditor value={draft['business.address']} onChange={(value) => update('business.address', value)} />
      </SectionCard>

      <SectionCard
        id="hero"
        title="Hero image"
        summary={draft['sections.hero.image'] || 'No hero image selected yet.'}
        open={open === 'hero'}
        onToggle={() => setOpen(open === 'hero' ? null : 'hero')}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ImagePreview src={draft['sections.hero.image']} alt="Current hero image" />
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm text-admin-muted">Photo upload needs a storage endpoint before this button can save a file.</p>
            <button
              type="button"
              disabled
              className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-muted disabled:cursor-not-allowed"
            >
              Replace photo
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="projects"
        title="Projects"
        summary={fieldSummary(projects.length, 'No projects yet.')}
        open={open === 'projects'}
        onToggle={() => setOpen(open === 'projects' ? null : 'projects')}
      >
        <ListEmpty show={projects.length === 0}>No projects yet. Add your first one - this is the part visitors look at most.</ListEmpty>
        <div className="flex flex-col gap-3">
          {projects.map((project, index) => (
            <ProjectRow
              key={`${project.slug ?? project.title}-${index}`}
              project={project}
              index={index}
              count={projects.length}
              onMove={(direction) => update('sections.portfolio.projects', moveItem(projects, index, direction))}
              onChange={(next) => {
                const copy = [...projects]
                copy[index] = { ...next, slug: next.slug || projectSlug(next.title, index) }
                update('sections.portfolio.projects', copy)
              }}
              onRemove={() => update('sections.portfolio.projects', projects.filter((_, i) => i !== index))}
            />
          ))}
        </div>
        <button
          type="button"
          className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary"
          onClick={() =>
            update('sections.portfolio.projects', [
              ...projects,
              {
                title: 'Untitled project',
                slug: projectSlug('Untitled project', projects.length),
                cover: '',
                images: [],
                location: '',
                projectType: 'residential',
                blurb: '',
              },
            ])
          }
        >
          Add a project
        </button>
      </SectionCard>

      <SectionCard
        id="about"
        title="About text"
        summary={aboutText ? `${aboutText.length} characters` : 'Add the studio introduction visitors should read.'}
        open={open === 'about'}
        onToggle={() => setOpen(open === 'about' ? null : 'about')}
      >
        <TextInput
          label="Heading"
          value={draft['sections.about.heading'] ?? ''}
          onChange={(value) => update('sections.about.heading', value)}
        />
        <TextArea label="About text" value={aboutText} onChange={(value) => update('sections.about.body', value)} />
        <p className="text-sm text-admin-muted">{aboutText.length} characters</p>
      </SectionCard>

      <SectionCard
        id="seo"
        title="Search preview"
        summary={draft['seo.title'] || 'Set Google title and description.'}
        open={open === 'seo'}
        onToggle={() => setOpen(open === 'seo' ? null : 'seo')}
      >
        <TextInput label="Google title" value={draft['seo.title']} onChange={(value) => update('seo.title', value)} />
        <TextArea label="Google description" value={draft['seo.description']} onChange={(value) => update('seo.description', value)} />
        <div className="rounded-lg border border-admin-border bg-admin-bg p-4">
          <p className="text-sm font-semibold text-admin-primary">{draft['seo.title'] || 'Search title'}</p>
          <p className="mt-1 text-sm text-admin-muted">{draft['seo.description'] || 'Search description appears here.'}</p>
        </div>
      </SectionCard>

      <SectionCard
        id="services"
        title="Services"
        summary={fieldSummary(services.length, 'No services yet.')}
        open={open === 'services'}
        onToggle={() => setOpen(open === 'services' ? null : 'services')}
      >
        <ListEmpty show={services.length === 0}>No services yet. Add the first service customers usually ask you for.</ListEmpty>
        <SimpleList
          items={services}
          labels={{ title: 'Service title', body: 'One-line description' }}
          getBody={(item) => item.blurb}
          setBody={(item, blurb) => ({ ...item, blurb })}
          onMove={(index, direction) => update('sections.services.items', moveItem(services, index, direction))}
          onChange={(index, item) => {
            const copy = [...services]
            copy[index] = item
            update('sections.services.items', copy)
          }}
          onRemove={(index) => update('sections.services.items', services.filter((_, i) => i !== index))}
        />
        <button
          type="button"
          className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary"
          onClick={() => update('sections.services.items', [...services, { title: 'New service', blurb: '' }])}
        >
          Add a service
        </button>
      </SectionCard>

      <SectionCard
        id="faq"
        title="Common questions"
        summary={fieldSummary(faqs.length, 'Add questions customers ask before calling.')}
        open={open === 'faq'}
        onToggle={() => setOpen(open === 'faq' ? null : 'faq')}
      >
        <ListEmpty show={faqs.length === 0}>No questions yet. Add the questions that usually come up on WhatsApp.</ListEmpty>
        <div className="grid gap-3">
          {faqs.map((item, index) => (
            <div key={`${item.q}-${index}`} className="rounded-lg border border-admin-border p-3">
              <TextInput
                label="Question"
                value={item.q}
                onChange={(q) => {
                  const copy = [...faqs]
                  copy[index] = { ...item, q }
                  update('sections.faq.items', copy)
                }}
              />
              <TextArea
                label="Answer"
                value={item.a}
                onChange={(a) => {
                  const copy = [...faqs]
                  copy[index] = { ...item, a }
                  update('sections.faq.items', copy)
                }}
              />
              <button type="button" onClick={() => update('sections.faq.items', faqs.filter((_, i) => i !== index))} className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-alert">
                Remove question
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary" onClick={() => update('sections.faq.items', [...faqs, { q: '', a: '' }])}>
          Add question
        </button>
      </SectionCard>

      <SectionCard
        id="testimonials"
        title="Testimonials"
        summary={fieldSummary(testimonials.length, 'No testimonials yet.')}
        open={open === 'testimonials'}
        onToggle={() => setOpen(open === 'testimonials' ? null : 'testimonials')}
      >
        <ListEmpty show={testimonials.length === 0}>No testimonials yet. Add one short client quote when you have it.</ListEmpty>
        <div className="flex flex-col gap-3">
          {testimonials.map((testimonial, index) => (
            <div key={`${testimonial.author}-${index}`} className="rounded-lg border border-admin-border p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                <MoveButtons index={index} count={testimonials.length} onMove={(direction) => update('sections.testimonials.items', moveItem(testimonials, index, direction))} />
                <button
                  type="button"
                  className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-alert"
                  onClick={() => update('sections.testimonials.items', testimonials.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label="Name"
                  value={testimonial.author}
                  onChange={(value) => {
                    const copy = [...testimonials]
                    copy[index] = { ...testimonial, author: value }
                    update('sections.testimonials.items', copy)
                  }}
                />
                <TextInput
                  label="Area"
                  value={testimonial.context ?? ''}
                  onChange={(value) => {
                    const copy = [...testimonials]
                    copy[index] = { ...testimonial, context: value }
                    update('sections.testimonials.items', copy)
                  }}
                />
              </div>
              <TextArea
                label="Quote"
                value={testimonial.quote}
                onChange={(value) => {
                  const copy = [...testimonials]
                  copy[index] = { ...testimonial, quote: value }
                  update('sections.testimonials.items', copy)
                }}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary"
          onClick={() => update('sections.testimonials.items', [...testimonials, { quote: '', author: '', context: '' }])}
        >
          Add a testimonial
        </button>
      </SectionCard>

      <SectionCard
        id="instagram"
        title="Instagram posts"
        summary={fieldSummary(posts.filter(Boolean).length, 'Add up to six post links.')}
        open={open === 'instagram'}
        onToggle={() => setOpen(open === 'instagram' ? null : 'instagram')}
      >
        <TextInput
          label="Instagram handle"
          value={draft['sections.instagram.handle'] ?? ''}
          hint="Use only the handle, for example ashishinteriors. Meta app credentials stay with the platform, not inside owner content."
          onChange={(value) => update('sections.instagram.handle', value.replace(/^@/, '').trim())}
        />
        <p className="text-sm text-admin-muted">Update these when you post something new - it shows visitors you&apos;re active.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <TextInput
              key={index}
              label={`Post link ${index + 1}`}
              value={posts[index] ?? ''}
              onChange={(value) => {
                const copy = [...posts]
                copy[index] = value
                update(
                  'sections.instagram.embedPostUrls',
                  copy.filter((post) => post.trim().length > 0),
                )
              }}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        id="team"
        title="Team"
        summary={fieldSummary((draft['sections.team.members'] ?? []).length, 'Team members and groups.')}
        open={open === 'team'}
        onToggle={() => setOpen(open === 'team' ? null : 'team')}
      >
        <TextArea label="Team intro" value={draft['sections.team.intro'] ?? ''} onChange={(value) => update('sections.team.intro', value)} />
        <JsonField label="Team members" value={draft['sections.team.members'] ?? []} onChange={(value) => update('sections.team.members', arrayOf<GenericRecord>(value))} />
        <JsonField label="Team groups" value={draft['sections.team.groups'] ?? []} onChange={(value) => update('sections.team.groups', arrayOf<GenericRecord>(value))} />
        <JsonField label="Workshop" value={draft['sections.team.workshop'] ?? {}} onChange={(value) => update('sections.team.workshop', objectOrUndefined(value))} />
      </SectionCard>

      <SectionCard
        id="locations"
        title="Locations"
        summary={fieldSummary((draft['sections.locations.offices'] ?? []).length, 'Office and area content.')}
        open={open === 'locations'}
        onToggle={() => setOpen(open === 'locations' ? null : 'locations')}
      >
        <JsonField label="Office pages" value={draft['sections.locations.offices'] ?? []} onChange={(value) => update('sections.locations.offices', arrayOf<GenericRecord>(value))} />
        <TextArea label="Other locations note" value={draft['sections.locations.otherLocationsNote'] ?? ''} onChange={(value) => update('sections.locations.otherLocationsNote', value)} />
        <JsonField label="Area pages" value={draft['sections.areas.items'] ?? []} onChange={(value) => update('sections.areas.items', arrayOf<GenericRecord>(value))} />
      </SectionCard>

      <SectionCard
        id="proof"
        title="Awards and before/after"
        summary="Awards, reviews, before/after and press proof."
        open={open === 'proof'}
        onToggle={() => setOpen(open === 'proof' ? null : 'proof')}
      >
        <JsonField label="Awards" value={draft['sections.awards.items'] ?? []} onChange={(value) => update('sections.awards.items', arrayOf<GenericRecord>(value))} />
        <JsonField label="Before and after pairs" value={draft['sections.beforeAfter.pairs'] ?? []} onChange={(value) => update('sections.beforeAfter.pairs', arrayOf<GenericRecord>(value))} />
      </SectionCard>

      <SectionCard
        id="case-studies"
        title="Case studies"
        summary={fieldSummary((draft['sections.caseStudy.items'] ?? []).length, 'No case studies yet.')}
        open={open === 'case-studies'}
        onToggle={() => setOpen(open === 'case-studies' ? null : 'case-studies')}
      >
        <JsonField label="Case study pages" value={draft['sections.caseStudy.items'] ?? []} onChange={(value) => update('sections.caseStudy.items', arrayOf<GenericRecord>(value))} />
      </SectionCard>

      <SectionCard
        id="journal"
        title="Journal"
        summary={fieldSummary((draft['sections.journal.posts'] ?? []).length, 'Articles and topics.')}
        open={open === 'journal'}
        onToggle={() => setOpen(open === 'journal' ? null : 'journal')}
      >
        <TextArea label="Journal intro" value={draft['sections.journal.intro'] ?? ''} onChange={(value) => update('sections.journal.intro', value)} />
        <TextArea label="Topics" value={(draft['sections.journal.topics'] ?? []).join('\n')} onChange={(value) => update('sections.journal.topics', lines(value))} />
        <JsonField label="Journal posts" value={draft['sections.journal.posts'] ?? []} onChange={(value) => update('sections.journal.posts', arrayOf<GenericRecord>(value))} />
      </SectionCard>

      <SectionCard
        id="news"
        title="News"
        summary={fieldSummary((draft['sections.news.items'] ?? []).length, 'Studio news and press.')}
        open={open === 'news'}
        onToggle={() => setOpen(open === 'news' ? null : 'news')}
      >
        <JsonField label="Press links" value={draft['sections.news.press'] ?? []} onChange={(value) => update('sections.news.press', arrayOf<GenericRecord>(value))} />
        <JsonField label="News items" value={draft['sections.news.items'] ?? []} onChange={(value) => update('sections.news.items', arrayOf<GenericRecord>(value))} />
      </SectionCard>

      <SectionCard
        id="careers"
        title="Careers"
        summary={fieldSummary((draft['sections.careers.roles'] ?? []).length, 'Hiring page content.')}
        open={open === 'careers'}
        onToggle={() => setOpen(open === 'careers' ? null : 'careers')}
      >
        <TextArea label="Careers intro" value={(draft['sections.careers.intro'] ?? []).join('\n\n')} onChange={(value) => update('sections.careers.intro', paragraphs(value))} />
        <JsonField label="What we look for" value={draft['sections.careers.lookFor'] ?? []} onChange={(value) => update('sections.careers.lookFor', arrayOf<GenericRecord>(value))} />
        <JsonField label="Open roles" value={draft['sections.careers.roles'] ?? []} onChange={(value) => update('sections.careers.roles', arrayOf<GenericRecord>(value))} />
        <JsonField label="Apply process" value={draft['sections.careers.applyProcess'] ?? {}} onChange={(value) => update('sections.careers.applyProcess', objectOrUndefined(value))} />
      </SectionCard>

      <SectionCard
        id="media"
        title="Company profile and video"
        summary="Profile PDF and walkthrough video."
        open={open === 'media'}
        onToggle={() => setOpen(open === 'media' ? null : 'media')}
      >
        <TextInput label="Video tour URL" value={draft['sections.videoTour.url'] ?? ''} onChange={(value) => update('sections.videoTour.url', value)} />
        <TextInput label="Company profile PDF path" value={draft['sections.companyProfile.pdf'] ?? ''} onChange={(value) => update('sections.companyProfile.pdf', value)} />
      </SectionCard>

      <SectionCard
        id="legal"
        title="Legal"
        summary="Privacy policy, terms and SEO keywords."
        open={open === 'legal'}
        onToggle={() => setOpen(open === 'legal' ? null : 'legal')}
      >
        <TextArea label="SEO keywords" value={(draft['seo.keywords'] ?? []).join('\n')} onChange={(value) => update('seo.keywords', lines(value))} />
        <JsonField label="Privacy policy document" value={draft['legal.privacyPolicyDoc'] ?? {}} onChange={(value) => update('legal.privacyPolicyDoc', objectOrUndefined(value))} />
        <JsonField label="Terms document" value={draft['legal.termsDoc'] ?? {}} onChange={(value) => update('legal.termsDoc', objectOrUndefined(value))} />
      </SectionCard>

        </div>

      </section>

      {(dirty || saveState === 'saved' || saveState === 'error' || activationState !== 'idle') && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-admin-border bg-admin-surface p-3">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {saveState === 'saved' && <p className="font-medium text-admin-primary">Saved. Your site updates in about a minute.</p>}
              {saveState === 'error' && <p className="font-medium text-admin-alert">{saveError}</p>}
              {activationState === 'sent' && <p className="font-medium text-admin-primary">Your local draft was sent for operator activation.</p>}
              {activationState === 'error' && <p className="font-medium text-admin-alert">{activationError}</p>}
              {dirty && saveState !== 'error' && saveState !== 'saved' && <p className="font-medium text-admin-ink">You have unsaved changes.</p>}
            </div>
            <div className="grid gap-2 sm:flex">
              <button type="button" onClick={discard} className="min-h-11 rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
                Discard
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={!dirty || saveState === 'saving'}
                className="min-h-11 rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary disabled:opacity-60"
              >
                {saveState === 'saving' ? 'Saving...' : 'Save changes'}
              </button>
              {mode === 'paid' && (
                <button
                  type="button"
                  onClick={() => void submitLocalDraft()}
                  disabled={activationState === 'sending'}
                  className="min-h-11 rounded border border-admin-primary px-4 text-sm font-semibold text-admin-primary disabled:opacity-60"
                >
                  {activationState === 'sending' ? 'Sending draft...' : 'Submit demo draft'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
    </div>
  )
}

function PanelShell({ title, message, alert = false }: { title: string; message: string; alert?: boolean }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <h1 className="text-xl font-semibold text-admin-ink">{title}</h1>
        <p className={`mt-2 text-base ${alert ? 'text-admin-alert' : 'text-admin-muted'}`}>{message}</p>
      </div>
    </div>
  )
}

function contentTree(draft: EditableConfig): Array<{ id: string; label: string; group: string }> {
  const areas = [
    { id: 'homepage', label: 'Homepage', group: 'Public page' },
    { id: 'hero', label: 'Hero image', group: 'Homepage' },
    { id: 'trust', label: 'Trust stats', group: 'Homepage' },
    { id: 'services', label: 'Services', group: `${draft['sections.services.items']?.length ?? 0} services` },
    { id: 'projects', label: 'Projects', group: `${draft['sections.portfolio.projects'].length} projects` },
    { id: 'about', label: 'About', group: 'Studio story' },
    { id: 'team', label: 'Team', group: `${draft['sections.team.members']?.length ?? 0} people` },
    { id: 'process', label: 'Process', group: 'Homepage' },
    { id: 'locations', label: 'Locations', group: `${draft['sections.locations.offices']?.length ?? 0} offices` },
    { id: 'case-studies', label: 'Case studies', group: `${draft['sections.caseStudy.items']?.length ?? 0} stories` },
    { id: 'journal', label: 'Journal', group: `${draft['sections.journal.posts']?.length ?? 0} posts` },
    { id: 'news', label: 'News', group: `${draft['sections.news.items']?.length ?? 0} items` },
    { id: 'careers', label: 'Careers', group: `${draft['sections.careers.roles']?.length ?? 0} roles` },
    { id: 'proof', label: 'Awards and before/after', group: 'Proof' },
    { id: 'faq', label: 'Common questions', group: `${draft['sections.faq.items']?.length ?? 0} questions` },
    { id: 'testimonials', label: 'Testimonials', group: `${draft['sections.testimonials.items']?.length ?? 0} quotes` },
    { id: 'instagram', label: 'Instagram', group: `${draft['sections.instagram.embedPostUrls']?.length ?? 0} posts` },
    { id: 'settings', label: 'CTA and Footer', group: 'Settings' },
    { id: 'estimate', label: 'Estimate calculator', group: draft['sections.estimate.enabled'] ? 'enabled' : 'disabled' },
    { id: 'contact', label: 'Contact', group: 'Settings' },
    { id: 'media', label: 'Company profile and video', group: 'Media' },
    { id: 'seo', label: 'SEO', group: 'Search' },
    { id: 'legal', label: 'Legal', group: 'Documents' },
    { id: 'languages', label: 'English / Hindi', group: 'Language' },
  ]

  return areas
}

function lines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function paragraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean)
}

function JsonField({ label, value, onChange }: { label: string; value: unknown; onChange: (value: unknown) => void }) {
  const [textValue, setTextValue] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState('')

  useEffect(() => {
    setTextValue(JSON.stringify(value, null, 2))
  }, [value])

  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">
      {label}
      <textarea
        value={textValue}
        rows={8}
        onChange={(event) => {
          const next = event.target.value
          setTextValue(next)
          try {
            onChange(JSON.parse(next))
            setError('')
          } catch {
            setError('Keep this as valid JSON. The save button will use the last valid value.')
          }
        }}
        className="min-h-40 rounded-lg border border-admin-border bg-admin-surface px-3 py-3 font-mono text-sm font-normal text-admin-ink outline-none focus:border-admin-primary"
      />
      <span className={error ? 'text-sm font-normal text-admin-alert' : 'text-sm font-normal text-admin-muted'}>
        {error || 'This uses the existing structured schema for deeper list content. It cannot change layout, tier, template, or section availability.'}
      </span>
    </label>
  )
}

function SectionCard({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  summary: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
      <section id={id} className="rounded-lg border border-admin-border bg-admin-surface">
      <button type="button" onClick={onToggle} className="flex min-h-14 w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-admin-raised sm:flex-row sm:items-center sm:justify-between">
        <span className="text-base font-semibold text-admin-ink">{title}</span>
        <span className="text-sm text-admin-muted">{summary}</span>
      </button>
      {open && <div className="flex flex-col gap-4 border-t border-admin-border p-4">{children}</div>}
    </section>
  )
}

function TextInput({
  label,
  value,
  onChange,
  hint,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  type?: string
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary"
      />
      {hint && <span className="text-sm font-normal text-admin-muted">{hint}</span>}
    </label>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  step = '1',
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: string
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">
      {label}
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary"
      />
    </label>
  )
}

function TextArea({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="min-h-32 rounded-lg border border-admin-border bg-admin-surface px-3 py-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary"
      />
      {hint && <span className="text-sm font-normal text-admin-muted">{hint}</span>}
    </label>
  )
}

function AddressEditor({ value, onChange }: { value: Address; onChange: (value: Address) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextInput label="Address line" value={value.line1 ?? ''} onChange={(line1) => onChange({ ...value, line1 })} />
      <TextInput label="Locality" value={value.locality} onChange={(locality) => onChange({ ...value, locality })} />
      <TextInput label="City" value={value.city} onChange={(city) => onChange({ ...value, city })} />
      <TextInput label="State" value={value.state} onChange={(state) => onChange({ ...value, state })} />
      <TextInput label="Pincode" value={value.pincode ?? ''} onChange={(pincode) => onChange({ ...value, pincode })} />
      <TextInput label="Map embed link" value={value.mapsEmbedUrl ?? ''} onChange={(mapsEmbedUrl) => onChange({ ...value, mapsEmbedUrl })} />
    </div>
  )
}

function ImagePreview({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return <div className="flex h-28 w-full items-center justify-center rounded-lg border border-admin-border text-sm text-admin-muted sm:w-40">No photo selected</div>
  }

  return (
    <div className="relative h-28 w-full overflow-hidden rounded-lg border border-admin-border sm:w-40">
      <Image src={src} alt={alt} fill sizes="160px" className="object-cover" />
    </div>
  )
}

function MoveButtons({ index, count, onMove }: { index: number; count: number; onMove: (direction: -1 | 1) => void }) {
  return (
    <>
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-ink disabled:text-admin-muted"
      >
        Move up
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-ink disabled:text-admin-muted"
      >
        Move down
      </button>
    </>
  )
}

function ProjectRow({
  project,
  index,
  count,
  onMove,
  onChange,
  onRemove,
}: {
  project: Project
  index: number
  count: number
  onMove: (direction: -1 | 1) => void
  onChange: (project: Project) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-lg border border-admin-border p-3">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="flex min-h-12 items-center rounded-lg border border-admin-border px-3 text-sm font-medium text-admin-muted">Position {index + 1}</span>
        <MoveButtons index={index} count={count} onMove={onMove} />
        <button type="button" onClick={onRemove} className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-alert">
          Delete
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
        <ImagePreview src={project.cover} alt={project.title} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="Project title" value={project.title} onChange={(title) => onChange({ ...project, title })} />
          <TextInput label="Location" value={project.location ?? ''} onChange={(location) => onChange({ ...project, location })} />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">
            Room type
            <div className="relative flex items-center">
              <select
                value={project.projectType ?? 'residential'}
                onChange={(e) => onChange({ ...project, projectType: e.target.value as Project['projectType'] })}
                className="min-h-12 w-full appearance-none rounded-lg border border-admin-border bg-admin-surface pl-3 pr-9 text-base font-normal text-admin-ink outline-none focus:border-admin-primary cursor-pointer"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="office">Office</option>
                <option value="retail">Retail</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-admin-muted" />
            </div>
          </label>
          <TextInput label="Duration" value={project.duration ?? ''} onChange={(duration) => onChange({ ...project, duration })} />
          <TextInput label="Cover image path" value={project.cover ?? ''} onChange={(cover) => onChange({ ...project, cover })} />
        </div>
      </div>
      <TextArea
        label="Description"
        value={project.blurb ?? ''}
        onChange={(blurb) => onChange({ ...project, blurb })}
        hint="Around 300 words works best - what the client wanted, what you did, how it turned out."
      />
    </div>
  )
}

function SimpleList<T extends { title: string }>({
  items,
  labels,
  getBody,
  setBody,
  onMove,
  onChange,
  onRemove,
}: {
  items: T[]
  labels: { title: string; body: string }
  getBody: (item: T) => string
  setBody: (item: T, value: string) => T
  onMove: (index: number, direction: -1 | 1) => void
  onChange: (index: number, item: T) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="rounded-lg border border-admin-border p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            <MoveButtons index={index} count={items.length} onMove={(direction) => onMove(index, direction)} />
            <button type="button" onClick={() => onRemove(index)} className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-alert">
              Remove
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label={labels.title} value={item.title} onChange={(title) => onChange(index, { ...item, title })} />
            <TextInput label={labels.body} value={getBody(item)} onChange={(value) => onChange(index, setBody(item, value))} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ListEmpty({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null
  return <div className="rounded-lg border border-admin-border bg-admin-bg p-4 text-sm text-admin-muted">{children}</div>
}
