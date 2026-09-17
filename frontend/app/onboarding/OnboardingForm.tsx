'use client'

import { useMemo, useState } from 'react'
import { EMPTY_ONBOARDING_DRAFT, type OnboardingDraft, type OnboardingErrors } from '@/lib/onboarding/types'
import { suggestedIntroduction, validateOnboardingDraft } from '@/lib/onboarding/validation'

const categories = ['Residential', 'Office', 'Retail', 'Hospitality']
const services = ['Interior design', 'Renovation', 'Turnkey projects', 'Design consultation', 'Modular kitchen', 'Other service']

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-admin-alert">{message}</p> : null
}

export function OnboardingForm() {
  const [stage, setStage] = useState(1)
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_ONBOARDING_DRAFT)
  const [errors, setErrors] = useState<OnboardingErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const introduction = useMemo(() => draft.introduction || suggestedIntroduction(draft), [draft])
  const update = <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const toggle = (key: 'categories' | 'services', value: string) => update(key, draft[key].includes(value) ? draft[key].filter((item) => item !== value) : [...draft[key], value])
  const next = () => {
    const result = validateOnboardingDraft(draft)
    setDraft(result.draft)
    setErrors(result.errors)
    if (Object.keys(result.errors).length === 0) setStage((current) => Math.min(3, current + 1))
  }

  if (submitted) return <div className="rounded border border-admin-border bg-admin-surface p-6"><h2 className="text-2xl font-semibold text-admin-ink">Your preview is ready</h2><p className="mt-2 text-sm leading-6 text-admin-muted">The next step will save this setup to your workspace and assign its preview hostname.</p></div>

  return <div className="space-y-6">
    <div className="flex gap-2 text-sm">{['Your studio', 'Photos and branding', 'Review'].map((label, index) => <div key={label} className={`flex-1 border-b-2 pb-2 ${stage === index + 1 ? 'border-admin-ink font-semibold text-admin-ink' : 'border-admin-border text-admin-muted'}`}>{index + 1}. {label}</div>)}</div>
    {stage === 1 && <section className="space-y-5">
      <div><label className="text-sm font-medium text-admin-ink" htmlFor="studioName">Studio name</label><input id="studioName" className="mt-2 w-full rounded border border-admin-border bg-admin-bg px-3 py-2 text-admin-ink" value={draft.studioName} onChange={(event) => update('studioName', event.target.value)} /><FieldError message={errors.studioName} /></div>
      <div><label className="text-sm font-medium text-admin-ink" htmlFor="serviceAreas">Where do you serve?</label><input id="serviceAreas" className="mt-2 w-full rounded border border-admin-border bg-admin-bg px-3 py-2 text-admin-ink" placeholder="e.g. South Delhi, Gurugram" value={draft.serviceAreas.join(', ')} onChange={(event) => update('serviceAreas', event.target.value.split(','))} /><FieldError message={errors.serviceAreas} /></div>
      <ChoiceGroup label="What categories do you work in?" values={categories} selected={draft.categories} onToggle={(value) => toggle('categories', value)} error={errors.categories} />
      <ChoiceGroup label="What services do you offer?" values={services} selected={draft.services} onToggle={(value) => toggle('services', value)} error={errors.services} />
      {draft.services.includes('Other service') && <div><label className="text-sm font-medium text-admin-ink" htmlFor="otherService">Tell us about the other service</label><input id="otherService" className="mt-2 w-full rounded border border-admin-border bg-admin-bg px-3 py-2 text-admin-ink" placeholder="e.g. Lighting design" value={draft.otherService} onChange={(event) => update('otherService', event.target.value)} /></div>}
    </section>}
    {stage === 2 && <section className="space-y-5"><div className="rounded border border-admin-border bg-admin-primary-soft p-4"><h2 className="font-semibold text-admin-ink">Photos and branding</h2><p className="mt-2 text-sm leading-6 text-admin-muted">You can use clearly labelled sample imagery now and replace it later. Project descriptions, budgets and titles can wait.</p></div><label className="block text-sm font-medium text-admin-ink">Optional logo<input type="file" accept="image/*" className="mt-2 block w-full text-sm text-admin-muted" /></label><label className="block text-sm font-medium text-admin-ink">Optional photos<input type="file" accept="image/*" multiple className="mt-2 block w-full text-sm text-admin-muted" /></label></section>}
    {stage === 3 && <section className="space-y-5"><div><label className="text-sm font-medium text-admin-ink" htmlFor="primaryPhone">Business phone</label><input id="primaryPhone" className="mt-2 w-full rounded border border-admin-border bg-admin-bg px-3 py-2 text-admin-ink" value={draft.primaryPhone} onChange={(event) => update('primaryPhone', event.target.value)} /><FieldError message={errors.primaryPhone} /></div><label className="flex items-center gap-2 text-sm text-admin-ink"><input type="checkbox" checked={draft.usePhoneForWhatsapp} onChange={(event) => update('usePhoneForWhatsapp', event.target.checked)} /> Use this number for WhatsApp</label>{!draft.usePhoneForWhatsapp && <div><label className="text-sm font-medium text-admin-ink" htmlFor="whatsapp">WhatsApp number</label><input id="whatsapp" className="mt-2 w-full rounded border border-admin-border bg-admin-bg px-3 py-2 text-admin-ink" value={draft.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} /><FieldError message={errors.whatsapp} /></div>}<div><label className="text-sm font-medium text-admin-ink" htmlFor="publicEmail">Public email (optional)</label><input id="publicEmail" type="email" className="mt-2 w-full rounded border border-admin-border bg-admin-bg px-3 py-2 text-admin-ink" value={draft.publicEmail} onChange={(event) => update('publicEmail', event.target.value)} /><FieldError message={errors.publicEmail} /></div><div className="rounded border border-admin-border bg-admin-primary-soft p-4"><p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Suggested introduction</p><p className="mt-2 text-sm leading-6 text-admin-ink">{introduction}</p></div></section>}
    <div className="flex justify-between gap-3"><button type="button" className="rounded border border-admin-border px-4 py-2 text-sm text-admin-ink disabled:opacity-50" disabled={stage === 1} onClick={() => setStage((current) => current - 1)}>Back</button>{stage < 3 ? <button type="button" className="rounded bg-admin-ink px-4 py-2 text-sm text-admin-bg" onClick={next}>Continue</button> : <button type="button" className="rounded bg-admin-ink px-4 py-2 text-sm text-admin-bg" onClick={() => { const result = validateOnboardingDraft(draft); setErrors(result.errors); if (!Object.keys(result.errors).length) setSubmitted(true) }}>Create my preview</button>}</div>
  </div>
}

function ChoiceGroup({ label, values, selected, onToggle, error }: { label: string; values: string[]; selected: string[]; onToggle: (value: string) => void; error?: string }) {
  return <fieldset><legend className="text-sm font-medium text-admin-ink">{label}</legend><div className="mt-2 flex flex-wrap gap-2">{values.map((value) => <button type="button" key={value} className={`rounded border px-3 py-2 text-sm ${selected.includes(value) ? 'border-admin-ink bg-admin-primary-soft text-admin-ink' : 'border-admin-border text-admin-muted'}`} aria-pressed={selected.includes(value)} onClick={() => onToggle(value)}>{value}</button>)}</div><FieldError message={error} /></fieldset>
}
