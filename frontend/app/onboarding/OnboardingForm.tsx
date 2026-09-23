'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  EMPTY_ONBOARDING_DRAFT,
  type OnboardingDraft,
  type OnboardingErrors,
} from '@/lib/onboarding/types'
import {
  suggestedIntroduction,
  validateOnboardingDraft,
  validateOnboardingStage,
} from '@/lib/onboarding/validation'
import {
  compressImageToWebp,
  formatBytes,
  LOGO_PRESET,
} from '@/lib/onboarding/image-compression'
import {
  COUNTRY_DIAL_CODES,
  CountryFlag,
  getCountryByDialCode,
  splitPhoneAndCountry,
} from '@/lib/onboarding/countries'

const CATEGORIES = ['Residential', 'Office', 'Retail', 'Hospitality']
const SERVICES = [
  'Interior design',
  'Renovation',
  'Turnkey projects',
  'Design consultation',
  'Modular kitchen',
  'Other service',
]

const CITY_SUGGESTIONS = [
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Gurugram',
  'Noida',
  'Jaipur',
  'Chandigarh',
  'Kochi',
  'Goa',
]

const PALETTES = [
  {
    id: 'editorial',
    title: 'Editorial Crisp',
    blurb: 'High-contrast monochrome, precision hairline borders, gallery aesthetic.',
    swatches: ['bg-admin-ink', 'bg-admin-surface', 'bg-admin-border'],
  },
  {
    id: 'warm-earth',
    title: 'Warm Earth',
    blurb: 'Natural limestone surfaces, terracotta accents, warm organic feel.',
    swatches: ['bg-admin-primary', 'bg-admin-primary-soft', 'bg-admin-alert-soft'],
  },
  {
    id: 'charcoal-modern',
    title: 'Charcoal Modern',
    blurb: 'Deep slate surfaces, tailored charcoal structure, bold elegance.',
    swatches: ['bg-admin-ink', 'bg-admin-raised', 'bg-admin-muted'],
  },
  {
    id: 'monolith-dark',
    title: 'Monolith Dark',
    blurb: 'Premium luxury midnight obsidian with restrained architectural bronze.',
    swatches: ['bg-admin-ink', 'bg-admin-primary', 'bg-admin-alert'],
  },
]

const STAGES = [
  { id: 1, label: 'Studio identity', summary: 'Name, location, and services' },
  { id: 2, label: 'Visual direction', summary: 'Logo and palette' },
  { id: 3, label: 'Contact details', summary: 'Phone, email, and introduction' },
] as const

const PROGRESS_WIDTHS = ['w-1/3', 'w-2/3', 'w-full'] as const

const CONTROL_CLASS =
  'min-h-12 w-full rounded-lg border border-admin-border bg-admin-bg px-3 text-base text-admin-ink outline-none transition-colors placeholder:text-admin-muted focus-visible:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface motion-reduce:transition-none'

const BUTTON_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60'

const CHOICE_BUTTON_CLASS =
  'inline-flex min-h-9 items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface motion-reduce:transition-none'

function ErrorText({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-2 text-sm text-admin-alert" role="alert">{message}</p>
}

export function OnboardingForm({ initialEmail = '' }: { initialEmail?: string }) {
  const [stage, setStage] = useState(1)
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    ...EMPTY_ONBOARDING_DRAFT,
    publicEmail: initialEmail,
  }))
  const [errors, setErrors] = useState<OnboardingErrors>({})
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isHydrating, setIsHydrating] = useState(true)
  const [draftRestored, setDraftRestored] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Staging area input state
  const [areaInput, setAreaInput] = useState('')

  // Phone & WhatsApp country code and national number state
  const [phoneCountry, setPhoneCountry] = useState('+91')
  const [phoneNational, setPhoneNational] = useState('')
  const [whatsappCountry, setWhatsappCountry] = useState('+91')
  const [whatsappNational, setWhatsappNational] = useState('')

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [logoStats, setLogoStats] = useState<{
    originalSize: number
    compressedSize: number
    previewUrl: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track if user explicitly edited the introduction
  const [isIntroCustomized, setIsIntroCustomized] = useState(false)

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
              publicEmail: payload.draft.publicEmail || current.publicEmail || initialEmail,
            }))
            setDraftRestored(true)
            if (payload.draft.introduction) {
              setIsIntroCustomized(true)
            }
            if (payload.draft.primaryPhone) {
              const parsed = splitPhoneAndCountry(payload.draft.primaryPhone)
              setPhoneCountry(parsed.dialCode)
              setPhoneNational(parsed.nationalNumber)
            }
            if (payload.draft.whatsapp) {
              const parsed = splitPhoneAndCountry(payload.draft.whatsapp)
              setWhatsappCountry(parsed.dialCode)
              setWhatsappNational(parsed.nationalNumber)
            }
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
      } finally {
        setIsHydrating(false)
      }
    }
    loadSavedDraft()
  }, [initialEmail])

  // Auto-save draft on step navigation and debounce
  const persistDraft = useCallback(async (updated: OnboardingDraft) => {
    setSaveState('saving')
    try {
      const response = await fetch('/api/onboarding/draft', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!response.ok) throw new Error('Draft save failed')
      setSaveState('saved')
    } catch {
      setSaveState('idle')
    }
  }, [])
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current || isHydrating) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      persistDraft(draft)
    }, 800)
    return () => clearTimeout(timer)
  }, [draft, isHydrating, persistDraft])

  const update = <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => {
    setDraft((current) => {
      const nextDraft = { ...current, [key]: value }
      return nextDraft
    })
  }

  const handlePhoneCountryChange = (code: string) => {
    setPhoneCountry(code)
    const combined = phoneNational ? `${code} ${phoneNational}` : code
    update('primaryPhone', combined)
    if (draft.usePhoneForWhatsapp) {
      setWhatsappCountry(code)
      update('whatsapp', combined)
    }
  }

  const handlePhoneNationalChange = (num: string) => {
    setPhoneNational(num)
    const combined = num ? `${phoneCountry} ${num}` : ''
    update('primaryPhone', combined)
    if (draft.usePhoneForWhatsapp) {
      setWhatsappNational(num)
      update('whatsapp', combined)
    }
  }

  const handleWhatsappCountryChange = (code: string) => {
    setWhatsappCountry(code)
    update('whatsapp', whatsappNational ? `${code} ${whatsappNational}` : code)
  }

  const handleWhatsappNationalChange = (num: string) => {
    setWhatsappNational(num)
    update('whatsapp', num ? `${whatsappCountry} ${num}` : '')
  }

  const handleToggleWhatsapp = (checked: boolean) => {
    update('usePhoneForWhatsapp', checked)
    if (checked) {
      setWhatsappCountry(phoneCountry)
      setWhatsappNational(phoneNational)
      update('whatsapp', draft.primaryPhone)
    }
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

  const useSampleLogo = async () => {
    setUploadingLogo(true)
    setServerError('')
    try {
      let response = await fetch('/images/sample-logo.png')
      if (!response.ok) {
        response = await fetch('/brand/sample-logo.png')
      }
      if (!response.ok) throw new Error('Could not load sample logo.')
      const blob = await response.blob()
      const sampleFile = new File([blob], 'sample-logo.png', { type: 'image/png' })
      await handleLogoFile(sampleFile)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sample logo failed.')
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
    const draftToValidate = {
      ...draft,
      introduction: isIntroCustomized ? draft.introduction : (draft.introduction.trim() || suggestedIntro),
    }
    const result = validateOnboardingStage(draftToValidate, stage as 1 | 2 | 3)
    setDraft(result.draft)
    setErrors(result.errors)
    if (!Object.keys(result.errors).length) {
      persistDraft(result.draft)
      setStage((value) => Math.min(3, value + 1))
    }
  }

  const submit = async () => {
    const draftToValidate = {
      ...draft,
      introduction: isIntroCustomized ? draft.introduction : (draft.introduction.trim() || suggestedIntro),
    }
    const result = validateOnboardingDraft(draftToValidate)
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
      const destination = typeof payload.dashboardUrl === 'string'
        ? payload.dashboardUrl
        : typeof payload.dashboardPath === 'string'
          ? payload.dashboardPath
          : ''
      if (!destination) {
        setServerError('Your setup was saved, but the dashboard link was missing. Please refresh and try again.')
        return
      }
      window.location.assign(destination)
    } catch {
      setServerError('We could not reach the server. Your answers are still here.')
    } finally {
      setBusy(false)
    }
  }

  const currentStage = STAGES[stage - 1] ?? STAGES[0]
  const saveMessage = saveState === 'saving' ? 'Saving' : saveState === 'saved' ? 'Saved' : draftRestored ? 'Draft restored' : 'Changes save as you go'

  return (
    <div className="space-y-6" aria-busy={isHydrating || busy}>
      <div className="flex flex-col gap-3 border-b border-admin-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Setup flow</p>
          <h2 id="onboarding-form-title" className="mt-2 text-2xl font-semibold tracking-tight text-admin-ink">
            {currentStage.label}
          </h2>
          <p className="mt-1 text-sm text-admin-muted">{currentStage.summary}</p>
          <p className="mt-3 text-xs font-medium text-admin-muted" aria-live="polite">{saveMessage}</p>
        </div>
        <p className="text-sm font-medium tabular-nums text-admin-muted">Step {stage} of {STAGES.length}</p>
      </div>

      <nav aria-label="Onboarding progress" className="space-y-3">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <p className="min-w-0 truncate text-sm font-medium text-admin-ink">Step {stage} of {STAGES.length} · {currentStage.label}</p>
          <span className="shrink-0 text-xs text-admin-muted">{currentStage.summary}</span>
        </div>
        <ol className="hidden grid-cols-3 gap-2 md:grid">
          {STAGES.map((item) => {
            const active = item.id === stage
            const complete = item.id < stage
            return (
              <li key={item.id} className="min-w-0">
                <div className={`flex min-h-16 flex-col justify-between rounded-xl border p-3 text-left transition-colors motion-reduce:transition-none ${
                  active
                    ? 'border-admin-primary bg-admin-primary-soft text-admin-ink'
                    : complete
                      ? 'border-admin-border bg-admin-raised text-admin-ink'
                      : 'border-admin-border bg-admin-surface text-admin-muted'
                }`} aria-current={active ? 'step' : undefined}>
                  <span className="text-xs font-semibold tabular-nums">0{item.id}</span>
                  <span className="mt-2 truncate text-xs font-semibold sm:text-sm">{item.label}</span>
                </div>
              </li>
            )
          })}
        </ol>
        <div
          className="h-1 overflow-hidden rounded-full bg-admin-raised"
          role="progressbar"
          aria-label="Onboarding completion"
          aria-valuemin={1}
          aria-valuemax={STAGES.length}
          aria-valuenow={stage}
        >
          <div
            className={`h-full rounded-full bg-admin-primary transition-[width] motion-reduce:transition-none ${PROGRESS_WIDTHS[stage - 1]}`}
          />
        </div>
      </nav>

      {isHydrating ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-admin-border bg-admin-surface px-5 text-center" role="status" aria-live="polite">
          <div>
            <p className="text-sm font-semibold text-admin-ink">Loading your saved answers</p>
            <p className="mt-1 text-sm text-admin-muted">Your setup will be ready in a moment.</p>
          </div>
        </div>
      ) : (
        <>
          {serverError && (
            <div role="alert" className="rounded-lg border border-admin-alert bg-admin-alert-soft px-4 py-3 text-sm text-admin-alert">
              <p className="font-semibold">We couldn’t finish that step.</p>
              <p className="mt-1">{serverError}</p>
            </div>
          )}

          {stage === 1 && (
            <section aria-labelledby="stage-1-title" className="space-y-6">
              <div>
                <h3 id="stage-1-title" className="text-lg font-semibold text-admin-ink">Tell us about your studio</h3>
                <p className="mt-1 text-sm leading-6 text-admin-muted">Start with the essentials. You can refine the copy and coverage later.</p>
              </div>

              <div className="grid gap-5">
                <Field id="studioName" label="Studio name" error={errors.studioName}>
                  <input
                    id="studioName"
                    placeholder="e.g. Studio Arcform"
                    value={draft.studioName}
                    aria-invalid={Boolean(errors.studioName)}
                    onChange={(event) => update('studioName', event.target.value)}
                  />
                </Field>

                <Field
                  id="primaryCity"
                  label="Primary studio location"
                  hint="The city or locality where your studio is based."
                >
                  <input
                    id="primaryCity"
                    list="city-suggestions"
                    placeholder="e.g. Gurugram, South Delhi, Indiranagar"
                    value={draft.primaryCity || ''}
                    onChange={(event) => update('primaryCity', event.target.value)}
                  />
                  <datalist id="city-suggestions">
                    {CITY_SUGGESTIONS.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </Field>
              </div>

              {draft.primaryCity?.trim() && !draft.serviceAreas.includes(draft.primaryCity.trim()) && (
                <button
                  type="button"
                  className="-mt-3 text-left text-sm text-admin-primary underline decoration-transparent underline-offset-4 transition hover:decoration-current focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface focus-visible:outline-none motion-reduce:transition-none"
                  onClick={() => addArea(draft.primaryCity?.trim())}
                >
                  Also add “{draft.primaryCity.trim()}” to your project service areas
                </button>
              )}

              <fieldset className="space-y-4 md:rounded-xl md:border md:border-admin-border md:bg-admin-surface md:p-5">
                <legend className="px-1 text-sm font-semibold text-admin-ink">Project coverage</legend>
                <div>
                  <label htmlFor="serviceAreas" className="text-sm font-medium text-admin-ink">Service areas</label>
                  <p id="serviceAreas-hint" className="mt-1 text-sm leading-6 text-admin-muted">Add the cities, localities, or neighbourhoods where you work. Press Enter or comma after each area.</p>
                  <div className="mt-3 flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-admin-border bg-admin-bg p-2 transition-colors focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary motion-reduce:transition-none">
                    {draft.serviceAreas.map((area, index) => (
                      <span key={area} className="flex items-center gap-1.5 rounded-full border border-admin-border bg-admin-raised px-3 py-1.5 text-xs font-medium text-admin-ink">
                        {area}
                        <button
                          type="button"
                          className="rounded-full text-admin-muted outline-none hover:text-admin-alert focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-raised focus-visible:outline-none"
                          onClick={() => removeArea(index)}
                          aria-label={`Remove ${area}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      id="serviceAreas"
                      className="min-w-40 flex-1 bg-transparent px-1 py-2 text-sm text-admin-ink outline-none placeholder:text-admin-muted"
                      placeholder={draft.serviceAreas.length ? 'Add another area…' : 'e.g. South Delhi, Noida, Gurugram'}
                      value={areaInput}
                      aria-describedby="serviceAreas-hint"
                      aria-invalid={Boolean(errors.serviceAreas)}
                      onChange={(event) => setAreaInput(event.target.value)}
                      onKeyDown={handleAreaKeyDown}
                      onBlur={() => addArea()}
                    />
                  </div>
                  <ErrorText message={errors.serviceAreas} />
                </div>

                <ChoiceGroup
                  label="Project categories"
                  values={CATEGORIES}
                  selected={draft.categories}
                  onToggle={(value) => toggle('categories', value)}
                  error={errors.categories}
                />

                <ChoiceGroup
                  label="Design services"
                  values={SERVICES}
                  selected={draft.services}
                  onToggle={(value) => toggle('services', value)}
                  error={errors.services}
                />

                {draft.services.includes('Other service') && (
                  <Field id="otherService" label="Tell us about the other service" error={errors.otherService}>
                    <input
                      id="otherService"
                      placeholder="e.g. Lighting design, Landscape styling"
                      value={draft.otherService}
                      aria-invalid={Boolean(errors.otherService)}
                      onChange={(event) => update('otherService', event.target.value)}
                    />
                  </Field>
                )}
              </fieldset>
            </section>
          )}

          {stage === 2 && (
            <section aria-labelledby="stage-2-title" className="space-y-6">
              <div>
                <h3 id="stage-2-title" className="text-lg font-semibold text-admin-ink">Set the visual direction</h3>
                <p className="mt-1 text-sm leading-6 text-admin-muted">Choose a starting point. These settings can change as your site takes shape.</p>
              </div>

              <fieldset className="space-y-4 md:rounded-xl md:border md:border-admin-border md:bg-admin-surface md:p-5">
                <legend className="px-1 text-sm font-semibold text-admin-ink">Studio logo</legend>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm leading-6 text-admin-muted">Upload a PNG, JPG, or WebP logo. We optimise it for the preview.</p>
                  <button
                    type="button"
                    className={`${BUTTON_CLASS} shrink-0 border-admin-border bg-admin-surface text-admin-ink hover:bg-admin-raised`}
                    onClick={useSampleLogo}
                    disabled={uploadingLogo}
                  >
                    Use sample logo
                  </button>
                </div>

                {logoStats?.previewUrl ? (
                  <div className="flex flex-col gap-4 rounded-lg border border-admin-border bg-admin-raised p-4 sm:flex-row sm:items-center">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-admin-border bg-admin-surface">
                      <Image src={logoStats.previewUrl} alt="Logo preview" width={64} height={64} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-admin-ink">Logo uploaded</p>
                      <p className="mt-1 text-sm text-admin-muted">{logoStats.compressedSize > 0 ? `${formatBytes(logoStats.compressedSize)} WebP · ` : ''}Ready for display.</p>
                    </div>
                    <button type="button" onClick={removeLogo} className={`${BUTTON_CLASS} border-admin-border text-admin-alert hover:bg-admin-surface`}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="logo-upload"
                    onDragOver={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setIsDragging(true)
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setIsDragging(false)
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setIsDragging(false)
                      const file = event.dataTransfer.files?.[0]
                      if (file) handleLogoFile(file)
                    }}
                    className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${isDragging ? 'border-admin-primary bg-admin-primary-soft' : 'border-admin-border bg-admin-bg hover:border-admin-primary'} px-5 py-6 text-center transition-colors focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary motion-reduce:transition-none`}
                  >
                    <input
                      id="logo-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/webp,image/png,image/jpeg"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) handleLogoFile(file)
                      }}
                    />
                    <span className="text-sm font-semibold text-admin-ink">{uploadingLogo ? 'Processing logo…' : 'Choose or drop a logo file'}</span>
                    <span className="mt-1 text-sm text-admin-muted">or use the sample logo above</span>
                  </label>
                )}
              </fieldset>

              <fieldset className="space-y-4 md:rounded-xl md:border md:border-admin-border md:bg-admin-surface md:p-5">
                <legend className="px-1 text-sm font-semibold text-admin-ink">Architectural identity</legend>
                <p className="text-sm leading-6 text-admin-muted">Select a starting palette for the public site. You can switch it later from config.</p>
                <div className="grid gap-3">
                  {PALETTES.map((palette) => {
                    const selected = (draft.palette || 'editorial') === palette.id
                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => update('palette', palette.id)}
                        aria-pressed={selected}
                        className={`flex min-h-28 flex-col rounded-lg border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface motion-reduce:transition-none ${selected ? 'border-admin-primary bg-admin-primary-soft' : 'border-admin-border bg-admin-surface hover:bg-admin-raised'}`}
                      >
                        <span className="flex items-center justify-between gap-3 text-sm font-semibold text-admin-ink">
                          {palette.title}
                          <span className="flex gap-1.5" aria-hidden="true">
                            {palette.swatches.map((swatch) => <span key={swatch} className={`h-3.5 w-3.5 rounded-full border border-admin-border ${swatch}`} />)}
                          </span>
                        </span>
                        <span className="mt-2 text-sm leading-6 text-admin-muted">{palette.blurb}</span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </section>
          )}

          {stage === 3 && (
            <section aria-labelledby="stage-3-title" className="space-y-6">
              <div>
                <h3 id="stage-3-title" className="text-lg font-semibold text-admin-ink">Make it easy to reach you</h3>
                <p className="mt-1 text-sm leading-6 text-admin-muted">These details help visitors contact the right studio team.</p>
              </div>

              <fieldset className="space-y-5 md:rounded-xl md:border md:border-admin-border md:bg-admin-surface md:p-5">
                <legend className="px-1 text-sm font-semibold text-admin-ink">Contact details</legend>
                <PhoneField id="primaryPhone" label="Business contact phone" countryCode={phoneCountry} nationalNumber={phoneNational} onCountryChange={handlePhoneCountryChange} onNumberChange={handlePhoneNationalChange} error={errors.primaryPhone} />

                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-admin-border bg-admin-bg px-3 text-sm font-medium text-admin-ink focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary">
                  <input
                    type="checkbox"
                    className="size-4 accent-admin-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
                    checked={draft.usePhoneForWhatsapp}
                    onChange={(event) => handleToggleWhatsapp(event.target.checked)}
                  />
                  Use this number for WhatsApp
                </label>

                {!draft.usePhoneForWhatsapp && <PhoneField id="whatsapp" label="WhatsApp number" countryCode={whatsappCountry} nationalNumber={whatsappNational} onCountryChange={handleWhatsappCountryChange} onNumberChange={handleWhatsappNationalChange} error={errors.whatsapp} />}

                <Field id="publicEmail" label="Public business email (optional)" error={errors.publicEmail}>
                  <input id="publicEmail" type="email" placeholder="hello@yourstudio.com" value={draft.publicEmail} aria-invalid={Boolean(errors.publicEmail)} onChange={(event) => update('publicEmail', event.target.value)} />
                </Field>
              </fieldset>

              <fieldset className="space-y-4 md:rounded-xl md:border md:border-admin-border md:bg-admin-surface md:p-5">
                <legend className="px-1 text-sm font-semibold text-admin-ink">Studio introduction</legend>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm leading-6 text-admin-muted">Start with a draft and make it sound like your studio.</p>
                  <button
                    type="button"
                    className="text-left text-sm font-semibold text-admin-primary underline decoration-transparent underline-offset-4 transition hover:decoration-current focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface focus-visible:outline-none motion-reduce:transition-none"
                    onClick={() => {
                      setIsIntroCustomized(false)
                      update('introduction', suggestedIntro)
                    }}
                  >
                    Reset to suggestion
                  </button>
                </div>
                <textarea
                  id="introduction"
                  rows={5}
                  className={`${CONTROL_CLASS} min-h-32 py-3`}
                  value={isIntroCustomized ? draft.introduction : (draft.introduction || suggestedIntro)}
                  onChange={(event) => {
                    setIsIntroCustomized(true)
                    update('introduction', event.target.value)
                  }}
                />
              </fieldset>
            </section>
          )}

          <div className="mt-8 flex gap-3 border-t border-admin-border pt-4 pb-12 md:items-center md:justify-between md:pb-0">
            <button type="button" className={`${BUTTON_CLASS} shrink-0 border-admin-border bg-admin-surface text-admin-ink hover:bg-admin-raised`} disabled={stage === 1 || busy} onClick={() => setStage((value) => value - 1)}>
              Back
            </button>
            {stage < 3 ? (
              <button type="button" className={`${BUTTON_CLASS} flex-1 border-admin-primary bg-admin-primary text-admin-on-primary hover:opacity-90 md:flex-none`} onClick={next}>
                Continue
              </button>
            ) : (
              <button type="button" disabled={busy || uploadingLogo} className={`${BUTTON_CLASS} flex-1 border-admin-primary bg-admin-primary text-admin-on-primary hover:opacity-90 md:flex-none`} onClick={submit}>
                {busy ? 'Opening your dashboard…' : 'Go to dashboard'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-admin-ink">
        {label}
      </label>
      {hint && <p className="mt-1 text-sm leading-6 text-admin-muted">{hint}</p>}
      <div className="mt-2 [&_input]:min-h-12 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-admin-border [&_input]:bg-admin-bg [&_input]:px-3 [&_input]:text-base [&_input]:text-admin-ink [&_input]:outline-none [&_input]:transition-colors [&_input]:placeholder:text-admin-muted [&_input]:focus-visible:border-admin-primary [&_input]:focus-visible:ring-2 [&_input]:focus-visible:ring-admin-primary [&_input]:focus-visible:ring-offset-2 [&_input]:focus-visible:ring-offset-admin-surface [&_input]:motion-reduce:transition-none">
        {children}
      </div>
      <ErrorText message={error} />
    </div>
  )
}

function PhoneField({
  id,
  label,
  countryCode,
  nationalNumber,
  onCountryChange,
  onNumberChange,
  error,
}: {
  id: string
  label: string
  countryCode: string
  nationalNumber: string
  onCountryChange: (code: string) => void
  onNumberChange: (number: string) => void
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedCountry = useMemo(
    () => getCountryByDialCode(countryCode),
    [countryCode],
  )

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return COUNTRY_DIAL_CODES
    return COUNTRY_DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q),
    )
  }, [search])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-admin-ink">
        {label}
      </label>
      <div className="relative mt-2 flex min-h-12 rounded-lg border border-admin-border bg-admin-bg transition-colors focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary motion-reduce:transition-none">
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            aria-label={`${label} country code selector`}
            aria-expanded={open}
            onClick={() => {
              setOpen((prev) => !prev)
              setSearch('')
            }}
            className="flex h-full min-h-12 items-center gap-2 border-r border-admin-border bg-admin-surface px-3 text-sm font-medium text-admin-ink outline-none transition-colors hover:bg-admin-raised focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-inset motion-reduce:transition-none"
          >
            <CountryFlag code={selectedCountry.code} className="h-3.5 w-5 shrink-0 rounded-sm object-cover" />
            <span>{selectedCountry.dialCode}</span>
            <span className="text-xs text-admin-muted">▾</span>
          </button>

          {open && (
            <div className="[color-scheme:dark] absolute left-0 top-full z-50 mt-1 max-h-64 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-admin-border bg-admin-surface text-admin-ink">
              <div className="border-b border-admin-border p-2">
                <input
                  type="text"
                  placeholder="Search country or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="[color-scheme:dark] min-h-10 w-full rounded-lg border border-admin-border bg-admin-bg px-2.5 text-sm text-admin-ink outline-none placeholder:text-admin-muted focus-visible:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary"
                  autoFocus
                />
              </div>
              <ul className="bg-admin-surface py-1 text-admin-ink">
                {filteredCountries.map((c) => (
                  <li key={`${c.code}-${c.dialCode}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onCountryChange(c.dialCode)
                        setOpen(false)
                      }}
                      className={`flex min-h-10 w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-admin-raised focus-visible:bg-admin-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary motion-reduce:transition-none ${
                        c.dialCode === countryCode ? 'bg-admin-raised font-semibold text-admin-ink' : 'text-admin-ink'
                      }`}
                    >
                      <CountryFlag code={c.code} className="h-3.5 w-5 shrink-0 rounded-sm object-cover" />
                      <span className="flex-1 truncate">{c.code} {c.name}</span>
                      <span className="text-admin-muted">{c.dialCode}</span>
                    </button>
                  </li>
                ))}
                {filteredCountries.length === 0 && (
                  <li className="px-3 py-3 text-center text-xs text-admin-muted">
                    No country found.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <input
          id={id}
          type="tel"
          className="min-h-12 w-full min-w-0 bg-transparent px-3 text-base text-admin-ink outline-none placeholder:text-admin-muted focus-visible:ring-2 focus-visible:ring-admin-primary"
          placeholder={countryCode === '+91' ? '10-digit mobile number' : 'Phone number'}
          value={nationalNumber}
          onChange={(e) => onNumberChange(e.target.value)}
        />
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
    <fieldset aria-invalid={Boolean(error)}>
      <legend className="text-sm font-medium text-admin-ink">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => {
          const isSelected = selected.includes(value)
          return (
            <button
              type="button"
              key={`${groupId}-${value}`}
              className={`${CHOICE_BUTTON_CLASS} ${
                isSelected
                  ? 'border-admin-primary bg-admin-primary-soft text-admin-ink'
                  : 'border-admin-border bg-admin-surface text-admin-muted hover:bg-admin-raised hover:text-admin-ink'
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
