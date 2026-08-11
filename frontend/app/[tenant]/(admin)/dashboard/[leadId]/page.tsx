import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { canAccessDashboard, leads, leadStatusSchema, requireTenant, type Lead, type LeadStatus } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
}

const noteSchema = z.string().max(2000)

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; leadId: string }>
}) {
  const { tenant: tenantSlug, leadId } = await params
  const { lead } = await loadLead(tenantSlug, leadId)

  async function saveStatus(formData: FormData) {
    'use server'

    const status = leadStatusSchema.parse(formData.get('status'))

    const { db } = await requireDashboardContext(tenantSlug)
    await leads.updateStatus(db, leadId, status)
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/${leadId}`)
  }

  async function saveNote(formData: FormData) {
    'use server'

    const note = noteSchema.parse(formData.get('notes'))

    const { db } = await requireDashboardContext(tenantSlug)
    await leads.addNote(db, leadId, note.trim())
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/${leadId}`)
  }

  const whatsappHref = `https://wa.me/${lead.phone.replace(/\D/g, '')}`
  const estimateRows = [
    ['Project type', lead.project_type],
    ['Budget band', lead.source === 'estimate' ? lead.budget_band : null],
    ['Timeline', lead.timeline],
  ].filter((row): row is [string, string] => typeof row[1] === 'string' && row[1].length > 0)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5 pb-28 sm:px-6 lg:py-8">
      <Link href="/dashboard" className="flex min-h-12 items-center text-sm font-medium text-admin-primary">
        Back to leads
      </Link>

      <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-admin-ink">{lead.name}</h1>
            {lead.locality && <p className="mt-1 text-base text-admin-muted">{lead.locality}</p>}
          </div>
          <span className="rounded-lg border border-admin-border bg-admin-bg px-2 py-1 text-xs font-semibold text-admin-muted">
            {STATUS_LABELS[lead.status].toUpperCase()}
          </span>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <DetailRow label="Phone" value={lead.phone} />
          <DetailRow label="Email" value={lead.email} />
          <DetailRow label="Source" value={lead.source} />
          <DetailRow label="Source page" value={lead.source_page} />
          <DetailRow label="Arrived" value={new Date(lead.created_at).toLocaleString('en-IN')} />
          <DetailRow label="Contacted" value={lead.contacted_at ? new Date(lead.contacted_at).toLocaleString('en-IN') : null} />
        </dl>
      </section>

      <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <h2 className="text-base font-semibold text-admin-ink">Message</h2>
        <p className="mt-3 whitespace-pre-wrap text-base text-admin-ink">
          {lead.message || 'No message was included with this enquiry.'}
        </p>
      </section>

      {estimateRows.length > 0 && (
        <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
          <h2 className="text-base font-semibold text-admin-ink">Estimate details</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            {estimateRows.map(([label, value]) => (
              <DetailRow key={label} label={label} value={value} />
            ))}
          </dl>
        </section>
      )}

      <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <h2 className="text-base font-semibold text-admin-ink">Status</h2>
        <form action={saveStatus} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-admin-ink">
            Lead status
            <select
              name="status"
              defaultValue={lead.status}
              className="min-h-12 rounded-lg border border-admin-border bg-admin-surface px-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-surface sm:self-end"
          >
            Save status
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <h2 className="text-base font-semibold text-admin-ink">Notes</h2>
        <form action={saveNote} className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-admin-ink">
            Private note
            <textarea
              name="notes"
              defaultValue={lead.notes ?? ''}
              rows={6}
              className="min-h-36 rounded-lg border border-admin-border bg-admin-surface px-3 py-3 text-base font-normal text-admin-ink outline-none focus:border-admin-primary"
            />
          </label>
          <button type="submit" className="min-h-12 rounded-lg bg-admin-primary px-4 text-base font-semibold text-admin-surface">
            Save note
          </button>
        </form>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-admin-border bg-admin-surface p-3">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2">
          <a
            href={whatsappHref}
            className="flex min-h-12 items-center justify-center rounded-lg bg-admin-primary px-3 text-base font-semibold text-admin-surface"
          >
            WhatsApp
          </a>
          <a
            href={`tel:${lead.phone}`}
            className="flex min-h-12 items-center justify-center rounded-lg border border-admin-border px-3 text-base font-semibold text-admin-ink"
          >
            Call
          </a>
        </div>
      </div>
    </div>
  )
}

async function loadLead(tenantSlug: string, leadId: string): Promise<{ lead: Lead }> {
  const { db } = await requireDashboardContext(tenantSlug)
  const lead = await leads.get(db, leadId)

  if (!lead) {
    notFound()
  }

  return { lead }
}

async function requireDashboardContext(expectedTenantSlug?: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user?.email || !session) {
    redirect('/login')
  }

  const tenantContext = await requireTenant({
    id: user.id,
    email: user.email,
    accessToken: session.access_token,
  })

  if (expectedTenantSlug && tenantContext.tenant.slug !== expectedTenantSlug) {
    redirect('/login')
  }

  if (!canAccessDashboard(tenantContext.tenant)) {
    redirect('/panel')
  }

  return tenantContext
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null

  return (
    <div>
      <dt className="text-sm font-medium text-admin-muted">{label}</dt>
      <dd className="mt-1 break-words text-base text-admin-ink">{value}</dd>
    </div>
  )
}
