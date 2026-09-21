"use client";

import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays,
  ChevronRight, Clock3, Inbox, MessageCircle, Plus,
  ScanLine, SlidersHorizontal, Users,
} from "lucide-react";
import type { DashboardView, Enquiry, EnquiryFilters } from "@/lib/types";
import { CITY_DEMAND } from "@/lib/demo-data";
import { Button, Badge, PageHeading } from "@/components/ui/primitives";
import { EnquiryDesk } from "./EnquiryDesk";

type OverviewTabProps = {
  enquiries: Enquiry[];
  filters: EnquiryFilters;
  onFiltersChange: (filters: EnquiryFilters) => void;
  onOpenEnquiry: (enquiry: Enquiry) => void;
  onCreateEnquiry: () => void;
  onShareCard: () => void;
  onNavigate: (view: DashboardView, status?: EnquiryFilters["status"]) => void;
};

/** Astra Concept 03's daily desk. All mutations are owned by the workspace. */
export default function OverviewTab({
  enquiries, filters, onFiltersChange, onOpenEnquiry,
  onCreateEnquiry, onShareCard, onNavigate,
}: OverviewTabProps) {
  const waiting = enquiries.filter((enquiry) => enquiry.status === "New").length;

  function selectCity(city: string) {
    onFiltersChange({ status: "All", city, query: "" });
    window.requestAnimationFrame(() => {
      document.getElementById("enquiries")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
    });
  }

  return (
    <>
      <PageHeading
        title="Your studio, at a glance."
        description="Start with the conversations that need you."
        action={<Badge><CalendarDays /><span>September <span className="font-mono">2026</span></span></Badge>}
      />
      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="primary" onClick={onCreateEnquiry}><Plus />Log walk-in lead</Button>
        <Button onClick={onShareCard}><MessageCircle />Share WhatsApp vCard</Button>
        <Button onClick={() => onNavigate("calculator")}><SlidersHorizontal />Tune pricing <span className="font-mono">₹/sqft</span></Button>
        <a className="btn" href="/site" target="_blank" rel="noopener noreferrer">View live site<ArrowUpRight /></a>
      </div>

      {waiting > 0 && (
        <section aria-label="Enquiries awaiting a response" className="response-notice">
          <div className="flex items-center gap-2.5">
            <Clock3 className="shrink-0 text-destructive" />
            <div>
              <p className="font-semibold"><span className="font-mono">{waiting}</span> enquiries are waiting for a first response</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">A quick reply helps turn an enquiry into a site visit.</p>
            </div>
          </div>
          <Button onClick={() => onNavigate("enquiries", "New")}>Review new enquiries<ArrowRight /></Button>
        </section>
      )}

      <MetricGrid enquiries={enquiries} onNavigate={onNavigate} />
      <div className="overview-charts">
        <AttentionChart />
        <CityDemand selectedCity={filters.city} onSelectCity={selectCity} />
      </div>
      <EnquiryDesk
        enquiries={enquiries}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onOpenEnquiry={onOpenEnquiry}
      />
    </>
  );
}

export function MetricGrid({ enquiries, onNavigate }: Pick<OverviewTabProps, "enquiries" | "onNavigate">) {
  const open = enquiries.filter((enquiry) => enquiry.status !== "Won");
  const waiting = enquiries.filter((enquiry) => enquiry.status === "New").length;
  const pipeline = open.reduce((total, enquiry) => total + enquiry.value, 0);
  const metrics = [
    { label: "New enquiries", value: "31", subtitle: "20 last month", delta: "+55%", icon: Inbox, target: "enquiries" },
    { label: "Active pipeline", value: `₹${pipeline.toFixed(1)}L`, subtitle: `${open.length} open sample enquiries`, delta: "Budget midpoints", icon: BriefcaseBusiness, target: "enquiries" },
    { label: "First response", value: "24 min", subtitle: "Monthly sample average", delta: `${waiting} awaiting contact`, icon: Clock3, target: "enquiries" },
    { label: "Website visitors", value: "1,248", subtitle: "1,058 last month", delta: "+18%", icon: Users, target: "analytics" },
    { label: "WhatsApp clicks", value: "86", subtitle: "Link clicks, not private chats", delta: "Top action channel", icon: MessageCircle, target: "analytics" },
    { label: "Digital card scans", value: "34", subtitle: "24 last month", delta: "+42%", icon: ScanLine, target: "card" },
  ] as const;

  return (
    <section className="metric-grid" aria-label="Studio performance at a glance">
      {metrics.map((metric, index) => (
        <button
          key={metric.label}
          className="metric-card group"
          onClick={() => onNavigate(metric.target, index === 2 ? "New" : undefined)}
          aria-label={`${metric.label}: ${metric.value}. Open ${metric.target}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium">{metric.label}</span>
            <metric.icon className="text-muted-foreground transition-colors group-hover:text-foreground" />
          </div>
          <div className="metric-number font-mono">{metric.value}</div>
          <div className="metric-bottom">
            <span className="text-[11px] text-muted-foreground">{metric.subtitle}</span>
            <span className={`metric-delta ${index === 2 && waiting ? "bg-destructive/6 text-destructive" : "bg-muted"} ${metric.delta.startsWith("+") ? "font-mono" : ""}`}>{metric.delta}</span>
          </div>
        </button>
      ))}
    </section>
  );
}

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const VISITS = [556, 756, 878, 1126, 1248, 1248];
const COUNTS = [11, 17, 16, 26, 25, 31];
const POINTS = [120, 102, 91, 69, 58, 58];

export function AttentionChart() {
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  return (
    <section className="panel min-w-0" aria-labelledby="attention-title">
      <div className="panel-heading">
        <div><h2 id="attention-title">Attention into enquiries</h2><p className="panel-description">Sample visits and recorded enquiries</p></div>
        <Badge>Apr – Sep</Badge>
      </div>
      <div className="p-5">
        <div className="mb-[5px] mt-[17px] flex gap-8">
          <div><p className="font-mono text-[21px]">5,812</p><p className="text-[11px] text-muted-foreground">Site visits</p></div>
          <div><p className="font-mono text-[21px]">126</p><p className="text-[11px] text-muted-foreground">Enquiries</p></div>
        </div>
        <div className="relative">
          {activeMonth !== null && (
            <div role="status" className="chart-tooltip" style={{ left: `${Math.min(65, activeMonth * 15 + 7)}%` }}>
              <p className="font-semibold">{MONTHS[activeMonth]} <span className="font-mono">2026</span></p>
              <p><span className="font-mono">{VISITS[activeMonth].toLocaleString("en-IN")}</span> visitors · <span className="font-mono">{COUNTS[activeMonth]}</span> enquiries</p>
            </div>
          )}
          <svg className="trend-chart" viewBox="0 0 540 215" aria-label="Six month visits and enquiries trend">
            <title>Sample website visits and enquiries, April to September 2026</title>
            {[35, 80, 125, 170].map((y, i) => (
              <g key={y}>
                <line className="chart-gridline" x1="35" y1={y} x2="525" y2={y} />
                <text x="0" y={y + 4} className="chart-number">{[1500, 1000, 500, 0][i]}</text>
              </g>
            ))}
            <path d="M40 120 C90 120 90 100 135 102 S195 88 230 91 S295 64 325 69 S385 60 420 58 S482 58 515 58 L515 170 L40 170 Z" fill="hsl(var(--foreground) / 0.035)" />
            <path d="M40 120 C90 120 90 100 135 102 S195 88 230 91 S295 64 325 69 S385 60 420 58 S482 58 515 58" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M40 145 C90 145 90 132 135 132 S195 134 230 134 S295 111 325 111 S385 114 420 114 S482 100 515 100" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="4 4" />
            {MONTHS.map((month, i) => (
              <g key={month} tabIndex={0} role="img" aria-label={`${month}: ${VISITS[i]} visitors, ${COUNTS[i]} enquiries`} onMouseEnter={() => setActiveMonth(i)} onMouseLeave={() => setActiveMonth(null)} onFocus={() => setActiveMonth(i)} onBlur={() => setActiveMonth(null)}>
                <rect x={i * 95 + 23} y="15" width="42" height="160" fill="transparent" />
                {activeMonth === i && <line x1={40 + i * 95} y1="25" x2={40 + i * 95} y2="170" stroke="hsl(var(--border))" />}
                <circle cx={40 + i * 95} cy={POINTS[i]} r={activeMonth === i ? 4.5 : 3} fill="hsl(var(--background))" stroke="currentColor" />
                <text x={40 + i * 95} y="201" textAnchor="middle">{month}</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-[11px] flex flex-wrap gap-[18px] text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-[1.5px] border-foreground" />Visits · left scale</span>
          <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-muted-foreground" />Enquiries · scale <span className="font-mono">0–60</span></span>
        </div>
      </div>
    </section>
  );
}

export function CityDemand({ selectedCity = "", onSelectCity }: { selectedCity?: string; onSelectCity: (city: string) => void }) {
  return (
    <section className="panel flex min-w-0 flex-col" aria-labelledby="demand-title">
      <div className="panel-heading">
        <div><h2 id="demand-title">Where your next project begins</h2><p className="panel-description">City demand · select a row to explore enquiries</p></div>
        <Badge>September</Badge>
      </div>
      <div className="px-5 py-3.5">
        <div className="demand-row demand-head"><span>City</span><span>Visits</span><span>Enquiries</span></div>
        {CITY_DEMAND.map(({ name, visits, enquiries }) => (
          <button key={name} className={`demand-row demand-city ${selectedCity === name ? "bg-muted/70" : ""}`} onClick={() => onSelectCity(name)} aria-label={`View ${name} enquiries`} aria-pressed={selectedCity === name}>
            <div>
              <span className="font-semibold">{name}</span>
              {name === "Patna" && <span className="ml-[7px] text-[9px] text-muted-foreground">Studio HQ</span>}
              <div className="mt-[7px] h-[3px] max-w-[190px] bg-muted" aria-hidden="true"><div className="h-full bg-foreground/60" style={{ width: `${(visits / 612) * 100}%` }} /></div>
            </div>
            <span className="font-mono">{visits}</span>
            <span className="flex items-center justify-end gap-2.5 font-mono">{enquiries}<ChevronRight className="text-muted-foreground" /></span>
          </button>
        ))}
      </div>
      <p className="panel-footer mt-auto">Sample city-level visits and enquiries. The desk shows a representative subset.</p>
    </section>
  );
}
