'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'
import { localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'

/** Fixed UI framing, identical for every client — not content, so not config. */
const COPY = {
  fields: {
    name: { label: 'Name', placeholder: 'Your name' },
    phone: { label: 'Phone', placeholder: 'Your phone number' },
    email: { label: 'Email', placeholder: 'you@email.com' },
    projectType: { label: 'Project type' },
    message: { label: 'Tell us about your project', placeholder: 'Flat size, location and rough budget' },
  },
  submit: 'Send inquiry',
  sending: 'Sending',
  sent: 'Thank you. We will be in touch shortly.',
  error: 'Something went wrong. Please call us instead.',
}

const HI_COPY = {
  fields: {
    name: { label: 'नाम', placeholder: 'अपना नाम लिखें' },
    phone: { label: 'फोन', placeholder: 'अपना फोन नंबर लिखें' },
    email: { label: 'ईमेल', placeholder: 'you@email.com' },
    projectType: { label: 'प्रोजेक्ट का प्रकार' },
    message: { label: 'अपने प्रोजेक्ट के बारे में बताएं', placeholder: 'फ्लैट का आकार, स्थान और अनुमानित बजट' },
  },
  submit: 'पूछताछ भेजें',
  sending: 'भेजा जा रहा है',
  sent: 'धन्यवाद। हम जल्द ही आपसे संपर्क करेंगे।',
  error: 'कुछ गलत हुआ। कृपया हमें फोन करें।',
}

export function InquiryForm({ site }: { site: ClientConfig }) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const projectTypes = site.sections.inquiryForm?.projectTypes ?? []
  const locale = publicLocaleFromSite(site)
  const copy = locale === 'hi' ? HI_COPY : COPY

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const form = new FormData(event.currentTarget)
    const requestId = crypto.randomUUID()
    try {
      const response = await fetch(`/api/${site.slug}/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'idempotency-key': requestId },
        body: JSON.stringify({
          requestId,
          name: String(form.get('name') ?? ''),
          phone: String(form.get('phone') ?? ''),
          email: String(form.get('email') ?? ''),
          projectType: String(form.get('projectType') ?? ''),
          message: String(form.get('message') ?? ''),
          source: 'form',
          sourcePage: window.location.pathname,
        }),
      })
      if (!response.ok) throw new Error('Request failed')
      event.currentTarget.reset()
      setStatus('sent')
      router.push(`/${site.slug}/thank-you`)
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <label className="grid gap-2"><h6 className={`m-0 font-medium text-accent ${localeRoleClass(locale, 'label')}`}>{copy.fields.name.label}</h6><input name="name" required placeholder={copy.fields.name.placeholder} className="ai-type-form-control border-0 border-b border-ink bg-transparent px-0 py-2 text-ink outline-none placeholder:text-muted" /></label>
      <label className="grid gap-2"><h6 className={`m-0 font-medium text-accent ${localeRoleClass(locale, 'label')}`}>{copy.fields.phone.label}</h6><input name="phone" required inputMode="tel" placeholder={copy.fields.phone.placeholder} className="ai-type-form-control border-0 border-b border-ink bg-transparent px-0 py-2 text-ink outline-none placeholder:text-muted" /></label>
      <label className="grid gap-2"><h6 className={`m-0 font-medium text-accent ${localeRoleClass(locale, 'label')}`}>{copy.fields.email.label}</h6><input name="email" type="email" placeholder={copy.fields.email.placeholder} className="ai-type-form-control border-0 border-b border-ink bg-transparent px-0 py-2 text-ink outline-none placeholder:text-muted" /></label>
      {projectTypes.length > 0 && (
        <label className="grid gap-2"><h6 className={`m-0 font-medium text-accent ${localeRoleClass(locale, 'label')}`}>{copy.fields.projectType.label}</h6><select name="projectType" defaultValue={projectTypes[0]} className="ai-type-form-control border-0 border-b border-ink bg-transparent px-0 py-2 text-ink outline-none">{projectTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      )}
      <label className="grid gap-2"><h6 className={`m-0 font-medium text-accent ${localeRoleClass(locale, 'label')}`}>{copy.fields.message.label}</h6><textarea name="message" rows={3} placeholder={copy.fields.message.placeholder} className="ai-type-form-control resize-y border-0 border-b border-ink bg-transparent px-0 py-2 text-ink outline-none placeholder:text-muted" /></label>
      <button type="submit" disabled={status === 'sending'} className={`inline-flex min-h-11 items-center justify-self-start gap-3 bg-cta px-8 py-5 font-semibold text-ink hover:bg-ink hover:text-cta disabled:opacity-60 ${localeRoleClass(locale, 'button')}`}>{status === 'sending' ? copy.sending : copy.submit} <EditorialIcon name="arrow-up-right" className="h-3 w-3" /></button>
      {status === 'sent' && <p className={`m-0 text-accent ${localeRoleClass(locale, 'body')}`}>{copy.sent}</p>}
      {status === 'error' && <p className={`m-0 text-accent ${localeRoleClass(locale, 'body')}`}>{copy.error}</p>}
    </form>
  )
}
