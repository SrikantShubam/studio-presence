'use client'

import { Badge, Button, Panel, PageHeading, buttonClass, monoClass } from './primitives'
import { EnquiryDesk } from './EnquiryDesk'
import { SAMPLE_CITIES, SAMPLE_TREND } from './demo-data'
import type { DashboardView, Enquiry, EnquiryFilters, WorkspaceData } from './types'

export default function OverviewTab({ data, filters, onFiltersChange, onNavigate, onCreate, onOpen }: {
  data: WorkspaceData; filters: EnquiryFilters; onFiltersChange: (filters: EnquiryFilters) => void
  onNavigate: (view: DashboardView, status?: EnquiryFilters['status']) => void; onCreate: () => void; onOpen: (item: Enquiry) => void
}) {
  const sample = data.mode === 'demo'
  const waiting = data.enquiries.filter((item) => item.status === 'new').length
  const open = data.enquiries.filter((item) => !['won', 'lost'].includes(item.status)).length
  const metrics = [
    { label: 'New enquiries', value: waiting, note: 'Awaiting first response', view: 'enquiries' },
    { label: 'Active pipeline', value: open, note: 'Open enquiries, not revenue', view: 'enquiries' },
    { label: 'Projects won', value: data.enquiries.filter((item) => item.status === 'won').length, note: 'Recorded in this desk', view: 'enquiries' },
    { label: 'Website visitors', value: sample ? '1,248' : '—', note: sample ? 'Sample September 2026' : 'Open analytics for live traffic', view: 'analytics' },
    { label: 'WhatsApp clicks', value: sample ? '86' : '—', note: sample ? 'Sample link clicks' : 'Click tracking unavailable', view: 'analytics' },
    { label: 'Digital card scans', value: sample ? '34' : '—', note: sample ? 'Sample scan count' : 'Scan tracking unavailable', view: 'card' },
  ] as const
  const areas = sample ? SAMPLE_CITIES : Object.entries(data.enquiries.reduce<Record<string, number>>((all, item) => { if (item.locality) all[item.locality] = (all[item.locality] ?? 0) + 1; return all }, {})).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6)
  return <>
    <PageHeading title="Your studio, at a glance." description="Start with the conversations that need you." action={<Badge>{sample ? 'Sample workspace' : data.config.business.name}</Badge>} />
    <div className="flex flex-wrap gap-2"><Button variant="primary" disabled={!data.canCreate || Boolean(data.leadError)} onClick={onCreate}>＋ Log walk-in lead</Button><Button onClick={() => onNavigate('card')}>Share studio card</Button><Button onClick={() => onNavigate('calculator')}>Tune pricing <span className={monoClass}>₹/sqft</span></Button><a className={buttonClass} href={`/${data.tenant}`} target="_blank" rel="noopener noreferrer">View public site ↗</a></div>
    {waiting > 0 && <section className="my-5 flex flex-wrap items-center justify-between gap-4 border border-admin-alert/30 border-l-2 border-l-admin-alert bg-admin-alert-soft p-4" aria-label="Enquiries awaiting response"><div><p className="font-semibold">{waiting} enquiries are waiting for a first response</p><p className="mt-1 text-[11px] text-admin-muted">A quick reply helps turn an enquiry into a site visit.</p></div><Button onClick={() => onNavigate('enquiries', 'new')}>Review new enquiries →</Button></section>}
    <section aria-label="Studio performance" className="my-5 grid grid-cols-2 gap-3 xl:grid-cols-3">{metrics.map((metric) => <button key={metric.label} onClick={() => onNavigate(metric.view)} className="min-w-0 border border-admin-border bg-admin-surface p-4 text-left hover:border-admin-muted focus-visible:outline-2 focus-visible:outline-admin-primary sm:p-5"><p className="text-xs font-medium">{metric.label}</p><p className={`${monoClass} my-3 text-[29px] tracking-tight`}>{data.mode === 'unavailable' || data.leadError ? '—' : metric.value}</p><p className="text-[10px] text-admin-muted">{metric.note}</p></button>)}</section>
    <div className="mb-6 grid gap-5 xl:grid-cols-[1.15fr_1fr]"><AttentionChart enquiries={data.enquiries} sample={sample} /><Panel title="Where your next project begins" description={sample ? 'Sample city demand. Select a row to explore.' : 'Enquiries by supplied locality / city.'}><div className="px-5 pb-5">{areas.length ? areas.map((area) => <button key={area.name} onClick={() => { onFiltersChange({ status: 'all', query: '', locality: area.name }); document.getElementById('enquiries')?.scrollIntoView({ block: 'start' }) }} className="grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-admin-border py-3 text-left" aria-label={`View ${area.name} enquiries`}><div><p className="text-xs font-medium">{area.name}</p><svg className="mt-2 h-1 w-full max-w-48" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="2" className="fill-admin-raised" /><rect width={area.count / Math.max(1, ...areas.map((item) => item.count)) * 100} height="2" className="fill-admin-muted" /></svg></div><span className={`${monoClass} text-xs`}>{area.count} →</span></button>) : <p className="py-8 text-xs text-admin-muted">No locality data available.</p>}</div></Panel></div>
    <EnquiryDesk enquiries={data.enquiries} filters={filters} onFiltersChange={onFiltersChange} onOpenEnquiry={onOpen} mode={data.mode} tenant={data.tenant} />
  </>
}

export function AttentionChart({ enquiries, sample, trend }: { enquiries: Enquiry[]; sample: boolean; trend?: { month: string; count: number }[] }) {
  const rows = sample ? SAMPLE_TREND : trend ?? Array.from({ length: 6 }, (_, index) => {
    const now = new Date(); const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1)); const key = date.toISOString().slice(0, 7)
    return { month: key, count: enquiries.filter((item) => item.created_at.startsWith(key)).length }
  })
  const max = Math.max(1, ...rows.map((row) => row.count))
  const points = rows.map((row, index) => `${30 + index * 90},${160 - row.count / max * 120}`).join(' ')
  return <Panel title="Attention into enquiries" description={sample ? 'Sample visits and enquiries, April to September 2026' : 'Recorded enquiry trend. Traffic history is not supplied.'} action={<Badge>{sample ? 'Sample' : 'Enquiries'}</Badge>}><div className="px-5 pb-5"><div className="my-4 flex gap-8"><div><p className={`${monoClass} text-xl`}>{rows.reduce((sum, row) => sum + row.count, 0)}</p><p className="text-[10px] text-admin-muted">Enquiries over six months</p></div>{sample && <div><p className={`${monoClass} text-xl`}>5,812</p><p className="text-[10px] text-admin-muted">Sample site visits</p></div>}</div><svg viewBox="0 0 510 195" className="w-full text-admin-ink" role="img" aria-label={rows.map((row) => `${row.month}: ${row.count} enquiries`).join('; ')}>{[40, 80, 120, 160].map((y) => <line key={y} x1="20" x2="495" y1={y} y2={y} className="stroke-admin-border" />)}<polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />{sample && <polyline points={SAMPLE_TREND.map((row, index) => `${30 + index * 90},${160 - row.visits / 1500 * 120}`).join(' ')} fill="none" className="stroke-admin-muted" strokeWidth="1.5" strokeDasharray="4 4" />}{rows.map((row, index) => <g key={row.month}><circle cx={30 + index * 90} cy={160 - row.count / max * 120} r="3" className="fill-admin-surface stroke-admin-ink"><title>{row.month}: {row.count} enquiries</title></circle><text x={30 + index * 90} y="187" textAnchor="middle" className="fill-admin-muted text-[10px]">{row.month.length > 3 ? row.month.slice(5) : row.month}</text></g>)}</svg><p className="mt-3 text-[10px] text-admin-muted">{sample ? 'Solid: enquiries (0–31). Dashed: visits (0–1,500). Sample series use separate scales.' : 'Monthly enquiry counts, grouped in UTC.'}</p></div></Panel>
}
