import { eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { enquiryUpdateSchema, rejectCrossOrigin, routeError } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return forbidden;
  try {
    const { id } = await context.params;
    if (id.length > 80) return Response.json({ error: "Invalid enquiry ID." }, { status: 400 });
    const parsed = enquiryUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
    const [updated] = await db.update(enquiries).set(parsed.data).where(eq(enquiries.id, id)).returning();
    if (!updated) return Response.json({ error: "This enquiry no longer exists." }, { status: 404 });
    return Response.json(updated);
  } catch (error) { return routeError(error); }
}
