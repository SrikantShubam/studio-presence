"use client";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Clock3, Inbox, MessageCircle, Plus, ScanLine, SlidersHorizontal, Users } from "lucide-react";

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
        action={
          <Badge>
            {sample ? "Sample workspace" : data.config.business.name}
          </Badge>
        }
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          disabled={!data.canCreate || Boolean(data.leadError)}
          onClick={onCreate}
        >
          <Plus aria-hidden="true" className="size-4" />Log walk-in lead
        </Button>
        <Button onClick={() => onNavigate("card")}><MessageCircle aria-hidden="true" className="size-4" />Share studio card</Button>
        <Button onClick={() => onNavigate("calculator")}>
          <SlidersHorizontal aria-hidden="true" className="size-4" />Tune pricing <span className={monoClass}>₹/sqft</span>
        </Button>
        <a
          className={buttonClass}
          href={`/${data.tenant}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View public site <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </div>
      {waiting > 0 && (
        <section
          className="my-5 flex flex-wrap items-center justify-between gap-4 border border-admin-alert/30 border-l-2 border-l-admin-alert bg-admin-alert-soft p-4"
          aria-label="Enquiries awaiting response"
        >
          <div>
            <p className="font-semibold">
              {waiting} enquiries are waiting for a first response
            </p>
            <p className="mt-1 text-[11px] text-admin-muted">
              A quick reply helps turn an enquiry into a site visit.
            </p>
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
        {metrics.map((metric) => (
          <button
            key={metric.label}
            onClick={() => onNavigate(metric.view)}
            className="min-w-0 border border-admin-border bg-admin-surface p-4 text-left hover:border-admin-muted focus-visible:outline-2 focus-visible:outline-admin-primary sm:p-5"
          >
            <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium">{metric.label}</p><metric.icon aria-hidden="true" className="size-4 text-admin-muted" strokeWidth={1.8} /></div>
            <p className={`${monoClass} my-3 text-[29px] tracking-tight`}>
              {data.mode === "unavailable" || data.leadError
                ? "—"
                : metric.value}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-admin-muted"><span>{metric.subtitle}</span><span className="font-medium text-admin-ink">{metric.delta}</span></div>
          </button>
        ))}
      </section>
      <div className="mb-6 grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <AttentionChart enquiries={data.enquiries} sample={sample} />
        <Panel
          title="Where your next project begins"
          description={
            sample
              ? "Sample city demand. Select a row to explore."
              : "Enquiries by supplied locality / city."
          }
        >
          <div className="px-5 pb-5">
            <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-4 text-[10px] uppercase tracking-[0.14em] text-admin-muted"><span>City</span><span>Visits</span><span>Enquiries</span></div>
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
                  className="grid min-h-16 w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-admin-border py-3 text-left"
                  aria-label={`View ${area.name} enquiries`}
                >
                  <div>
                    <p className="text-xs font-medium">{area.name}</p>
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
                          ((area.enquiries) /
                            Math.max(1, ...areas.map((item) => item.enquiries))) *
                          100
                        }
                        height="2"
                        className="fill-admin-muted"
                      />
                    </svg>
                  </div>
                  <span className={`${monoClass} text-xs text-admin-muted`}>{area.visits ?? "—"}</span><span className={`${monoClass} text-xs`}>{area.enquiries} →</span>
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
    : (trend ??
      Array.from({ length: 6 }, (_, index) => {
        const now = new Date();
        const date = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1),
        );
        const key = date.toISOString().slice(0, 7);
        return {
          month: key,
          count: enquiries.filter((item) => item.created_at.startsWith(key))
            .length,
        };
      }));
  const max = Math.max(1, ...rows.map((row) => row.count));
  const curvePath = (values: number[], scale: number) => values.map((value, index) => { const x = 30 + index * 90; const y = 160 - (value / scale) * 120; if (index === 0) return "M " + x + " " + y; const previousX = 30 + (index - 1) * 90; const previousY = 160 - ((values[index - 1] ?? 0) / scale) * 120; const controlX = (previousX + x) / 2; return " Q " + controlX + " " + previousY + " " + x + " " + y; }).join("");
  const points = curvePath(rows.map((row) => row.count), max);
  return (
    <Panel
      title="Attention into enquiries"
      description={
        sample
          ? "Sample visits and enquiries, April to September 2026"
          : "Recorded enquiry trend. Traffic history is not supplied."
      }
      action={<Badge>{sample ? "Sample" : "Enquiries"}</Badge>}
    >
      <div className="px-5 pb-5">
        <div className="my-4 flex gap-8">
          <div>
            <p className={`${monoClass} text-xl`}>
              {rows.reduce((sum, row) => sum + row.count, 0)}
            </p>
            <p className="text-[10px] text-admin-muted">
              Enquiries over six months
            </p>
          </div>
          {sample && (
            <div>
              <p className={`${monoClass} text-xl`}>5,812</p>
              <p className="text-[10px] text-admin-muted">Site visits over six months</p>
            </div>
          )}
        </div>
        <svg
          viewBox="0 0 510 195"
          className="w-full text-admin-ink"
          role="img"
          aria-label={rows
            .map((row) => `${row.month}: ${row.count} enquiries`)
            .join("; ")}
        >
          {[40, 80, 120, 160].map((y) => (
            <line
              key={y}
              x1="20"
              x2="495"
              y1={y}
              y2={y}
              className="stroke-admin-border"
            />
          ))}
          <path d={points} fill="none" stroke="currentColor" strokeWidth="2" />
          {sample && (
            <path d={curvePath(SAMPLE_TREND.map((row) => row.visits), 1500)} fill="none" className="stroke-admin-muted" strokeWidth="1.5" strokeDasharray="4 4" />
          )}
          {rows.map((row, index) => (
            <g key={row.month}>
              <circle
                cx={30 + index * 90}
                cy={160 - (row.count / max) * 120}
                r="3"
                className="fill-admin-surface stroke-admin-ink"
              >
                <title>{`${row.month}: ${row.count} enquiries`}</title>
              </circle>
              <text
                x={30 + index * 90}
                y="187"
                textAnchor="middle"
                className="fill-admin-muted text-[10px]"
              >
                {row.month.length > 3 ? row.month.slice(5) : row.month}
              </text>
            </g>
          ))}
        </svg>
        <p className="mt-3 text-[10px] text-admin-muted">
          {sample
            ? "Solid: enquiries (0–31). Dashed: visits (0–1,500). Sample series use separate scales."
            : "Monthly enquiry counts, grouped in UTC."}
        </p>
      </div>
    </Panel>
  );
}
