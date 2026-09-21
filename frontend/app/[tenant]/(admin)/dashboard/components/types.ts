import type { ClientConfig, Lead, LeadStatus } from "@studio/backend";

export type Mode = "demo" | "live" | "unavailable";
export type DashboardView =
  | "overview"
  | "enquiries"
  | "website"
  | "calculator"
  | "card"
  | "analytics"
  | "settings"
  | "integrations";
export type Enquiry = Lead;
export type WorkspaceConfig = Pick<
  ClientConfig,
  "business" | "sections" | "integrations" | "status"
>;
export type EnquiryFilters = {
  status: "all" | LeadStatus;
  query: string;
  locality: string;
};
export const EMPTY_FILTERS: EnquiryFilters = {
  status: "all",
  query: "",
  locality: "",
};
export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};
export const NAV_ITEMS: { id: DashboardView; label: string; mark: string; group?: string }[] = [
  { id: "overview", label: "Overview", mark: "01" },
  { id: "enquiries", label: "Enquiries", mark: "02" },
  { id: "analytics", label: "Traffic & analytics", mark: "03" },
  { id: "website", label: "Website editor", mark: "04", group: "Your website" },
  { id: "calculator", label: "Estimate calculator", mark: "05" },
  { id: "card", label: "Digital card & QR", mark: "06" },
  { id: "settings", label: "Workspace settings", mark: "07", group: "Workspace" },
  { id: "integrations", label: "Integrations", mark: "08" },
];
export type LeadInput = {
  name: string;
  phone: string;
  locality: string;
  projectType: string;
  budgetBand: string;
  timeline: string;
  message: string;
};
export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string };
export type LeadAction = (
  input:
    | { kind: "create"; values: LeadInput }
    | { kind: "update"; id: string; status: LeadStatus; notes: string },
) => Promise<ActionResult<Enquiry>>;
export type SaveConfig = (patch: Record<string, unknown>) => Promise<void>;
export type Analytics = {
  enquiryStats: { thisMonth: number; lastMonth: number };
  monthlyTrend: { month: string; count: number }[];
  visitStats: { thisMonth: number; lastMonth: number } | null;
  topProjects: { slug: string; title: string; views: number }[];
};
export type WorkspaceData = {
  tenant: string;
  mode: Mode;
  config: WorkspaceConfig;
  enquiries: Enquiry[];
  canEdit: boolean;
  canCreate: boolean;
  leadError?: string;
};

export function dashboardMode(
  demo: string | undefined,
  eligible: boolean,
): Mode {
  if (demo === "1") return "demo";
  if (eligible) return "live";
  return demo === "0" ? "unavailable" : "demo";
}
export function viewFrom(value: string | null): DashboardView {
  return NAV_ITEMS.find((item) => item.id === value)?.id ?? "overview";
}
export function normalizeIndianPhone(value: string): string | null {
  if (!/^[+\d\s()-]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, "");
  const national =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(national) ? `91${national}` : null;
}
export function contactPhone(value: string): string | null {
  if (!/^[+\d\s()-]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, "");
  return (
    normalizeIndianPhone(value) ?? (/^\d{11,15}$/.test(digits) ? digits : null)
  );
}
export function calculateQuote(
  area: number,
  low: number,
  high: number,
  factor: number,
) {
  return {
    low: area * Math.round(low * factor),
    high: area * Math.round(high * factor),
  };
}
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export function csvCell(value: string) {
  const safe = /^[\s]*[=+@\-\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function enquiriesCSV(items: Enquiry[]) {
  const rows = [
    [
      "Name",
      "Phone",
      "Locality",
      "Project",
      "Budget",
      "Source",
      "Status",
      "Timeline",
      "Notes",
    ],
    ...items.map((item) => [
      item.name,
      item.phone,
      item.locality ?? "",
      item.project_type ?? "",
      item.budget_band ?? "",
      item.source,
      item.status,
      item.timeline ?? "",
      item.notes ?? "",
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function vCard(config: WorkspaceConfig, url: string) {
  const escape = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\r|\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const business = config.business;
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(business.name)}`,
    `ORG:${escape(business.name)}`,
    `TEL;TYPE=WORK:${escape(business.phone)}`,
    `EMAIL:${escape(business.email ?? "")}`,
    `URL:${escape(url)}`,
    "END:VCARD",
    "",
  ].join("\r\n");
}
export function applyConfigPatch(
  config: WorkspaceConfig,
  patch: Record<string, unknown>,
): WorkspaceConfig {
  const result = structuredClone(config);
  for (const [path, value] of Object.entries(patch)) {
    const parts = path.split(".");
    if (
      parts.some((part) =>
        ["__proto__", "prototype", "constructor"].includes(part),
      )
    )
      throw new Error("Invalid field");
    let target = result as unknown as Record<string, unknown>;
    for (const part of parts.slice(0, -1)) {
      if (!target[part] || typeof target[part] !== "object") target[part] = {};
      target = target[part] as Record<string, unknown>;
    }
    target[parts[parts.length - 1]!] = value;
  }
  return result;
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Could not save. Please try again.";
}
