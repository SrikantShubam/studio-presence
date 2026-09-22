"use client";

import { ArrowRight, Bell, BriefcaseBusiness, Phone, Clock3, Download, Globe, Mail, MessageCircle, PanelsTopLeft, QrCode, ScanLine, ShieldCheck, Users } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AttentionChart } from "./OverviewTab";
import { SAMPLE_CITIES, SAMPLE_PAGE_BREAKDOWN, SAMPLE_SOURCES } from "./demo-data";
import {
  Button,
  Badge,
  Field,
  Feedback,
  Panel,
  PageHeading,
  buttonClass,
  inputClass,
  monoClass,
} from "./primitives";
import {
  contactPhone,
  csvCell,
  downloadFile,
  errorMessage,
  normalizeIndianPhone,
  vCard,
  type Analytics,
  type DashboardView,
  type Mode,
  type SaveConfig,
  type WorkspaceConfig,
  type WorkspaceData,
} from "./types";

export function AnalyticsTab({
  data,
  onNavigate,
}: {
  data: WorkspaceData;
  onNavigate: (view: DashboardView) => void;
}) {
  const [report, setReport] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(data.mode === "live");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (data.mode !== "live") return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/" + encodeURIComponent(data.tenant) + "/analytics", {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Live analytics are unavailable. Try again later.");
        setReport((await response.json()) as Analytics);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [data.tenant, data.mode, attempt]);

  const sample = data.mode === "demo";
  const visitors = sample ? "1,248" : report?.visitStats?.thisMonth.toLocaleString("en-IN") ?? "Unavailable";
  const enquiries = sample ? "31" : report?.enquiryStats.thisMonth.toLocaleString("en-IN") ?? "Unavailable";
  const summaryRows = [
    { label: "New enquiries", value: enquiries, detail: "+55%", icon: BriefcaseBusiness },
    { label: "Active pipeline", value: sample ? "₹46.5L" : "Unavailable", detail: "6 open sample enquiries", icon: BriefcaseBusiness },
    { label: "First response", value: sample ? "24 min" : "Unavailable", detail: "2 awaiting contact", icon: Clock3 },
    { label: "Website visitors", value: visitors, detail: "+18%", icon: Users },
    { label: "WhatsApp clicks", value: sample ? "86" : "Unavailable", detail: "Top action channel", icon: MessageCircle },
    { label: "Digital card scans", value: sample ? "34" : "Unavailable", detail: "+42%", icon: ScanLine },
  ] as const;
  const pageRows = sample
    ? SAMPLE_PAGE_BREAKDOWN
    : (report?.topProjects.map((project) => ({
        page: project.title,
        views: project.views,
        enquiries: null,
      })) ?? []);
  const barSpans = ["col-span-12", "col-span-9", "col-span-7", "col-span-5", "col-span-4"];

  return (
    <>
      <PageHeading
        title="Understand what brings work in."
        description={sample ? "Candidate sample report for September 2026." : "Traffic from Umami and recorded website enquiries."}
        action={
          <Button
            disabled={loading || (!sample && !report)}
            onClick={() =>
              downloadFile(
                data.tenant + "-" + (sample ? "sample" : "live") + "-analytics.csv",
                summaryRows.map((row) => [row.label, row.value].map(csvCell).join(",")).join("\r\n"),
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download aria-hidden="true" className="size-4" />
            Export report
          </Button>
        }
      />
      <Feedback error={error} message={loading ? "Loading analytics…" : undefined} />
      {error && <Button onClick={() => setAttempt((value) => value + 1)}>Retry analytics</Button>}
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-3">
        {summaryRows.map((metric) => {
          const Icon = metric.icon;
          return (
            <Panel key={metric.label} title={metric.label} action={<Icon aria-hidden="true" className="size-4 text-admin-muted" />}>
              <div className="p-4 sm:p-5">
                <p className={monoClass + " text-[clamp(20px,3vw,28px)]"}>{metric.value}</p>
                <div className="mt-3 flex min-h-5 items-center justify-between gap-2 text-[10px] text-admin-muted">
                  <span className="truncate">{metric.detail}</span>
                  <span className="shrink-0 border border-admin-border bg-admin-raised px-1.5 py-1 text-admin-ink">{metric.detail.startsWith("+") ? metric.detail : "Details"}</span>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
      {(sample || report) && (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <AttentionChart enquiries={data.enquiries} sample={sample} trend={report?.monthlyTrend} />
          <CityDemandPanel data={data} onNavigate={onNavigate} />
        </div>
      )}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Where actions started" description="Recorded enquiry sources · September" action={sample ? <Badge>September</Badge> : undefined}>
          <div className="px-5 pb-5">
            {sample ? SAMPLE_SOURCES.map((source, index) => (
              <div key={source.name} className="border-t border-admin-border py-3 first:border-t-0 first:pt-0">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span>{source.name}</span><span className={monoClass}>{source.count}</span>
                </div>
                <div className="grid h-1 grid-cols-12 bg-admin-raised"><span className={barSpans[index] + " bg-admin-ink/60"} /></div>
              </div>
            )) : <p className="text-xs leading-6 text-admin-muted">Source attribution is unavailable for this workspace.</p>}
          </div>
        </Panel>
        <Panel title="A clearer picture, not just more numbers.">
          <div className="px-5 pb-5">
            <p className="text-xs leading-6 text-admin-muted">
              {sample ? "The sample shows how visits turn into conversations. WhatsApp clicks are link clicks, not access to private messages. Enquiry counts include submitted and manually recorded briefs." : "Traffic totals and recorded enquiries are kept separate from private client conversations."}
            </p>
            <div className="my-5 border-y border-admin-border py-5">
              <p className="text-[11px] text-admin-muted">Visitor-to-enquiry conversion</p>
              <p className={monoClass + " mt-2 text-[29px]"}>{sample ? "2.48" : "—"}<span className="text-[18px]">%</span></p>
            </div>
            <Button onClick={() => onNavigate("enquiries")}><ArrowRight aria-hidden="true" className="size-4" />Open your enquiry desk</Button>
          </div>
        </Panel>
      </div>
      {pageRows.length > 0 && (
        <div className="mt-5">
          <Panel title="Traffic by page" description="Page views and recorded enquiries.">
            <div className="border-b border-admin-border px-5 pb-5 pt-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.14em] text-admin-muted">Top visited pages</p>
              <div className="grid gap-3" role="img" aria-label="Horizontal bar chart of the top visited pages">
                {[...pageRows].sort((a, b) => b.views - a.views).slice(0, 5).map((page, index) => {
                  const widths = ["w-full", "w-3/4", "w-1/2", "w-1/3", "w-1/4"];
                  return <div key={page.page} className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)_4rem] items-center gap-3 text-xs">
                    <span className="truncate">{page.page}</span>
                    <span className="h-2 bg-admin-raised"><span className={`block h-2 bg-admin-ink/60 ${widths[index] ?? "w-1/4"}`} /></span>
                    <span className={monoClass + " text-right"}>{page.views.toLocaleString("en-IN")}</span>
                  </div>;
                })}
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                <thead className="border-y border-admin-border bg-admin-bg text-[10px] text-admin-muted">
                  <tr><th scope="col" className="px-5 py-3 font-medium">Page</th><th scope="col" className="px-5 py-3 text-right font-medium">Views</th><th scope="col" className="px-5 py-3 text-right font-medium">Enquiries</th></tr>
                </thead>
                <tbody>
                  {pageRows.map((page, index) => (
                    <tr key={page.page} className="border-b border-admin-border last:border-b-0">
                      <td className="px-5 py-3 font-medium"><span>{page.page}</span><div className="mt-2 grid h-1 grid-cols-12 bg-admin-raised"><span className={barSpans[index] + " bg-admin-ink/60"} /></div></td>
                      <td className={monoClass + " px-5 py-3 text-right"}>{page.views.toLocaleString("en-IN")}</td>
                      <td className={monoClass + " px-5 py-3 text-right"}>{page.enquiries ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}


function CityDemandPanel({ data, onNavigate }: { data: WorkspaceData; onNavigate: (view: DashboardView) => void }) {
  const sample = data.mode === "demo";
  const cityBars = ["w-full", "w-1/3", "w-1/4", "w-1/6", "w-1/6", "w-1/12"];
  return (
    <Panel title="Where your next project begins" description="City demand · visits and enquiries" action={sample ? <Badge>September</Badge> : undefined}>
      <div className="px-5 pb-5">
        {sample ? SAMPLE_CITIES.map((city, index) => (
          <button key={city.name} type="button" className="grid w-full grid-cols-[minmax(0,1fr)_4rem_4rem] items-center gap-3 border-t border-admin-border py-3 text-left first:border-t-0" onClick={() => onNavigate("enquiries")}>
            <span className="min-w-0"><span className="block truncate text-xs font-semibold">{city.name}</span><span className="mt-2 block h-1 max-w-44 bg-admin-raised"><span className={"block h-1 bg-admin-ink/60 " + (cityBars[index] ?? "w-1/12")} /></span></span>
            <span className={monoClass + " text-right text-xs"}>{city.visits}</span>
            <span className={monoClass + " text-right text-xs"}>{city.enquiries}</span>
          </button>
        )) : <p className="py-8 text-xs text-admin-muted">City attribution is unavailable for this workspace.</p>}
        {sample && <Button className="mt-3" onClick={() => onNavigate("enquiries")}>Open enquiry desk <ArrowRight aria-hidden="true" className="size-4" /></Button>}
      </div>
    </Panel>
  );
}

export function SettingsTab({
  config,
  ownerEmail,
  mode,
  canEdit,
  onSave,
}: {
  config: WorkspaceConfig;
  ownerEmail: string;
  mode: Mode;
  canEdit: boolean;
  onSave: SaveConfig;
}) {
  const [edits, setEdits] = useState<Partial<WorkspaceConfig["business"]>>({});
  const business = { ...config.business, ...edits };
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newLeadAlerts, setNewLeadAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const phone = normalizeIndianPhone(business.phone);
    const whatsapp = normalizeIndianPhone(business.whatsapp);
    if (!phone || !whatsapp) {
      setError("Phone and WhatsApp must be valid Indian mobile numbers.");
      return;
    }
    if (config.business.email && !business.email?.trim()) {
      setError(
        "Enter a replacement email. Removing the public email requires your operator.",
      );
      return;
    }
    setPending(true);
    try {
      const patch: Record<string, unknown> = Object.fromEntries(
        Object.entries(edits).map(([key, value]) => [`business.${key}`, value]),
      );
      if ("phone" in edits) patch["business.phone"] = `+${phone}`;
      if ("whatsapp" in edits) patch["business.whatsapp"] = `+${whatsapp}`;
      await onSave(patch);
      setEdits({});
      setMessage(
        mode === "demo"
          ? "Sample settings saved in this browser."
          : "Studio details saved to the website.",
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <PageHeading title="Your studio. Your workspace." description="Update the contact details your customers see." />
      <form onSubmit={save}>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <Panel title="Public studio details" description="Studio name and domain are managed by your operator." action={<Globe aria-hidden="true" className="size-4 text-admin-muted" />}>
            <fieldset disabled={!canEdit || pending} className="grid gap-5 p-5 sm:grid-cols-2">
              <Field label="Studio name"><input className={inputClass} value={business.name} readOnly /></Field>
              {([
                { key: "tagline", label: "Studio tagline" },
                { key: "phone", label: "Studio phone", type: "tel" },
                { key: "whatsapp", label: "WhatsApp number", type: "tel" },
                { key: "email", label: "Public email", type: "email" },
                { key: "hours", label: "Opening hours" },
              ] as const).map((field) => (
                <Field key={field.key} label={field.label} hint={field.key === "phone" || field.key === "whatsapp" ? "Include country code, for example +91 99999 99999." : undefined}>
                  <input className={inputClass} maxLength={250} type={"type" in field ? field.type : "text"} required={field.key === "phone" || field.key === "whatsapp" || (field.key === "email" && Boolean(config.business.email))} value={business[field.key] ?? ""} onChange={(event) => setEdits({ ...edits, [field.key]: event.target.value })} />
                </Field>
              ))}
              <Field label="City"><input className={inputClass} required value={business.address.city} onChange={(event) => setEdits({ ...edits, address: { ...business.address, city: event.target.value } })} /></Field>
            </fieldset>
          </Panel>
          <div className="grid gap-5">
            <Panel title="Workspace owner" description="The owner visible to your studio team." action={<ShieldCheck aria-hidden="true" className="size-4 text-admin-muted" />}>
              <fieldset disabled={!canEdit || pending} className="grid gap-4 p-5">
                <Field label="Owner name"><input className={inputClass} maxLength={250} value={business.ownerName ?? ""} onChange={(event) => setEdits({ ...edits, ownerName: event.target.value })} /></Field>
                <Field label="Owner email"><input className={inputClass} value={ownerEmail} readOnly /></Field>
                <p className="text-xs leading-6 text-admin-muted">Workspace access and sign out are available from the studio account menu.</p>
              </fieldset>
            </Panel>
            <Panel title="Notification preferences" description="Choose the updates shown for this workspace." action={<Bell aria-hidden="true" className="size-4 text-admin-muted" />}>
              <div className="grid gap-3 p-5 text-xs">
                <label className="flex items-center justify-between gap-3"><span><span className="block font-medium">New enquiry alerts</span><span className="text-admin-muted">Show an alert when a lead arrives.</span></span><input type="checkbox" className="size-4 accent-admin-primary" checked={newLeadAlerts} onChange={(event) => setNewLeadAlerts(event.target.checked)} /></label>
                <label className="flex items-center justify-between gap-3 border-t border-admin-border pt-3"><span><span className="block font-medium">Weekly activity digest</span><span className="text-admin-muted">Show the last seven days in your workspace.</span></span><input type="checkbox" className="size-4 accent-admin-primary" checked={weeklyDigest} onChange={(event) => setWeeklyDigest(event.target.checked)} /></label>
              </div>
            </Panel>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary">{pending ? "Saving…" : mode === "demo" ? "Save sample settings" : "Save studio details"}</Button>
          <Feedback error={error} message={message} />
        </div>
      </form>
    </>
  );
}

export function IntegrationsTab({
  data,
  onNavigate,
}: {
  data: WorkspaceData;
  onNavigate: (view: DashboardView) => void;
}) {
  const items = [
    {
      title: "Workspace access",
      status:
        data.mode === "live"
          ? "Connected"
          : data.mode === "demo"
            ? "Demo mode"
            : "Not connected",
      description:
        "Private lead reads and updates use the signed-in tenant account.",
      view: "enquiries",
      icon: ShieldCheck,
    },
    {
      title: "WhatsApp click-to-chat",
      status: contactPhone(data.config.business.whatsapp)
        ? "Connected"
        : "Not connected",
      description:
        "Public contact links open WhatsApp. Private conversations are not read or imported.",
      view: "settings",
      icon: MessageCircle,
    },
    {
      title: "Website analytics",
      status: data.config.integrations.umami.enabled
        ? "Connected"
        : "Not connected",
      description:
        "The report shows unavailable when the analytics service cannot return data.",
      view: "analytics",
      icon: Globe,
    },
    {
      title: "Lead notifications",
      status: "Not connected",
      description:
        "Notifications use the existing server-side delivery service. This screen does not verify inbox delivery.",
      view: "settings",
      icon: Mail,
    },
  ] as const;
  const [metaId, setMetaId] = useState("");
  const [analyticsId, setAnalyticsId] = useState(data.config.integrations.umami.siteId ?? "");
  const [notificationEmail, setNotificationEmail] = useState(data.ownerEmail);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeading
        title="The tools behind your website."
        description="Configuration and verified delivery are shown separately."
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
          <Panel
            key={item.title}
            title={item.title}
            action={<div className="flex items-center gap-2"><Icon aria-hidden="true" className="size-4 text-admin-muted" /><Badge className={item.status === "Connected" ? "border-admin-primary text-admin-primary" : ""}>{item.status}</Badge></div>}
          >
            <div className="p-5">
              <p className="mb-5 text-xs leading-6 text-admin-muted">
                {item.description}
              </p>
              <Button onClick={() => onNavigate(item.view)}>
                Open {item.view} <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </Panel>
          );
        })}
      </div>
      <Panel title="Connection details" description="Add provider identifiers when you connect external services.">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Instagram / Meta business ID" hint="Used to connect Instagram publishing and insights."><input className={inputClass} value={metaId} onChange={(event) => { setMetaId(event.target.value); setSaved(false); }} placeholder="Not connected" /></Field>
          <Field label="Analytics site ID" hint="The site identifier returned by your analytics provider."><input className={inputClass} value={analyticsId} onChange={(event) => { setAnalyticsId(event.target.value); setSaved(false); }} placeholder="Not connected" /></Field>
          <Field label="Lead notification email" hint="Used when server-side delivery is enabled."><input className={inputClass} type="email" value={notificationEmail} onChange={(event) => { setNotificationEmail(event.target.value); setSaved(false); }} placeholder="owner@example.com" /></Field>
          <div className="flex items-end"><Button type="button" onClick={() => setSaved(true)}>{saved ? "Saved in this session" : "Save connection details"}</Button></div>
        </div>
      </Panel>
    </>
  );
}

export function DigitalCardTab({
  config,
  tenant,
}: {
  config: WorkspaceConfig;
  tenant: string;
}) {
  const [url, setURL] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    setURL(new URL(`/${tenant}`, window.location.origin).href);
  }, [tenant]);
  let cells: boolean[][] = [];
  let qrError = "";
  if (url) {
    try {
      cells = qrMatrix(url);
    } catch (error) {
      qrError = errorMessage(error);
    }
  }
  const phone = contactPhone(config.business.phone);
  const whatsapp = contactPhone(config.business.whatsapp);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Public website link copied.");
      setError("");
    } catch {
      setError("Clipboard unavailable. Select and copy the URL below.");
    }
  }
  function exportQR() {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[class]").forEach((node, index) => {
      const original = svg.querySelectorAll("[class]")[index]!;
      node.setAttribute("fill", getComputedStyle(original).fill);
      node.removeAttribute("class");
    });
    clone.removeAttribute("class");
    clone.setAttribute("width", "450");
    clone.setAttribute("height", "450");
    downloadFile(
      `${tenant}-website-qr.svg`,
      new XMLSerializer().serializeToString(clone),
      "image/svg+xml",
    );
  }
  return (
    <>
      <PageHeading
        title="A small card. A useful first connection."
        description="Share your public website or download your studio contact."
      />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Panel title="Your studio card" action={<PanelsTopLeft aria-hidden="true" className="size-4 text-admin-muted" />}>
          <div className="p-5">
            <div className="border border-admin-border bg-admin-bg p-6">
              <div className="mb-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider text-admin-muted"><span className="flex items-center gap-2">{config.brand.logo ? <img src={config.brand.logo} alt={config.business.name} className="size-10 border border-admin-border object-contain" /> : <PanelsTopLeft aria-hidden="true" className="size-4" />}{config.business.address.city}</span><a className="text-admin-primary hover:underline" href={`/${tenant}/dashboard?demo=1&tab=website`}>Change logo</a></div>
              <h2 className="text-2xl font-semibold">{config.business.name}</h2>
              <p className="my-5 text-xs text-admin-muted">
                {config.business.tagline}
              </p>
              <div className="grid gap-3">
                {whatsapp && (
                  <a
                    className={buttonClass + " border-admin-primary text-admin-primary"}
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle aria-hidden="true" className="size-4" />Start a WhatsApp conversation
                  </a>
                )}
                {phone && (
                  <a className={buttonClass} href={`tel:+${phone}`}>
                    <Phone aria-hidden="true" className="size-4" />Call the studio
                  </a>
                )}
                {config.business.email && (
                  <a
                    className={buttonClass}
                    href={`mailto:${config.business.email}`}
                  >
                    <Mail aria-hidden="true" className="size-4" />Email the studio
                  </a>
                )}
                <a
                  className={buttonClass}
                  href={`/${tenant}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe aria-hidden="true" className="size-4" />View public website
                </a>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                disabled={!url}
                onClick={() =>
                  downloadFile(
                    `${tenant}.vcf`,
                    vCard(config, url),
                    "text/vcard;charset=utf-8",
                  )
                }
              >
                <Download aria-hidden="true" className="size-4" />Download contact (.vcf)
              </Button>
              {url && (
                <a
                  className={buttonClass}
                  href={`https://wa.me/?text=${encodeURIComponent(`${config.business.name}: ${url}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" className="size-4" />Share on WhatsApp
                </a>
              )}
            </div>
          </div>
        </Panel>
        <Panel
          title="From a scan to a conversation"
          description="This QR opens your tenant's public website."
          action={<QrCode aria-hidden="true" className="size-4 text-admin-muted" />}
        >
          <div className="p-5">
            {cells.length > 0 && (
              <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 45 45"
                shapeRendering="crispEdges"
                role="img"
                aria-label={`QR code for ${config.business.name}`}
                className="mx-auto mb-6 h-56 w-56"
              >
                <rect width="45" height="45" className="fill-surface" />
                <path
                  className="fill-ink"
                  d={cells
                    .flatMap((row, y) =>
                      row.flatMap((dark, x) =>
                        dark ? [`M${x + 4},${y + 4}h1v1h-1z`] : [],
                      ),
                    )
                    .join("")}
                />
              </svg>
            )}
            <Feedback error={qrError} />
            <Field label="Public website URL">
              <input
                className={inputClass}
                readOnly
                value={url}
                onFocus={(event) => event.target.select()}
              />
            </Field>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button disabled={!url} onClick={copy}>
                <ArrowRight aria-hidden="true" className="size-4" />Copy link
              </Button>
              <Button disabled={!cells.length} onClick={exportQR}>
                <Download aria-hidden="true" className="size-4" />Download QR SVG
              </Button>
            </div>
            <Feedback error={error} message={message} />
            <p className="mt-5 text-[10px] leading-5 text-admin-muted">
              Only public studio details are exported. Scan counts are
              unavailable unless tracking is connected.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}

/** QR Model 2, version 5-L, byte mode, mask 0. One RS block: 108 data + 26 parity bytes. */
export function qrMatrix(value: string): boolean[][] {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > 106)
    throw new Error(
      "This URL is too long for the print QR. Use a shorter public domain or copy the link.",
    );
  const bits: number[] = [];
  const append = (value: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  append(4, 4);
  append(bytes.length, 8);
  for (const byte of bytes) append(byte, 8);
  append(0, Math.min(4, 864 - bits.length));
  while (bits.length % 8) bits.push(0);
  const words: number[] = [];
  for (let i = 0; i < bits.length; i += 8)
    words.push(bits.slice(i, i + 8).reduce((sum, bit) => sum * 2 + bit, 0));
  for (let i = 0; words.length < 108; i++) words.push(i % 2 ? 17 : 236);
  function multiply(a: number, b: number) {
    let result = 0;
    for (let i = 7; i >= 0; i--) {
      result = (result << 1) ^ ((result >>> 7) * 285);
      result ^= ((b >>> i) & 1) * a;
    }
    return result;
  }
  const divisor = new Array<number>(26).fill(0);
  divisor[25] = 1;
  let root = 1;
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      divisor[j] = multiply(divisor[j]!, root);
      if (j + 1 < 26) divisor[j] = divisor[j]! ^ divisor[j + 1]!;
    }
    root = multiply(root, 2);
  }
  const remainder = new Array<number>(26).fill(0);
  for (const byte of words) {
    const factor = byte ^ remainder.shift()!;
    remainder.push(0);
    for (let j = 0; j < 26; j++)
      remainder[j] = remainder[j]! ^ multiply(divisor[j]!, factor);
  }
  const stream = [...words, ...remainder].flatMap((byte) =>
    Array.from({ length: 8 }, (_, i) => (byte >>> (7 - i)) & 1),
  );
  const size = 37;
  const grid = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );
  const reserved = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );
  function set(x: number, y: number, dark: boolean) {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      grid[y]![x] = dark;
      reserved[y]![x] = true;
    }
  }
  for (const [cx, cy] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ]) {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        set(cx! + dx, cy! + dy, distance !== 2 && distance !== 4);
      }
  }
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++)
      set(30 + dx, 30 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  let format = 8;
  for (let i = 0; i < 10; i++) format = (format << 1) ^ ((format >>> 9) * 1335);
  format = ((8 << 10) | format) ^ 21522;
  const bit = (i: number) => ((format >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) set(8, i, bit(i));
  set(8, 7, bit(6));
  set(8, 8, bit(7));
  set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
  set(8, size - 8, true);
  let index = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < size; vertical++)
      for (let offset = 0; offset < 2; offset++) {
        const x = right - offset;
        const y = ((right + 1) & 2) === 0 ? size - 1 - vertical : vertical;
        if (!reserved[y]![x]) {
          grid[y]![x] = Boolean(
            (stream[index] ?? 0) ^ ((x + y) % 2 === 0 ? 1 : 0),
          );
          index++;
        }
      }
  }
  return grid;
}
