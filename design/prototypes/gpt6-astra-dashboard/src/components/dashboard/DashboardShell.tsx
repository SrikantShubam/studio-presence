"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Calculator, ChartNoAxesCombined, Check, Inbox, LayoutDashboard, Menu, PanelsTopLeft, QrCode, Settings2, SunMoon, Unplug, X } from "lucide-react";
import { Badge, Button, PageHeading } from "@/components/ui/primitives";
import { EMPTY_FILTERS, type DashboardView, type Enquiry, type EnquiryFilters, type Notice, type WorkspaceData } from "@/lib/types";
import { navigateDashboard, useDashboardView, useStudioTheme } from "@/lib/browser-state";
import OverviewTab from "./OverviewTab";
import { EnquiryDesk } from "./EnquiryDesk";
import { EnquiryDetails, NewEnquiryDialog } from "./EnquiryDialogs";
import CalculatorTab from "./CalculatorTab";
import WebsiteEditor from "./WebsiteEditor";
import { AnalyticsTab, DigitalCardTab, IntegrationsTab, SettingsTab, ShareCardDialog } from "./SupportingTabs";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "analytics", label: "Traffic & analytics", icon: ChartNoAxesCombined },
  { id: "website", label: "Website editor", icon: PanelsTopLeft },
  { id: "calculator", label: "Estimate calculator", icon: Calculator },
  { id: "card", label: "Digital card & QR", icon: QrCode },
  { id: "settings", label: "Workspace settings", icon: Settings2 },
  { id: "integrations", label: "Integrations", icon: Unplug },
] as const;
export default function DashboardShell({ initialData }: { initialData: WorkspaceData }) {
  const [data, setData] = useState(initialData);
  const view = useDashboardView();
  const { dark, toggleTheme } = useStudioTheme();
  const [filters, setFilters] = useState<EnquiryFilters>({ ...EMPTY_FILTERS });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const currentNav = NAV_ITEMS.find((item) => item.id === view)!;
  const selectedEnquiry = data.enquiries.find((enquiry) => enquiry.id === selectedId);
  const initials = (value: string) => value.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  const notify = useCallback((message: string, kind: Notice["kind"] = "success") => setNotice({ message, kind }), []);

  useEffect(() => { document.title = `${currentNav.label} · Studio Presence`; }, [currentNav.label]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!mobileOpen) return;
    sidebarRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") { setMobileOpen(false); menuRef.current?.focus(); }
      if (event.key === "Tab") {
        const buttons = sidebarRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
        if (!buttons?.length) return;
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("keydown", keyboard); document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  function navigate(next: DashboardView, status?: EnquiryFilters["status"]) {
    if (status) setFilters({ ...EMPTY_FILTERS, status });
    setMobileOpen(false);
    navigateDashboard(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function selectCity(city: string) { setFilters({ ...EMPTY_FILTERS, city }); navigate("enquiries"); }
  function updateEnquiry(enquiry: Enquiry) {
    setData((previous) => ({ ...previous, enquiries: previous.enquiries.map((item) => item.id === enquiry.id ? enquiry : item) }));
  }
  function createEnquiry(enquiry: Enquiry) {
    setData((previous) => ({ ...previous, enquiries: [enquiry, ...previous.enquiries] }));
    navigate("enquiries", "All"); notify("Enquiry added to your desk");
  }

  return (
    <>
      <a href="#main-content" className="sr-only z-50 bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4">Skip to content</a>
      <div className="app-shell">
        {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation backdrop" onClick={() => setMobileOpen(false)} />}
        <aside ref={sidebarRef} className={`sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Studio workspace navigation" role={mobileOpen ? "dialog" : undefined} aria-modal={mobileOpen || undefined}>
          <Button className="mobile-menu icon-button absolute right-2 top-2" aria-label="Close navigation" onClick={() => { setMobileOpen(false); menuRef.current?.focus(); }}><X /></Button>
          <div className="brand"><span className="brand-mark"><PanelsTopLeft /></span><span>Studio Presence</span></div>
          <div className="workspace-switcher"><span className="avatar">{initials(data.settings.name)}</span><div className="min-w-0"><strong className="block truncate text-[12px] font-semibold">{data.settings.name}</strong><span className="text-[11px] text-muted-foreground">{data.settings.city}, Bihar</span></div></div>
          <nav className="sidebar-nav" aria-label="Workspace">
            {NAV_ITEMS.map((item, index) => <Fragment key={item.id}>{index === 3 && <div className="nav-label">Your website</div>}{index === 6 && <div className="nav-label">Workspace</div>}<button className={`nav-item ${view === item.id ? "active" : ""}`} aria-current={view === item.id ? "page" : undefined} onClick={() => navigate(item.id)}><item.icon />{item.label}</button></Fragment>)}
          </nav>
          <div className="sidebar-footer"><p className="mb-4 border-b border-border pb-[18px] text-[11px] leading-[1.6] text-muted-foreground">Concept <span className="font-mono">03</span> · Sample workspace<br />Sample clients and analytics.<br />Your studio changes are saved.</p><div className="flex items-center gap-2.5"><span className="avatar">{initials(data.settings.ownerName)}</span><div><strong className="text-[12px] font-semibold">{data.settings.ownerName}</strong><p className="text-[11px] text-muted-foreground">Workspace owner</p></div></div></div>
        </aside>
        <div className="min-w-0" inert={mobileOpen || undefined}>
          <header className="topbar">
            <div className="flex items-center gap-2.5"><button ref={menuRef} className="btn mobile-menu icon-button" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu /></button><span className="text-muted-foreground max-[420px]:hidden">Workspace /</span><strong className="text-[12px] font-semibold">{currentNav.label}</strong></div>
            <div className="flex items-center gap-2.5"><Badge>Sample workspace</Badge><Button className="icon-button" onClick={toggleTheme} aria-label="Toggle light and dark theme" title={dark ? "Switch to light theme" : "Switch to dark theme"}><SunMoon /></Button></div>
          </header>
          <main id="main-content" className="main-content">
            {view === "overview" && <OverviewTab enquiries={data.enquiries} filters={filters} onFiltersChange={setFilters} onOpenEnquiry={(enquiry) => setSelectedId(enquiry.id)} onCreateEnquiry={() => setNewOpen(true)} onShareCard={() => setShareOpen(true)} onNavigate={navigate} />}
            {view === "enquiries" && <><PageHeading title="Good projects start with a conversation." description="Every enquiry, one considered next step." action={<Button variant="primary" onClick={() => setNewOpen(true)}><Inbox />Log walk-in lead</Button>} /><EnquiryDesk standalone enquiries={data.enquiries} filters={filters} onFiltersChange={setFilters} onOpenEnquiry={(enquiry) => setSelectedId(enquiry.id)} /></>}
            {view === "analytics" && <AnalyticsTab enquiries={data.enquiries} onNavigate={navigate} onSelectCity={selectCity} />}
            {view === "calculator" && <CalculatorTab initialPricing={data.pricing} onPublished={(pricing) => { setData((previous) => ({ ...previous, pricing })); notify("Pricing published to your website"); }} />}
            {view === "website" && <WebsiteEditor initialDraft={data.websiteDraft} published={data.websitePublished} settings={data.settings} onSaved={(content, publish) => setData((previous) => ({ ...previous, websiteDraft: content, websitePublished: publish ? content : previous.websitePublished }))} />}
            {view === "card" && <DigitalCardTab settings={data.settings} onShare={() => setShareOpen(true)} notify={notify} />}
            {view === "settings" && <SettingsTab initialSettings={data.settings} onSaved={(settings) => setData((previous) => ({ ...previous, settings }))} />}
            {view === "integrations" && <IntegrationsTab onNavigate={navigate} />}
          </main>
        </div>
      </div>
      {newOpen && <NewEnquiryDialog open onClose={() => setNewOpen(false)} onCreated={createEnquiry} />}
      {selectedEnquiry && <EnquiryDetails key={selectedEnquiry.id} enquiry={selectedEnquiry} studioName={data.settings.name} onClose={() => setSelectedId(null)} onUpdated={updateEnquiry} />}
      <ShareCardDialog open={shareOpen} onClose={() => setShareOpen(false)} settings={data.settings} notify={notify} />
      {notice && <div className="toast" role={notice.kind === "error" ? "alert" : "status"}>{notice.kind === "error" ? <X /> : <Check />}<span>{notice.message}</span><button aria-label="Dismiss notification" className="ml-3 opacity-60 hover:opacity-100" onClick={() => setNotice(null)}><X className="!size-3.5" /></button></div>}
    </>
  );
}
