import type { Enquiry, StudioSettings } from "./types";

export async function apiRequest<T>(url: string, method: "GET" | "POST" | "PATCH", body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result as T;
}

export function whatsappURL(enquiry: Enquiry, studio = "Ashish Interiors") {
  const text = `Hello ${enquiry.name}, this is ${studio}. Thank you for your ${enquiry.projectType.toLowerCase()} enquiry. When would be a good time to discuss your project?`;
  return `https://wa.me/${enquiry.phone}?text=${encodeURIComponent(text)}`;
}

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportEnquiries(enquiries: Enquiry[]) {
  const escape = (value: string) => {
    const safe = /^[\s]*[=+@\-\t\r]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Client", "Locality", "City", "Project", "Budget", "Source", "Status", "Timeline", "Notes"],
    ...enquiries.map((enquiry) => [enquiry.name, enquiry.locality, enquiry.city, enquiry.projectType, enquiry.budget, enquiry.source, enquiry.status, enquiry.timeline, enquiry.notes]),
  ];
  downloadFile("studio-enquiries.csv", `\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`, "text/csv;charset=utf-8");
}

export function downloadVCard(settings: StudioSettings) {
  const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  downloadFile("ashish-interiors.vcf", [
    "BEGIN:VCARD", "VERSION:3.0", `FN:${escape(settings.name)}`, `ORG:${escape(settings.name)}`,
    `TEL;TYPE=WORK:+${settings.phone}`, `EMAIL:${escape(settings.email)}`,
    `URL:${window.location.origin}/site`, `ADR;TYPE=WORK:;;${escape(settings.city)};;;;`, "END:VCARD",
  ].join("\r\n"), "text/vcard;charset=utf-8");
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
