"use client";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, ChevronRight, Clock3, Inbox, MessageCircle, Plus, ScanLine, SlidersHorizontal, Users } from "lucide-react";

import {
  Badge,
  Button,
  Panel,
  PageHeading,
  buttonClass,
  monoClass,
} from "./primitives";
import { EnquiryDesk } from "./EnquiryDesk";
import { SAMPLE_CITIES, SAMPLE_TREND } from "./demo-data";
import type {
  DashboardView,
  Enquiry,
  EnquiryFilters,
  WorkspaceData,
} from "./types";

export default function OverviewTab({
  data,
  filters,
  onFiltersChange,
  onNavigate,
  onCreate,
  onOpen,
}: {
  data: WorkspaceData;
  filters: EnquiryFilters;
  onFiltersChange: (filters: EnquiryFilters) => void;
  onNavigate: (view: DashboardView, status?: EnquiryFilters["status"]) => void;
  onCreate: () => void;
  onOpen: (item: Enquiry) => void;
}) {
  const sample = data.mode === "demo";
  const waiting = data.enquiries.filter((item) => item.status === "new").length;
  const open = data.enquiries.filter(
    (item) => !["won", "lost"].includes(item.status),
  ).length;
  const metrics = [
    {
      label: "New enquiries",
      icon: Inbox,
      value: sample ? "31" : waiting,
      subtitle: sample ? "20 last month" : "Awaiting first response",
      delta: sample ? "+55%" : waiting > 0 ? waiting + " waiting" : "No new leads",
      view: "enquiries",
    },
    {
      label: "Active pipeline",
      icon: BriefcaseBusiness,
      value: sample ? "₹39.5L" : open,
      subtitle: sample ? "6 open sample enquiries" : "Open enquiries",
      delta: sample ? "Budget midpoints" : "Not revenue",
      view: "enquiries",
    },
    {
      label: "First response",
      icon: Clock3,
      value: sample ? "24 min" : "—",
      subtitle: "Monthly sample average",
      delta: sample ? waiting + " awaiting contact" : "Response tracking unavailable",
      view: "enquiries",
    },
    {
      label: "Website visitors",
      icon: Users,
      value: sample ? "1,248" : "—",
      subtitle: sample ? "1,058 last month" : "Open analytics for live traffic",
      delta: sample ? "+18%" : "Traffic tracking unavailable",
      view: "analytics",
    },
    {
      label: "WhatsApp clicks",
      icon: MessageCircle,
      value: sample ? "86" : "—",
      subtitle: sample ? "Link clicks, not private chats" : "Click tracking unavailable",
      delta: sample ? "Top action channel" : "—",
      view: "analytics",
    },
    {
      label: "Digital card scans",
      icon: ScanLine,
      value: sample ? "34" : "—",
      subtitle: sample ? "24 last month" : "Open digital card",
      delta: sample ? "+42%" : "Scan tracking unavailable",
      view: "card",
    },
  ] as const;
  const areas = sample
    ? SAMPLE_CITIES
    : Object.entries(
        data.enquiries.reduce<Record<string, number>>((all, item) => {
          if (item.locality) all[item.locality] = (all[item.locality] ?? 0) + 1;
          return all;
        }, {}),
      )
        .map(([name, enquiries]) => ({ name, enquiries, visits: null }))
        .sort((a, b) => b.enquiries - a.enquiries)
        .slice(0, 6);
  return (
    <>
      <PageHeading
        title="Your studio, at a glance."
        description="Start with the conversations that need you."
        action={<Badge><CalendarDays aria-hidden="true" className="size-3.5" /><span>September <span className={monoClass}>2026</span></span></Badge>}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          disabled={!data.canCreate || Boolean(data.leadError)}
          onClick={onCreate}
        >
          <Plus aria-hidden="true" className="size-4" />Log walk-in lead
        </Button>
        <Button onClick={() => onNavigate("card")}><MessageCircle aria-hidden="true" className="size-4" />Share WhatsApp vCard</Button>
        <Button onClick={() => onNavigate("calculator")}>
          <SlidersHorizontal aria-hidden="true" className="size-4" />Tune pricing <span className={monoClass}>₹/sqft</span>
        </Button>
        <a
          className={buttonClass}
          href={`/${data.tenant}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View live site <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </div>
      {waiting > 0 && (
        <section
          className="my-5 flex flex-col items-start gap-4 border border-admin-alert/30 border-l-[3px] border-l-admin-alert bg-admin-bg p-4 xl:flex-row xl:items-center xl:justify-between"
          aria-label="Enquiries awaiting response"
        >
          <div className="flex items-start gap-2.5">
            <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-admin-alert" strokeWidth={1.8} />
            <div><p className="font-semibold">
              {waiting} enquiries are waiting for a first response
            </p>
            <p className="mt-1 text-[11px] text-admin-muted">
              A quick reply helps turn an enquiry into a site visit.
            </p></div>
          </div>
          <Button onClick={() => onNavigate("enquiries", "new")}>
            Review new enquiries <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </section>
      )}
      <section
        aria-label="Studio performance"
        className="my-5 grid grid-cols-2 gap-3 xl:grid-cols-3"
      >
        {metrics.map((metric, index) => (
          <button
            key={metric.label}
            onClick={() => onNavigate(metric.view)}
            className="min-w-0 border border-admin-border bg-admin-bg p-4 text-left hover:border-admin-muted focus-visible:outline-2 focus-visible:outline-admin-primary sm:p-5"
          >
            <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium">{metric.label}</p><metric.icon aria-hidden="true" className="size-4 text-admin-muted" strokeWidth={1.8} /></div>
            <p className={`${monoClass} my-3 text-[29px] tracking-tight`}>
              {data.mode === "unavailable" || data.leadError
                ? "—"
                : metric.value}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-admin-muted"><span>{metric.subtitle}</span><span className={`${monoClass} shrink-0 bg-admin-raised px-1.5 py-0.5 font-medium ${index === 2 && waiting > 0 ? "text-admin-alert" : "text-admin-ink"}`}>{metric.delta}</span></div>
          </button>
        ))}
      </section>
      <div className="mb-6 grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <AttentionChart enquiries={data.enquiries} sample={sample} />
        <Panel
          title="Where your next project begins"
          description={sample ? "City demand · select a row to explore enquiries" : "Enquiries by supplied locality / city."}
          action={sample ? <Badge>September</Badge> : undefined}
        >
          <div className="px-5 pb-5">
            <div className="mb-2 grid grid-cols-[minmax(0,1fr)_55px_80px] gap-3 text-[10px] text-admin-muted"><span>City</span><span className="text-right">Visits</span><span className="text-right">Enquiries</span></div>
            {areas.length ? (
              areas.map((area) => (
                <button
                  key={area.name}
                  onClick={() => {
                    onFiltersChange({
                      status: "all",
                      query: "",
                      locality: area.name,
                    });
                    document
                      .getElementById("enquiries")
                      ?.scrollIntoView({ block: "start" });
                  }}
                  className="grid min-h-16 w-full grid-cols-[minmax(0,1fr)_55px_80px] items-center gap-3 border-t border-admin-border py-3 text-left hover:bg-admin-raised/40"
                  aria-label={`View ${area.name} enquiries`}
                >
                  <div>
                    <p className="text-xs font-semibold">{area.name}{area.name === "Patna" && <span className="ml-2 text-[9px] font-normal text-admin-muted">Studio HQ</span>}</p>
                    <svg
                      className="mt-2 h-1 w-full max-w-48"
                      viewBox="0 0 100 2"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <rect
                        width="100"
                        height="2"
                        className="fill-admin-raised"
                      />
                      <rect
                        width={
                          ((area.visits ?? 0) /
                            Math.max(1, ...areas.map((item) => item.visits ?? 0))) *
                          100
                        }
                        height="2"
                        className="fill-admin-ink/60"
                      />
                    </svg>
                  </div>
                  <span className={`${monoClass} text-right text-xs text-admin-muted`}>{area.visits ?? "—"}</span><span className={`${monoClass} flex items-center justify-end gap-2 text-xs`}>{area.enquiries}<ChevronRight aria-hidden="true" className="size-4 text-admin-muted" /></span>
                </button>
              ))
            ) : (
              <p className="py-8 text-xs text-admin-muted">
                No locality data available.
              </p>
            )}
          </div>
        </Panel>
      </div>
      <EnquiryDesk
        enquiries={data.enquiries}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onOpenEnquiry={onOpen}
        mode={data.mode}
        tenant={data.tenant}
      />
    </>
  );
}

export function AttentionChart({
  enquiries,
  sample,
  trend,
}: {
  enquiries: Enquiry[];
  sample: boolean;
  trend?: { month: string; count: number }[];
}) {
  const rows = sample
    ? SAMPLE_TREND
    : (trend ?? Array.from({ length: 6 }, (_, index) => {
      const now = new Date();
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
      const key = date.toISOString().slice(0, 7);
      return { month: key, count: enquiries.filter((item) => item.created_at.startsWith(key)).length };
    }));
  const visits = sample ? SAMPLE_TREND.map((row) => row.visits) : [];
  const totalEnquiries = rows.reduce((sum, row) => sum + row.count, 0);
  const maxVisits = Math.max(1500, ...visits);
  const maxEnquiries = Math.max(60, ...rows.map((row) => row.count));
  const x = (index: number) => 40 + index * 95;
  const visitY = (value: number) => 170 - (value / maxVisits) * 135;
  const enquiryY = (value: number) => 170 - (value / maxEnquiries) * 135;
  const smoothPath = (values: number[], position: (value: number) => number) => values.map((value, index) => {
    if (index === 0) return "M " + x(index) + " " + position(value);
    const previous = values[index - 1] ?? 0;
    const control = (x(index - 1) + x(index)) / 2;
    return " C " + control + " " + position(previous) + " " + control + " " + position(value) + " " + x(index) + " " + position(value);
  }).join("");
  const visitPath = visits.length ? smoothPath(visits, visitY) : "";
  const enquiryPath = smoothPath(rows.map((row) => row.count), enquiryY);
  return (
    <Panel
      title="Attention into enquiries"
      description={sample ? "Sample visits and recorded enquiries" : "Recorded enquiry trend. Traffic history is not supplied."}
      action={<Badge>{sample ? "Apr – Sep" : "Enquiries"}</Badge>}
    >
      <div className="px-5 pb-5">
        <div className="mb-4 mt-4 flex gap-8">
          {sample && <div><p className={monoClass + " text-xl"}>5,812</p><p className="text-[10px] text-admin-muted">Site visits</p></div>}
          <div><p className={monoClass + " text-xl"}>{totalEnquiries}</p><p className="text-[10px] text-admin-muted">Enquiries</p></div>
        </div>
        <svg viewBox="0 0 540 215" className="h-[210px] w-full overflow-visible" role="img" aria-label={rows.map((row, index) => row.month + ": " + (visits[index]?.toLocaleString("en-IN") ?? "no visit data") + " visits, " + row.count + " enquiries").join("; ")}>
          <title>{sample ? "Sample website visits and enquiries, April to September 2026" : "Recorded enquiry trend"}</title>
          {[35, 80, 125, 170].map((y, index) => <g key={y}><line x1="35" y1={y} x2="525" y2={y} className="stroke-admin-border" strokeDasharray="3 4" /><text x="0" y={y + 4} className="fill-admin-muted text-[10px] [font-family:var(--font-dashboard-mono)]">{sample ? [1500, 1000, 500, 0][index] : [maxEnquiries, Math.round(maxEnquiries * 0.66), Math.round(maxEnquiries * 0.33), 0][index]}</text></g>)}
          {sample && <path d={visitPath + " L 515 170 L 40 170 Z"} className="fill-admin-raised/40" />}
          {sample && <path d={visitPath} fill="none" stroke="currentColor" strokeWidth="2" />}
          <path d={enquiryPath} fill="none" className="stroke-admin-muted" strokeWidth="1.5" strokeDasharray="4 4" />
          {rows.map((row, index) => <g key={row.month}><circle cx={x(index)} cy={sample ? visitY(visits[index] ?? 0) : enquiryY(row.count)} r="3" className="fill-admin-bg stroke-admin-ink" strokeWidth="1.5"><title>{row.month + ": " + (visits[index]?.toLocaleString("en-IN") ?? "no visit data") + " visits, " + row.count + " enquiries"}</title></circle><text x={x(index)} y="201" textAnchor="middle" className="fill-admin-muted text-[10px]">{row.month.length > 3 ? row.month.slice(5) : row.month}</text></g>)}
        </svg>
        <div className="mt-3 flex flex-wrap gap-5 text-[10px] text-admin-muted">
          {sample && <span className="flex items-center gap-1.5"><span className="w-4 border-t-[1.5px] border-admin-ink" />Visits · left scale</span>}
          <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-admin-muted" />Enquiries · scale <span className={monoClass}>0–{maxEnquiries}</span></span>
        </div>
      </div>
    </Panel>
  );
}