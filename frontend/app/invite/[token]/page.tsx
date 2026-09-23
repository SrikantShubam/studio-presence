import { redirect } from "next/navigation";
import { acceptWorkspaceInvitation, createScopedClient } from "@studio/backend";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  if (!user?.email || !session) redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);

  const db = createScopedClient(session.access_token);
  let accepted: { tenantId: string; role: "editor" | "viewer" };
  try {
    accepted = await acceptWorkspaceInvitation(db, token);
  } catch (error) {
    if (isRedirectError(error)) throw error
    return <InvitationError email={user.email} />;
  }
  const { data: tenant } = await db.from("tenants").select("slug").eq("id", accepted.tenantId).single();
  if (!tenant?.slug) return <InvitationError email={user.email} />;
  redirect(`/${tenant.slug}/dashboard`);
}

function InvitationError({ email }: { email: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-admin-bg px-5 text-admin-ink">
      <section className="w-full max-w-md border border-admin-border bg-admin-surface p-6">
        <h1 className="text-xl font-semibold">Invitation unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-admin-muted">This invitation is expired, revoked, already used, or belongs to another email address.</p>
        <p className="mt-5 text-xs text-admin-muted">Signed in as {email}</p>
      </section>
    </main>
  );
}

function isRedirectError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
}
