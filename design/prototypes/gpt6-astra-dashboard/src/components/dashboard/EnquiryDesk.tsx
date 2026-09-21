"use client";

import { useDeferredValue, useMemo } from "react";
import { Download, Inbox, MessageCircle, NotebookPen, Phone, Search, X } from "lucide-react";
import { ENQUIRY_STATUSES, EMPTY_FILTERS, type Enquiry, type EnquiryFilters } from "@/lib/types";
import { exportEnquiries, whatsappURL } from "@/lib/utils";
import { Badge, Button, StatusBadge } from "@/components/ui/primitives";

type EnquiryDeskProps = {
  enquiries: Enquiry[];
  filters: EnquiryFilters;
  onFiltersChange: (filters: EnquiryFilters) => void;
  onOpenEnquiry: (enquiry: Enquiry) => void;
  standalone?: boolean;
};

export function EnquiryDesk({ enquiries, filters, onFiltersChange, onOpenEnquiry, standalone = false }: EnquiryDeskProps) {
  const query = useDeferredValue(filters.query.trim().toLowerCase());
  const filtered = useMemo(() => enquiries.filter((enquiry) =>
    (filters.status === "All" || enquiry.status === filters.status) &&
    (!filters.city || enquiry.city === filters.city) &&
    `${enquiry.name} ${enquiry.locality} ${enquiry.city} ${enquiry.budget} ${enquiry.notes} ${enquiry.projectType} ${enquiry.source}`.toLowerCase().includes(query)
  ), [enquiries, filters.status, filters.city, query]);

  return (
    <section className="panel scroll-mt-5" id="enquiries" aria-labelledby="desk-title">
      <div className="panel-heading">
        <div><h2 id="desk-title">{standalone ? "All enquiries" : "Your enquiry desk"}</h2><p className="panel-description">Representative sample leads · review demo contact details before calling</p></div>
        <Button onClick={() => exportEnquiries(filtered)} disabled={filtered.length === 0}><Download />Export</Button>
      </div>
      <div className="desk-toolbar">
        <div className="desk-tabs" role="group" aria-label="Enquiry status">
          {(["All", ...ENQUIRY_STATUSES] as const).map((status) => (
            <button key={status} className={filters.status === status ? "active" : ""} aria-pressed={filters.status === status} onClick={() => onFiltersChange({ ...filters, status })}>
              {status}<span className="ml-1.5 font-mono text-[10px] text-muted-foreground">{enquiries.filter((enquiry) => status === "All" || enquiry.status === status).length}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full min-[801px]:max-w-[270px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={filters.query} onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })} aria-label="Search enquiries" placeholder="Search name, locality, budget, notes…" className="!py-2.5 !pl-9 !text-[11px]" />
        </div>
      </div>
      {filters.city && (
        <div className="flex items-center gap-2.5 px-5 pb-3.5" aria-live="polite">
          <Badge>{filters.city}</Badge>
          <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground" onClick={() => onFiltersChange({ ...filters, city: "" })}>Clear city filter<X className="!size-3" /></button>
        </div>
      )}
      {filtered.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="enquiry-table">
              <thead><tr><th scope="col">Client & locality</th><th scope="col">Project & budget</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Timeline</th><th scope="col">Contact</th></tr></thead>
              <tbody>
                {filtered.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td><button className="text-left font-medium hover:underline" onClick={() => onOpenEnquiry(enquiry)}>{enquiry.name}</button><small className="whitespace-nowrap">{enquiry.locality}, {enquiry.city}</small></td>
                    <td><span className="whitespace-nowrap">{enquiry.projectType}</span><small className="font-mono">{enquiry.budget}</small></td>
                    <td>{enquiry.source}</td>
                    <td><StatusBadge status={enquiry.status} /></td>
                    <td><span className="whitespace-nowrap">{enquiry.timeline}</span><small>{enquiry.age}</small></td>
                    <td><div className="flex gap-[5px]">
                      <a className="btn contact-button !text-success" aria-label={`WhatsApp ${enquiry.name}`} href={whatsappURL(enquiry)} target="_blank" rel="noopener noreferrer"><MessageCircle /></a>
                      <a className="btn contact-button" aria-label={`Call ${enquiry.name}`} href={`tel:+${enquiry.phone}`}><Phone /></a>
                      <Button className="contact-button" aria-label={`View notes for ${enquiry.name}`} onClick={() => onOpenEnquiry(enquiry)}><NotebookPen /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="panel-footer" aria-live="polite"><span className="font-mono">{filtered.length}</span> of <span className="font-mono">{enquiries.length}</span> enquiries · Budget bands are estimates, not booked revenue</p>
        </>
      ) : (
        <div className="border-t border-border px-6 py-12 text-center" aria-live="polite">
          <Inbox className="mx-auto mb-3 !size-6 text-muted-foreground" />
          <h3>No enquiries match these filters</h3>
          <p className="mb-5 mt-1 text-[12px] text-muted-foreground">Try another name or clear your filters.</p>
          <Button onClick={() => onFiltersChange({ ...EMPTY_FILTERS })}>Clear all filters</Button>
        </div>
      )}
    </section>
  );
}

export default EnquiryDesk;
