'use client'

import { useEffect, useState } from 'react'

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  open: 'Open now',
  closed: 'Closed',
  copyAddress: 'Copy address',
  copied: 'Copied',
}

type Hours = { weekday?: string; saturday?: string; sunday?: string } | undefined

/** "10:00 – 19:00" -> [600, 1140] in minutes. Returns null if it doesn't parse. */
function parseRange(text: string | undefined): [number, number] | null {
  if (!text) return null
  const match = text.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  const [, h1, m1, h2, m2] = match
  return [Number(h1) * 60 + Number(m1), Number(h2) * 60 + Number(m2)]
}

function openLabel(hours: Hours): string {
  if (!hours) return copy.closed
  const now = new Date()
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000)
  const day = ist.getDay()
  const mins = ist.getHours() * 60 + ist.getMinutes()

  const todayText = day === 0 ? hours.sunday : day === 6 ? hours.saturday : hours.weekday
  const range = parseRange(todayText)
  if (range && mins >= range[0] && mins < range[1]) return copy.open
  return todayText ? `${copy.closed} · ${todayText}` : copy.closed
}

export function OpenBadge({ hours }: { hours: Hours }) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    setLabel(openLabel(hours))
    const id = window.setInterval(() => setLabel(openLabel(hours)), 60_000)
    return () => window.clearInterval(id)
  }, [hours])

  if (!label) return null
  const open = label === copy.open

  return (
    <span className={`text-[10.5px] font-medium uppercase tracking-[0.22em] ${open ? 'text-accent' : 'text-muted'}`}>
      {label}
    </span>
  )
}

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(address)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1800)
        } catch {
          setCopied(false)
        }
      }}
      className="inline-flex min-h-11 items-center gap-2.5 border border-hairline px-6 py-[15px] text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-surface"
    >
      {copied ? copy.copied : copy.copyAddress}
    </button>
  )
}
