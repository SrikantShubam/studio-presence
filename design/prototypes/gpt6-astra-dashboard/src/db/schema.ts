import { pgTable, text, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import type { EnquiryStatus, PricingSettings, StudioSettings, WebsiteContent } from "@/lib/types";

export const enquiries = pgTable("studio_enquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  locality: text("locality").notNull(),
  city: text("city").notNull(),
  projectType: text("project_type").notNull(),
  budget: text("budget").notNull(),
  value: real("value").notNull(),
  source: text("source").notNull(),
  status: text("status").$type<EnquiryStatus>().notNull().default("New"),
  age: text("age").notNull().default("Just now"),
  timeline: text("timeline").notNull().default("To be discussed"),
  phone: text("phone").notNull(),
  brief: text("brief").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true }).notNull().defaultNow(),
});

export const workspace = pgTable("studio_workspace", {
  id: text("id").primaryKey().default("studio"),
  settings: jsonb("settings").$type<StudioSettings>().notNull(),
  pricing: jsonb("pricing").$type<PricingSettings>().notNull(),
  websiteDraft: jsonb("website_draft").$type<WebsiteContent>().notNull(),
  websitePublished: jsonb("website_published").$type<WebsiteContent>().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true }).notNull().defaultNow(),
});
