import { eq } from "drizzle-orm";
import { db } from "@/db";
import { workspace } from "@/db/schema";
import { ensureWorkspace, getWorkspaceData } from "@/lib/data";
import { rejectCrossOrigin, routeError, workspaceUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try { const { enquiries: _enquiries, ...studio } = await getWorkspaceData(); return Response.json(studio); }
  catch (error) { return routeError(error); }
}

export async function PATCH(request: Request) {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return forbidden;
  try {
    const parsed = workspaceUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(" ") }, { status: 400 });
    await ensureWorkspace();
    const update = parsed.data;
    const patch = update.kind === "settings" ? { settings: update.data }
      : update.kind === "pricing" ? { pricing: update.data }
      : update.kind === "draft" ? { websiteDraft: update.data }
      : { websiteDraft: update.data, websitePublished: update.data };
    const [updated] = await db.update(workspace).set({ ...patch, updatedAt: new Date().toISOString() }).where(eq(workspace.id, "studio")).returning();
    return Response.json(updated);
  } catch (error) { return routeError(error); }
}
