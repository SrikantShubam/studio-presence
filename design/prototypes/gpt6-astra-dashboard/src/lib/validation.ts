import { z } from "zod";
import { ENQUIRY_STATUSES } from "./types";

const text = (max: number) => z.string().trim().min(1, "This field is required.").max(max);
const mobile = z.string().trim().regex(/^(?:91)?[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number.").transform((phone) => phone.length === 10 ? `91${phone}` : phone);

export const enquiryCreateSchema = z.object({
  name: text(80), phone: mobile, locality: text(80), city: text(80),
  projectType: text(100), value: z.number().finite().min(0.1).max(1000),
  source: z.enum(["Studio walk-in", "Phone consultation", "Website Direct Form", "Digital QR Card"]),
  brief: z.string().trim().max(2000).default(""),
  timeline: z.string().trim().max(100).default("To be discussed"),
}).strict();

export const enquiryUpdateSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES).optional(),
  notes: z.string().max(10000).optional(),
}).strict().refine((value) => value.status !== undefined || value.notes !== undefined, "No changes were provided.");

export const pricingSchema = z.object({
  rates: z.tuple([z.number().min(100).max(20000), z.number().min(100).max(20000), z.number().min(100).max(20000)]),
  factors: z.tuple([z.number().min(0.1).max(5), z.number().min(0.1).max(5), z.number().min(0.1).max(5), z.number().min(0.1).max(5)]),
  note: text(2000), inclusions: text(2000),
});

export const settingsSchema = z.object({
  name: text(80), tagline: text(200), city: text(80),
  domain: z.string().trim().regex(/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i, "Enter a domain without https:// or a path."),
  email: z.email().max(254), alerts: z.email().max(254), phone: mobile,
  ownerName: text(80), alertNew: z.boolean(), alertDigest: z.boolean(),
});

const section = z.object({ enabled: z.boolean(), title: z.string().max(300), body: z.string().max(3000) });
const image = z.string().max(2000).refine((value) => {
  if (value.startsWith("/images/") && !value.includes("..")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Use an HTTPS image URL or a local /images/ path.");

export const websiteSchema = z.object({
  hero: section.extend({ button: z.string().max(100), image }),
  about: section,
  projects: section.extend({ items: z.array(z.object({ title: text(200), location: z.string().max(200), image })).max(12) }),
  services: section.extend({ items: z.array(z.object({ title: text(200), description: z.string().max(1000), price: z.string().max(200) })).max(12) }),
  contact: section,
  footer: section,
});

export const workspaceUpdateSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("settings"), data: settingsSchema }),
  z.object({ kind: z.literal("pricing"), data: pricingSchema }),
  z.object({ kind: z.literal("draft"), data: websiteSchema }),
  z.object({ kind: z.literal("publish"), data: websiteSchema }),
]);

export function rejectCrossOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  try {
    const host = new URL(origin).host;
    const requestHost = new URL(request.url).host;
    const forwardedHost = request.headers.get("x-forwarded-host");
    if (host === requestHost || host === forwardedHost) return null;
  } catch { /* Malformed origins are rejected below. */ }
  return Response.json({ error: "Cross-origin writes are not allowed." }, { status: 403 });
}

export function routeError(error: unknown): Response {
  if (error instanceof SyntaxError) return Response.json({ error: "The request must contain valid JSON." }, { status: 400 });
  console.error("Studio API request failed:", error);
  return Response.json({ error: "Your changes could not be saved. Please try again." }, { status: 500 });
}
