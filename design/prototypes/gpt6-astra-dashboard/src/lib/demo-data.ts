import type { Enquiry, PricingSettings, StudioSettings, WebsiteContent } from "./types";

export const CITY_DEMAND = [
  { name: "Patna", visits: 612, enquiries: 14 },
  { name: "Delhi NCR", visits: 142, enquiries: 3 },
  { name: "Ranchi", visits: 128, enquiries: 3 },
  { name: "Kolkata", visits: 96, enquiries: 1 },
  { name: "Varanasi", visits: 84, enquiries: 2 },
  { name: "Bengaluru", visits: 54, enquiries: 1 },
];

export const DEFAULT_SETTINGS: StudioSettings = {
  name: "Ashish Interiors",
  tagline: "Thoughtful spaces, made for living.",
  city: "Patna",
  domain: "ashish-interiors.in",
  email: "ashish@ashish-interiors.in",
  alerts: "leads@ashish-interiors.in",
  phone: "919999999999",
  ownerName: "Ashish Kumar",
  alertNew: false,
  alertDigest: true,
};

export const DEFAULT_PRICING: PricingSettings = {
  rates: [1200, 1800, 2600],
  factors: [0.94, 1, 1.06, 1.12],
  note: "Indicative estimate including design, materials and installation. Final quote follows a site visit. Taxes and civil work excluded.",
  inclusions: "Design consultation, modular furniture, installation",
};

const interiorImage = "/images/studio-interior.jpg";
export const DEFAULT_WEBSITE: WebsiteContent = {
  hero: { enabled: true, title: "Spaces shaped around the way you live.", body: "Thoughtful interiors for homes in Patna and beyond. From the first conversation to the final detail, we make the process feel personal.", button: "Tell us about your space", image: interiorImage },
  about: { enabled: true, title: "Good design begins with listening.", body: "We are Ashish Interiors, an independent design studio in Patna. We bring considered materials, practical planning, and a personal approach to every home." },
  projects: { enabled: true, title: "A few spaces we've made our own.", body: "Real homes. Thoughtful details. Made for everyday living.", items: [
    { title: "A warm family home", location: "Boring Road, Patna · 3 BHK", image: interiorImage },
    { title: "Room to slow down", location: "Lalpur, Ranchi · 2 BHK", image: interiorImage },
  ] },
  services: { enabled: true, title: "From one room to a whole new beginning.", body: "Choose the kind of support your space needs.", items: [
    { title: "Full-home interiors", description: "A cohesive home, designed around you.", price: "From ₹1,200 / sqft" },
    { title: "Modular kitchens", description: "Practical layouts. Beautiful finishes.", price: "Tailored to your space" },
    { title: "Renovation & refresh", description: "A fresh perspective on a familiar place.", price: "Let's talk about your project" },
  ] },
  contact: { enabled: true, title: "Every good space starts with a conversation.", body: "Have a new home, a room to rethink, or just an idea? We'd love to hear it." },
  footer: { enabled: true, title: "Ashish Interiors", body: "Thoughtfully designed. Personally made. Patna, Bihar." },
};

export const SAMPLE_ENQUIRIES: Enquiry[] = [
  { id: "sample-1", name: "Ananya Sinha", locality: "Boring Road", city: "Patna", projectType: "3 BHK · Full home", budget: "₹12L–₹16L", value: 14, source: "Estimate Calculator", status: "New", age: "18 min ago", timeline: "Within 2 months", phone: "919999999991", brief: "Moving into our new 3 BHK. Looking for a warm, practical home with a modular kitchen and plenty of storage.", notes: "", createdAt: "2026-09-18T10:42:00.000Z" },
  { id: "sample-2", name: "Rahul Verma", locality: "Kankarbagh", city: "Patna", projectType: "Modular kitchen", budget: "₹3L–₹5L", value: 4, source: "Digital QR Card", status: "New", age: "42 min ago", timeline: "Within 1 month", phone: "919999999992", brief: "Visited your studio and scanned the card. Need a kitchen renovation for our family home.", notes: "", createdAt: "2026-09-18T10:18:00.000Z" },
  { id: "sample-3", name: "Priya & Amit", locality: "Lalpur", city: "Ranchi", projectType: "2 BHK · Full home", budget: "₹8L–₹10L", value: 9, source: "Website Direct Form", status: "Contacted", age: "Yesterday", timeline: "Within 3 months", phone: "919999999993", brief: "Need interiors for a new apartment. Handover is next month.", notes: "Requested floor plan. Follow up on Monday.", createdAt: "2026-09-17T09:00:00.000Z" },
  { id: "sample-4", name: "Saurabh Mishra", locality: "Lanka", city: "Varanasi", projectType: "Living & dining", budget: "₹4L–₹6L", value: 5, source: "Website Direct Form", status: "Quoted", age: "2 days ago", timeline: "Within 2 months", phone: "919999999994", brief: "Redesign our living and dining rooms. Prefer easy maintenance finishes.", notes: "Sent estimate. Site measurement pending.", createdAt: "2026-09-16T09:00:00.000Z" },
  { id: "sample-5", name: "Meera Bose", locality: "Salt Lake", city: "Kolkata", projectType: "2 BHK · Renovation", budget: "₹6L–₹9L", value: 7.5, source: "WhatsApp Floating CTA", status: "Contacted", age: "3 days ago", timeline: "Within 4 months", phone: "919999999995", brief: "Sample enquiry manually recorded after a WhatsApp conversation. Click tracking alone does not create a lead.", notes: "", createdAt: "2026-09-15T09:00:00.000Z" },
  { id: "sample-6", name: "Rohan Kapoor", locality: "Noida", city: "Delhi NCR", projectType: "Home office", budget: "₹2L–₹4L", value: 3, source: "Digital QR Card", status: "Won", age: "4 days ago", timeline: "This month", phone: "919999999996", brief: "A quiet, practical home office with custom storage and a comfortable workspace.", notes: "Design consultation booked. Advance received.", createdAt: "2026-09-14T09:00:00.000Z" },
  { id: "sample-7", name: "Neha Rao", locality: "Whitefield", city: "Bengaluru", projectType: "Bedroom & storage", budget: "₹6L–₹8L", value: 7, source: "Estimate Calculator", status: "Quoted", age: "5 days ago", timeline: "Within 3 months", phone: "919999999997", brief: "Looking for a restful bedroom with full-height wardrobes and thoughtful storage.", notes: "Shared premium and essential finish options.", createdAt: "2026-09-13T09:00:00.000Z" },
];
