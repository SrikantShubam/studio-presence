'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AttentionChart } from './OverviewTab'
import { Button, Badge, Field, Feedback, Panel, PageHeading, buttonClass, inputClass, monoClass } from './primitives'
import { contactPhone, csvCell, downloadFile, errorMessage, normalizeIndianPhone, vCard, type Analytics, type DashboardView, type Mode, type SaveConfig, type WorkspaceConfig, type WorkspaceData } from './types'

export function AnalyticsTab({ data }: { data: WorkspaceData }) {
  const [report, setReport] = useState<Analytics | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(data.mode === 'live')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (data.mode !== 'live') return
    const controller = new AbortController()
    setLoading(true); setError('')
    fetch(`/api/${encodeURIComponent(data.tenant)}/analytics`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Live analytics are unavailable. Try again later.')
      setReport(await response.json() as Analytics)
    }).catch((error: unknown) => { if (!controller.signal.aborted) setError(errorMessage(error)) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [data.tenant, data.mode, attempt])
  const sample = data.mode === 'demo'
  const visitors = sample ? 1248 : report?.visitStats?.thisMonth
  const enquiries = sample ? 31 : report?.enquiryStats.thisMonth
  const rows = [['Visitors this month', visitors?.toString() ?? 'Unavailable'], ['Enquiries this month', enquiries?.toString() ?? 'Unavailable']]
  return <><PageHeading title="Understand what brings work in." description={sample ? 'Sample September 2026 report. No live traffic is implied.' : 'Traffic from Umami and recorded website enquiries.'} action={<Button disabled={loading || (!sample && !report)} onClick={() => downloadFile(`${data.tenant}-${sample ? 'sample' : 'live'}-analytics.csv`, rows.map((row) => row.map(csvCell).join(',')).join('\r\n'), 'text/csv;charset=utf-8')}>Export report</Button>} /><Feedback error={error} message={loading ? 'Loading analytics…' : undefined} />{error && <Button onClick={() => setAttempt((value) => value + 1)}>Retry analytics</Button>}<div className="mb-5 grid gap-4 sm:grid-cols-2">{rows.map(([label, value]) => <Panel key={label} title={label!}><p className={`${monoClass} p-5 text-3xl`}>{value}</p></Panel>)}</div>{(sample || report) && <AttentionChart enquiries={data.enquiries} sample={sample} trend={report?.monthlyTrend} />}<div className="mt-5"><Panel title="Traffic connection"><p className="px-5 pb-5 text-xs leading-6 text-admin-muted">{sample ? 'All traffic and scan counts in this report are sample values.' : report?.visitStats ? 'Visitor totals were returned by the analytics service.' : 'Visitor totals are unavailable. No sample numbers are substituted.'} WhatsApp link clicks do not provide access to private conversations.</p></Panel></div>{report && report.topProjects.length > 0 && <div className="mt-5"><Panel title="Most viewed projects"><ul className="px-5 pb-5">{report.topProjects.map((project) => <li key={project.slug} className="flex justify-between gap-4 border-t border-admin-border py-3"><span>{project.title}</span><span className={monoClass}>{project.views}</span></li>)}</ul></Panel></div>}</>
}

export function SettingsTab({ config, mode, canEdit, onSave }: { config: WorkspaceConfig; mode: Mode; canEdit: boolean; onSave: SaveConfig }) {
  const [business, setBusiness] = useState(config.business)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    const phone = normalizeIndianPhone(business.phone); const whatsapp = normalizeIndianPhone(business.whatsapp)
    if (!phone || !whatsapp) { setError('Phone and WhatsApp must be valid Indian mobile numbers.'); return }
    setPending(true)
    try {
      const patch: Record<string, unknown> = { 'business.tagline': business.tagline ?? '', 'business.ownerName': business.ownerName ?? '', 'business.phone': `+${phone}`, 'business.whatsapp': `+${whatsapp}`, 'business.address': business.address, 'business.hours': business.hours ?? '' }
      if (business.email) patch['business.email'] = business.email
      await onSave(patch)
      setMessage(mode === 'demo' ? 'Sample settings saved in this browser.' : 'Studio details saved to the website.')
    } catch (error) { setError(errorMessage(error)) }
    finally { setPending(false) }
  }
  return <><PageHeading title="Your studio. Your workspace." description="Update the contact details your customers see." /><form onSubmit={save}><Panel title="Public studio details" description="Studio name and domain are managed by your operator."><fieldset disabled={!canEdit || pending} className="grid gap-5 p-5 sm:grid-cols-2"><Field label="Studio name"><input className={inputClass} value={business.name} readOnly /></Field>{([{ key: 'tagline', label: 'Studio tagline' }, { key: 'ownerName', label: 'Owner name' }, { key: 'phone', label: 'Studio phone', type: 'tel' }, { key: 'whatsapp', label: 'WhatsApp number', type: 'tel' }, { key: 'email', label: 'Public email', type: 'email' }, { key: 'hours', label: 'Opening hours' }] as const).map((field) => <Field key={field.key} label={field.label}><input className={inputClass} maxLength={250} type={'type' in field ? field.type : 'text'} required={field.key === 'phone' || field.key === 'whatsapp'} value={business[field.key] ?? ''} onChange={(event) => setBusiness({ ...business, [field.key]: event.target.value })} /></Field>)}<Field label="City"><input className={inputClass} required value={business.address.city} onChange={(event) => setBusiness({ ...business, address: { ...business.address, city: event.target.value } })} /></Field><Button type="submit" variant="primary">{pending ? 'Saving…' : mode === 'demo' ? 'Save sample settings' : 'Save studio details'}</Button></fieldset></Panel><Feedback error={error} message={message} /></form></>
}

export function IntegrationsTab({ data, onNavigate }: { data: WorkspaceData; onNavigate: (view: DashboardView) => void }) {
  const items = [
    { title: 'Workspace access', status: data.mode === 'live' ? 'Tenant authorized' : data.mode === 'demo' ? 'Local sample mode' : 'Enquiries unavailable', description: 'Private lead reads and updates use the signed-in tenant account.', view: 'enquiries' },
    { title: 'WhatsApp click-to-chat', status: contactPhone(data.config.business.whatsapp) ? 'Number configured' : 'Number unavailable', description: 'Public contact links open WhatsApp. Private conversations are not read or imported.', view: 'settings' },
    { title: 'Website analytics', status: data.config.integrations.umami.enabled ? 'Configured; check report' : 'Not configured', description: 'The report shows unavailable when the analytics service cannot return data.', view: 'analytics' },
    { title: 'Lead notifications', status: 'Delivery not verified', description: 'Notifications use the existing server-side delivery service. This screen does not verify inbox delivery.', view: 'settings' },
  ] as const
  return <><PageHeading title="The tools behind your website." description="Configuration and verified delivery are shown separately." /><div className="grid gap-5 xl:grid-cols-2">{items.map((item) => <Panel key={item.title} title={item.title} action={<Badge>{item.status}</Badge>}><div className="p-5"><p className="mb-5 text-xs leading-6 text-admin-muted">{item.description}</p><Button onClick={() => onNavigate(item.view)}>Open {item.view} →</Button></div></Panel>)}</div></>
}

export function DigitalCardTab({ config, tenant }: { config: WorkspaceConfig; tenant: string }) {
  const [url, setURL] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(() => { setURL(new URL(`/${tenant}`, window.location.origin).href) }, [tenant])
  let cells: boolean[][] = []
  let qrError = ''
  if (url) { try { cells = qrMatrix(url) } catch (error) { qrError = errorMessage(error) } }
  const phone = contactPhone(config.business.phone)
  const whatsapp = contactPhone(config.business.whatsapp)
  async function copy() {
    try { await navigator.clipboard.writeText(url); setMessage('Public website link copied.'); setError('') }
    catch { setError('Clipboard unavailable. Select and copy the URL below.') }
  }
  function exportQR() {
    const svg = svgRef.current
    if (!svg) return
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.querySelectorAll('[class]').forEach((node, index) => {
      const original = svg.querySelectorAll('[class]')[index]!
      node.setAttribute('fill', getComputedStyle(original).fill); node.removeAttribute('class')
    })
    clone.removeAttribute('class'); clone.setAttribute('width', '450'); clone.setAttribute('height', '450')
    downloadFile(`${tenant}-website-qr.svg`, new XMLSerializer().serializeToString(clone), 'image/svg+xml')
  }
  return <><PageHeading title="A small card. A useful first connection." description="Share your public website or download your studio contact." /><div className="grid items-start gap-5 xl:grid-cols-2"><Panel title="Your studio card"><div className="p-5"><div className="border border-admin-border bg-admin-bg p-6"><p className="mb-2 text-[10px] uppercase tracking-wider text-admin-muted">{config.business.address.city}</p><h2 className="text-2xl font-semibold">{config.business.name}</h2><p className="my-5 text-xs text-admin-muted">{config.business.tagline}</p><div className="grid gap-3">{whatsapp && <a className={buttonClass} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Start a WhatsApp conversation ↗</a>}{phone && <a className={buttonClass} href={`tel:+${phone}`}>Call the studio</a>}{config.business.email && <a className={buttonClass} href={`mailto:${config.business.email}`}>Email the studio</a>}<a className={buttonClass} href={`/${tenant}`} target="_blank" rel="noopener noreferrer">View public website ↗</a></div></div><div className="mt-5 flex flex-wrap gap-2"><Button disabled={!url} onClick={() => downloadFile(`${tenant}.vcf`, vCard(config, url), 'text/vcard;charset=utf-8')}>Download contact (.vcf)</Button>{url && <a className={buttonClass} href={`https://wa.me/?text=${encodeURIComponent(`${config.business.name}: ${url}`)}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp ↗</a>}</div></div></Panel><Panel title="From a scan to a conversation" description="This QR opens your tenant's public website."><div className="p-5">{cells.length > 0 && <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" shapeRendering="crispEdges" role="img" aria-label={`QR code for ${config.business.name}`} className="mx-auto mb-6 h-56 w-56"><rect width="45" height="45" className="fill-admin-surface" /><path className="fill-admin-ink" d={cells.flatMap((row, y) => row.flatMap((dark, x) => dark ? [`M${x + 4},${y + 4}h1v1h-1z`] : [])).join('')} /></svg>}<Feedback error={qrError} /><Field label="Public website URL"><input className={inputClass} readOnly value={url} onFocus={(event) => event.target.select()} /></Field><div className="mt-4 flex flex-wrap gap-2"><Button disabled={!url} onClick={copy}>Copy link</Button><Button disabled={!cells.length} onClick={exportQR}>Download QR SVG</Button></div><Feedback error={error} message={message} /><p className="mt-5 text-[10px] leading-5 text-admin-muted">Only public studio details are exported. Scan counts are unavailable unless tracking is connected.</p></div></Panel></div></>
}

/** QR Model 2, version 5-L, byte mode, mask 0. One RS block: 108 data + 26 parity bytes. */
export function qrMatrix(value: string): boolean[][] {
  const bytes = new TextEncoder().encode(value)
  if (bytes.length > 106) throw new Error('This URL is too long for the print QR. Use a shorter public domain or copy the link.')
  const bits: number[] = []
  const append = (value: number, count: number) => { for (let i = count - 1; i >= 0; i--) bits.push((value >>> i) & 1) }
  append(4, 4); append(bytes.length, 8)
  for (const byte of bytes) append(byte, 8)
  append(0, Math.min(4, 864 - bits.length))
  while (bits.length % 8) bits.push(0)
  const words: number[] = []
  for (let i = 0; i < bits.length; i += 8) words.push(bits.slice(i, i + 8).reduce((sum, bit) => sum * 2 + bit, 0))
  for (let i = 0; words.length < 108; i++) words.push(i % 2 ? 17 : 236)
  function multiply(a: number, b: number) {
    let result = 0
    for (let i = 7; i >= 0; i--) { result = (result << 1) ^ ((result >>> 7) * 285); result ^= ((b >>> i) & 1) * a }
    return result
  }
  const divisor = new Array<number>(26).fill(0); divisor[25] = 1
  let root = 1
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) { divisor[j] = multiply(divisor[j]!, root); if (j + 1 < 26) divisor[j] = divisor[j]! ^ divisor[j + 1]! }
    root = multiply(root, 2)
  }
  const remainder = new Array<number>(26).fill(0)
  for (const byte of words) {
    const factor = byte ^ remainder.shift()!; remainder.push(0)
    for (let j = 0; j < 26; j++) remainder[j] = remainder[j]! ^ multiply(divisor[j]!, factor)
  }
  const stream = [...words, ...remainder].flatMap((byte) => Array.from({ length: 8 }, (_, i) => (byte >>> (7 - i)) & 1))
  const size = 37
  const grid = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  function set(x: number, y: number, dark: boolean) { if (x >= 0 && x < size && y >= 0 && y < size) { grid[y]![x] = dark; reserved[y]![x] = true } }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const distance = Math.max(Math.abs(dx), Math.abs(dy)); set(cx! + dx, cy! + dy, distance !== 2 && distance !== 4) }
  }
  for (let i = 8; i < size - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0) }
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(30 + dx, 30 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
  let format = 8
  for (let i = 0; i < 10; i++) format = (format << 1) ^ ((format >>> 9) * 1335)
  format = ((8 << 10) | format) ^ 21522
  const bit = (i: number) => ((format >>> i) & 1) !== 0
  for (let i = 0; i <= 5; i++) set(8, i, bit(i))
  set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8))
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i))
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i))
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i))
  set(8, size - 8, true)
  let index = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vertical = 0; vertical < size; vertical++) for (let offset = 0; offset < 2; offset++) {
      const x = right - offset; const y = ((right + 1) & 2) === 0 ? size - 1 - vertical : vertical
      if (!reserved[y]![x]) { grid[y]![x] = Boolean((stream[index] ?? 0) ^ ((x + y) % 2 === 0 ? 1 : 0)); index++ }
    }
  }
  return grid
}
