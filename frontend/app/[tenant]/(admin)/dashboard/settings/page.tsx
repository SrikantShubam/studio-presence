import Link from 'next/link'
import { ConfigError } from '@studio/backend'
import { loadPublicTenantConfig } from '@/lib/tenant-config'
import { AdminCard, AdminChip, AdminShell } from '../../components'

export default async function DashboardSettingsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const site = await settingsConfig(tenant)
  const instagramHandle = site?.sections.instagram?.handle
  const instagramPosts = site?.sections.instagram?.embedPostUrls.length ?? 0
  const umami = site?.integrations.umami
  const estimate = site?.sections.estimate
  const contentHref = `/${tenant}/dashboard/content`

  return (
    <AdminShell>
      <AdminCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-muted">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-admin-ink">Minimal owner settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
              This page only shows high-level controls and integration status. Editing copy, pages, socials, and calculator values stays in Website Content.
            </p>
          </div>
          <Link href={contentHref} className="inline-flex min-h-11 items-center justify-center rounded bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary">
            Open Website Content
          </Link>
        </div>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard title="CTA and contact" status="Owner editable">
          <p className="text-sm leading-6 text-admin-muted">
            Phone, WhatsApp number, WhatsApp starter message, CTA labels, contact address, and footer socials are content settings.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={contentHref} className="inline-flex min-h-11 items-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
              Edit contact and footer
            </Link>
            <Link href={contentHref} className="inline-flex min-h-11 items-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
              Edit CTAs
            </Link>
          </div>
        </SettingsCard>

        <SettingsCard title="Estimate calculator" status={estimate?.enabled ? 'Enabled' : 'Disabled'}>
          <p className="text-sm leading-6 text-admin-muted">
            The owner can turn the calculator on/off and change rates, multipliers, result notes, and included items from Website Content.
          </p>
          <Link href={contentHref} className="mt-4 inline-flex min-h-11 items-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
            Edit calculator
          </Link>
        </SettingsCard>

        <SettingsCard title="Instagram" status={`${instagramPosts} picked posts`}>
          <p className="text-sm leading-6 text-admin-muted">
            Instagram is hand-picked. The owner provides the handle and post URLs; there is no live auto-updating feed at any tier.
          </p>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-admin-muted">Handle</dt>
              <dd className="truncate font-semibold text-admin-ink">{instagramHandle ? `@${instagramHandle}` : 'Not set'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-admin-muted">Post picks</dt>
              <dd className="font-semibold tabular-nums text-admin-ink">{instagramPosts}</dd>
            </div>
          </dl>
          <Link href={contentHref} className="mt-4 inline-flex min-h-11 items-center rounded border border-admin-border px-4 text-sm font-semibold text-admin-ink">
            Edit Instagram picks
          </Link>
        </SettingsCard>

        <SettingsCard title="Platform credentials" status="Operator managed">
          <p className="text-sm leading-6 text-admin-muted">
            No client API keys are collected in this dashboard. Meta oEmbed uses platform env vars `META_APP_ID` and `META_APP_SECRET`.
            Umami uses `UMAMI_API_URL`, `UMAMI_USERNAME`, and `UMAMI_PASSWORD`. Lead delivery uses the internal enquiry pipeline and Resend.
          </p>
          <div className="mt-4 grid gap-2 text-sm">
            <CredentialRow label="Meta / Instagram oEmbed" value="Platform env" />
            <CredentialRow label="Umami analytics" value={umami?.enabled && umami.siteId ? 'Configured' : 'Not configured'} />
            <CredentialRow label="Google Places reviews" value="Platform env when enabled" />
            <CredentialRow label="Lead delivery" value="Platform managed" />
          </div>
        </SettingsCard>
      </div>
    </AdminShell>
  )
}

async function settingsConfig(tenant: string) {
  try {
    return await loadPublicTenantConfig(tenant)
  } catch (error) {
    if (error instanceof ConfigError) return null
    throw error
  }
}

function SettingsCard({ title, status, children }: { title: string; status: string; children: React.ReactNode }) {
  return (
    <AdminCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-admin-ink">{title}</h2>
        <AdminChip tone="neutral">{status}</AdminChip>
      </div>
      <div className="mt-4">{children}</div>
    </AdminCard>
  )
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 rounded border border-admin-border bg-admin-bg px-3">
      <span className="text-admin-muted">{label}</span>
      <span className="font-semibold text-admin-ink">{value}</span>
    </div>
  )
}
