import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { ensureWorkspace, getWorkspaceData } from "@/lib/data";
import { enquiryCreateSchema, rejectCrossOrigin, routeError } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return Response.json((await getWorkspaceData()).enquiries); }
  catch (error) { return routeError(error); }
}

export async function POST(request: Request) {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return forbidden;
  try {
    const parsed = enquiryCreateSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(" ") }, { status: 400 });
    await ensureWorkspace();
    const input = parsed.data;
    const [created] = await db.insert(enquiries).values({
      ...input, id: crypto.randomUUID(), budget: `₹${input.value}L`,
      status: "New", notes: "", age: "Just now",
    }).returning();
    return Response.json(created, { status: 201 });
  } catch (error) { return routeError(error); }
}
