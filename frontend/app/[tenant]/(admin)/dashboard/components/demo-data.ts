import type { Enquiry } from "./types";

/**
 * Candidate/demo-only dashboard records. Production must replace this path with
 * tenant-scoped lead data returned by the server; none of these contacts are real.
 */
export function createCandidateDemoEnquiries(): Enquiry[] {
  return [
    {
      id: "sample-1", tenant_id: "sample", name: "Ananya Sinha",
      phone: "919999999991", email: null, locality: "Boring Road, Patna",
      project_type: "3 BHK · Full home", budget_band: "₹12L–₹16L",
      timeline: "Within 2 months",
      message: "Moving into our new 3 BHK. Looking for a warm, practical home with a modular kitchen and plenty of storage.",
      source: "estimate", source_page: "sample", status: "new",
      notes: "", created_at: "2026-09-18T10:42:00.000Z", contacted_at: null,
    },
    {
      id: "sample-2", tenant_id: "sample", name: "Rahul Verma",
      phone: "919999999992", email: null, locality: "Kankarbagh, Patna",
      project_type: "Modular kitchen", budget_band: "₹3L–₹5L",
      timeline: "Within 1 month",
      message: "Visited your studio and scanned the card. Need a kitchen renovation for our family home.",
      source: "other", source_page: "sample", status: "new",
      notes: "", created_at: "2026-09-18T10:18:00.000Z", contacted_at: null,
    },
    {
      id: "sample-3", tenant_id: "sample", name: "Priya & Amit",
      phone: "919999999993", email: null, locality: "Lalpur, Ranchi",
      project_type: "2 BHK · Full home", budget_band: "₹8L–₹10L",
      timeline: "Within 3 months",
      message: "Need interiors for a new apartment. Handover is next month.",
      source: "form", source_page: "sample", status: "contacted",
      notes: "Requested floor plan. Follow up on Monday.", created_at: "2026-09-17T09:00:00.000Z", contacted_at: "2026-09-17T10:00:00.000Z",
    },
    {
      id: "sample-4", tenant_id: "sample", name: "Saurabh Mishra",
      phone: "919999999994", email: null, locality: "Lanka, Varanasi",
      project_type: "Living & dining", budget_band: "₹4L–₹6L",
      timeline: "Within 2 months",
      message: "Redesign our living and dining rooms. Prefer easy maintenance finishes.",
      source: "form", source_page: "sample", status: "quoted",
      notes: "Sent estimate. Site measurement pending.", created_at: "2026-09-16T09:00:00.000Z", contacted_at: "2026-09-16T10:00:00.000Z",
    },
    {
      id: "sample-5", tenant_id: "sample", name: "Meera Bose",
      phone: "919999999995", email: null, locality: "Salt Lake, Kolkata",
      project_type: "2 BHK · Renovation", budget_band: "₹6L–₹9L",
      timeline: "Within 4 months",
      message: "Sample enquiry manually recorded after a WhatsApp conversation. Click tracking alone does not create a lead.",
      source: "whatsapp", source_page: "sample", status: "contacted",
      notes: "", created_at: "2026-09-15T09:00:00.000Z", contacted_at: "2026-09-15T10:00:00.000Z",
    },
    {
      id: "sample-6", tenant_id: "sample", name: "Rohan Kapoor",
      phone: "919999999996", email: null, locality: "Noida, Delhi NCR",
      project_type: "Home office", budget_band: "₹2L–₹4L",
      timeline: "This month",
      message: "A quiet, practical home office with custom storage and a comfortable workspace.",
      source: "other", source_page: "sample", status: "won",
      notes: "Design consultation booked. Advance received.", created_at: "2026-09-14T09:00:00.000Z", contacted_at: "2026-09-14T10:00:00.000Z",
    },
    {
      id: "sample-7", tenant_id: "sample", name: "Neha Rao",
      phone: "919999999997", email: null, locality: "Whitefield, Bengaluru",
      project_type: "Bedroom & storage", budget_band: "₹6L–₹8L",
      timeline: "Within 3 months",
      message: "Looking for a restful bedroom with full-height wardrobes and thoughtful storage.",
      source: "estimate", source_page: "sample", status: "quoted",
      notes: "Shared premium and essential finish options.", created_at: "2026-09-13T09:00:00.000Z", contacted_at: "2026-09-13T10:00:00.000Z",
    },
  ];
}
export const DEMO_ENQUIRIES = createCandidateDemoEnquiries();

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
  { name: "Kolkata", count: 1, enquiries: 1, visits: 96 },
  { name: "Varanasi", count: 2, enquiries: 2, visits: 84 },
  { name: "Bengaluru", count: 1, enquiries: 1, visits: 54 },
];export const SAMPLE_ESTIMATE = {
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
  included: [
    { title: "Design consultation", body: "A focused conversation before detailed planning." },
    { title: "Modular furniture", body: "Core made-to-measure cabinetry and storage." },
    { title: "Installation", body: "Site installation and final handover support." },
  ],
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