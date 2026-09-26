'use client'

import type { NormalizedActivityEvent } from '@studio/backend'
import { ActivityIcon } from './ActivityIcon'

export function LeadTimeline({
  timeline,
  timezone,
}: {
  timeline: NormalizedActivityEvent[]
  timezone: string
}) {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <section className="rounded-xl border border-admin-border bg-admin-surface p-5 sm:p-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">History</p>
        <h2 className="mt-1 text-base font-semibold text-admin-ink">Lead timeline</h2>
      </div>
      <div className="mt-5 divide-y divide-admin-border">
        {timeline.length ? timeline.map((event) => (
          <article key={`${event.source}:${event.eventId}`} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            {event.actor.avatarUrl ? <img src={event.actor.avatarUrl} alt="" className="size-9 shrink-0 rounded-full border border-admin-border object-cover" /> : <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-admin-border bg-admin-raised text-[10px] font-semibold">{event.actor.initials}</span>}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-admin-ink">{event.title}</p>
              <p className="mt-1 text-sm leading-6 text-admin-muted">{event.description}</p>
              <p className="mt-1 text-xs text-admin-muted">{event.actor.name} · {formatter.format(new Date(event.createdAt))}</p>
            </div>
            <ActivityIcon type={event.type} />
          </article>
        )) : <p className="py-4 text-sm text-admin-muted">No timeline events yet.</p>}
      </div>
    </section>
  )
}
