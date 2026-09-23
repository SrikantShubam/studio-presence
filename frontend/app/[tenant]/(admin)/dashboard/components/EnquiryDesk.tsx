"use client";
import { Download, NotebookPen, Phone, Search, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

import { useDeferredValue } from "react";
import {
  Button,
  Panel,
  StatusBadge,
  buttonClass,
  inputClass,
  monoClass,
} from "./primitives";
const contactButtonClass = "!min-h-9 !w-9 !p-0";
const sourceLabels = {
  estimate: "Estimate calculator",
  form: "Website direct form",
  whatsapp: "WhatsApp floating CTA",
  call: "Walk-in / call",
  other: "Digital QR card",
} as const;
const formatISTDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));

import {
  contactPhone,
  downloadFile,
  EMPTY_FILTERS,
  enquiriesCSV,
  STATUS_LABELS,
  type Enquiry,
  type EnquiryFilters,
  type Mode,
} from "./types";

export function EnquiryDesk({
  enquiries,
  filters,
  onFiltersChange,
  onOpenEnquiry,
  mode,
  tenant,
}: {
  enquiries: Enquiry[];
  filters: EnquiryFilters;
  onFiltersChange: (filters: EnquiryFilters) => void;
  onOpenEnquiry: (enquiry: Enquiry) => void;
  mode: Mode;
  tenant: string;
}) {
  const query = useDeferredValue(filters.query.trim().toLowerCase());
  const filtered = enquiries.filter(
    (item) =>
      (filters.status === "all" || item.status === filters.status) &&
      (!filters.locality || item.locality?.includes(filters.locality)) &&
      [
        item.name,
        item.phone,
        item.locality,
        item.project_type,
        item.budget_band,
        item.notes,
        item.source,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
  );
  return (
    <div id="enquiries" className="min-w-0">
      <Panel
        title="Your enquiry desk"
        description={
          mode === "demo"
            ? "Representative sample leads Â· review demo contact details before calling"
            : "Budget bands are estimates, not booked revenue."
        }
        action={
          <Button
            disabled={!filtered.length}
            onClick={() =>
              downloadFile(
                `${tenant}-${mode}-enquiries.csv`,
                enquiriesCSV(filtered),
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download aria-hidden="true" className="size-4" />Export CSV
          </Button>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 pb-4">
          <div
            className="flex max-w-full flex-wrap gap-1"
            role="group"
            aria-label="Enquiry status"
          >
            {(
              [
                "all",
                ...Object.keys(STATUS_LABELS),
              ] as EnquiryFilters["status"][]
            ).map((status) => (
              <button
                key={status}
                aria-pressed={filters.status === status}
                onClick={() => onFiltersChange({ ...filters, status })}
                className={`min-h-11 border-b-2 px-2 text-xs focus-visible:outline-2 focus-visible:outline-admin-primary ${filters.status === status ? "border-admin-ink font-semibold" : "border-transparent text-admin-muted"}`}
              >
                {status === "all" ? "All" : STATUS_LABELS[status]}
                <span className={`${monoClass} ml-2 text-[10px]`}>
                  {
                    enquiries.filter(
                      (item) => status === "all" || item.status === status,
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
            <input
              className={`${inputClass} w-full pl-9`}
              type="search"
              aria-label="Search enquiries"
              placeholder="Search name, phone, locality or notes"
              value={filters.query}
              onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            />
          </div>
        </div>
        {filters.locality && (
          <div className="flex items-center gap-3 px-5 pb-4">
            <span>{filters.locality}</span>
            <Button
              onClick={() => onFiltersChange({ ...filters, locality: "" })}
            >
              <X aria-hidden="true" className="size-4" />Clear area filter
            </Button>
          </div>
        )}
        {filtered.length > 0 ? (
          <>
            <div
              className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain"
              tabIndex={0}
              role="region"
              aria-label="Enquiry table"
            >
              <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                <thead className="border-y border-admin-border bg-admin-bg text-[10px] text-admin-muted">
                  <tr>
                    {[
                      "Client & locality",
                      "Project & budget",
                      "Source",
                      "Status",
                      "Timeline",
                      "Contact",
                    ].map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className="px-5 py-3 font-medium"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-admin-border last:border-b-0 hover:bg-admin-raised/40"
                    >
                      <td className="px-5 py-4">
                        <button
                          className="min-h-11 text-left font-semibold underline-offset-4 hover:underline"
                          onClick={() => onOpenEnquiry(item)}
                        >
                          {item.name}
                        </button>
                        <p className="text-[10px] text-admin-muted">
                          {item.locality || "Area not supplied"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p>{item.project_type || "Project not supplied"}</p>
                        <p
                          className={`${monoClass} mt-1 text-[10px] text-admin-muted`}
                        >
                          {item.budget_band || "Budget not supplied"}
                        </p>
                      </td>
                      <td className="px-5 py-4">{sourceLabels[item.source]}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4">
                        <p>{item.timeline || "Not supplied"}</p>
                        <p className="mt-1 text-[10px] text-admin-muted">
                          {formatISTDate(item.created_at)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <ContactActions enquiry={item} />
                          <Button
                            className={contactButtonClass}
                            onClick={() => onOpenEnquiry(item)}
                            aria-label={"View notes for " + item.name}
                            title={"View notes for " + item.name}
                          >
                            <NotebookPen aria-hidden="true" className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p
              aria-live="polite"
              className="border-t border-admin-border px-5 py-3 text-[10px] text-admin-muted"
            >
              {filtered.length} of {enquiries.length} enquiries
            </p>
          </>
        ) : (
          <div className="border-t border-admin-border p-8 text-center">
            <h3 className="font-semibold">
              {enquiries.length
                ? "No enquiries match these filters"
                : mode === "unavailable"
                  ? "Live enquiries unavailable"
                  : "No enquiries yet"}
            </h3>
            <p className="my-3 text-xs text-admin-muted">
              {enquiries.length
                ? "Try another search or clear the filters."
                : "New enquiries will appear here when available."}
            </p>
            {enquiries.length > 0 && (
              <Button onClick={() => onFiltersChange({ ...EMPTY_FILTERS })}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

export function ContactActions({
  enquiry,
}: {
  enquiry: Enquiry;
}) {
  const phone = contactPhone(enquiry.phone);
  if (!phone)
    return (
      <>
        <Button
          className={contactButtonClass}
          disabled
          aria-label={"WhatsApp " + enquiry.name}
          title="Contact actions are unavailable for sample contacts"
        >
          <FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" className="size-4 text-admin-primary" />
        </Button>
        <Button
          className={contactButtonClass}
          disabled
          aria-label={"Call " + enquiry.name}
          title="Contact actions are unavailable for sample contacts"
        >
          <Phone aria-hidden="true" className="size-4" />
        </Button>
      </>
    );
  return (
    <>
      <a
        className={buttonClass + " " + contactButtonClass}
        href={"https://wa.me/" + phone}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={"WhatsApp " + enquiry.name}
        title={"WhatsApp " + enquiry.name}
      >
        <FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" className="size-4 text-admin-primary" />
      </a>
      <a
        className={buttonClass + " " + contactButtonClass}
        href={"tel:+" + phone}
        aria-label={"Call " + enquiry.name}
        title={"Call " + enquiry.name}
      >
        <Phone aria-hidden="true" className="size-4" />
      </a>
    </>
  );
}
