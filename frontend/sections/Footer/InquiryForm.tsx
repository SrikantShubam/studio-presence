'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'

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

export function InquiryForm({ site }: { site: ClientConfig }) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const projectTypes = site.sections.inquiryForm?.projectTypes ?? []

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch(`/api/${site.slug}/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
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
      router.push('/thank-you')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <label className="grid gap-2"><span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{COPY.fields.name.label}</span><input name="name" required placeholder={COPY.fields.name.placeholder} className="border-0 border-b border-ink bg-transparent px-0 py-2 text-base text-ink outline-none placeholder:text-muted" /></label>
      <label className="grid gap-2"><span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{COPY.fields.phone.label}</span><input name="phone" required inputMode="tel" placeholder={COPY.fields.phone.placeholder} className="border-0 border-b border-ink bg-transparent px-0 py-2 text-base text-ink outline-none placeholder:text-muted" /></label>
      <label className="grid gap-2"><span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{COPY.fields.email.label}</span><input name="email" type="email" placeholder={COPY.fields.email.placeholder} className="border-0 border-b border-ink bg-transparent px-0 py-2 text-base text-ink outline-none placeholder:text-muted" /></label>
      {projectTypes.length > 0 && (
        <label className="grid gap-2"><span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{COPY.fields.projectType.label}</span><select name="projectType" defaultValue={projectTypes[0]} className="border-0 border-b border-ink bg-transparent px-0 py-2 text-base text-ink outline-none">{projectTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      )}
      <label className="grid gap-2"><span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{COPY.fields.message.label}</span><textarea name="message" rows={3} placeholder={COPY.fields.message.placeholder} className="resize-y border-0 border-b border-ink bg-transparent px-0 py-2 text-base text-ink outline-none placeholder:text-muted" /></label>
      <button type="submit" disabled={status === 'sending'} className="inline-flex min-h-11 items-center justify-self-start gap-3 bg-cta px-8 py-5 text-[11.5px] font-medium uppercase tracking-[0.18em] text-ink hover:bg-ink hover:text-cta disabled:opacity-60">{status === 'sending' ? COPY.sending : COPY.submit} <EditorialIcon name="arrow-up-right" className="h-3 w-3" /></button>
      {status === 'sent' && <p className="m-0 text-sm text-accent">{COPY.sent}</p>}
      {status === 'error' && <p className="m-0 text-sm text-accent">{COPY.error}</p>}
    </form>
  )
}
