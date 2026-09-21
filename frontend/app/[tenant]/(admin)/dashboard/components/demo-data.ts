import type { Enquiry } from "./types";

// Every contact is visibly fictional and cannot be called from the sample desk.
export const DEMO_ENQUIRIES: Enquiry[] = [
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
  "new",
].map((status, index) => ({
  id: `sample-${index + 1}`,
  tenant_id: "sample",
  name: `Sample client ${index + 1}`,
  phone: "",
  email: null,
  locality: ["Patna", "Delhi NCR", "Ranchi"][
    index % 3
  ]!,
  project_type: ["3 BHK · Full home", "Modular kitchen", "2 BHK · Full home"][
    index % 3
  ]!,
  budget_band: ["₹12L–₹16L", "₹3L–₹5L", "₹8L–₹10L"][index % 3]!,
  timeline: "Within 3 months",
  message:
    "Sample enquiry for exploring the dashboard. This is not a real customer.",
  source: "other",
  source_page: "sample",
  status: status as Enquiry["status"],
  notes: "",
  created_at: `2026-09-${String(20 - index).padStart(2, "0")}T06:00:00.000Z`,
  contacted_at: null,
}));
export const SAMPLE_TREND = [
  { month: "Apr", visits: 556, count: 11 },
  { month: "May", visits: 756, count: 17 },
  { month: "Jun", visits: 878, count: 16 },
  { month: "Jul", visits: 1126, count: 26 },
  { month: "Aug", visits: 1248, count: 25 },
  { month: "Sep", visits: 1248, count: 31 },
];
export const SAMPLE_CITIES = [
  { name: "Patna", count: 14, enquiries: 14, visits: 612 },
  { name: "Delhi NCR", count: 3, enquiries: 3, visits: 142 },
  { name: "Ranchi", count: 3, enquiries: 3, visits: 128 },
];
export const SAMPLE_ESTIMATE = {
  enabled: true,
  ratePerSqft: { basic: 1200, standard: 1800, premium: 2400 },
  area: { min: 400, max: 3500, step: 50, default: 1000 },
  homeTypes: [1, 2, 3, 4].map((bhk) => ({
    id: `${bhk}bhk`,
    label: `${bhk} BHK`,
    factor: 1,
  })),
  finishLevels: [
    { id: "basic", label: "Essential", low: 0.94, high: 1 },
    { id: "standard", label: "Premium", low: 1, high: 1.06 },
    { id: "premium", label: "Luxe", low: 1.06, high: 1.12 },
  ],
  included: ["Design consultation", "Modular furniture", "Installation"],
  resultNote: "Sample indicative estimate. Final pricing follows a site visit.",
};

export const SAMPLE_SOURCES = [
  { name: "Estimate Calculator", count: 12 },
  { name: "Website Direct Form", count: 9 },
  { name: "Digital QR Card", count: 7 },
  { name: "WhatsApp follow-up", count: 3 },
] as const;

export const SAMPLE_PAGE_BREAKDOWN = [
  { page: "Home", views: 586, enquiries: 14 },
  { page: "Projects", views: 211, enquiries: 7 },
  { page: "Services", views: 148, enquiries: 6 },
  { page: "Contact", views: 97, enquiries: 4 },
] as const;