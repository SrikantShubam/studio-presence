import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  canAccessDashboard,
  leads,
  listWorkspaceMembers,
  listWorkspaceInvitations,
  leadStatusSchema,
  panel,
  requireTenant,
} from "@studio/backend";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  loadPublicTenantConfig,
  loadTenantWorkspaceConfig,
} from "@/lib/tenant-config";
import { DashboardWorkspace } from "./components/DashboardShell";
import { DEMO_ENQUIRIES, DEMO_WORKSPACE_MEMBERS } from "./components/demo-data";
import {
  applyConfigPatch,

  dashboardMode,
  normalizeIndianPhone,
  type ActionResult,
  type Enquiry,
  type LeadAction,
  type WorkspaceConfig,
  type WorkspaceMember,
  type TeamAccessSnapshot,
} from "./components/types";

const leadInput = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().max(30),
  locality: z.string().trim().max(160),
  projectType: z.string().trim().max(160),
  budgetBand: z.string().trim().max(100),
  timeline: z.string().trim().max(160),
  message: z.string().trim().max(3000),
});
const mutation = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("create"), values: leadInput }),
  z.object({
    kind: z.literal("update"),
    id: z.string().uuid(),
    status: leadStatusSchema,
    notes: z.string().max(2000),
  }),
  z.object({
    kind: z.literal("assign"),
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
]);

async function authenticatedContext(expectedTenant: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!user?.email || !session) return null;
  const context = await requireTenant({
    id: user.id,
    email: user.email,
    accessToken: session.access_token,
  });
  if (
    context.tenant.slug !== expectedTenant ||
    context.tenant.status === "archived"
  )
    throw new Error("Workspace access denied.");
  return {
    ...context,
    profileMetadata: {
      ...(user.user_metadata ?? {}),
      ...(user.identities?.[0]?.identity_data ?? {}),
    },
  };
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams?: Promise<{ demo?: string; tab?: string }>;
}) {
  const { tenant } = await params;
  const query = await searchParams;
  const context = await authenticatedContext(tenant);
  const base = context
    ? await loadTenantWorkspaceConfig(
        tenant,
        context.tenant.id,
        context.user.accessToken,
      )
    : await loadPublicTenantConfig(tenant);
  if (!context && (base.status !== "demo" || query?.demo === "0"))
    redirect(`/login?next=${encodeURIComponent(`/${tenant}/dashboard`)}`);
  const eligible = Boolean(
    context &&
    canAccessDashboard(context.tenant),
  );
  const mode = dashboardMode(query?.demo, eligible);
  let config: WorkspaceConfig = {
    business: base.business,
    brand: base.brand,
    seo: base.seo,
    sections: base.sections,
    integrations: base.integrations,
    status: base.status,
  };
  if (context) {
    const editable = await panel.getEditableConfig(context.db, context.tenant);
    config = applyConfigPatch(
      config,
      Object.fromEntries(
        Object.entries(editable.current).filter(
          ([key, value]) =>
            value !== undefined &&
            (key.startsWith("business.") || key.startsWith("brand.") || key.startsWith("seo.") || key.startsWith("sections.")),
        ),
      ),
    );
  }
  const profileMetadata = context?.profileMetadata ?? {};
  const ownerName =
    stringFrom(profileMetadata.full_name) ??
    stringFrom(profileMetadata.name) ??
    nameFromEmail(context?.user.email) ??
    base.business.ownerName ??
    "";

  let members: WorkspaceMember[] = mode === "demo" ? DEMO_WORKSPACE_MEMBERS : [];
  let currentRole: "owner" | "editor" | "viewer" = mode === "demo" ? "owner" : "viewer";
  let items: Enquiry[] = mode === "demo" ? DEMO_ENQUIRIES : [];
  let leadError: string | undefined;
  if (mode === "live" && context) {
    try {
  let teamAccess: TeamAccessSnapshot | undefined;
  if (context && query?.tab === "settings") {
    try {
      const teamMembers = await listWorkspaceMembers(context.db, context.tenant.id);
      const teamRole = teamMembers.find((member) => member.user_id === context.user.id)?.role ?? "viewer";
      const invitations = teamRole === "owner"
        ? await listWorkspaceInvitations(context.db, context.tenant.id)
        : [];
      teamAccess = { currentRole: teamRole, members: teamMembers, invitations };
    } catch { /* Team Access will load from its route. */ }
  }

      members = await listWorkspaceMembers(context.db, context.tenant.id);
      currentRole = members.find((member) => member.user_id === context.user.id)?.role ?? "viewer";
    } catch {
      leadError = "Workspace members could not be loaded. Assignment is temporarily unavailable.";
    }
    try {
      items = await leads.list(context.db);
    } catch {
      leadError = leadError ?? "Live enquiries could not be loaded. Refresh to try again.";
    }
  }

  async function mutateLead(
    input: Parameters<LeadAction>[0],
  ): Promise<ActionResult<Enquiry>> {
    "use server";
    if (mode !== "live") return { ok: false, error: "Sample and unavailable workspaces cannot change live enquiries." };
    const parsed = mutation.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Check the lead details. Notes must be under 2,000 characters." };
    try {
      const current = await authenticatedContext(tenant);
      if (!current || !canAccessDashboard(current.tenant)) return { ok: false, error: "You do not have access to this enquiry desk." };
      const workspaceMembers = await listWorkspaceMembers(current.db, current.tenant.id);
      const actor = workspaceMembers.find((member) => member.user_id === current.user.id);
      if (!actor) return { ok: false, error: "You are not an active workspace member." };
      let row: Enquiry;
      if (parsed.data.kind === "assign") {
        const assignment = parsed.data;
        if (actor.role !== "owner") return { ok: false, error: "Only the workspace owner can assign enquiries." };
        const assignee = workspaceMembers.find((member) => member.user_id === assignment.userId);
        if (!assignee || (assignee.role !== "owner" && assignee.role !== "editor")) return { ok: false, error: "Choose an active owner or editor." };
        row = await leads.assign(current.db, assignment.id, assignment.userId);
      } else if (parsed.data.kind === "create") {
        if (actor.role === "viewer") return { ok: false, error: "Viewers cannot create enquiries." };
        const phone = normalizeIndianPhone(parsed.data.values.phone);
        if (!phone) return { ok: false, error: "Enter a valid 10-digit Indian mobile number." };
        const result = await leads.create({ ...parsed.data.values, phone: `+${phone}`, tenantSlug: tenant, source: "other", sourcePage: `/${tenant}/dashboard#walk-in` });
        const created = await leads.get(current.db, result.leadId);
        if (!created) return { ok: false, error: "The lead was submitted but could not be reloaded. Refresh before trying again." };
        row = created;
      } else {
        if (actor.role === "viewer") return { ok: false, error: "Viewers cannot update enquiries." };
        const existing = await leads.get(current.db, parsed.data.id);
        if (!existing) return { ok: false, error: "The enquiry could not be found." };
        if (actor.role === "editor" && existing.assigned_to !== current.user.id) return { ok: false, error: "Editors can update only enquiries assigned to them." };
        row = await leads.updateWork(current.db, parsed.data.id, parsed.data.status, parsed.data.notes.trim());
      }
      revalidatePath(`/${tenant}/dashboard`);
      revalidatePath(`/${tenant}/dashboard/${row.id}`);
      return { ok: true, data: row };
    } catch {
      return { ok: false, error: "The enquiry could not be saved. Check your access and try again." };
    }
  }

  return (
    <DashboardWorkspace
      key={`${tenant}:${mode}`}
      initialData={{
        tenant,
        mode,
        config,
        ownerName,
        ownerEmail: context?.user.email ?? base.business.email ?? "",
        enquiries: items,
        members,
        currentRole,
        canAssign: currentRole === "owner",
        teamAccess,
        canEdit: mode === "demo" || (Boolean(context) && currentRole !== "viewer"),
        canUploadAssets: Boolean(context && currentRole !== "viewer"),
        canCreate:
          mode === "demo" ||
          Boolean(context && currentRole !== "viewer"),
        leadError,
      }}
      leadAction={mutateLead}
    />
  );
}

function stringFrom(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function nameFromEmail(email: string | null | undefined): string | null {
  const local = email?.split("@")[0]?.trim();
  if (!local) return null;
  const words = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length ? words.join(" ") : null;
}
