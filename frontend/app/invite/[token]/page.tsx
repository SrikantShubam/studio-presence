import Link from "next/link";
import { redirect } from "next/navigation";
import { acceptWorkspaceInvitation, createScopedClient } from "@studio/backend";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadPublicTenantConfig } from "@/lib/tenant-config";
import { InvitationEntry, InvitationSessionReset } from "./InvitationEntry";

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ tenant?: string; auth?: string }>;
}) {
  const { token } = await params;
  const inviteParams = await searchParams;
  const tenantSlug = inviteParams?.tenant;
  const isAuthenticatedInvite = inviteParams?.auth === "1";
  const branding = await loadInvitationBranding(tenantSlug);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!user?.email || !session) {
    return (
      <InvitationEntry
        token={token}
        tenantSlug={tenantSlug}
        studioName={branding.name}
        logoUrl={branding.logo}
      />
    );
  }

  if (!isAuthenticatedInvite) {
    return (
      <InvitationSessionReset
        token={token}
        tenantSlug={tenantSlug}
        studioName={branding.name}
        logoUrl={branding.logo}
        email={user.email}
      />
    );
  }

  const db = createScopedClient(session.access_token);
  let accepted: { tenantId: string; role: "editor" | "viewer" };
  try {
    accepted = await acceptWorkspaceInvitation(db, token);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return <InvitationError email={user.email} error={error instanceof Error ? error.message : undefined} />;
  }
  const { data: tenant } = await db.from("tenants").select("slug").eq("id", accepted.tenantId).single();
  if (!tenant?.slug) return <InvitationError email={user.email} />;
  redirect(`/${tenant.slug}/dashboard`);
}

async function loadInvitationBranding(tenantSlug: string | undefined): Promise<{ name?: string; logo?: string | null }> {
  if (!tenantSlug) return {};
  try {
    const config = await loadPublicTenantConfig(tenantSlug);
    return { name: config.business.name, logo: config.brand.logo ?? null };
  } catch {
    return {};
  }
}

function InvitationError({ email, error }: { email: string; error?: string }) {
  const isWrongEmail = error?.includes("another email address");
  const isExpired = /invitation (?:has )?expired(?: because|\.|$)/i.test(error ?? "");
  const isRevoked = error?.includes("revoked");
  const isAccepted = error?.includes("already been accepted");

  const title = isWrongEmail
    ? "Wrong account signed in"
    : isExpired
      ? "Invitation expired"
      : isRevoked
        ? "Invitation revoked"
        : isAccepted
          ? "Invitation already accepted"
          : "Invitation unavailable";

  const description = isWrongEmail
    ? `This invitation was created for another email address. You are currently signed in as ${email}. Please sign in with the invited email address to join this workspace.`
    : isExpired
      ? "This invitation has expired because it was created more than 24 hours ago. Please ask your workspace owner to send a new invitation."
      : isRevoked
        ? "This invitation was revoked by the workspace owner."
        : isAccepted
          ? "This invitation has already been accepted. You can proceed directly to your workspace dashboard."
          : "We could not complete this invitation. It may already have been used, revoked, expired, or created for another email. Ask the workspace owner to send a fresh invitation.";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-admin-bg px-5 text-admin-ink">
      <section className="w-full max-w-md border border-admin-border bg-admin-surface p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-admin-muted">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {isWrongEmail ? (
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center border border-admin-primary bg-admin-primary px-4 text-xs font-semibold text-admin-on-primary hover:opacity-90"
            >
              Sign in with another account
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center border border-admin-primary bg-admin-primary px-4 text-xs font-semibold text-admin-on-primary hover:opacity-90"
            >
              Go to dashboard
            </Link>
          )}
        </div>
        <p className="mt-5 border-t border-admin-border pt-4 text-[11px] text-admin-muted">Signed in as {email}</p>
      </section>
    </main>
  );
}

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}
