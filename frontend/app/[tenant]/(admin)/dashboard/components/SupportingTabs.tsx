"use client";

import { ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness, Phone, Clock3, Download, Globe, Mail, MessageCircle, PanelsTopLeft, Pencil, QrCode, ScanLine, ShieldCheck, Users, X } from "lucide-react";
import PhoneInput, { getCountries, getCountryCallingCode } from "react-phone-number-input";
import enLabels from "react-phone-number-input/locale/en.json";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AttentionChart } from "./OverviewTab";
import { SAMPLE_CITIES, SAMPLE_PAGE_BREAKDOWN, SAMPLE_SOURCES } from "./demo-data";
import { TeamManagement } from "./TeamManagement";
import {
  Button,
  Badge,
  Field,
  Feedback,
  Panel,
  PageHeading,
  Select,
  buttonClass,
  inputClass,
  monoClass,
} from "./primitives";
import {
  contactPhone,
  csvCell,
  downloadFile,
  errorMessage,
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
        lastMonthViews: null,
        lastMonthEnquiries: null,
      })) ?? []);
  const barSpans = ["col-span-12", "col-span-9", "col-span-7", "col-span-5", "col-span-4"];
  const topTrafficPages = [...pageRows].sort((a, b) => b.views - a.views).slice(0, 5);
  const topTrafficMax = Math.max(...topTrafficPages.map((page) => page.views), 1);
  const dotPositions = [
    "col-start-1", "col-start-2", "col-start-3", "col-start-4", "col-start-5", "col-start-6",
    "col-start-7", "col-start-8", "col-start-9", "col-start-10", "col-start-11", "col-start-12",
  ];

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
        <div className="mt-5 grid gap-5">
          <Panel title="Top 5 pages by Traffic" description="The pages drawing the most attention this month.">
            <div className="px-5 pb-5">
              <div className="mt-4 grid gap-3">
                {topTrafficPages.map((page, index) => {
                  const position = Math.max(0, Math.min(11, Math.round((page.views / topTrafficMax) * 11)));
                  return (
                    <div key={page.page} className="grid grid-cols-[minmax(8rem,0.32fr)_minmax(0,1fr)_4.5rem] items-center gap-3 text-xs">
                      <span className="min-w-0 truncate font-medium"><span className="mr-2 text-admin-muted">0{index + 1}</span>{page.page}</span>
                      <span className="grid h-8 grid-cols-12 items-center border-b border-admin-border bg-admin-bg">
                        <span className={dotPositions[position] + " size-3 rounded-full bg-admin-primary ring-4 ring-admin-primary/10"} title={page.views.toLocaleString("en-IN") + " views"} />
                      </span>
                      <span className={monoClass + " text-right"}>{page.views.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-4 text-[10px] text-admin-muted"><span>0</span><span className="text-center">150</span><span className="text-center">300</span><span className="text-right">600 views</span></div>
            </div>
          </Panel>
          <Panel title="Traffic by page" description="Month-over-month page views and recorded enquiries for every page.">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                <thead className="border-y border-admin-border bg-admin-bg text-[10px] text-admin-muted">
                  <tr><th scope="col" className="px-5 py-3 font-medium">Page</th><th scope="col" className="px-5 py-3 text-right font-medium">Last month</th><th scope="col" className="px-5 py-3 text-right font-medium">Current month</th><th scope="col" className="px-5 py-3 text-right font-medium">Change</th><th scope="col" className="px-5 py-3 text-right font-medium">Views</th><th scope="col" className="px-5 py-3 text-right font-medium">Enquiries</th></tr>
                </thead>
                <tbody>
                  {pageRows.map((page) => (
                    <tr key={page.page} className="border-b border-admin-border last:border-b-0">
                      <td className="px-5 py-3 font-medium">{page.page}</td>
                      <td className={monoClass + " px-5 py-3 text-right"}>{page.lastMonthViews?.toLocaleString("en-IN") ?? "—"}</td>
                      <td className={monoClass + " px-5 py-3 text-right"}>{page.views.toLocaleString("en-IN")}</td>
                      <td className={monoClass + " px-5 py-3 text-right text-admin-primary"}>{page.lastMonthViews ? `${Math.round(((page.views - page.lastMonthViews) / page.lastMonthViews) * 100)}%` : "\u2014"}</td>
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

function countryToFlag(isoCode: string): string {
  if (isoCode.length !== 2) return "";
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const COUNTRY_LABELS: Record<string, string> = (() => {
  const labels: Record<string, string> = { ...(enLabels as Record<string, string>) };
  for (const country of getCountries()) {
    const name = labels[country] || country;
    let code = "";
    try {
      code = ` (+${getCountryCallingCode(country)})`;
    } catch {
      // ignore
    }
    const flag = countryToFlag(country);
    labels[country] = `${flag} ${name}${code}`.trim();
  }
  return labels;
})();

const DAY_PRESETS = [
  "Mon – Sat",
  "Mon – Fri",
  "Mon – Sun",
  "Tue – Sun",
  "By appointment only",
] as const;

const TIME_OPTIONS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
];

const CLOSED_NOTE_PRESETS = [
  "Closed Sundays",
  "Sunday by appointment",
  "Open all days",
  "Closed Mondays",
  "None",
] as const;

function parseHours(raw: string | undefined) {
  if (!raw?.trim()) {
    return {
      days: "Mon – Sat",
      start: "10:00 AM",
      end: "07:00 PM",
      note: "Closed Sundays",
      isCustom: false,
    };
  }
  if (raw.trim() === "By appointment only") {
    return {
      days: "By appointment only",
      start: "10:00 AM",
      end: "07:00 PM",
      note: "None",
      isCustom: false,
    };
  }
  const match = raw.match(/^(.*?):\s*(.*?)\s*[–-]\s*(.*?)(?:\s*\((.*?)\))?$/);
  if (match) {
    const [, days, start, end, note] = match;
    return {
      days: days?.trim() || "Mon – Sat",
      start: start?.trim() || "10:00 AM",
      end: end?.trim() || "07:00 PM",
      note: note ? note.trim() : "None",
      isCustom: false,
    };
  }
  return {
    days: "Mon – Sat",
    start: "10:00 AM",
    end: "07:00 PM",
    note: "Closed Sundays",
    isCustom: true,
  };
}

function OpeningHoursBuilder({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const initial = parseHours(value);
  const [isTextMode, setIsTextMode] = useState(initial.isCustom);
  const [days, setDays] = useState(initial.days);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [note, setNote] = useState(initial.note);

  const applyChanges = (newDays: string, newStart: string, newEnd: string, newNote: string) => {
    setDays(newDays);
    setStart(newStart);
    setEnd(newEnd);
    setNote(newNote);
    if (newDays === "By appointment only") {
      onChange("By appointment only");
      return;
    }
    const noteSuffix = newNote && newNote !== "None" ? ` (${newNote})` : "";
    onChange(`${newDays}: ${newStart} – ${newEnd}${noteSuffix}`);
  };

  const toggleMode = () => {
    if (isTextMode) {
      const p = parseHours(value);
      setDays(p.days);
      setStart(p.start);
      setEnd(p.end);
      setNote(p.note);
      setIsTextMode(false);
      if (!value) {
        applyChanges(p.days, p.start, p.end, p.note);
      }
    } else {
      setIsTextMode(true);
    }
  };

  return (
    <div className="grid gap-3">
      {isTextMode ? (
        <input
          className={inputClass}
          value={value}
          disabled={disabled}
          maxLength={250}
          placeholder="e.g. Mon – Sat: 10:00 AM – 07:00 PM (Closed Sundays)"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-admin-muted">Days</label>
            <Select
              disabled={disabled}
              value={days}
              onChange={(e) => applyChanges(e.target.value, start, end, note)}
            >
              {DAY_PRESETS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          {days !== "By appointment only" ? (
            <>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-admin-muted">Hours</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Select
                    disabled={disabled}
                    className="px-2 text-xs"
                    value={start}
                    onChange={(e) => applyChanges(days, e.target.value, end, note)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                  <Select
                    disabled={disabled}
                    className="px-2 text-xs"
                    value={end}
                    onChange={(e) => applyChanges(days, start, e.target.value, note)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-admin-muted">Weekend / note</label>
                <Select
                  disabled={disabled}
                  value={note}
                  onChange={(e) => applyChanges(days, start, end, e.target.value)}
                >
                  {CLOSED_NOTE_PRESETS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          ) : (
            <div className="flex items-center pt-5 text-xs text-admin-muted sm:col-span-2">
              Studio visits and consultations are scheduled by appointment.
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border border-admin-border bg-admin-raised px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <Clock3 aria-hidden="true" className="size-3.5 text-admin-muted" />
          <span className="font-mono text-admin-ink">{value || "No hours set"}</span>
        </div>
        <button
          type="button"
          onClick={toggleMode}
          className="text-[11px] text-admin-primary underline hover:text-admin-ink"
        >
          {isTextMode ? "Use visual builder" : "Edit as text"}
        </button>
      </div>
    </div>
  );
}

function ServiceAreasInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const addAreas = () => {
    const tokens = draft
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (tokens.length === 0) return;
    const combined = Array.from(new Set([...value, ...tokens]));
    onChange(combined);
    setDraft("");
  };

  const removeArea = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="grid gap-2">
      <div className="flex min-h-8 flex-wrap items-center gap-1.5">
        {value.length > 0 ? (
          value.map((area, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 border border-admin-border bg-admin-raised px-2.5 py-1 text-xs text-admin-ink"
            >
              <span>{area}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeArea(index)}
                  className="text-admin-muted hover:text-admin-ink focus-visible:outline-none"
                  aria-label={`Remove ${area}`}
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="text-xs text-admin-muted">No additional cities or service areas added yet.</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          className={inputClass + " flex-1"}
          placeholder="e.g. Jamshedpur, Dhanbad, Bokaro (press Enter to add)"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addAreas();
            }
          }}
        />
        <Button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={addAreas}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export function SettingsTab({
  tenant,
  config,
  ownerName,
  ownerEmail,
  mode,
  canEdit,
  onSave,
}: {
  tenant: string;
  config: WorkspaceConfig;
  ownerName: string;
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
  const [ownerEmailDraft, setOwnerEmailDraft] = useState(ownerEmail);
  const [newLeadAlerts, setNewLeadAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const ownerNameValue = "ownerName" in edits ? String(edits.ownerName ?? "") : business.ownerName?.trim() || ownerName;
  const ownerEmailChanged = ownerEmailDraft.trim() !== ownerEmail;

  useEffect(() => {
    setOwnerEmailDraft(ownerEmail);
  }, [ownerEmail]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const phone = contactPhone(business.phone);
    const whatsapp = contactPhone(business.whatsapp);
    if (!phone || !whatsapp) {
      setError("Phone and WhatsApp must be valid international numbers.");
      return;
    }
    if (config.business.email && !business.email?.trim()) {
      setError(
        "Enter a replacement email. Removing the public email requires your operator.",
      );
      return;
    }
    if (ownerEmailChanged && !/^\S+@\S+\.\S+$/.test(ownerEmailDraft.trim())) {
      setError("Enter a valid owner email address.");
      return;
    }
    setPending(true);
    try {
      const patch: Record<string, unknown> = Object.fromEntries(
        Object.entries(edits).map(([key, value]) => [`business.${key}`, value]),
      );
      if ("phone" in edits) patch["business.phone"] = `+${phone}`;
      if ("whatsapp" in edits) patch["business.whatsapp"] = `+${whatsapp}`;
      if ("address" in edits) {
        patch["business.address"] = {
          ...config.business.address,
          ...business.address,
        };
      }
      if ("serviceAreas" in edits) {
        patch["business.serviceAreas"] = business.serviceAreas;
      }
      if (Object.keys(patch).length > 0) await onSave(patch);
      if (ownerEmailChanged && mode !== "demo") {
        const supabase = createSupabaseBrowserClient();
        const { error: emailError } = await supabase.auth.updateUser({
          email: ownerEmailDraft.trim(),
        });
        if (emailError) throw emailError;
      }
      setEdits({});
      setMessage(
        ownerEmailChanged && mode !== "demo"
          ? "Studio details saved. Check both email addresses to confirm the owner email change."
          : mode === "demo"
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
      <TeamManagement tenant={tenant} mode={mode} />
      <form onSubmit={save}>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <Panel title="Public studio details" description="Studio name and domain are managed by your operator." action={<Globe aria-hidden="true" className="size-4 text-admin-muted" />}>
            <fieldset disabled={!canEdit || pending} className="grid items-start gap-5 p-5 sm:grid-cols-2">
              <Field label="Studio name">
                <div className="relative">
                  <input
                    className={inputClass + " pr-11"}
                    value={business.name}
                    readOnly
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-admin-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary"
                    aria-label="Edit studio name"
                    title="Edit studio name"
                    onClick={(event) => {
                      const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
                      input?.focus();
                      input?.select();
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </Field>
              <Field label="Studio tagline">
                <div className="relative">
                  <input
                    className={inputClass + " pr-11"}
                    maxLength={250}
                    value={business.tagline ?? ""}
                    onChange={(event) => setEdits({ ...edits, tagline: event.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-admin-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary"
                    aria-label="Edit studio tagline"
                    title="Edit studio tagline"
                    onClick={(event) => {
                      const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
                      input?.focus();
                      input?.select();
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </Field>
              <Field label="Studio phone" hint="Choose a country, then enter the number without the country code.">
                <div className="relative">
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    countryCallingCodeEditable={false}
                    labels={COUNTRY_LABELS}
                    required
                    value={business.phone || undefined}
                    onChange={(value) => setEdits({ ...edits, phone: value ?? "" })}
                    className={inputClass + " flex items-center gap-2 pr-11"}
                    numberInputProps={{ className: "min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-admin-ink outline-none" }}
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-admin-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary"
                    aria-label="Edit studio phone"
                    title="Edit studio phone"
                    onClick={(event) => {
                      const container = event.currentTarget.previousElementSibling as HTMLElement | null;
                      const input = container?.querySelector("input[type='tel'], input") as HTMLInputElement | null;
                      input?.focus();
                      input?.select();
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </Field>
              <Field label="WhatsApp number" hint="Choose a country, then enter the number without the country code.">
                <div className="relative">
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    countryCallingCodeEditable={false}
                    labels={COUNTRY_LABELS}
                    required
                    value={business.whatsapp || undefined}
                    onChange={(value) => setEdits({ ...edits, whatsapp: value ?? "" })}
                    className={inputClass + " flex items-center gap-2 pr-11"}
                    numberInputProps={{ className: "min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-admin-ink outline-none" }}
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-admin-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary"
                    aria-label="Edit WhatsApp number"
                    title="Edit WhatsApp number"
                    onClick={(event) => {
                      const container = event.currentTarget.previousElementSibling as HTMLElement | null;
                      const input = container?.querySelector("input[type='tel'], input") as HTMLInputElement | null;
                      input?.focus();
                      input?.select();
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </Field>
              <Field label="Public email">
                <div className="relative">
                  <input
                    className={inputClass + " pr-11"}
                    maxLength={250}
                    type="email"
                    required={Boolean(config.business.email)}
                    value={business.email ?? ""}
                    onChange={(event) => setEdits({ ...edits, email: event.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-admin-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary"
                    aria-label="Edit public email"
                    title="Edit public email"
                    onClick={(event) => {
                      const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
                      input?.focus();
                      input?.select();
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </Field>
              <Field label="Primary city" hint="The main city where your studio is physically based.">
                <div className="relative">
                  <input
                    className={inputClass + " pr-11"}
                    required
                    value={business.address.city}
                    onChange={(event) => setEdits({ ...edits, address: { ...business.address, city: event.target.value } })}
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-admin-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary"
                    aria-label="Edit primary city"
                    title="Edit primary city"
                    onClick={(event) => {
                      const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
                      input?.focus();
                      input?.select();
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Other cities & service areas" hint="Additional cities or regions your studio accepts projects in.">
                  <ServiceAreasInput
                    value={business.serviceAreas ?? []}
                    disabled={!canEdit || pending}
                    onChange={(serviceAreas) => setEdits({ ...edits, serviceAreas })}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Opening hours" hint="Set working days, daily studio hours, and weekend notes, or switch to custom text.">
                  <OpeningHoursBuilder
                    value={business.hours ?? ""}
                    disabled={!canEdit || pending}
                    onChange={(hours) => setEdits({ ...edits, hours })}
                  />
                </Field>
              </div>
            </fieldset>
          </Panel>
          <div className="grid gap-5">
            <Panel title="Workspace owner" description="The owner visible to your studio team." action={<ShieldCheck aria-hidden="true" className="size-4 text-admin-muted" />}>
              <fieldset disabled={!canEdit || pending} className="grid gap-4 p-5">
                <Field label="Owner name">
                  <div className="relative">
                    <input className={inputClass + " pr-11"} maxLength={250} value={ownerNameValue} onChange={(event) => setEdits({ ...edits, ownerName: event.target.value })} />
                    <button type="button" className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-admin-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary" aria-label="Edit owner name" title="Edit owner name" onClick={(event) => { const input = event.currentTarget.previousElementSibling as HTMLInputElement | null; input?.focus(); input?.select(); }}>
                      <Pencil aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </Field>
                <Field label="Owner email">
                  <div className="relative">
                    <input className={inputClass + " pr-11"} type="email" value={ownerEmailDraft} onChange={(event) => setOwnerEmailDraft(event.target.value)} />
                    <button type="button" className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-admin-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary" aria-label="Edit owner email" title="Edit owner email" onClick={(event) => { const input = event.currentTarget.previousElementSibling as HTMLInputElement | null; input?.focus(); input?.select(); }}>
                      <Pencil aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </Field>
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
        ? "Ready"
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
            action={<div className="flex items-center gap-2"><Icon aria-hidden="true" className="size-4 text-admin-muted" /><Badge className={item.status === "Connected" || item.status === "Ready" ? "border-admin-success text-admin-success" : ""}>{item.status}</Badge></div>}
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
  tenant: string;
  config: WorkspaceConfig;
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
              <div className="mb-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider text-admin-muted"><span className="flex items-center gap-2">{config.brand.logo ? <img src={config.brand.logo} alt={config.business.name} className="size-10 border border-admin-border object-contain" /> : <PanelsTopLeft aria-hidden="true" className="size-4" />}{config.business.address.city}</span><a className="text-admin-primary hover:underline" href={`/${tenant}/dashboard?tab=website`}>Change logo</a></div>
              <h2 className="text-2xl font-semibold">{config.business.name}</h2>
              <p className="my-5 text-xs text-admin-muted">
                {config.business.tagline}
              </p>
              <div className="grid gap-3">
                {whatsapp && (
                  <a
                    className={buttonClass + " !justify-start"}
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle aria-hidden="true" className="size-4 text-admin-primary" />Start a WhatsApp conversation<ArrowUpRight aria-hidden="true" className="ml-auto size-4" />
                  </a>
                )}
                {phone && (
                  <a className={buttonClass + " !justify-start"} href={`tel:+${phone}`}>
                    <Phone aria-hidden="true" className="size-4" />Call the studio<ArrowUpRight aria-hidden="true" className="ml-auto size-4" />
                  </a>
                )}
                {config.business.email && (
                  <a
                    className={buttonClass + " !justify-start"}
                    href={`mailto:${config.business.email}`}
                  >
                    <Mail aria-hidden="true" className="size-4" />Email the studio<ArrowUpRight aria-hidden="true" className="ml-auto size-4" />
                  </a>
                )}
                <a
                  className={buttonClass + " !justify-start"}
                  href={`/${tenant}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe aria-hidden="true" className="size-4" />View public website<ArrowUpRight aria-hidden="true" className="ml-auto size-4" />
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
