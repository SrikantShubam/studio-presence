import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { ConfigError, loadPublicClientConfig } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ChevronDown } from 'lucide-react'
import { SignOutButton } from './SignOutButton'
import { DashboardTabs } from './dashboard/DashboardTabs'

export async function AdminChrome({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const profileMetadata = (user.identities ?? []).reduce<Record<string, unknown>>(
    (metadata, identity) => ({ ...metadata, ...(identity.identity_data ?? {}) }),
    { ...(user.user_metadata ?? {}) },
  )
  const profile = profileFor(user.email, profileMetadata)
  const businessName = await tenantBusinessName(tenant)

  return (
    <div className="min-h-screen bg-admin-bg text-admin-ink lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-admin-border bg-admin-surface px-4 py-5 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-primary text-sm font-bold text-admin-on-primary">
            SP
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-admin-ink">Owner admin</p>
            <p className="truncate text-xs text-admin-muted">{businessName}</p>
          </div>
        </div>

        <div className="mb-5">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-admin-muted">General</p>
          <DashboardTabs orientation="side" />
        </div>

        <div className="rounded-lg border border-admin-border bg-admin-bg p-4 text-xs leading-5 text-admin-muted">
          Website edits are content-only. Tier, template, palette, and route structure stay operator controlled.
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-admin-border bg-admin-surface px-4 py-3">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-admin-ink">Welcome {profile.name} to {businessName}</p>
              <p className="truncate text-xs text-admin-muted">Manage enquiries, content, analytics, and owner settings.</p>
            </div>

            <div className="lg:hidden">
              <DashboardTabs />
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <ProfileMenu profile={profile} email={user.email} />
              <SignOutButton />
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}

async function tenantBusinessName(tenant: string): Promise<string> {
  try {
    const config = await loadPublicClientConfig(tenant)
    return config.business.name
  } catch (error) {
    if (error instanceof ConfigError) return tenant
    throw error
  }
}

type Profile = {
  name: string
  initials: string
  avatarUrl: string | null
}

function profileFor(email: string, metadata: Record<string, unknown> | null | undefined): Profile {
  const name =
    stringFrom(metadata?.full_name) ??
    stringFrom(metadata?.name) ??
    email.split('@')[0] ??
    'Operator'
  return {
    name,
    initials: initialsFor(name || email),
    avatarUrl:
      stringFrom(metadata?.avatar_url) ??
      stringFrom(metadata?.picture) ??
      stringFrom(metadata?.avatarUrl) ??
      stringFrom(metadata?.photoURL) ??
      stringFrom(metadata?.image),
  }
}

function stringFrom(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function initialsFor(value: string): string {
  const email = value.includes('@') ? value : value.replace(/\s+/g, '.')
  const name = email.split('@')[0] ?? ''
  const parts = name.split(/[._-]+/).filter(Boolean)
  const letters = (parts.length > 1 ? parts.slice(0, 2) : [name.slice(0, 2)])
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
  return letters || 'O'
}

function ProfileAvatar({ profile }: { profile: Profile }) {
  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className="h-9 w-9 rounded-full border border-admin-border object-cover"
      />
    )
  }

  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-admin-border bg-admin-raised text-xs font-semibold text-admin-ink">
      {profile.initials}
    </span>
  )
}

function ProfileMenu({ profile, email }: { profile: Profile; email: string }) {
  return (
    <details className="group relative min-w-0">
      <summary
        className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-lg border border-admin-border bg-admin-bg px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-admin-primary [&::-webkit-details-marker]:hidden"
        aria-label="Open account menu"
        title="Open account menu"
      >
        <ProfileAvatar profile={profile} />
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-40 truncate text-sm font-semibold text-admin-ink">{profile.name}</p>
          <p className="max-w-40 truncate text-xs text-admin-muted">{email}</p>
        </div>
        <ChevronDown aria-hidden="true" className="size-4 text-admin-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-full z-40 mt-2 w-56 border border-admin-border bg-admin-surface p-2">
        <p className="truncate px-2 py-2 text-xs text-admin-muted">Signed in as {email}</p>
        <SignOutButton />
      </div>
    </details>
  )
}
