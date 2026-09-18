'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  EMPTY_ONBOARDING_DRAFT,
  type OnboardingDraft,
  type OnboardingErrors,
} from '@/lib/onboarding/types'
import {
  normalizePhoneNumber,
  suggestedIntroduction,
  validateOnboardingDraft,
  validateOnboardingStage,
} from '@/lib/onboarding/validation'
import {
  compressImageToWebp,
  formatBytes,
  LOGO_PRESET,
} from '@/lib/onboarding/image-compression'

const CATEGORIES = ['Residential', 'Office', 'Retail', 'Hospitality']
const SERVICES = [
  'Interior design',
  'Renovation',
  'Turnkey projects',
  'Design consultation',
  'Modular kitchen',
  'Other service',
]

const QUICK_CITIES = [
  'Delhi NCR',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Patna',
  'Pune',
  'Kolkata',
]

const PALETTES = [
  {
    id: 'editorial',
    title: 'Editorial Crisp',
    blurb: 'High-contrast monochrome, precision hairline borders, gallery aesthetic.',
    swatches: ['bg-admin-ink', 'bg-admin-surface', 'border-admin-border'],
  },
  {
    id: 'warm-earth',
    title: 'Warm Earth',
    blurb: 'Natural limestone surfaces, terracotta accents, warm organic feel.',
    swatches: ['bg-amber-800', 'bg-stone-200', 'bg-stone-500'],
  },
  {
    id: 'charcoal-modern',
    title: 'Charcoal Modern',
    blurb: 'Deep slate surfaces, tailored charcoal structure, bold elegance.',
    swatches: ['bg-zinc-900', 'bg-zinc-700', 'bg-zinc-400'],
  },
  {
    id: 'monolith-dark',
    title: 'Monolith Dark',
    blurb: 'Premium luxury midnight obsidian with restrained architectural bronze.',
    swatches: ['bg-black', 'bg-neutral-800', 'bg-amber-700'],
  },
]

function ErrorText({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-admin-alert">{message}</p>
}

export function OnboardingForm() {
  const [stage, setStage] = useState(1)
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_ONBOARDING_DRAFT)
  const [errors, setErrors] = useState<OnboardingErrors>({})
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')

  // Staging area input state
  const [areaInput, setAreaInput] = useState('')

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoStats, setLogoStats] = useState<{
    originalSize: number
    compressedSize: number
    previewUrl: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-fill suggested intro if user hasn't typed custom intro
  const suggestedIntro = useMemo(() => suggestedIntroduction(draft), [draft])

  // Hydrate draft on mount
  useEffect(() => {
    async function loadSavedDraft() {
      try {
        const res = await fetch('/api/onboarding/draft')
        if (res.ok) {
          const payload = await res.json()
          if (payload.draft && !payload.completedAt) {
            setDraft((current) => ({
              ...current,
              ...payload.draft,
            }))
            if (payload.draft.logoPath) {
              setLogoStats({
                originalSize: 0,
                compressedSize: 0,
                previewUrl: payload.draft.logoPath,
              })
            }
          }
        }
      } catch {
        // Silently fall back to empty draft
      }
    }
    loadSavedDraft()
  }, [])

  // Auto-save draft on step navigation
  const persistDraft = useCallback(async (updated: OnboardingDraft) => {
    try {
      await fetch('/api/onboarding/draft', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch {
      // Draft autosave failure is non-blocking
    }
  }, [])

  const update = <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => {
    setDraft((current) => {
      const nextDraft = { ...current, [key]: value }
      return nextDraft
    })
  }

  const toggle = (key: 'categories' | 'services', value: string) => {
    update(
      key,
      draft[key].includes(value)
        ? draft[key].filter((item) => item !== value)
        : [...draft[key], value],
    )
  }

  const addArea = (areaToAdd?: string) => {
    const candidate = (areaToAdd ?? areaInput).trim()
    if (!candidate) return
    if (!draft.serviceAreas.includes(candidate)) {
      update('serviceAreas', [...draft.serviceAreas, candidate])
    }
    setAreaInput('')
  }

  const removeArea = (indexToRemove: number) => {
    update(
      'serviceAreas',
      draft.serviceAreas.filter((_, i) => i !== indexToRemove),
    )
  }

  const handleAreaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addArea()
    }
  }

  const handleLogoFile = async (file: File) => {
    if (!file) return
    setUploadingLogo(true)
    setServerError('')

    try {
      // 1. Client-side canvas compression to WebP
      const compressed = await compressImageToWebp(file, LOGO_PRESET)

      setLogoStats({
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        previewUrl: compressed.dataUrl,
      })

      // 2. Upload to staging API
      const formData = new FormData()
      formData.append(
        'file',
        new File([compressed.blob], 'logo.webp', { type: 'image/webp' }),
      )
      formData.append('assetType', 'logo')

      const uploadRes = await fetch('/api/onboarding/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadPayload = await uploadRes.json()
      if (!uploadRes.ok) {
        throw new Error(uploadPayload.error || 'Failed to upload logo.')
      }

      update('logoPath', uploadPayload.assetPath)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Logo processing failed.')
      setLogoStats(null)
    } finally {
      setUploadingLogo(false)
    }
  }

  const removeLogo = () => {
    update('logoPath', '')
    setLogoStats(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const next = () => {
    const result = validateOnboardingStage(draft, stage as 1 | 2 | 3)
    setDraft(result.draft)
    setErrors(result.errors)
    if (!Object.keys(result.errors).length) {
      persistDraft(result.draft)
      setStage((value) => Math.min(3, value + 1))
    }
  }

  const submit = async () => {
    const result = validateOnboardingDraft(draft)
    setDraft(result.draft)
    setErrors(result.errors)
    setServerError('')

    if (Object.keys(result.errors).length) {
      setStage(1)
      return
    }

    setBusy(true)
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(result.draft),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setServerError(payload.error || 'We could not save your setup. Your answers are still here.')
        return
      }
      window.location.assign(payload.dashboardPath)
    } catch {
      setServerError('We could not reach the server. Your answers are still here.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-sm">
        {['Studio Identity', 'Branding & Palette', 'Contact & Launch'].map((label, index) => (
          <div
            key={label}
            className={`flex-1 border-b-2 pb-2 ${
              stage === index + 1
                ? 'border-admin-ink font-semibold text-admin-ink'
                : 'border-admin-border text-admin-muted'
            }`}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>

      {serverError && (
        <p
          role="alert"
          className="rounded border border-admin-alert bg-admin-alert-soft px-3 py-2 text-sm text-admin-alert"
        >
          {serverError}
        </p>
      )}

      {/* Stage 1: Studio Identity & Operations */}
      {stage === 1 && (
        <section className="space-y-5">
          <Field id="studioName" label="Studio name" error={errors.studioName}>
            <input
              id="studioName"
              placeholder="e.g. Studio Arcform"
              value={draft.studioName}
              onChange={(event) => update('studioName', event.target.value)}
            />
          </Field>

          <div>
            <label htmlFor="primaryCity" className="text-sm font-medium text-admin-ink">
              Primary City / Base
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_CITIES.map((city) => (
                <button
                  type="button"
                  key={city}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    draft.primaryCity === city
                      ? 'border-admin-ink bg-admin-ink text-admin-on-primary'
                      : 'border-admin-border bg-admin-surface text-admin-muted hover:text-admin-ink'
                  }`}
                  onClick={() => {
                    update('primaryCity', city)
                    addArea(city)
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
            <div className="mt-2 [&_input]:w-full [&_input]:rounded [&_input]:border [&_input]:border-admin-border [&_input]:bg-admin-bg [&_input]:px-3 [&_input]:py-2 [&_input]:text-admin-ink">
              <input
                id="primaryCity"
                placeholder="Or enter another city (e.g. Chandigarh, Jaipur)"
                value={draft.primaryCity || ''}
                onChange={(e) => update('primaryCity', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="serviceAreas" className="text-sm font-medium text-admin-ink">
              Service Areas (press Enter or comma to add badges)
            </label>
            <div className="mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded border border-admin-border bg-admin-bg p-2">
              {draft.serviceAreas.map((area, index) => (
                <span
                  key={area}
                  className="flex items-center gap-1.5 rounded-full border border-admin-border bg-admin-raised px-3 py-1 text-xs font-medium text-admin-ink"
                >
                  {area}
                  <button
                    type="button"
                    className="text-admin-muted hover:text-admin-alert"
                    onClick={() => removeArea(index)}
                    aria-label={`Remove ${area}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="serviceAreas"
                className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm text-admin-ink outline-none"
                placeholder={draft.serviceAreas.length ? 'Add another area…' : 'e.g. South Delhi, Gurugram'}
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={handleAreaKeyDown}
                onBlur={() => addArea()}
              />
            </div>
            <ErrorText message={errors.serviceAreas} />
          </div>

          <ChoiceGroup
            label="What project categories do you work in?"
            values={CATEGORIES}
            selected={draft.categories}
            onToggle={(value) => toggle('categories', value)}
            error={errors.categories}
          />

          <ChoiceGroup
            label="What design services do you offer?"
            values={SERVICES}
            selected={draft.services}
            onToggle={(value) => toggle('services', value)}
            error={errors.services}
          />

          {draft.services.includes('Other service') && (
            <Field
              id="otherService"
              label="Tell us about the other service"
              error={errors.otherService}
            >
              <input
                id="otherService"
                placeholder="e.g. Lighting design, Landscape styling"
                value={draft.otherService}
                onChange={(event) => update('otherService', event.target.value)}
              />
            </Field>
          )}
        </section>
      )}

      {/* Stage 2: Visual Branding & Palette */}
      {stage === 2 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-sm font-medium text-admin-ink">Studio Logo</h2>
            <p className="mt-1 text-xs text-admin-muted">
              Upload your studio logo. Our active Canvas engine automatically converts it to high-performance WebP and downscales it to under 35 KB.
            </p>

            <div className="mt-3">
              {logoStats?.previewUrl ? (
                <div className="flex items-center gap-4 rounded-lg border border-admin-border bg-admin-raised p-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-admin-border bg-admin-surface">
                    <Image
                      src={logoStats.previewUrl}
                      alt="Logo preview"
                      width={64}
                      height={64}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-admin-ink">Logo Processed</p>
                    {logoStats.originalSize > 0 && (
                      <p className="mt-0.5 text-xs text-admin-muted">
                        Optimized: {formatBytes(logoStats.originalSize)} →{' '}
                        <span className="font-medium text-emerald-600">
                          {formatBytes(logoStats.compressedSize)} WebP
                        </span>
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="rounded border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-alert hover:bg-admin-surface"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-admin-border bg-admin-surface p-6 text-center transition-colors hover:border-admin-ink"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/webp,image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoFile(file)
                    }}
                  />
                  <span className="text-sm font-medium text-admin-ink">
                    {uploadingLogo ? 'Optimizing & Uploading…' : 'Click to upload your logo'}
                  </span>
                  <span className="mt-1 text-xs text-admin-muted">
                    Supports WebP, PNG, or JPEG. You can also skip this and add it later.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-admin-ink">Architectural Identity & Palette</h2>
            <p className="mt-1 text-xs text-admin-muted">
              Choose the visual identity template for your studio website. Switchable at any time from config.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {PALETTES.map((p) => {
                const selected = (draft.palette || 'editorial') === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => update('palette', p.id)}
                    className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
                      selected
                        ? 'border-admin-ink bg-admin-raised ring-1 ring-admin-ink'
                        : 'border-admin-border bg-admin-surface hover:border-admin-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-admin-ink">{p.title}</span>
                      <div className="flex gap-1.5">
                        {p.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className={`h-3.5 w-3.5 rounded-full border border-admin-border ${swatch}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-admin-muted">{p.blurb}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stage 3: Contact & AI Studio Voice */}
      {stage === 3 && (
        <section className="space-y-5">
          <div>
            <label htmlFor="primaryPhone" className="text-sm font-medium text-admin-ink">
              Business phone
            </label>
            <div className="mt-2 flex rounded border border-admin-border bg-admin-bg">
              <span className="flex items-center border-r border-admin-border px-3 text-sm font-medium text-admin-muted">
                +91
              </span>
              <input
                id="primaryPhone"
                className="w-full bg-transparent px-3 py-2 text-sm text-admin-ink outline-none"
                placeholder="10-digit mobile number"
                value={draft.primaryPhone.replace(/^\+91/, '')}
                onChange={(event) =>
                  update('primaryPhone', normalizePhoneNumber(event.target.value))
                }
              />
            </div>
            <ErrorText message={errors.primaryPhone} />
          </div>

          <label className="flex items-center gap-2 text-sm text-admin-ink">
            <input
              type="checkbox"
              checked={draft.usePhoneForWhatsapp}
              onChange={(event) => update('usePhoneForWhatsapp', event.target.checked)}
            />{' '}
            Use this number for WhatsApp
          </label>

          {!draft.usePhoneForWhatsapp && (
            <div>
              <label htmlFor="whatsapp" className="text-sm font-medium text-admin-ink">
                WhatsApp number
              </label>
              <div className="mt-2 flex rounded border border-admin-border bg-admin-bg">
                <span className="flex items-center border-r border-admin-border px-3 text-sm font-medium text-admin-muted">
                  +91
                </span>
                <input
                  id="whatsapp"
                  className="w-full bg-transparent px-3 py-2 text-sm text-admin-ink outline-none"
                  placeholder="10-digit mobile number"
                  value={draft.whatsapp.replace(/^\+91/, '')}
                  onChange={(event) =>
                    update('whatsapp', normalizePhoneNumber(event.target.value))
                  }
                />
              </div>
              <ErrorText message={errors.whatsapp} />
            </div>
          )}

          <Field
            id="publicEmail"
            label="Public email (optional)"
            error={errors.publicEmail}
          >
            <input
              id="publicEmail"
              type="email"
              placeholder="hello@yourstudio.com"
              value={draft.publicEmail}
              onChange={(event) => update('publicEmail', event.target.value)}
            />
          </Field>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="introduction" className="text-sm font-medium text-admin-ink">
                Studio Introduction
              </label>
              <button
                type="button"
                className="text-xs text-admin-muted hover:text-admin-ink"
                onClick={() => update('introduction', suggestedIntro)}
              >
                Reset to AI suggestion
              </button>
            </div>
            <div className="mt-2 [&_textarea]:w-full [&_textarea]:rounded [&_textarea]:border [&_textarea]:border-admin-border [&_textarea]:bg-admin-bg [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-admin-ink">
              <textarea
                id="introduction"
                rows={3}
                value={draft.introduction || suggestedIntro}
                onChange={(e) => update('introduction', e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-between gap-3 pt-2">
        <button
          type="button"
          className="rounded border border-admin-border px-4 py-2 text-sm text-admin-ink disabled:opacity-50"
          disabled={stage === 1 || busy}
          onClick={() => setStage((value) => value - 1)}
        >
          Back
        </button>
        {stage < 3 ? (
          <button
            type="button"
            className="rounded bg-admin-ink px-4 py-2 text-sm text-admin-bg"
            onClick={next}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={busy || uploadingLogo}
            className="rounded bg-admin-ink px-4 py-2 text-sm text-admin-bg disabled:opacity-50"
            onClick={submit}
          >
            {busy ? 'Creating your studio website…' : 'Launch Preview'}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-admin-ink">
        {label}
      </label>
      <div className="mt-2 [&_input]:w-full [&_input]:rounded [&_input]:border [&_input]:border-admin-border [&_input]:bg-admin-bg [&_input]:px-3 [&_input]:py-2 [&_input]:text-admin-ink">
        {children}
      </div>
      <ErrorText message={error} />
    </div>
  )
}

function ChoiceGroup({
  label,
  values,
  selected,
  onToggle,
  error,
}: {
  label: string
  values: string[]
  selected: string[]
  onToggle: (value: string) => void
  error?: string
}) {
  const groupId = useId()
  return (
    <fieldset>
      <legend className="text-sm font-medium text-admin-ink">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => {
          const isSelected = selected.includes(value)
          return (
            <button
              type="button"
              key={`${groupId}-${value}`}
              className={`rounded border px-3 py-2 text-sm transition-colors ${
                isSelected
                  ? 'border-admin-ink bg-admin-raised font-medium text-admin-ink'
                  : 'border-admin-border text-admin-muted hover:text-admin-ink'
              }`}
              aria-pressed={isSelected}
              onClick={() => onToggle(value)}
            >
              {value}
            </button>
          )
        })}
      </div>
      <ErrorText message={error} />
    </fieldset>
  )
}
