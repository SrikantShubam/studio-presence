'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

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
}

type Testimonial = {
  quote: string
  author: string
  context?: string
  image?: string
}

type EditableConfig = {
  'business.phone': string
  'business.whatsapp': string
  'business.email'?: string
  'business.hours'?: string
  'business.address': Address
  'sections.hero.image'?: string
  'sections.portfolio.projects': Project[]
  'sections.about.heading'?: string
  'sections.about.body'?: string
  'sections.services.items'?: Service[]
  'sections.testimonials.items'?: Testimonial[]
  'sections.instagram.embedPostUrls'?: string[]
}

type Field = keyof EditableConfig
type LoadState = 'loading' | 'ready' | 'error'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const FIELDS: Field[] = [
  'business.phone',
  'business.whatsapp',
  'business.email',
  'business.hours',
  'business.address',
  'sections.hero.image',
  'sections.portfolio.projects',
  'sections.about.heading',
  'sections.about.body',
  'sections.services.items',
  'sections.testimonials.items',
  'sections.instagram.embedPostUrls',
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

function normaliseCurrent(current: Partial<Record<Field, unknown>>): EditableConfig {
  return {
    'business.phone': text(current['business.phone']),
    'business.whatsapp': text(current['business.whatsapp']),
    'business.email': text(current['business.email']),
    'business.hours': text(current['business.hours']),
    'business.address': toAddress(current['business.address']),
    'sections.hero.image': text(current['sections.hero.image']),
    'sections.portfolio.projects': arrayOf<Project>(current['sections.portfolio.projects']),
    'sections.about.heading': text(current['sections.about.heading']),
    'sections.about.body': text(current['sections.about.body']),
    'sections.services.items': arrayOf<Service>(current['sections.services.items']),
    'sections.testimonials.items': arrayOf<Testimonial>(current['sections.testimonials.items']),
    'sections.instagram.embedPostUrls': arrayOf<string>(current['sections.instagram.embedPostUrls']).slice(0, 6),
  }
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

export function PanelEditor({ tenant }: { tenant: string }) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [initial, setInitial] = useState<EditableConfig | null>(null)
  const [draft, setDraft] = useState<EditableConfig | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoadState('loading')
      setLoadError('')

      try {
        const response = await fetch(`/api/${tenant}/panel`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Could not load your saved website content.')
        const body = (await response.json()) as { current?: Partial<Record<Field, unknown>> }
        const current = normaliseCurrent(body.current ?? {})
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
  }, [tenant])

  const changes = useMemo(() => {
    const out: Partial<Record<Field, unknown>> = {}
    if (!initial || !draft) return out

    for (const field of FIELDS) {
      if (!sameValue(initial[field], draft[field])) out[field] = draft[field]
    }

    return out
  }, [draft, initial])

  const dirty = Object.keys(changes).length > 0

  function update<K extends Field>(field: K, value: EditableConfig[K]) {
    setDraft((current) => (current ? { ...current, [field]: value } : current))
    setSaveState('idle')
    setSaveError('')
  }

  async function save() {
    if (!dirty || saveState === 'saving') return
    setSaveState('saving')
    setSaveError('')

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

  function discard() {
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 pb-28 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-3 rounded-lg border border-admin-border bg-admin-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-admin-muted">Website content</p>
          <h1 className="text-xl font-semibold text-admin-ink">Edit your site</h1>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center rounded-lg border border-admin-border px-4 text-base font-medium text-admin-ink"
        >
          View my site
        </a>
      </div>

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
          className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-surface"
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
          className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-surface"
          onClick={() => update('sections.services.items', [...services, { title: 'New service', blurb: '' }])}
        >
          Add a service
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
          className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-surface"
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

      {(dirty || saveState === 'saved' || saveState === 'error') && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-admin-border bg-admin-surface p-3">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {saveState === 'saved' && <p className="font-medium text-admin-primary">Saved. Your site updates in about a minute.</p>}
              {saveState === 'error' && <p className="font-medium text-admin-alert">{saveError}</p>}
              {dirty && saveState !== 'error' && saveState !== 'saved' && <p className="font-medium text-admin-ink">You have unsaved changes.</p>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button type="button" onClick={discard} className="min-h-12 rounded-lg border border-admin-border px-4 text-base font-medium text-admin-ink">
                Discard
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={!dirty || saveState === 'saving'}
                className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-surface disabled:opacity-60"
              >
                {saveState === 'saving' ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
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

function SectionCard({
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
    <section className="rounded-lg border border-admin-border bg-admin-surface">
      <button type="button" onClick={onToggle} className="flex min-h-14 w-full flex-col gap-1 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between">
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
            <select
              value={project.projectType ?? 'residential'}
              onChange={(e) => onChange({ ...project, projectType: e.target.value as Project['projectType'] })}
              className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
              <option value="retail">Retail</option>
            </select>
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
