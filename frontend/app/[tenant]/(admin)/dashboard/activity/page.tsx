import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { canAccessDashboard, listWorkspaceActivity, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ActivityIcon } from '../components/ActivityIcon'
import { DEMO_ACTIVITY } from '../components/demo-data'

export default async function WorkspaceActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams?: Promise<{ cursor?: string; demo?: string }>
}) {
  const { tenant } = await params
  const query = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()

  let events = DEMO_ACTIVITY
  let nextCursor: string | null = null
  let timezone = 'Asia/Kolkata'
  if (user?.email && session) {
    const context = await requireTenant({ id: user.id, email: user.email, accessToken: session.access_token })
    if (context.tenant.slug !== tenant || !canAccessDashboard(context.tenant)) redirect(`/${context.tenant.slug}/dashboard`)
    const page = await listWorkspaceActivity(context.db, context.tenant.id, { limit: 10, cursor: query?.cursor })
    events = page.events
    nextCursor = page.nextCursor
    const { data: preferences } = await context.db.from('workspace_preferences').select('timezone').eq('tenant_id', context.tenant.id).maybeSingle()
    timezone = preferences?.timezone || timezone
  } else if (query?.demo !== '1') {
    redirect(`/login?next=/${encodeURIComponent(tenant)}/dashboard/activity`)
  }

  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-28 sm:px-6 lg:py-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Workspace history</p>
        <h1 className="mt-2 text-2xl font-semibold text-admin-ink">All activity</h1>
        <p className="mt-2 text-sm text-admin-muted">A tenant-scoped record of meaningful workspace changes.</p>
      </div>
      <section className="divide-y divide-admin-border rounded-xl border border-admin-border bg-admin-surface px-5">
        {events.length ? events.map((event) => (
          <div key={`${event.source}:${event.eventId}`} className="flex min-w-0 items-start gap-3 py-4">
            <ActivityIcon type={event.type} />
            {event.actor.avatarUrl ? <img src={event.actor.avatarUrl} alt="" className="size-9 shrink-0 rounded-full border border-admin-border object-cover" /> : <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-admin-border bg-admin-raised text-[10px] font-semibold">{event.actor.initials}</span>}
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-admin-ink">{event.title}</p><p className="mt-1 text-sm text-admin-muted">{event.description}</p><p className="mt-1 text-xs text-admin-muted">{event.actor.name} · {formatter.format(new Date(event.createdAt))}</p></div>
          </div>
        )) : <p className="py-8 text-sm text-admin-muted">No new activities.</p>}
      </section>
      {nextCursor && <a href={`/${tenant}/dashboard/activity?cursor=${encodeURIComponent(nextCursor)}`} className="flex min-h-12 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-sm font-semibold text-admin-ink hover:bg-admin-raised">Load more</a>}
      <a href={`/${tenant}/dashboard`} className="flex min-h-12 items-center justify-center gap-2 text-sm font-semibold text-admin-primary hover:underline"><ArrowLeft aria-hidden="true" className="size-4" />Back to overview</a>
    </main>
  )
}
