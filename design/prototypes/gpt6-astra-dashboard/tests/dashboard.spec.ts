import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db, pool } from "../src/db";
import { enquiries as enquiryTable } from "../src/db/schema";
import type { Enquiry, WorkspaceData } from "../src/lib/types";
import { readFile } from "node:fs/promises";

test.afterAll(async () => { await pool.end(); });

test("overview preserves the Astra desk and strict visual invariants", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your studio, at a glance." })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".metric-card")).toHaveCount(6);
  await expect(page.getByRole("heading", { name: "Where your next project begins" })).toBeVisible();
  await expect(page.locator(".demand-city")).toHaveCount(6);
  const styles = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const metric = getComputedStyle(document.querySelector(".metric-card")!);
    const value = getComputedStyle(document.querySelector(".metric-number")!);
    return { fontSize: body.fontSize, font: body.fontFamily, mono: value.fontFamily, radius: metric.borderRadius, shadow: metric.boxShadow, gradient: document.querySelectorAll("linearGradient, radialGradient").length, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  expect(styles.fontSize).toBe("13px");
  expect(styles.font).toMatch(/inter/i);
  expect(styles.mono).toMatch(/jetbrains/i);
  expect(styles.radius).toBe("0px");
  expect(styles.shadow).toBe("none");
  expect(styles.gradient).toBe(0);
  expect(styles.overflow).toBe(false);
  await page.screenshot({ path: "artifacts/overview-desktop.png", fullPage: true });
  await page.screenshot({ path: "artifacts/overview-viewport.png" });
  expect(errors).toEqual([]);
});

test("city demand, status tabs, search, and empty-state reset compose correctly", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View Ranchi enquiries", exact: true }).click();
  await expect(page.locator(".enquiry-table tbody tr")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Priya & Amit", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear city filter" }).click();
  await expect(page.locator(".enquiry-table tbody tr")).toHaveCount(7);
  await page.getByRole("group", { name: "Enquiry status" }).getByRole("button", { name: /^New/ }).click();
  await expect(page.locator(".enquiry-table tbody tr")).toHaveCount(2);
  await page.getByRole("group", { name: "Enquiry status" }).getByRole("button", { name: /^All/ }).click();
  await page.getByRole("searchbox", { name: "Search enquiries" }).fill("Whitefield");
  await expect(page.locator(".enquiry-table tbody tr")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Neha Rao", exact: true })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search enquiries" }).fill("no-match-zzzz");
  await expect(page.getByRole("heading", { name: "No enquiries match these filters" })).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page.locator(".enquiry-table tbody tr")).toHaveCount(7);
});

test("enquiry notes and status persist across a reload", async ({ page, request }) => {
  const original = ((await (await request.get("/api/enquiries")).json()) as Enquiry[]).find((enquiry) => enquiry.id === "sample-1")!;
  try {
    await page.goto("/#enquiries");
    await page.getByRole("button", { name: "Ananya Sinha", exact: true }).click();
    await page.getByLabel("Lead status", { exact: true }).selectOption("Contacted");
    await expect(page.getByLabel("Lead status", { exact: true })).toBeEnabled();
    await page.getByLabel("Private studio notes").fill("Browser-tested follow-up: bring material samples.");
    await page.getByRole("button", { name: "Save notes", exact: true }).click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close dialog", exact: true }).click();
    await page.reload();
    await page.getByRole("button", { name: "Ananya Sinha", exact: true }).click();
    await expect(page.getByLabel("Lead status", { exact: true })).toHaveValue("Contacted");
    await expect(page.getByLabel("Private studio notes")).toHaveValue("Browser-tested follow-up: bring material samples.");
  } finally {
    await request.patch("/api/enquiries/sample-1", { data: { status: original.status, notes: original.notes } });
  }
});

test("walk-in enquiry is validated and stored in PostgreSQL", async ({ page }) => {
  let id: string | undefined;
  try {
    await page.goto("/");
    await page.getByRole("button", { name: "Log walk-in lead", exact: true }).click();
    await page.getByLabel("Client name", { exact: true }).fill("E2E Studio Enquiry");
    await page.getByLabel("Indian mobile number").fill("9876543210");
    await page.getByLabel("City", { exact: true }).selectOption("Ranchi");
    await page.getByLabel("Locality", { exact: true }).fill("Test locality");
    await page.getByLabel("Budget in lakh").fill("12.5");
    await page.getByLabel("Client brief").fill("Automated browser test. This record is removed after verification.");
    const responsePromise = page.waitForResponse((response) => response.url().endsWith("/api/enquiries") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Save enquiry", exact: true }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    id = (await response.json()).id;
    await expect(page.getByRole("button", { name: "E2E Studio Enquiry", exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "E2E Studio Enquiry", exact: true })).toBeVisible();
  } finally {
    if (id) await db.delete(enquiryTable).where(eq(enquiryTable.id, id));
  }
});

test("calculator updates a quote and publishes validated pricing", async ({ page, request }) => {
  const original = (await (await request.get("/api/workspace")).json()) as WorkspaceData;
  try {
    await page.goto("/#calculator");
    await page.getByLabel("Essential rate").fill("1250");
    await page.getByRole("button", { name: "Essential", exact: true }).click();
    await expect(page.getByText("₹13.5L – ₹16.5L", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Publish rates to site", exact: true }).click();
    await expect(page.getByText("Your pricing is published. The live site now uses these rates.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Essential rate")).toHaveValue("1250");
  } finally { await request.patch("/api/workspace", { data: { kind: "pricing", data: original.pricing } }); }
});

test("website drafts remain private until reviewed and published", async ({ page, request }) => {
  const original = (await (await request.get("/api/workspace")).json()) as WorkspaceData;
  const heading = "A considered home begins with you.";
  try {
    await page.goto("/#website");
    await page.getByLabel("Heading", { exact: true }).fill(heading);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByText("Website draft saved. Your live site is unchanged.")).toBeVisible();
    expect(await (await request.get("/site")).text()).not.toContain(heading);
    await page.getByRole("button", { name: "Review & publish", exact: true }).click();
    await page.getByRole("button", { name: "Publish website", exact: true }).click();
    await expect(page.getByText("Your website is published. The live site is up to date.")).toBeVisible();
    expect(await (await request.get("/site")).text()).toContain(heading);
  } finally {
    await request.patch("/api/workspace", { data: { kind: "publish", data: original.websitePublished } });
    await request.patch("/api/workspace", { data: { kind: "draft", data: original.websiteDraft } });
  }
});

test("CSV, vCard, and QR exports produce real downloadable files", async ({ page }) => {
  await page.goto("/");
  let downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const csv = await downloadPromise;
  expect(csv.suggestedFilename()).toBe("studio-enquiries.csv");
  expect(await readFile((await csv.path())!, "utf8")).toContain("Ananya Sinha");
  await page.getByRole("button", { name: "Share WhatsApp vCard", exact: true }).click();
  downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download contact (.vcf)", exact: true }).click();
  const vcard = await downloadPromise;
  expect(await readFile((await vcard.path())!, "utf8")).toContain("BEGIN:VCARD");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Digital card & QR", exact: true }).click();
  await expect(page.getByRole("img", { name: /QR code linking/ })).toBeVisible();
  downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download print QR", exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("ashish-interiors-qr.svg");
});

test("mobile navigation and persistent theme remain accessible without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("button", { name: "Open navigation", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: "artifacts/overview-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Toggle light and dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle light and dark theme", exact: true }).click();
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Studio workspace navigation" })).toBeVisible();
  await page.getByRole("button", { name: "Enquiries", exact: true }).click();
  await expect(page.getByRole("heading", { name: "All enquiries", exact: true })).toBeVisible();
  await expect(page.locator(".sidebar")).not.toHaveClass(/is-open/);
});

test("API rejects invalid input and cross-origin writes", async ({ request }) => {
  const invalid = await request.post("/api/enquiries", { data: { name: "" } });
  expect(invalid.status()).toBe(400);
  const forged = await request.patch("/api/enquiries/sample-1", { headers: { Origin: "https://unrelated.example" }, data: { status: "Won" } });
  expect(forged.status()).toBe(403);
  const missing = await request.patch("/api/enquiries/nonexistent", { data: { notes: "Test" } });
  expect(missing.status()).toBe(404);
});
