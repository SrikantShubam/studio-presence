'use client'

import { useRef, useState, type FormEvent } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import type { ClientConfig } from '@studio/backend'
import { chromeCopy, localeHref, localeRoleClass, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback': () => void
          'error-callback': () => void
        },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}

const contactFormSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(7),
  email: z.string().trim().email().optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional(),
})

const DEFAULT_TEST_SITE_KEY = '10000000-ffff-ffff-ffff-000000000001'
const SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || DEFAULT_TEST_SITE_KEY

export function ContactForm({
  site,
  locale,
}: {
  site: ClientConfig
  locale: PublicLocale
}) {
  const router = useRouter()
  const formCopy = chromeCopy[locale].contact.page.form
  const isHi = locale === 'hi'

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [captchaToken, setCaptchaToken] = useState<string>('')

  const captchaContainer = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  function renderCaptcha() {
    if (!SITE_KEY || !window.hcaptcha || !captchaContainer.current || widgetId.current) return
    widgetId.current = window.hcaptcha.render(captchaContainer.current, {
      sitekey: SITE_KEY,
      callback: (token) => {
        setErrorMessage(null)
        setCaptchaToken(token)
      },
      'expired-callback': () => {
        setErrorMessage(formCopy.captchaExpired)
        setCaptchaToken('')
      },
      'error-callback': () => {
        setErrorMessage(formCopy.captchaFailed)
        setCaptchaToken('')
      },
    })
  }

  function resetCaptcha() {
    setCaptchaToken('')
    if (widgetId.current && window.hcaptcha) {
      window.hcaptcha.reset(widgetId.current)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setFieldErrors({})

    const form = new FormData(event.currentTarget)
    const rawValues = {
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      message: String(form.get('message') ?? ''),
    }

    const validation = contactFormSchema.safeParse(rawValues)
    if (!validation.success) {
      const fieldMsgMap: Record<string, string> = {
        name: formCopy.nameRequired,
        phone: formCopy.phoneRequired,
        email: formCopy.emailInvalid,
      }
      const newErrors: Record<string, string> = {}
      for (const issue of validation.error.issues) {
        const field = String(issue.path[0])
        if (fieldMsgMap[field] && !newErrors[field]) {
          newErrors[field] = fieldMsgMap[field]
        }
      }
      setFieldErrors(newErrors)
      setErrorMessage(newErrors.phone || newErrors.name || newErrors.email || formCopy.error)
      return
    }

    setStatus('sending')
    const requestId = crypto.randomUUID()

    try {
      const response = await fetch(`/api/${site.slug}/leads`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': requestId,
        },
        body: JSON.stringify({
          requestId,
          name: validation.data.name,
          phone: validation.data.phone,
          email: validation.data.email || undefined,
          message: validation.data.message || undefined,
          source: 'form',
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/contact',
          captchaToken: captchaToken || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      event.currentTarget.reset()
      setStatus('sent')
      router.push(localeHref('/thank-you', locale))
    } catch {
      setStatus('error')
      setErrorMessage(formCopy.error)
      resetCaptcha()
    }
  }

  return (
    <>
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderCaptcha}
        onReady={renderCaptcha}
      />

      <form onSubmit={submit} className="grid gap-6">
        <label className="grid gap-2">
          <span className={`font-medium text-accent ${localeRoleClass(locale, 'label')}`}>
            {formCopy.fields.name.label}
          </span>
          <input
            name="name"
            required
            placeholder={formCopy.fields.name.placeholder}
            onChange={() => setFieldErrors((prev) => ({ ...prev, name: '' }))}
            className={`ai-type-form-control border-0 border-b bg-transparent px-0 py-2.5 text-ink outline-none placeholder:text-muted focus:border-accent ${
              fieldErrors.name ? 'border-accent' : 'border-ink'
            }`}
          />
          {fieldErrors.name && (
            <span className={`text-xs text-accent ${localeRoleClass(locale, 'meta')}`}>
              {fieldErrors.name}
            </span>
          )}
        </label>

        <label className="grid gap-2">
          <span className={`font-medium text-accent ${localeRoleClass(locale, 'label')}`}>
            {formCopy.fields.phone.label}
          </span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            required
            placeholder={formCopy.fields.phone.placeholder}
            onChange={() => setFieldErrors((prev) => ({ ...prev, phone: '' }))}
            className={`ai-type-form-control border-0 border-b bg-transparent px-0 py-2.5 text-ink outline-none placeholder:text-muted focus:border-accent ${
              fieldErrors.phone ? 'border-accent' : 'border-ink'
            }`}
          />
          {fieldErrors.phone && (
            <span className={`text-xs text-accent ${localeRoleClass(locale, 'meta')}`}>
              {fieldErrors.phone}
            </span>
          )}
        </label>

        <label className="grid gap-2">
          <span className={`font-medium text-accent ${localeRoleClass(locale, 'label')}`}>
            {formCopy.fields.email.label}
          </span>
          <input
            name="email"
            type="email"
            placeholder={formCopy.fields.email.placeholder}
            onChange={() => setFieldErrors((prev) => ({ ...prev, email: '' }))}
            className={`ai-type-form-control border-0 border-b bg-transparent px-0 py-2.5 text-ink outline-none placeholder:text-muted focus:border-accent ${
              fieldErrors.email ? 'border-accent' : 'border-ink'
            }`}
          />
          {fieldErrors.email && (
            <span className={`text-xs text-accent ${localeRoleClass(locale, 'meta')}`}>
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label className="grid gap-2">
          <span className={`font-medium text-accent ${localeRoleClass(locale, 'label')}`}>
            {formCopy.fields.message.label}
          </span>
          <textarea
            name="message"
            rows={4}
            placeholder={formCopy.fields.message.placeholder}
            className="ai-type-form-control resize-y border-0 border-b border-ink bg-transparent px-0 py-2.5 text-ink outline-none placeholder:text-muted focus:border-accent"
          />
        </label>

        <div ref={captchaContainer} className="my-2 min-h-[78px] overflow-hidden" />

        <div className="pt-2">
          <button
            type="submit"
            disabled={status === 'sending'}
            className={`group/submit relative inline-flex min-h-12 items-center justify-between gap-4 bg-cta px-7 py-3.5 font-semibold text-ink transition-all hover:bg-ink hover:text-cta disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-14px)_100%,0_100%)] ${
              isHi ? 'text-sm tracking-normal' : 'text-xs uppercase tracking-[0.16em]'
            } ${localeRoleClass(locale, 'button')}`}
          >
            <span>{status === 'sending' ? formCopy.sending : formCopy.submit}</span>
            <EditorialIcon
              name="arrow-right"
              className="h-3.5 w-3.5 transition-transform group-hover/submit:translate-x-0.5"
            />
          </button>
        </div>

        {status === 'sent' && (
          <p className={`m-0 text-accent ${localeRoleClass(locale, 'body')}`}>
            {formCopy.sent}
          </p>
        )}

        {(status === 'error' || errorMessage) && (
          <p className={`m-0 text-accent ${localeRoleClass(locale, 'body')}`}>
            {errorMessage || formCopy.error}
          </p>
        )}
      </form>
    </>
  )
}
