'use client'

import { useState, type ReactNode } from 'react'
import type { NormalizedActivityEvent } from '@studio/backend'

type Tab = 'notes' | 'booklet' | 'timeline'

export function LeadDetailTabs({
  notes,
  booklet,
  timeline,
  timezone,
}: {
  notes: ReactNode
  booklet: ReactNode
  timeline: NormalizedActivityEvent[]
  timezone: string
}) {
  const [active, setActive] = useState<Tab>('booklet')
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const content = active === 'notes' ? notes : active === 'booklet' ? booklet : (
    <section className="rounded-xl border border-admin-border bg-admin-surface p-4">
      <h2 className="text-base font-semibold text-admin-ink">Lead timeline</h2>
      <div className="mt-4 divide-y divide-admin-border">
        {timeline.length ? timeline.map((event) => (
          <article key={`${event.source}:${event.eventId}`} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            {event.actor.avatarUrl ? <img src={event.actor.avatarUrl} alt="" className="size-8 shrink-0 rounded-full border border-admin-border object-cover" /> : <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-admin-border bg-admin-raised text-[10px] font-semibold">{event.actor.initials}</span>}
            <div className="min-w-0"><p className="text-sm font-semibold text-admin-ink">{event.title}</p><p className="mt-1 text-sm text-admin-muted">{event.description}</p><p className="mt-1 text-xs text-admin-muted">{event.actor.name} · {formatter.format(new Date(event.createdAt))}</p></div>
          </article>
        )) : <p className="py-4 text-sm text-admin-muted">No timeline events yet.</p>}
      </div>
    </section>
  )

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 border-b border-admin-border" role="tablist" aria-label="Lead details">
        {(['notes', 'booklet', 'timeline'] as const).map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={active === tab} onClick={() => setActive(tab)} className={`min-h-12 border-b-2 px-2 text-sm font-semibold capitalize ${active === tab ? 'border-admin-primary text-admin-ink' : 'border-transparent text-admin-muted'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="pt-4">{content}</div>
    </div>
  )
}
