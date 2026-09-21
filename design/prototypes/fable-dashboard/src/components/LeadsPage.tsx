import { useState } from 'react';
import {
  Search,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  X,
  FileText,
  Clock,
  IndianRupee,
  Filter,
  CalendarDays,
  Save,
} from 'lucide-react';
import { useStore } from '../store';
import { type Lead, formatCurrency, formatCurrencyFull } from '../data';
import { Card, Badge, Button, Input, Tabs, Textarea, Select, Label, Separator, EmptyState } from './ui';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'won', label: 'Won' },
];

function statusVariant(status: string) {
  switch (status) {
    case 'new': return 'info' as const;
    case 'contacted': return 'warning' as const;
    case 'quoted': return 'secondary' as const;
    case 'won': return 'success' as const;
    default: return 'destructive' as const;
  }
}

function waLink(lead: Lead) {
  return `https://wa.me/${lead.phone}?text=${encodeURIComponent(
    `Hi ${lead.name}, thank you for your interest in Ashish Interiors. I'd love to discuss your ${lead.projectType} project. When would be a good time for a quick chat?`
  )}`;
}

/* ================= List Page ================= */

export function LeadsPage() {
  const store = useStore();
  const filteredLeads = store.getFilteredLeads();

  const statusCounts = {
    all: store.leads.length,
    new: store.leads.filter((l) => l.status === 'new').length,
    contacted: store.leads.filter((l) => l.status === 'contacted').length,
    quoted: store.leads.filter((l) => l.status === 'quoted').length,
    won: store.leads.filter((l) => l.status === 'won').length,
  };

  const tabs = statusTabs.map((t) => ({
    ...t,
    count: statusCounts[t.value as keyof typeof statusCounts],
  }));

  const pipelineOfView = filteredLeads
    .filter((l) => l.status !== 'lost' && l.status !== 'won')
    .reduce((s, l) => s + (l.budgetMin + l.budgetMax) / 2, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Enquiries Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            {filteredLeads.length} leads{store.cityFilter ? ` in ${store.cityFilter}` : ''}
            {pipelineOfView > 0 && (
              <>
                {' '}· open value{' '}
                <span className="font-mono font-medium text-foreground">{formatCurrency(pipelineOfView)}</span>
              </>
            )}
          </p>
        </div>
        <Button onClick={() => store.setAddLeadModalOpen(true)}>
          <Plus className="h-4 w-4" /> Log Offline Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={tabs} active={store.statusFilter} onChange={store.setStatusFilter} className="w-fit" />
        <div className="flex items-center gap-2">
          {store.cityFilter && (
            <Badge variant="secondary" className="h-9 gap-1.5 rounded-md px-3">
              <MapPin className="h-3 w-3" />
              {store.cityFilter}
              <button onClick={() => store.setCityFilter(null)} className="ml-0.5 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, locality, budget, notes…"
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {store.searchQuery && (
              <button
                onClick={() => store.setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Filter className="h-6 w-6" />}
            title="No leads found"
            description="Try adjusting your search or filters."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className="cursor-pointer transition-all hover:border-foreground/25 hover:shadow-md"
              onClick={() => store.setSelectedLead(lead)}
            >
              <div className="flex items-stretch">
                {/* status accent strip */}
                <div
                  className={`w-1 shrink-0 rounded-l-xl ${
                    !lead.contacted
                      ? 'bg-destructive'
                      : lead.status === 'won'
                      ? 'bg-green-500'
                      : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 p-4 pl-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold">{lead.name}</h4>
                        <Badge variant={statusVariant(lead.status)} className="text-[10px]">
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                        {!lead.contacted && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                            <span className="h-1 w-1 animate-pulse rounded-full bg-destructive" />
                            Awaiting first response
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {lead.locality}, {lead.city}
                        <span className="mx-1 text-border">|</span>
                        <CalendarDays className="h-3 w-3" />
                        {lead.createdAt}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" /> {lead.projectType}
                        </span>
                        <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                          <IndianRupee className="h-3 w-3" />
                          {formatCurrency(lead.budgetMin)} – {formatCurrency(lead.budgetMax)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {lead.timeline}
                        </span>
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px]">
                          {lead.source}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={waLink(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-whatsapp/25 bg-whatsapp/10 px-2.5 py-2 text-whatsapp transition-colors hover:bg-whatsapp/20"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                        <span className="hidden text-xs font-medium md:inline">WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Call"
                      >
                        <Phone className="h-4 w-4" strokeWidth={1.75} />
                        <span className="hidden text-xs font-medium md:inline">Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= Drawer ================= */

export function LeadDrawer() {
  const store = useStore();
  const lead = store.selectedLead;

  if (!lead || !store.drawerOpen) return null;
  // Key by lead id so the form state resets when a different lead opens
  return <LeadDrawerContent key={lead.id} lead={lead} />;
}

function LeadDrawerContent({ lead }: { lead: Lead }) {
  const store = useStore();
  const [notes, setNotes] = useState(lead.notes);
  const [status, setStatus] = useState<Lead['status']>(lead.status);

  const handleSave = () => {
    store.updateLead(lead.id, {
      notes,
      status,
      contacted: status !== 'new' ? true : lead.contacted,
    });
    store.addToast('Lead updated', 'success');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 animate-fade-in bg-black/50 backdrop-blur-[2px]" onClick={store.closeDrawer} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md animate-slide-in-right flex-col border-l border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
              {lead.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold leading-tight">{lead.name}</h2>
                <Badge variant={statusVariant(lead.status)} className="text-[10px]">
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {lead.locality}, {lead.city} · via {lead.source}
              </p>
            </div>
          </div>
          <button onClick={store.closeDrawer} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* Value banner */}
          <div className="rounded-xl bg-muted/70 p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Estimated Project Value
            </p>
            <p className="mt-1 font-mono text-xl font-bold tracking-tight">
              {formatCurrencyFull(lead.budgetMin)} – {formatCurrencyFull(lead.budgetMax)}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-mono">{lead.carpetArea} sqft</span>
              <span>·</span>
              <span>{lead.homeType}</span>
              <span>·</span>
              <span>{lead.timeline}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="lead-status">Update Status</Label>
            <Select
              id="lead-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Lead['status'])}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </Select>
          </div>

          <Separator />

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</p>
              <p className="mt-0.5 text-sm font-medium">{lead.projectType}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Received</p>
              <p className="mt-0.5 text-sm font-medium">{lead.createdAt}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone</p>
              <p className="mt-0.5 font-mono text-sm font-medium">+{lead.phone}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Source</p>
              <p className="mt-0.5 text-sm font-medium">{lead.source}</p>
            </div>
          </div>

          <Separator />

          {/* Client Brief */}
          <div className="space-y-1.5">
            <Label>Client Brief</Label>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{lead.brief}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="lead-notes">Private Studio Notes</Label>
            <Textarea
              id="lead-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add follow-up reminders, material preferences, site visit notes…"
              rows={4}
            />
          </div>

          <Button className="w-full" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>

        {/* Sticky bottom actions */}
        <div className="flex shrink-0 gap-2.5 border-t border-border bg-background p-4">
          <a href={waLink(lead)} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="whatsapp" className="w-full">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </a>
          <a href={`tel:${lead.phone}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Phone className="h-4 w-4" /> Call
            </Button>
          </a>
        </div>
      </div>
    </>
  );
}

/* ================= Add Lead Modal ================= */

export function AddLeadModal() {
  const store = useStore();
  if (!store.addLeadModalOpen) return null;
  return <AddLeadModalContent />;
}

function AddLeadModalContent() {
  const store = useStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    locality: '',
    city: 'Patna',
    projectType: 'Full Home Interior',
    budgetMin: '',
    budgetMax: '',
    carpetArea: '',
    homeType: '2 BHK',
    timeline: '2-3 months',
    brief: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addLead({
      name: form.name,
      phone: `91${form.phone}`,
      locality: form.locality,
      city: form.city,
      projectType: form.projectType,
      budgetMin: Number(form.budgetMin || 0) * 100000,
      budgetMax: Number(form.budgetMax || 0) * 100000,
      status: 'new',
      source: 'Walk-in',
      createdAt: new Date().toISOString().split('T')[0],
      timeline: form.timeline,
      notes: '',
      brief: form.brief,
      carpetArea: Number(form.carpetArea || 0),
      homeType: form.homeType,
      contacted: true, // walk-ins have been met in person
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 animate-fade-in bg-black/50 backdrop-blur-[2px]" onClick={() => store.setAddLeadModalOpen(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 animate-fade-in overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-base font-semibold">Log Walk-in / Phone Lead</h2>
              <p className="text-xs text-muted-foreground">Capture offline enquiries into your CRM</p>
            </div>
            <button type="button" onClick={() => store.setAddLeadModalOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Client Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Rahul Sharma" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <div className="flex">
                  <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-2 text-sm text-muted-foreground">+91</span>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="9876543210" className="rounded-l-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="locality">Locality</Label>
                <Input id="locality" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="Boring Road" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Patna" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="projectType">Project Type</Label>
                <Select id="projectType" value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })}>
                  <option>Full Home Interior</option>
                  <option>Modular Kitchen</option>
                  <option>Bedroom & Wardrobe</option>
                  <option>Living & Dining</option>
                  <option>Office Interior</option>
                  <option>Other</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="homeType">Home Type</Label>
                <Select id="homeType" value={form.homeType} onChange={(e) => setForm({ ...form, homeType: e.target.value })}>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4 BHK</option>
                  <option>Studio</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="budgetMin">Budget Min (₹L)</Label>
                <Input id="budgetMin" type="number" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} placeholder="5" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budgetMax">Budget Max (₹L)</Label>
                <Input id="budgetMax" type="number" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} placeholder="10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="carpetArea">Carpet (sqft)</Label>
                <Input id="carpetArea" type="number" value={form.carpetArea} onChange={(e) => setForm({ ...form, carpetArea: e.target.value })} placeholder="1200" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brief">Client Brief</Label>
              <Textarea id="brief" value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} placeholder="What does the client want?" rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-border p-4">
            <Button variant="outline" type="button" onClick={() => store.setAddLeadModalOpen(false)}>Cancel</Button>
            <Button type="submit">
              <Plus className="h-4 w-4" /> Add Lead
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}