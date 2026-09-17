'use client'

import { useMemo, useState } from 'react'
import { EMPTY_ONBOARDING_DRAFT, type OnboardingDraft, type OnboardingErrors } from '@/lib/onboarding/types'
import { suggestedIntroduction, validateOnboardingDraft, validateOnboardingStage } from '@/lib/onboarding/validation'

const categories = ['Residential', 'Office', 'Retail', 'Hospitality']
const services = ['Interior design', 'Renovation', 'Turnkey projects', 'Design consultation', 'Modular kitchen', 'Other service']

function ErrorText({ message }: { message?: string }) { return message ? <p className="mt-1 text-sm text-admin-alert">{message}</p> : null }

export function OnboardingForm() {
  const [stage, setStage] = useState(1)
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_ONBOARDING_DRAFT)
  const [errors, setErrors] = useState<OnboardingErrors>({})
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')
  const introduction = useMemo(() => draft.introduction || suggestedIntroduction(draft), [draft])
  const update = <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const toggle = (key: 'categories' | 'services', value: string) => update(key, draft[key].includes(value) ? draft[key].filter((item) => item !== value) : [...draft[key], value])
  const next = () => { const result = validateOnboardingStage(draft, stage as 1 | 2 | 3); setDraft(result.draft); setErrors(result.errors); if (!Object.keys(result.errors).length) setStage((value) => Math.min(3, value + 1)) }
  const submit = async () => {
    const result = validateOnboardingDraft(draft)
    setDraft(result.draft); setErrors(result.errors); setServerError('')
    if (Object.keys(result.errors).length) { setStage(1); return }
    setBusy(true)
    try {
      const response = await fetch('/api/onboarding/complete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(result.draft) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) { setServerError(payload.error || 'We could not save your setup. Your answers are still here.'); return }
      window.location.assign(payload.dashboardPath)
    } catch { setServerError('We could not reach the server. Your answers are still here.') } finally { setBusy(false) }
  }
  return <div className="space-y-6">
    <div className="flex gap-2 text-sm">{['Your studio', 'Photos and branding', 'Review'].map((label, index) => <div key={label} className={`flex-1 border-b-2 pb-2 ${stage === index + 1 ? 'border-admin-ink font-semibold text-admin-ink' : 'border-admin-border text-admin-muted'}`}>{index + 1}. {label}</div>)}</div>
    {serverError && <p role="alert" className="rounded border border-admin-alert bg-admin-alert-soft px-3 py-2 text-sm text-admin-alert">{serverError}</p>}
    {stage === 1 && <section className="space-y-5"><Field id="studioName" label="Studio name" error={errors.studioName}><input id="studioName" value={draft.studioName} onChange={(event) => update('studioName', event.target.value)} /></Field><Field id="serviceAreas" label="Where do you serve?" error={errors.serviceAreas}><input id="serviceAreas" placeholder="e.g. South Delhi, Gurugram" value={draft.serviceAreas.join(', ')} onChange={(event) => update('serviceAreas', event.target.value.split(','))} /></Field><ChoiceGroup label="What categories do you work in?" values={categories} selected={draft.categories} onToggle={(value) => toggle('categories', value)} error={errors.categories} /><ChoiceGroup label="What services do you offer?" values={services} selected={draft.services} onToggle={(value) => toggle('services', value)} error={errors.services} />{draft.services.includes('Other service') && <Field id="otherService" label="Tell us about the other service" error={errors.otherService}><input id="otherService" placeholder="e.g. Lighting design" value={draft.otherService} onChange={(event) => update('otherService', event.target.value)} /></Field>}</section>}
    {stage === 2 && <section className="space-y-5"><div className="rounded border border-admin-border bg-admin-primary-soft p-4"><h2 className="font-semibold text-admin-ink">Photos and branding</h2><p className="mt-2 text-sm leading-6 text-admin-muted">You can use clearly labelled sample imagery now and replace it later. Photo and logo uploads will be available after this setup is saved.</p></div><div className="rounded border border-admin-border p-4 text-sm leading-6 text-admin-muted">Continue with the sample imagery to see your personalized structure. You can replace it from the editor when asset storage is enabled for your workspace.</div></section>}
    {stage === 3 && <section className="space-y-5"><Field id="primaryPhone" label="Business phone" error={errors.primaryPhone}><input id="primaryPhone" value={draft.primaryPhone} onChange={(event) => update('primaryPhone', event.target.value)} /></Field><label className="flex items-center gap-2 text-sm text-admin-ink"><input type="checkbox" checked={draft.usePhoneForWhatsapp} onChange={(event) => update('usePhoneForWhatsapp', event.target.checked)} /> Use this number for WhatsApp</label>{!draft.usePhoneForWhatsapp && <Field id="whatsapp" label="WhatsApp number" error={errors.whatsapp}><input id="whatsapp" value={draft.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} /></Field>}<Field id="publicEmail" label="Public email (optional)" error={errors.publicEmail}><input id="publicEmail" type="email" value={draft.publicEmail} onChange={(event) => update('publicEmail', event.target.value)} /></Field><div className="rounded border border-admin-border bg-admin-primary-soft p-4"><p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Suggested introduction</p><p className="mt-2 text-sm leading-6 text-admin-ink">{introduction}</p></div></section>}
    <div className="flex justify-between gap-3"><button type="button" className="rounded border border-admin-border px-4 py-2 text-sm text-admin-ink disabled:opacity-50" disabled={stage === 1 || busy} onClick={() => setStage((value) => value - 1)}>Back</button>{stage < 3 ? <button type="button" className="rounded bg-admin-ink px-4 py-2 text-sm text-admin-bg" onClick={next}>Continue</button> : <button type="button" disabled={busy} className="rounded bg-admin-ink px-4 py-2 text-sm text-admin-bg disabled:opacity-50" onClick={submit}>{busy ? 'Saving…' : 'Create my preview'}</button>}</div>
  </div>
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) { return <div><label htmlFor={id} className="text-sm font-medium text-admin-ink">{label}</label><div className="mt-2 [&_input]:w-full [&_input]:rounded [&_input]:border [&_input]:border-admin-border [&_input]:bg-admin-bg [&_input]:px-3 [&_input]:py-2 [&_input]:text-admin-ink">{children}</div><ErrorText message={error} /></div> }
function ChoiceGroup({ label, values, selected, onToggle, error }: { label: string; values: string[]; selected: string[]; onToggle: (value: string) => void; error?: string }) { return <fieldset><legend className="text-sm font-medium text-admin-ink">{label}</legend><div className="mt-2 flex flex-wrap gap-2">{values.map((value) => <button type="button" key={value} className={`rounded border px-3 py-2 text-sm ${selected.includes(value) ? 'border-admin-ink bg-admin-primary-soft text-admin-ink' : 'border-admin-border text-admin-muted'}`} aria-pressed={selected.includes(value)} onClick={() => onToggle(value)}>{value}</button>)}</div><ErrorText message={error} /></fieldset> }
