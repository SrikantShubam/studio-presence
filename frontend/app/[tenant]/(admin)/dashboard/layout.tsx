import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { DashboardShell } from "./components/DashboardShell";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthError,
  ConfigError,
  requireTenant,
  type ClientConfig,
} from "@studio/backend";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  loadPublicTenantConfig,
  loadTenantWorkspaceConfig,
} from "@/lib/tenant-config";
import { signOut } from "../actions";
const inter = Inter({ subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dashboard-mono",
});

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = Boolean(user?.email && session);

  let branding: ClientConfig | null = null;

  if (isAuthenticated && user?.email && session) {
    let tenantContext;
    try {
      tenantContext = await requireTenant({
        id: user.id,
        email: user.email,
        accessToken: session.access_token,
      });
    } catch (e) {
      if (e instanceof AuthError) {
        return <ProvisioningGap message={e.message} />;
      }
      throw e;
    }

    if (tenantContext.tenant.slug !== tenantSlug) {
      return (
        <TenantMismatchNotice
          userEmail={user.email ?? ""}
          currentSlug={tenantContext.tenant.slug}
          targetSlug={tenantSlug}
        />
      );
    }

    try {
      branding = await loadTenantWorkspaceConfig(
        tenantContext.tenant.slug,
        tenantContext.tenant.id,
        session.access_token,
      );
    } catch (e) {
      if (e instanceof ConfigError)
        return <ProvisioningGap message="This site's config is invalid." />;
      throw e;
    }
  } else {
    // Unauthenticated visit: allow demo preview if the tenant is a demo studio
    try {
      branding = await loadPublicTenantConfig(tenantSlug);
    } catch {
      branding = null;
    }

    if (!branding || branding.status !== "demo") {
      redirect(`/login?next=/${encodeURIComponent(tenantSlug)}/dashboard`);
    }
  }

  return (
    <div className={`${inter.className} ${mono.variable} text-[13px]`}>
      <DashboardShell
        tenant={tenantSlug}
        studioName={branding.business.name}
        ownerName={branding.business.ownerName ?? ""}
        ownerEmail={user?.email ?? branding.business.email ?? ""}
        authenticated={isAuthenticated}
        signOutAction={signOut}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
function ProvisioningGap({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-sm rounded-none border border-admin-border bg-admin-surface p-6">
        <h1 className="mb-2 text-lg font-semibold text-admin-ink">
          Almost there
        </h1>
        <p className="mb-4 text-sm text-admin-muted">{message}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="min-h-12 text-sm font-medium text-admin-primary"
          >
            Sign out and try a different email
          </button>
        </form>
      </div>
    </main>
  );
}

function TenantMismatchNotice({
  userEmail,
  currentSlug,
  targetSlug,
}: {
  userEmail: string;
  currentSlug: string;
  targetSlug: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-md rounded-none border border-admin-border bg-admin-surface p-6">
        <h1 className="mb-2 text-lg font-semibold text-admin-ink">
          Different workspace
        </h1>
        <p className="mb-4 text-sm text-admin-muted">
          You are signed in as{" "}
          <span className="font-medium text-admin-ink">{userEmail}</span>, which
          is linked to{" "}
          <span className="font-medium text-admin-ink">{currentSlug}</span>, but
          requested workspace{" "}
          <span className="font-medium text-admin-ink">{targetSlug}</span>.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/${currentSlug}/dashboard`}
            className="inline-flex min-h-11 items-center justify-center rounded-none bg-admin-primary px-4 text-sm font-semibold text-admin-on-primary"
          >
            Go to your studio dashboard
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-none border border-admin-border px-4 text-sm font-semibold text-admin-ink"
            >
              Sign out to switch account
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
