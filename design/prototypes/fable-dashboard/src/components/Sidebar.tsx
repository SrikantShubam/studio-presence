import {
  LayoutDashboard,
  Users,
  Calculator,
  QrCode,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  ExternalLink,
  Sparkles,
  Home,
} from 'lucide-react';
import { useStore } from '../store';

const navSections: {
  label: string;
  items: { id: 'overview' | 'leads' | 'calculator' | 'qrcard' | 'analytics' | 'settings'; label: string; icon: any }[];
}[] = [
  {
    label: 'Studio',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'leads', label: 'Leads & CRM', icon: Users },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Growth Tools',
    items: [
      { id: 'calculator', label: 'Estimate Calculator', icon: Calculator },
      { id: 'qrcard', label: 'Digital Card & QR', icon: QrCode },
    ],
  },
  {
    label: 'Account',
    items: [{ id: 'settings', label: 'Settings', icon: Settings }],
  },
];

export function Sidebar() {
  const store = useStore();
  const newCount = store.leads.filter((l) => l.status === 'new').length;
  const collapsed = store.sidebarCollapsed;

  return (
    <>
      {/* Mobile overlay */}
      {store.mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden animate-fade-in"
          onClick={store.toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:z-auto lg:translate-x-0 ${
          store.mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[64px]' : 'w-[248px]'}`}
      >
        {/* Brand */}
        <div className={`flex h-14 shrink-0 items-center border-b border-sidebar-border ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" strokeWidth={1.75} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold leading-tight">Studio Presence</span>
                <span className="text-[10px] leading-tight text-muted-foreground">Ashish Interiors · Patna</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={store.toggleMobileMenu}
              className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-5 last:mb-0">
              {!collapsed && (
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = store.page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => store.setPage(item.id)}
                      className={`group relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-2 text-[13px] font-medium transition-colors ${
                        collapsed ? 'justify-center px-0' : 'px-2.5'
                      } ${
                        isActive
                          ? 'bg-sidebar-accent text-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                      {!collapsed && item.id === 'leads' && newCount > 0 && (
                        <span className="rounded-full bg-primary px-1.5 py-px font-mono text-[10px] font-semibold text-primary-foreground">
                          {newCount}
                        </span>
                      )}
                      {collapsed && item.id === 'leads' && newCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Plan card */}
        {!collapsed && (
          <div className="mx-3 mb-3 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
              <span className="text-xs font-semibold">Growth Plan</span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Custom domain, lead alerts & analytics active.
            </p>
            <a
              href="https://ashish-interiors.in"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-[11px] font-medium text-foreground hover:underline"
            >
              ashish-interiors.in <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="hidden shrink-0 border-t border-sidebar-border p-2.5 lg:block">
          <button
            onClick={store.toggleSidebar}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" /> Collapse
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export function Header() {
  const store = useStore();
  const uncontacted = store.leads.filter((l) => !l.contacted).length;

  const pageTitles: Record<string, { title: string; sub: string }> = {
    overview: { title: 'Overview', sub: 'Daily studio operations' },
    leads: { title: 'Leads & Enquiries', sub: 'Every enquiry is ₹2L–₹25L of business' },
    calculator: { title: 'Estimate Calculator', sub: 'Tune & test your public pricing' },
    qrcard: { title: 'Digital Card & QR', sub: 'Physical networking toolkit' },
    analytics: { title: 'Traffic & Analytics', sub: 'Umami-verified, no vanity metrics' },
    settings: { title: 'Settings & Security', sub: 'Studio identity, team & integrations' },
  };

  const meta = pageTitles[store.page];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={store.toggleMobileMenu}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold leading-tight">{meta.title}</h1>
        <p className="hidden truncate text-[11px] leading-tight text-muted-foreground sm:block">
          {meta.sub}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button
          onClick={() => {
            store.setStatusFilter('new');
            store.setPage('leads');
          }}
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={`${uncontacted} uncontacted enquiries`}
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          {uncontacted > 0 && (
            <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive font-mono text-[8px] font-bold text-white">
              {uncontacted}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Toggle theme"
        >
          {store.theme === 'dark' ? (
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Moon className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* User */}
        <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-accent">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground">
            AK
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-xs font-medium leading-tight">Ashish Kumar</span>
            <span className="text-[10px] leading-tight text-muted-foreground">Owner</span>
          </div>
        </button>
      </div>
    </header>
  );
}