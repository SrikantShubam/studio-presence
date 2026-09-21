import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, workspace } from "@/db/schema";
import { DEFAULT_PRICING, DEFAULT_SETTINGS, DEFAULT_WEBSITE, SAMPLE_ENQUIRIES } from "./demo-data";
import type { WorkspaceData } from "./types";

/** Atomic initialization: existing workspace data is never overwritten by samples. */
export async function ensureWorkspace() {
  await db.transaction(async (transaction) => {
    const inserted = await transaction.insert(workspace).values({
      id: "studio", settings: DEFAULT_SETTINGS, pricing: DEFAULT_PRICING,
      websiteDraft: DEFAULT_WEBSITE, websitePublished: DEFAULT_WEBSITE,
    }).onConflictDoNothing().returning({ id: workspace.id });
    if (inserted.length) await transaction.insert(enquiries).values(SAMPLE_ENQUIRIES).onConflictDoNothing();
  });
}

export async function getWorkspaceData(): Promise<WorkspaceData> {
  await ensureWorkspace();
  const [studio, leads] = await Promise.all([
    db.select().from(workspace).where(eq(workspace.id, "studio")).limit(1),
    db.select().from(enquiries).orderBy(sql`${enquiries.id} like 'sample-%'`, desc(enquiries.createdAt)),
  ]);
  if (!studio[0]) throw new Error("The studio workspace could not be loaded.");
  return { ...studio[0], enquiries: leads };
}
