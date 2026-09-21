import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Clock,
  Eye,
  MessageCircle,
  QrCode,
  Phone,
  ExternalLink,
  Plus,
  Share2,
  Sliders,
  ArrowRight,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../store';
import { trafficData, cityData, formatCurrency } from '../data';
import { Card, Badge, Button } from './ui';
import { IndiaMap } from './IndiaMap';

/* ---------- KPI ---------- */

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  subtitle,
  urgent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  urgent?: boolean;
}) {
  return (
    <Card className={`relative overflow-hidden ${urgent ? 'ring-1 ring-destructive/40' : ''}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </span>
          <span className="text-muted-foreground/70">{icon}</span>
        </div>
        <div className="mt-2 font-mono text-[22px] font-bold leading-none tracking-tight">
          {value}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium ${
                trendUp
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </span>
          )}
          {urgent && (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 font-medium text-destructive">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
              Uncontacted
            </span>
          )}
          {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
        </div>
      </div>
    </Card>
  );
}

/* ---------- Chart tooltip ---------- */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold">{label} 2026</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground" /> Visitors
          </span>
          <span className="font-mono text-xs font-semibold">
            {payload[0]?.value?.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/60" /> Enquiries
          </span>
          <span className="font-mono text-xs font-semibold">{payload[1]?.value}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Status badge helper ---------- */

function statusVariant(status: string) {
  switch (status) {
    case 'new': return 'info' as const;
    case 'contacted': return 'warning' as const;
    case 'quoted': return 'secondary' as const;
    case 'won': return 'success' as const;
    default: return 'destructive' as const;
  }
}

/* ---------- Page ---------- */

export function OverviewPage() {
  const store = useStore();

  const newLeads = store.leads.filter((l) => l.status === 'new');
  const uncontacted = store.leads.filter((l) => !l.contacted);
  const pipelineValue = store.leads
    .filter((l) => l.status !== 'lost' && l.status !== 'won')
    .reduce((sum, l) => sum + (l.budgetMin + l.budgetMax) / 2, 0);

  const recentLeads = useMemo(() => store.leads.slice(0, 7), [store.leads]);
  const sortedCities = useMemo(() => [...cityData].sort((a, b) => b.visits - a.visits), []);
  const maxVisits = sortedCities[0]?.visits ?? 1;

  return (
    <div className="space-y-5">
      {/* Greeting + quick actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {(() => {
              const h = new Date().getHours();
              return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
            })()}
            , Ashish 👋
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {uncontacted.length > 0 ? (
              <>
                <span className="font-medium text-destructive">{uncontacted.length} uncontacted enquiries</span>{' '}
                are waiting for a first response.
              </>
            ) : (
              'All enquiries have been contacted. Great response velocity!'
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => store.setAddLeadModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Log Walk-in
          </Button>
          <Button size="sm" variant="outline" onClick={() => store.setPage('calculator')}>
            <Sliders className="h-3.5 w-3.5" /> Tune ₹/SqFt
          </Button>
          <Button
            size="sm"
            variant="whatsapp"
            onClick={() => window.open('https://wa.me/919876543210', '_blank')}
          >
            <Share2 className="h-3.5 w-3.5" /> Share vCard
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('https://ashish-interiors.in', '_blank')}
          >
            Live Site <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="New Enquiries"
          value={String(newLeads.length)}
          trend="+55%"
          trendUp
          subtitle="vs last mo"
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValue)}
          subtitle="open enquiries"
          icon={<IndianRupee className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          title="Avg Response"
          value="24m"
          urgent={uncontacted.length > 0}
          icon={<Clock className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          title="Verified Visitors"
          value="1,248"
          trend="+18%"
          trendUp
          icon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          title="WhatsApp Clicks"
          value="86"
          trend="+32%"
          trendUp
          icon={<MessageCircle className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          title="QR Card Scans"
          value="34"
          trend="+12"
          trendUp
          icon={<QrCode className="h-4 w-4" strokeWidth={1.75} />}
        />
      </div>

      {/* Chart + Map */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Traffic Chart */}
        <Card className="xl:col-span-3">
          <div className="flex items-start justify-between p-5 pb-1">
            <div>
              <h3 className="text-sm font-semibold">Traffic & Enquiries</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Site visits vs consultation enquiries · last 6 months
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-foreground" /> Visitors
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60" /> Enquiries
              </span>
            </div>
          </div>
          <div className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficData} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gEnquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-muted-foreground)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--color-muted-foreground)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.45} vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                  width={44}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="var(--color-foreground)"
                  strokeWidth={2}
                  fill="url(#gVisitors)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-background)' }}
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  stroke="var(--color-muted-foreground)"
                  strokeWidth={2}
                  fill="url(#gEnquiries)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-background)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* India Map */}
        <Card className="xl:col-span-2">
          <div className="flex items-start justify-between p-5 pb-2">
            <div>
              <h3 className="text-sm font-semibold">Geographic Demand</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Real visitor cities · click a dot to filter leads
              </p>
            </div>
            {store.cityFilter && (
              <button
                onClick={() => store.setCityFilter(null)}
                className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear · {store.cityFilter}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 px-5 pb-5 sm:grid-cols-5 sm:gap-4">
            <div className="sm:col-span-3">
              <IndiaMap
                activeCity={store.cityFilter}
                onCityClick={(city) => {
                  store.setCityFilter(store.cityFilter === city ? null : city);
                  store.setPage('leads');
                }}
              />
            </div>
            {/* City rank list */}
            <div className="flex flex-col justify-center gap-2.5 sm:col-span-2">
              {sortedCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    store.setCityFilter(store.cityFilter === city.name ? null : city.name);
                    store.setPage('leads');
                  }}
                  className={`group w-full rounded-lg border px-2.5 py-2 text-left transition-colors cursor-pointer ${
                    store.cityFilter === city.name
                      ? 'border-foreground/40 bg-muted'
                      : 'border-transparent hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${city.isHQ ? 'bg-whatsapp' : 'bg-foreground/60'}`}
                      />
                      {city.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {city.visits} · {city.leads}L
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${city.isHQ ? 'bg-whatsapp' : 'bg-foreground/50'}`}
                      style={{ width: `${(city.visits / maxVisits) * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Enquiries Table */}
      <Card>
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h3 className="text-sm font-semibold">Recent Enquiries</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {store.leads.length} total · {newLeads.length} new ·{' '}
              <span className={uncontacted.length ? 'text-destructive font-medium' : ''}>
                {uncontacted.length} uncontacted
              </span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => store.setPage('leads')}>
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border bg-muted/40">
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Client & Locality
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Project & Value
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Source
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Timeline
                </th>
                <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => store.setSelectedLead(lead)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      {!lead.contacted ? (
                        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-destructive" title="Uncontacted" />
                      ) : (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-transparent" />
                      )}
                      <div>
                        <p className="text-sm font-medium leading-tight">{lead.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {lead.locality}, {lead.city}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm leading-tight">{lead.projectType}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {formatCurrency(lead.budgetMin)} – {formatCurrency(lead.budgetMax)}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant(lead.status)}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-muted-foreground">{lead.timeline}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`https://wa.me/${lead.phone}?text=${encodeURIComponent(
                          `Hi ${lead.name}, thank you for your interest in our interior design services. I'd love to discuss your ${lead.projectType} project. When would be a good time to chat?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-transparent p-1.5 text-whatsapp transition-colors hover:border-whatsapp/30 hover:bg-whatsapp/10"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="rounded-md border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
                        title="Call"
                      >
                        <Phone className="h-4 w-4" strokeWidth={1.75} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-border border-t border-border md:hidden">
          {recentLeads.map((lead) => (
            <div
              key={lead.id}
              className="cursor-pointer px-4 py-3 hover:bg-muted/50"
              onClick={() => store.setSelectedLead(lead)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {!lead.contacted && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.locality}, {lead.city}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {lead.projectType} ·{' '}
                      <span className="font-mono">
                        {formatCurrency(lead.budgetMin)}–{formatCurrency(lead.budgetMax)}
                      </span>
                    </p>
                  </div>
                </div>
                <Badge variant={statusVariant(lead.status)} className="text-[10px]">
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                  href={`https://wa.me/${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}, thank you for your interest!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-md bg-whatsapp/10 px-2.5 py-1.5 text-whatsapp"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-medium">WhatsApp</span>
                </a>
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-muted-foreground"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-medium">Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer helper */}
      <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <ExternalLink className="mr-1.5 inline h-3.5 w-3.5" />
          Your site <span className="font-mono text-foreground">ashish-interiors.in</span> is live and healthy · SSL valid · Last deploy 2 days ago
        </p>
        <Badge variant="success" className="hidden sm:inline-flex">Operational</Badge>
      </div>
    </div>
  );
}