import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  AuthError,
  changeWorkspaceMemberRole,
  createWorkspaceInvitation,
  listWorkspaceInvitations,
  listWorkspaceMembers,
  removeWorkspaceMember,
  requireTenant,
  revokeWorkspaceInvitation,
  sendWorkspaceInvitation,
  workspaceRoleSchema,
} from "@studio/backend";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({ tenant: z.string().regex(/^[a-z0-9-]+$/) });
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("invite"), email: z.string().email(), role: workspaceRoleSchema }),
  z.object({ action: z.literal("resend"), invitationId: z.string().uuid(), email: z.string().email(), role: workspaceRoleSchema }),
  z.object({ action: z.literal("revoke"), invitationId: z.string().uuid() }),
  z.object({ action: z.literal("role"), userId: z.string().uuid(), role: workspaceRoleSchema }),
  z.object({ action: z.literal("remove"), userId: z.string().uuid() }),
]);

type RouteContext = { params: Promise<{ tenant: string }> };

async function authenticate(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user?.email || !session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const tenantContext = await requireTenant({ id: user.id, email: user.email, accessToken: session.access_token });
  if (tenantContext.tenant.slug !== tenantSlug) return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { tenantContext, user };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "not-found" }, { status: 404 });
  try {
    const auth = await authenticate(parsed.data.tenant);
    if (auth.error) return auth.error;
    const rawMembers = await listWorkspaceMembers(auth.tenantContext.db, auth.tenantContext.tenant.id);
    const currentRole = rawMembers.find((member) => member.user_id === auth.user.id)?.role ?? "viewer";
    const userMeta = (auth.user.identities ?? []).reduce<Record<string, unknown>>(
      (metadata, identity) => ({ ...metadata, ...(identity.identity_data ?? {}) }),
      { ...(auth.user.user_metadata ?? {}) },
    );
    const currentAvatar = [userMeta.avatar_url, userMeta.picture, userMeta.avatarUrl, userMeta.photoURL, userMeta.image]
      .find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? null;
    const members = rawMembers.map((m) => ({
      ...m,
      avatar_url: m.user_id === auth.user.id ? currentAvatar : (m as { avatar_url?: string | null }).avatar_url ?? null,
    }));
    const invitations = currentRole === "owner"
      ? await listWorkspaceInvitations(auth.tenantContext.db, auth.tenantContext.tenant.id)
      : [];
    return NextResponse.json({ currentRole, members, invitations });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.code }, { status: 403 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load workspace members." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const parsedBody = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return NextResponse.json({ error: "Invalid membership action." }, { status: 400 });
  try {
    const auth = await authenticate(parsedParams.data.tenant);
    if (auth.error) return auth.error;
    const { tenantContext } = auth;
    const roleResult = await tenantContext.db.rpc("current_tenant_role", { p_tenant_id: tenantContext.tenant.id });
    if (roleResult.data !== "owner") return NextResponse.json({ error: "Only the workspace owner can manage members." }, { status: 403 });
    const body = parsedBody.data;
    if (body.action === "invite" || body.action === "resend") {
      if (body.action === "resend") await revokeWorkspaceInvitation(tenantContext.db, body.invitationId);
      const invitation = await createWorkspaceInvitation(tenantContext.db, { tenantId: tenantContext.tenant.id, email: body.email, role: body.role });
      const inviteUrl = new URL(`/invite/${invitation.token}`, request.url);
      inviteUrl.searchParams.set("tenant", parsedParams.data.tenant);
      const inviteUrlString = inviteUrl.toString();
      let emailSent = false;
      let emailError: string | undefined;
      try {
        await sendWorkspaceInvitation({ to: body.email, studioName: tenantContext.tenant.name, inviterName: auth.user.user_metadata?.full_name ?? auth.user.email ?? "", role: body.role, inviteUrl: inviteUrlString });
        emailSent = true;
      } catch (error) {
        console.error("Workspace invitation email failed", { tenant: parsedParams.data.tenant, error });
        emailError = "Email failed. Link copied.";
      }
      return NextResponse.json({ invitationId: invitation.invitationId, inviteUrl: inviteUrlString, expiresAt: invitation.expiresAt, emailSent, emailError });
    }
    if (body.action === "revoke") await revokeWorkspaceInvitation(tenantContext.db, body.invitationId);
    if (body.action === "role") await changeWorkspaceMemberRole(tenantContext.db, { tenantId: tenantContext.tenant.id, userId: body.userId, role: body.role });
    if (body.action === "remove") await removeWorkspaceMember(tenantContext.db, tenantContext.tenant.id, body.userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.code }, { status: 403 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Membership action failed." }, { status: 400 });
  }
}