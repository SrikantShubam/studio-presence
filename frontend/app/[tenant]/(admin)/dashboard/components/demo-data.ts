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
  locality: ["Sample central area", "Sample north area", "Sample south area"][
    index % 3
  ]!,
  project_type: ["2 BHK interiors", "3 BHK interiors", "Kitchen renovation"][
    index % 3
  ]!,
  budget_band: ["₹8–12 lakh", "₹12–18 lakh", "₹3–5 lakh"][index % 3]!,
  timeline: "Sample: within 3 months",
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
  { name: "Sample central area", count: 2, visits: 612 },
  { name: "Sample north area", count: 2, visits: 381 },
  { name: "Sample south area", count: 2, visits: 255 },
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
  finishLevels: [],
  included: [],
  resultNote: "Sample indicative estimate. Final pricing follows a site visit.",
};
