'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface StudioOverviewHubProps {
  tenant: string
  studioName: string
  phone: string
  whatsapp: string
  paletteName: string
  serviceAreas: string[]
  city: string
  hasProjects: boolean
  previewUrl: string
  newLeadsCount: number
}

export function StudioOverviewHub({
  tenant,
  studioName,
  phone,
  whatsapp,
  paletteName,
  serviceAreas,
  city,
  hasProjects,
  previewUrl,
  newLeadsCount,
}: StudioOverviewHubProps) {
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [hasSharedLink, setHasSharedLink] = useState(false)

  const storageKey = `studio-checklist-dismissed-${tenant}`
  const sharedKey = `studio-link-shared-${tenant}`

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === 'true') {
        setDismissed(true)
      }
      if (localStorage.getItem(sharedKey) === 'true') {
        setHasSharedLink(true)
      }
    } catch {
      // Storage unavailable
    }
  }, [storageKey, sharedKey])

  const dismissChecklist = () => {
    setDismissed(true)
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {
      // Storage unavailable
    }
  }

  const markShared = () => {
    setHasSharedLink(true)
    try {
      localStorage.setItem(sharedKey, 'true')
    } catch {
      // Storage unavailable
    }
  }

  const copyWebsiteLink = async () => {
    try {
      const fullUrl = window.location.origin + previewUrl
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable
    }
  }

  // Pre-composed WhatsApp sharing text
  const shareText = `Hi! Take a look at our interior design studio's portfolio, services, and recent work here: ${
    typeof window !== 'undefined' ? window.location.origin + previewUrl : previewUrl
  }`
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`

  // Checklist items completion calculation
  const isIdentityComplete = Boolean(studioName && (city || serviceAreas.length > 0))
  const isPhoneComplete = Boolean(whatsapp || phone)
  const isPortfolioComplete = Boolean(hasProjects)
  const isShareComplete = hasSharedLink

  const completedCount = [
    isIdentityComplete,
    isPhoneComplete,
    isPortfolioComplete,
    isShareComplete,
  ].filter(Boolean).length

  const totalSteps = 4
  const progressPercent = Math.round((completedCount / totalSteps) * 100)

  const coverageDisplay =
    serviceAreas.length > 0
      ? serviceAreas.slice(0, 3).join(', ') + (serviceAreas.length > 3 ? ` +${serviceAreas.length - 3} more` : '')
      : city || 'All India'

  return (
    <div className="space-y-6">
      {/* 1. What You Have: Studio Assets Snapshot */}
      <section
        aria-labelledby="studio-snapshot-title"
        className="rounded-xl border border-admin-border bg-admin-surface p-5 sm:p-6 transition-colors"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-admin-primary">
              Studio Snapshot
            </p>
            <h2 id="studio-snapshot-title" className="mt-1 text-xl font-semibold text-admin-ink sm:text-2xl">
              {studioName}
            </h2>
            <p className="mt-1 text-sm text-admin-muted">
              Live website active and reachable on your public domain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyWebsiteLink}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-admin-border bg-admin-bg px-3.5 text-xs font-semibold text-admin-ink transition-colors hover:bg-admin-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary motion-reduce:transition-none"
            >
              {copied ? 'Copied link!' : 'Copy website link'}
            </button>
            <Link
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-admin-border bg-admin-surface px-3.5 text-xs font-semibold text-admin-ink transition-colors hover:border-admin-primary hover:text-admin-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary motion-reduce:transition-none"
            >
              Open public site ↗
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-admin-border pt-4">
          <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
            <p className="text-xs font-medium text-admin-muted">Connected WhatsApp</p>
            <p className="mt-1 truncate text-sm font-semibold text-admin-ink">
              {whatsapp || phone || 'Not connected'}
            </p>
          </div>
          <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
            <p className="text-xs font-medium text-admin-muted">Visual Identity</p>
            <p className="mt-1 truncate text-sm font-semibold text-admin-ink">
              {paletteName}
            </p>
          </div>
          <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
            <p className="text-xs font-medium text-admin-muted">Service Coverage</p>
            <p className="mt-1 truncate text-sm font-semibold text-admin-ink">
              {coverageDisplay}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Setup & Launch Checklist (Dismissible) */}
      {!dismissed && (
        <section
          aria-labelledby="launch-checklist-title"
          className="rounded-xl border border-admin-border bg-admin-surface p-5 sm:p-6 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-admin-primary-soft px-2.5 py-0.5 text-xs font-semibold text-admin-primary">
                  Launch Checklist
                </span>
                <span className="text-xs text-admin-muted font-medium">
                  {completedCount} of {totalSteps} completed ({progressPercent}%)
                </span>
              </div>
              <h2 id="launch-checklist-title" className="mt-2 text-base font-semibold text-admin-ink sm:text-lg">
                Essential steps to launch your studio presence
              </h2>
            </div>
            <button
              type="button"
              onClick={dismissChecklist}
              aria-label="Dismiss launch checklist"
              className="rounded-lg p-1 text-admin-muted hover:bg-admin-raised hover:text-admin-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-admin-raised">
            <div
              className={`h-full rounded-full bg-admin-primary transition-all duration-300 motion-reduce:transition-none ${
                completedCount === 4
                  ? 'w-full'
                  : completedCount === 3
                    ? 'w-3/4'
                    : completedCount === 2
                      ? 'w-2/4'
                      : completedCount === 1
                        ? 'w-1/4'
                        : 'w-0'
              }`}
            />
          </div>

          <ul className="mt-5 space-y-3">
            <li className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-bg p-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isIdentityComplete
                      ? 'bg-admin-primary text-admin-on-primary'
                      : 'border border-admin-border text-admin-muted'
                  }`}
                  aria-hidden="true"
                >
                  {isIdentityComplete ? '✓' : '1'}
                </span>
                <span className="text-sm font-medium text-admin-ink">
                  Studio name and service coverage configured
                </span>
              </div>
              {isIdentityComplete ? (
                <span className="text-xs font-semibold text-admin-primary">Ready</span>
              ) : (
                <Link
                  href={`/${tenant}/dashboard/content`}
                  className="text-xs font-semibold text-admin-primary underline underline-offset-4"
                >
                  Configure
                </Link>
              )}
            </li>

            <li className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-bg p-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isPhoneComplete
                      ? 'bg-admin-primary text-admin-on-primary'
                      : 'border border-admin-border text-admin-muted'
                  }`}
                  aria-hidden="true"
                >
                  {isPhoneComplete ? '✓' : '2'}
                </span>
                <span className="text-sm font-medium text-admin-ink">
                  WhatsApp and business phone connected
                </span>
              </div>
              {isPhoneComplete ? (
                <span className="text-xs font-semibold text-admin-primary">Ready</span>
              ) : (
                <Link
                  href={`/${tenant}/dashboard/settings`}
                  className="text-xs font-semibold text-admin-primary underline underline-offset-4"
                >
                  Connect phone
                </Link>
              )}
            </li>

            <li className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-bg p-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isPortfolioComplete
                      ? 'bg-admin-primary text-admin-on-primary'
                      : 'border border-admin-border text-admin-muted'
                  }`}
                  aria-hidden="true"
                >
                  {isPortfolioComplete ? '✓' : '3'}
                </span>
                <span className="text-sm font-medium text-admin-ink">
                  Add your first portfolio showcase project
                </span>
              </div>
              {isPortfolioComplete ? (
                <span className="text-xs font-semibold text-admin-primary">Ready</span>
              ) : (
                <Link
                  href={`/${tenant}/dashboard/content`}
                  className="text-xs font-semibold text-admin-primary underline underline-offset-4"
                >
                  Add project ➔
                </Link>
              )}
            </li>

            <li className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-bg p-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isShareComplete
                      ? 'bg-admin-primary text-admin-on-primary'
                      : 'border border-admin-border text-admin-muted'
                  }`}
                  aria-hidden="true"
                >
                  {isShareComplete ? '✓' : '4'}
                </span>
                <span className="text-sm font-medium text-admin-ink">
                  Share your studio link with a prospect on WhatsApp
                </span>
              </div>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={markShared}
                className="text-xs font-semibold text-admin-primary underline underline-offset-4"
              >
                {isShareComplete ? 'Share again' : 'Share link ➔'}
              </a>
            </li>
          </ul>
        </section>
      )}

      {/* 3. What You Can Do: Action Hub */}
      <section aria-labelledby="action-hub-title" className="space-y-3">
        <div>
          <h2 id="action-hub-title" className="text-base font-semibold text-admin-ink sm:text-lg">
            What can I do next?
          </h2>
          <p className="text-sm text-admin-muted">
            Direct shortcuts to manage client leads, update your site, and share your portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={markShared}
            className="group flex flex-col justify-between rounded-xl border border-admin-border bg-admin-surface p-4 transition-all hover:border-admin-primary hover:bg-admin-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary motion-reduce:transition-none"
          >
            <div>
              <span className="text-2xl" aria-hidden="true">💬</span>
              <h3 className="mt-3 text-sm font-semibold text-admin-ink group-hover:text-admin-primary">
                Share on WhatsApp
              </h3>
              <p className="mt-1 text-xs leading-5 text-admin-muted">
                Pre-composed message ready to send to clients with your live website link.
              </p>
            </div>
            <p className="mt-4 text-xs font-semibold text-admin-primary">
              Send message ➔
            </p>
          </a>

          <Link
            href={`/${tenant}/dashboard/content`}
            className="group flex flex-col justify-between rounded-xl border border-admin-border bg-admin-surface p-4 transition-all hover:border-admin-primary hover:bg-admin-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary motion-reduce:transition-none"
          >
            <div>
              <span className="text-2xl" aria-hidden="true">✏️</span>
              <h3 className="mt-3 text-sm font-semibold text-admin-ink group-hover:text-admin-primary">
                Edit Website Content
              </h3>
              <p className="mt-1 text-xs leading-5 text-admin-muted">
                Update headlines, case studies, service descriptions, and pricing calculator.
              </p>
            </div>
            <p className="mt-4 text-xs font-semibold text-admin-primary">
              Open Content Editor ➔
            </p>
          </Link>

          <Link
            href={`/${tenant}/dashboard/enquiries`}
            className="group flex flex-col justify-between rounded-xl border border-admin-border bg-admin-surface p-4 transition-all hover:border-admin-primary hover:bg-admin-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary motion-reduce:transition-none"
          >
            <div>
              <span className="text-2xl" aria-hidden="true">📥</span>
              <h3 className="mt-3 text-sm font-semibold text-admin-ink group-hover:text-admin-primary">
                Follow Up Enquiries
              </h3>
              <p className="mt-1 text-xs leading-5 text-admin-muted">
                {newLeadsCount > 0
                  ? `${newLeadsCount} new enquiries waiting for a reply or phone call.`
                  : 'Track and follow up with prospective clients.'}
              </p>
            </div>
            <p className="mt-4 text-xs font-semibold text-admin-primary">
              View Leads ➔
            </p>
          </Link>

          <Link
            href={`/${tenant}/dashboard/settings`}
            className="group flex flex-col justify-between rounded-xl border border-admin-border bg-admin-surface p-4 transition-all hover:border-admin-primary hover:bg-admin-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary motion-reduce:transition-none"
          >
            <div>
              <span className="text-2xl" aria-hidden="true">⚙️</span>
              <h3 className="mt-3 text-sm font-semibold text-admin-ink group-hover:text-admin-primary">
                Website Settings
              </h3>
              <p className="mt-1 text-xs leading-5 text-admin-muted">
                Configure WhatsApp integration, Meta sharing cards, and visitor tracking.
              </p>
            </div>
            <p className="mt-4 text-xs font-semibold text-admin-primary">
              Open Settings ➔
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}
