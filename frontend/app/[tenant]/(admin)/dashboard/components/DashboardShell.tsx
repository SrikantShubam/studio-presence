"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Calculator, ChartNoAxesCombined, Inbox, LayoutDashboard, LogOut, Menu, PanelsTopLeft, QrCode, Settings2, Unplug, type LucideIcon } from "lucide-react";
import { ThemeToggle } from "../../ThemeToggle";
import {
  Badge,
  Button,
  Dialog,
  Feedback,
  buttonClass,
} from "./primitives";
import {
  applyConfigPatch,
  EMPTY_FILTERS,
  NAV_ITEMS,
  viewFrom,
  type DashboardView,
  type Enquiry,
  type EnquiryFilters,
  type LeadAction,
  type WorkspaceData,
} from "./types";
import OverviewTab from "./OverviewTab";
import { EnquiryDesk } from "./EnquiryDesk";
import { EnquiryDetails, NewEnquiryDialog } from "./EnquiryDialogs";
import WebsiteEditor from "./WebsiteEditor";
import CalculatorTab from "./CalculatorTab";
import {
  AnalyticsTab,
  DigitalCardTab,
  IntegrationsTab,
  SettingsTab,
} from "./SupportingTabs";

const NAV_ICONS: Record<DashboardView, LucideIcon> = {
  overview: LayoutDashboard,
  enquiries: Inbox,
  analytics: ChartNoAxesCombined,
  website: PanelsTopLeft,
  calculator: Calculator,
  card: QrCode,
  settings: Settings2,
  integrations: Unplug,
};
export function DashboardShell({
  tenant,
  studioName,
  ownerName,
  authenticated,
  signOutAction,
  children,
}: {
  tenant: string;
  studioName: string;
  ownerName: string;
  authenticated: boolean;
  signOutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const [mobile, setMobile] = useState(false);
  const params = useSearchParams();
  const pathname = usePathname();
  const base = `/${tenant}/dashboard`;
  const isDashboardRoot = pathname === base || pathname === "/dashboard";
  const active = isDashboardRoot
    ? viewFrom(params.get("tab"))
    : pathname.includes("/content")
      ? "website"
      : pathname.includes("/analytics")
        ? "analytics"
        : pathname.includes("/settings")
          ? "settings"
          : "enquiries";
  function href(tab: DashboardView) {
    const next = new URLSearchParams();
    if (params.has("demo")) next.set("demo", params.get("demo")!);
    next.set("tab", tab);
    return `${base}?${next}`;
  }
  const navigation = (
    <nav className="grid gap-1" aria-label="Dashboard navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = NAV_ICONS[item.id];
        return (
          <div key={item.id}>
            {item.group && (
              <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">
                {item.group}
              </p>
            )}
            <Link
              href={href(item.id)}
              onClick={(event) => {
                if (
                  isDashboardRoot &&
                  !event.ctrlKey &&
                  !event.metaKey &&
                  !event.shiftKey &&
                  !event.altKey
                ) {
                  event.preventDefault();
                  window.history.pushState(null, "", href(item.id));
                }
                setMobile(false);
              }}
              aria-current={active === item.id ? "page" : undefined}
              className={active === item.id ? "flex min-h-11 items-center gap-3 bg-admin-raised px-3 py-2 text-xs font-semibold text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-primary" : "flex min-h-11 items-center gap-3 px-3 py-2 text-xs text-admin-muted focus-visible:outline-2 focus-visible:outline-admin-primary hover:bg-admin-raised"}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.8} />
              {item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
  const brand = (
    <>
      <div className="flex items-center gap-2 px-3">
        <span className="flex size-8 items-center justify-center border border-admin-border bg-admin-ink text-admin-bg">
          <PanelsTopLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </span>
        <p className="text-sm font-semibold tracking-tight">
          Studio Presence
        </p>
      </div>
      <div className="my-7 flex items-center gap-3 border border-admin-border bg-admin-bg p-3">
        <span className="flex size-8 shrink-0 items-center justify-center border border-admin-border bg-admin-raised text-[11px] font-semibold">
          {(studioName || "S").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{studioName}</p>
          <p className="mt-1 text-[11px] text-admin-muted">Studio workspace</p>
        </div>
      </div>
    </>
  );
  return (
    <div className="min-h-dvh bg-admin-bg text-admin-ink lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-admin-surface focus:p-4"
      >
        Skip to dashboard content
      </a>
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-admin-border bg-admin-bg p-4 pt-7 lg:flex">
        {brand}
        {navigation}
        <div className="mt-auto px-3 pt-5">
          <p className="mb-4 border-b border-admin-border pb-4 text-[11px] leading-5 text-admin-muted">
            Concept <span className="[font-family:var(--font-dashboard-mono)]">03</span> · {authenticated ? "Live workspace" : "Sample workspace"}
          </p>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center border border-admin-border bg-admin-raised text-[11px] font-semibold">
              {(ownerName || studioName).split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}
            </span>
            <div className="min-w-0"><p className="truncate text-xs font-semibold">{ownerName || studioName}</p><p className="mt-1 text-[11px] text-admin-muted">Workspace owner</p></div>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-admin-border bg-admin-bg px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              className="lg:hidden"
              aria-label="Open navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <Menu aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </Button>
            <p className="truncate text-xs">
              <span className="hidden text-admin-muted sm:inline">
                Workspace /{" "}
              </span>
              {NAV_ITEMS.find((item) => item.id === active)?.label}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            {authenticated ? (
              <form action={signOutAction}>
                <Button type="submit"><LogOut aria-hidden="true" className="size-4" />Sign out</Button>
              </form>
            ) : (
              <Link
                className={buttonClass}
                href={`/login?next=${encodeURIComponent(base)}`}
              >
                Sign in
              </Link>
            )}
          </div>
        </header>
        <main
          id="dashboard-main"
          tabIndex={-1}
          className="mx-auto max-w-[1580px] p-4 pb-12 sm:p-8"
        >
          {children}
        </main>
      </div>
      <Dialog
        open={mobile}
        onClose={() => setMobile(false)}
        title="Studio navigation"
        side="left"
      >
        <div className="flex h-full flex-col p-4">
          {brand}
          {navigation}
          <div className="mt-auto px-3 pt-5">
            <p className="mb-4 border-b border-admin-border pb-4 text-[11px] leading-5 text-admin-muted">Concept <span className="[font-family:var(--font-dashboard-mono)]">03</span> · {authenticated ? "Live workspace" : "Sample workspace"}</p>
            <div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center border border-admin-border bg-admin-raised text-[11px] font-semibold">{(ownerName || studioName).split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{ownerName || studioName}</p><p className="mt-1 text-[11px] text-admin-muted">Workspace owner</p></div></div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export function DashboardWorkspace({
  initialData,
  leadAction,
}: {
  initialData: WorkspaceData;
  leadAction: LeadAction;
}) {
  const [data, setData] = useState(initialData);
  const [restored, setRestored] = useState(initialData.mode !== "demo");
  const params = useSearchParams();
  const view = viewFrom(params.get("tab"));
  const [filters, setFilters] = useState<EnquiryFilters>({ ...EMPTY_FILTERS });
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [storageError, setStorageError] = useState("");
  const demoKey = `studio-presence:dashboard:demo:v1:${data.tenant}`;
  useEffect(() => {
    if (initialData.mode !== "demo") return;
    try {
      const saved = localStorage.getItem(demoKey);
      if (saved) {
        const patch: unknown = JSON.parse(saved);
        if (patch && typeof patch === "object" && !Array.isArray(patch)) {
          const allowed = Object.fromEntries(
            Object.entries(patch).filter(
              ([key]) =>
                key.startsWith("business.") || key.startsWith("sections."),
            ),
          );
          setData((previous) => ({
            ...previous,
            config: applyConfigPatch(initialData.config, allowed),
          }));
        }
      }
    } catch {
      setStorageError(
        "Local demo changes could not be restored. You can continue with the saved studio content.",
      );
    } finally {
      setRestored(true);
    }
  }, [demoKey, initialData.config, initialData.mode]);
  function navigate(next: DashboardView, status?: EnquiryFilters["status"]) {
    if (status) setFilters({ ...EMPTY_FILTERS, status });
    const query = new URLSearchParams(params.toString());
    query.set("tab", next);
    window.history.pushState(null, "", `/${data.tenant}/dashboard?${query}`);
  }
  async function saveConfig(patch: Record<string, unknown>) {
    if (!data.canEdit)
      throw new Error("Website editing is unavailable for this workspace.");
    if (data.mode === "demo") {
      const existing = JSON.parse(
        localStorage.getItem(demoKey) ?? "{}",
      ) as Record<string, unknown>;
      localStorage.setItem(demoKey, JSON.stringify({ ...existing, ...patch }));
    } else {
      const response = await fetch(
        `/api/${encodeURIComponent(data.tenant)}/panel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Could not save website changes.");
    }
    setData((previous) => ({
      ...previous,
      config: applyConfigPatch(previous.config, patch),
    }));
  }
  const performLeadAction: LeadAction = async (input) => {
    if (data.mode !== "demo") return leadAction(input);
    if (input.kind === "update") {
      const existing = data.enquiries.find((item) => item.id === input.id);
      if (!existing) return { ok: false, error: "Sample enquiry not found." };
      return {
        ok: true,
        data: { ...existing, status: input.status, notes: input.notes },
      };
    }
    const values = input.values;
    return {
      ok: true,
      data: {
        id: `sample-${crypto.randomUUID()}`,
        tenant_id: "sample",
        name: values.name,
        phone: values.phone,
        email: null,
        locality: values.locality,
        project_type: values.projectType,
        budget_band: values.budgetBand,
        timeline: values.timeline,
        message: values.message,
        source: "other",
        source_page: "sample",
        status: "new",
        notes: "",
        created_at: new Date().toISOString(),
        contacted_at: null,
      },
    };
  };
  function updateLead(enquiry: Enquiry) {
    setData((previous) => ({
      ...previous,
      enquiries: previous.enquiries.map((item) =>
        item.id === enquiry.id ? enquiry : item,
      ),
    }));
  }
  const chosen = data.enquiries.find((item) => item.id === selected);
  if (!restored)
    return (
      <p role="status" className="text-sm text-admin-muted">
        Restoring local demo changes…
      </p>
    );
  const description =
    data.mode === "demo"
      ? "Sample workspace. Website changes save only in this browser; sample leads reset on refresh."
      : data.mode === "unavailable"
        ? "Sample data is off. Live enquiries require an eligible tenant account."
        : "Tenant workspace. Website saves update published content.";
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-admin-border bg-admin-surface p-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>
            {data.mode === "demo"
              ? "Sample data"
              : data.mode === "live"
                ? "Live workspace"
                : "Live enquiries unavailable"}
          </Badge>
          <p className="text-[11px] text-admin-muted">{description}</p>
        </div>
        <Link
          className="min-h-11 content-center text-xs underline"
          href={`/${data.tenant}/dashboard?demo=${data.mode === "demo" ? "0" : "1"}&tab=${view}`}
        >
          {data.mode === "demo"
            ? "Turn sample data off"
            : "Turn sample data on"}
        </Link>
      </div>
      <Feedback error={storageError || data.leadError} />
      {view === "overview" && (
        <OverviewTab
          data={data}
          filters={filters}
          onFiltersChange={setFilters}
          onNavigate={navigate}
          onCreate={() => setCreating(true)}
          onOpen={(item) => setSelected(item.id)}
        />
      )}
      {view === "enquiries" && (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Good projects start with a conversation.
              </h1>
              <p className="mt-2 text-xs text-admin-muted">
                Every enquiry, one considered next step.
              </p>
            </div>
            <Button
              variant="primary"
              disabled={!data.canCreate || Boolean(data.leadError)}
              onClick={() => setCreating(true)}
            >
              Log walk-in lead
            </Button>
          </div>
          <EnquiryDesk
            enquiries={data.enquiries}
            filters={filters}
            onFiltersChange={setFilters}
            onOpenEnquiry={(item) => setSelected(item.id)}
            mode={data.mode}
            tenant={data.tenant}
          />
        </div>
      )}
      <PersistentTab active={view === "website"}>
        <WebsiteEditor
          config={data.config}
          tenant={data.tenant}
          mode={data.mode}
          canEdit={data.canEdit}
          onSave={saveConfig}
        />
      </PersistentTab>
      <PersistentTab active={view === "calculator"}>
        <CalculatorTab
          config={data.config}
          mode={data.mode}
          canEdit={data.canEdit}
          onSave={saveConfig}
        />
      </PersistentTab>
      {view === "card" && (
        <DigitalCardTab config={data.config} tenant={data.tenant} />
      )}
      {view === "analytics" && <AnalyticsTab data={data} />}
      <PersistentTab active={view === "settings"}>
        <SettingsTab
          config={data.config}
          mode={data.mode}
          canEdit={data.canEdit}
          onSave={saveConfig}
        />
      </PersistentTab>
      {view === "integrations" && (
        <IntegrationsTab data={data} onNavigate={navigate} />
      )}
      {creating && (
        <NewEnquiryDialog
          mode={data.mode}
          action={performLeadAction}
          onClose={() => setCreating(false)}
          onCreated={(item) => {
            setData((previous) => ({
              ...previous,
              enquiries: [item, ...previous.enquiries],
            }));
            setCreating(false);
            navigate("enquiries", "all");
          }}
        />
      )}
      {chosen && (
        <EnquiryDetails
          key={chosen.id}
          enquiry={chosen}
          mode={data.mode}
          action={performLeadAction}
          onClose={() => setSelected(null)}
          onUpdated={updateLead}
        />
      )}
    </>
  );
}

function PersistentTab({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const [visited, setVisited] = useState(active);
  useEffect(() => {
    if (active) setVisited(true);
  }, [active]);
  return active || visited ? <div hidden={!active}>{children}</div> : null;
}
