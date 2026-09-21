export const ENQUIRY_STATUSES = ["New", "Contacted", "Quoted", "Won"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type DashboardView = "overview" | "enquiries" | "analytics" | "website" | "calculator" | "card" | "settings" | "integrations";

export type Enquiry = {
  id: string;
  name: string;
  locality: string;
  city: string;
  projectType: string;
  budget: string;
  value: number;
  source: string;
  status: EnquiryStatus;
  age: string;
  timeline: string;
  phone: string;
  brief: string;
  notes: string;
  createdAt: string;
};

export type EnquiryFilters = { status: "All" | EnquiryStatus; city: string; query: string };
export const EMPTY_FILTERS: EnquiryFilters = { status: "All", city: "", query: "" };

export type StudioSettings = {
  name: string;
  tagline: string;
  city: string;
  domain: string;
  email: string;
  alerts: string;
  phone: string;
  ownerName: string;
  alertNew: boolean;
  alertDigest: boolean;
};

export type PricingSettings = {
  rates: [number, number, number];
  factors: [number, number, number, number];
  note: string;
  inclusions: string;
};

export type WebsiteSectionKey = "hero" | "about" | "projects" | "services" | "contact" | "footer";
export type WebsiteSection = { enabled: boolean; title: string; body: string };
export type WebsiteContent = {
  hero: WebsiteSection & { button: string; image: string };
  about: WebsiteSection;
  projects: WebsiteSection & { items: { title: string; location: string; image: string }[] };
  services: WebsiteSection & { items: { title: string; description: string; price: string }[] };
  contact: WebsiteSection;
  footer: WebsiteSection;
};

export type WorkspaceData = {
  enquiries: Enquiry[];
  settings: StudioSettings;
  pricing: PricingSettings;
  websiteDraft: WebsiteContent;
  websitePublished: WebsiteContent;
  updatedAt: string;
};

export type Notice = { message: string; kind?: "success" | "error" };
