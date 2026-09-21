"use client";

import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { ArrowRight, ArrowUpRight, Check, Copy, Database, Download, ExternalLink, Globe, Link2, Loader2, Mail, MessageCircle, PanelsTopLeft, Phone, QrCode, Save, ShieldCheck } from "lucide-react";
import { Badge, Button, Dialog, Field, PageHeading } from "@/components/ui/primitives";
import { AttentionChart, CityDemand, MetricGrid } from "./OverviewTab";
import type { DashboardView, Enquiry, EnquiryFilters, StudioSettings } from "@/lib/types";
import { apiRequest, downloadFile, downloadVCard, errorMessage } from "@/lib/utils";
import { useCardURL } from "@/lib/browser-state";

type Notify = (message: string, kind?: "success" | "error") => void;

export function AnalyticsTab({ enquiries, onNavigate, onSelectCity }: { enquiries: Enquiry[]; onNavigate: (view: DashboardView, status?: EnquiryFilters["status"]) => void; onSelectCity: (city: string) => void }) {
  const sources = [{ name: "Estimate Calculator", count: 12 }, { name: "Website Direct Form", count: 9 }, { name: "Digital QR Card", count: 7 }, { name: "WhatsApp follow-up", count: 3 }];
  return <>
    <PageHeading title="Understand what brings work in." description="Sample September 2026 report. No live analytics connection." action={<Button onClick={() => downloadFile("september-2026-analytics.csv", "Metric,Value\r\nWebsite visitors,1248\r\nEnquiries,31\r\nWhatsApp clicks,86\r\nDigital card scans,34\r\nConversion rate,2.48%", "text/csv;charset=utf-8")}><Download />Export report</Button>} />
    <MetricGrid enquiries={enquiries} onNavigate={onNavigate} />
    <div className="overview-charts"><AttentionChart /><CityDemand onSelectCity={onSelectCity} /></div>
    <div className="grid gap-[22px] min-[1000px]:grid-cols-2"><section className="panel"><div className="panel-heading"><div><h2>Where actions started</h2><p className="panel-description">Recorded enquiry sources · September</p></div><Badge>Sample</Badge></div><div className="p-5">{sources.map((source) => <div key={source.name} className="border-b border-border py-3 last:border-b-0"><div className="mb-2 flex justify-between text-[12px]"><span>{source.name}</span><span className="font-mono">{source.count}</span></div><div className="h-1 bg-muted"><div className="h-full bg-foreground/60" style={{ width: `${source.count / 12 * 100}%` }} /></div></div>)}</div></section><section className="panel"><div className="panel-heading"><h2>A clearer picture, not just more numbers.</h2></div><div className="p-5"><p className="text-[12px] leading-6 text-muted-foreground">The sample shows how visits turn into conversations. WhatsApp clicks are link clicks, not access to a client’s private messages. Enquiry counts only include submitted or manually recorded briefs.</p><div className="my-5 border-y border-border py-5"><p className="text-[11px] text-muted-foreground">Visitor-to-enquiry conversion</p><p className="mt-2 font-mono text-[29px]">2.48<span className="text-[18px]">%</span></p></div><Button onClick={() => onNavigate("enquiries")}><ArrowRight />Open your enquiry desk</Button></div></section></div>
  </>;
}

export function DigitalCardTab({ settings, onShare, notify }: { settings: StudioSettings; onShare: () => void; notify: Notify }) {
  const url = useCardURL();
  const [qr, setQr] = useState("");
  const [qrError, setQrError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 600, margin: 2, errorCorrectionLevel: "M", color: { dark: "#18181b", light: "#ffffff" } }).then((image) => { if (!cancelled) setQr(image); }).catch(() => { if (!cancelled) setQrError(true); });
    return () => { cancelled = true; };
  }, [url]);
  async function exportQR() {
    try { downloadFile("ashish-interiors-qr.svg", await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M" }), "image/svg+xml"); notify("Print-ready QR downloaded"); }
    catch { notify("The QR could not be generated. Please try again.", "error"); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(url); notify("Public card URL copied"); }
    catch { notify("Copy the address from the card URL field below.", "error"); }
  }
  return <>
    <PageHeading title="A small card. A useful first connection." description="Give visitors one place to contact you and share their project." />
    <div className="grid items-start gap-[22px] min-[1000px]:grid-cols-2">
      <section className="panel"><div className="panel-heading"><h2>Your studio card</h2><Badge>Public preview</Badge></div><div className="p-5"><StudioCard settings={settings} compact /><div className="mt-5 flex flex-wrap gap-2"><Button variant="primary" onClick={onShare}><MessageCircle />Share studio card</Button><a className="btn" href="/card" target="_blank" rel="noopener noreferrer">Visitor preview<ArrowUpRight /></a></div></div></section>
      <section className="panel"><div className="panel-heading"><div><h2>From a scan to a conversation</h2><p className="panel-description">For your studio desk, visiting card, or brochure</p></div><QrCode /></div><div className="p-5"><div className="mx-auto my-5 grid aspect-square w-[220px] place-items-center border border-border bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr ? <img src={qr} width={220} height={220} alt="QR code linking to the Ashish Interiors public contact card" /> : <span className="p-5 text-center text-[11px] text-muted-foreground">{qrError ? "QR unavailable. Use the card link below." : "Preparing your QR…"}</span>}
      </div><Field label="Public card URL"><input readOnly value={url} onFocus={(event) => event.target.select()} /></Field><div className="mt-4 flex flex-wrap gap-2"><Button onClick={copy}><Copy />Copy link</Button><Button onClick={exportQR}><Download />Download print QR</Button></div><p className="mt-5 text-[10px] leading-5 text-muted-foreground">This is a real, scannable QR for your public card. The overview scan count is sample analytics, not a live counter.</p></div></section>
    </div>
  </>;
}

export function StudioCard({ settings, compact = false }: { settings: StudioSettings; compact?: boolean }) {
  return <div className={`border border-border bg-muted/20 ${compact ? "p-6" : "p-8"}`}>
    <span className="mb-7 grid size-11 place-items-center bg-primary text-primary-foreground"><PanelsTopLeft className="!size-5" /></span>
    <p className="mb-2 text-[10px] uppercase tracking-[1.5px] text-muted-foreground">Interior design · {settings.city}</p>
    <h1>{settings.name}</h1><p className="mb-7 mt-2 text-[12px] text-muted-foreground">{settings.tagline}</p>
    <div className="grid gap-2.5"><a className="btn !justify-start" href={`https://wa.me/${settings.phone}?text=${encodeURIComponent("Hello, I'd like to discuss a project with your studio.")}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="text-success" />Start a WhatsApp conversation<ArrowUpRight className="ml-auto" /></a><a className="btn !justify-start" href={`tel:+${settings.phone}`}><Phone />Call the studio<ArrowUpRight className="ml-auto" /></a><a className="btn !justify-start" href={`mailto:${settings.email}`}><Mail />Email us<ArrowUpRight className="ml-auto" /></a><a className="btn btn-primary !justify-start" href="/site#contact"><ArrowRight />Send a project brief</a></div>
    <button onClick={() => downloadVCard(settings)} className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground"><Download className="!size-3.5" />Save contact to your phone</button>
  </div>;
}

export function ShareCardDialog({ open, onClose, settings, notify }: { open: boolean; onClose: () => void; settings: StudioSettings; notify: Notify }) {
  const url = useCardURL();
  return <Dialog open={open} onClose={onClose} title="Share your studio card" eyebrow="A warmer first introduction"><div className="p-6"><p className="mb-6 text-[12px] leading-6 text-muted-foreground">Send the public card link through WhatsApp, or download a contact file to attach yourself.</p><div className="mb-5 border border-border bg-muted/30 p-4"><p className="font-semibold">{settings.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{settings.tagline}</p><p className="mt-3 break-all text-[10px] text-muted-foreground">{url}</p></div><div className="grid gap-3"><a className="btn btn-primary" href={`https://wa.me/?text=${encodeURIComponent(`Hello! Here is our studio card — ${settings.name}: ${url}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle />Share on WhatsApp<ArrowUpRight /></a><Button onClick={() => { downloadVCard(settings); notify("Studio contact file downloaded"); }}><Download />Download contact (.vcf)</Button><Button onClick={async () => { try { await navigator.clipboard.writeText(url); notify("Studio card link copied"); } catch { notify("Select and copy the link shown above.", "error"); } }}><Link2 />Copy card link</Button></div><p className="mt-5 text-[10px] text-muted-foreground">The link opens your public studio card. No private client information is shared.</p></div></Dialog>;
}

export function SettingsTab({ initialSettings, onSaved }: { initialSettings: StudioSettings; onSaved: (settings: StudioSettings) => void }) {
  const [settings, setSettings] = useState(initialSettings);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  function update<K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) { setSettings((previous) => ({ ...previous, [key]: value })); setSaved(false); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    try { const result = await apiRequest<{ settings: StudioSettings }>("/api/workspace", "PATCH", { kind: "settings", data: settings }); onSaved(result.settings); setSaved(true); }
    catch (error) { setError(errorMessage(error)); }
    finally { setPending(false); }
  }
  return <><PageHeading title="Your studio. Your workspace." description="Keep public details, account access and lead routing separate." /><form onSubmit={submit}><div className="grid items-start gap-[22px] min-[1000px]:grid-cols-2">
    <section className="panel"><div className="panel-heading"><div><h2>Public studio details</h2><p className="panel-description">Used on your website and digital card</p></div><Globe /></div><div className="grid gap-4 p-5">{([{ key: "name", label: "Studio name" }, { key: "tagline", label: "Studio tagline" }, { key: "city", label: "Studio city" }, { key: "domain", label: "Website domain" }, { key: "email", label: "Public email", type: "email" }, { key: "phone", label: "Studio phone (with country code)", type: "tel" }] as const).map((field) => <Field key={field.key} label={field.label}><input required type={"type" in field ? field.type : "text"} value={settings[field.key]} maxLength={254} onChange={(event) => update(field.key, event.target.value)} /></Field>)}<p className="text-[10px] text-muted-foreground">Your domain is a display setting. Hosting and DNS must be configured separately.</p></div></section>
    <div className="grid gap-[22px]"><section className="panel"><div className="panel-heading"><h2>Workspace owner</h2><ShieldCheck /></div><div className="grid gap-4 p-5"><Field label="Owner name"><input required maxLength={80} value={settings.ownerName} onChange={(event) => update("ownerName", event.target.value)} /></Field><Field label="Lead notification email"><input required type="email" value={settings.alerts} onChange={(event) => update("alerts", event.target.value)} /></Field><p className="text-[10px] leading-5 text-muted-foreground">This is a shared sample workspace. Account authentication and team invitations are not enabled.</p></div></section>
    <section className="panel"><div className="panel-heading"><h2>Notification preferences</h2></div><div className="p-5"><label className="flex items-center justify-between gap-5 border-b border-border py-3"><span>New enquiry alerts</span><input type="checkbox" checked={settings.alertNew} onChange={(event) => update("alertNew", event.target.checked)} /></label><label className="flex items-center justify-between gap-5 py-3"><span>Weekly studio digest</span><input type="checkbox" checked={settings.alertDigest} onChange={(event) => update("alertDigest", event.target.checked)} /></label><p className="mt-3 text-[10px] leading-5 text-muted-foreground">Preferences are saved. Email delivery requires a configured email provider; no emails are sent from this sample workspace.</p></div></section></div>
    </div><div className="mt-5 flex items-center gap-4"><Button variant="primary" type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />}{pending ? "Saving…" : "Save workspace settings"}</Button>{saved && <span role="status" className="flex items-center gap-1 text-[12px] text-success"><Check />Workspace settings saved</span>}</div>{error && <p role="alert" className="mt-3 text-destructive">{error}</p>}</form></>;
}

export function IntegrationsTab({ onNavigate }: { onNavigate: (view: DashboardView) => void }) {
  return <><PageHeading title="Connect the tools behind your website." description="A clear view of what's connected, and what stays private." /><div className="grid gap-[22px] min-[1000px]:grid-cols-2">
    <section className="panel"><div className="panel-heading"><div className="flex items-center gap-2"><Database /><h2>Workspace database</h2></div><Badge className="text-success">Connected</Badge></div><div className="p-5"><p className="mb-5 text-[12px] leading-6 text-muted-foreground">PostgreSQL stores your enquiries, private notes, pricing, website drafts, and published content. Changes persist when you return.</p><a className="btn" href="/api/health" target="_blank" rel="noopener noreferrer"><ShieldCheck />Check connection<ExternalLink /></a></div></section>
    <section className="panel"><div className="panel-heading"><div className="flex items-center gap-2"><MessageCircle /><h2>WhatsApp click-to-chat</h2></div><Badge className="text-success">Ready</Badge></div><div className="p-5"><p className="mb-5 text-[12px] leading-6 text-muted-foreground">Contact links use your studio phone number. Your private conversations are never read or imported. No WhatsApp API credentials are needed.</p><Button onClick={() => onNavigate("settings")}>Manage studio phone<ArrowRight /></Button></div></section>
    <section className="panel"><div className="panel-heading"><div className="flex items-center gap-2"><Globe /><h2>Website analytics</h2></div><Badge>Sample data</Badge></div><div className="p-5"><p className="mb-5 text-[12px] leading-6 text-muted-foreground">The dashboard displays the Concept 03 sample report. Connect a consent-aware analytics provider in your deployment before using this as a live traffic report.</p><Button onClick={() => onNavigate("analytics")}>Explore sample report<ArrowRight /></Button></div></section>
    <section className="panel"><div className="panel-heading"><div className="flex items-center gap-2"><Mail /><h2>Notification delivery</h2></div><Badge>Not connected</Badge></div><div className="p-5"><p className="mb-5 text-[12px] leading-6 text-muted-foreground">Set your routing address and preferences now. Email delivery must be configured server-side. Never paste API keys or production secrets into this workspace.</p><Button onClick={() => onNavigate("settings")}>Review notification preferences<ArrowRight /></Button></div></section>
  </div></>;
}
