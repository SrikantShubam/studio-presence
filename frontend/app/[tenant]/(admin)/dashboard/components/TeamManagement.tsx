"use client";

import { Check, ChevronDown, Copy, Link2, MailPlus, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Feedback, Panel, inputClass } from "./primitives";

type Role = "owner" | "editor" | "viewer";
type Member = {
  user_id: string;
  role: Role;
  email: string | null;
  display_name: string | null;
  created_at: string;
  avatar_url?: string | null;
};
type Invitation = { id: string; email_display: string; role: Exclude<Role, "owner">; expires_at: string; created_at: string };
const roleLabels: Record<Exclude<Role, "owner">, string> = { editor: "Editor", viewer: "Viewer" };

const DEMO_MEMBERS: Member[] = [
  {
    user_id: "demo-owner",
    role: "owner",
    email: "ashish@ashishinteriors.com",
    display_name: "Ashish Sharma",
    created_at: "2026-08-01T00:00:00.000Z",
  },
  {
    user_id: "demo-editor",
    role: "editor",
    email: "priya@ashishinteriors.com",
    display_name: "Priya Patel",
    created_at: "2026-08-15T00:00:00.000Z",
  },
  {
    user_id: "demo-viewer",
    role: "viewer",
    email: "rohit@ashishinteriors.com",
    display_name: "Rohit Verma",
    created_at: "2026-09-01T00:00:00.000Z",
  },
];

const DEMO_INVITATIONS: Invitation[] = [
  {
    id: "demo-invite-1",
    email_display: "neha@ashishinteriors.com",
    role: "editor",
    expires_at: new Date(Date.now() + 20 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];

function memberInitials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.split("@")[0]?.trim() || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (first && second) return `${first[0]}${second[0]}`.toUpperCase();
  if (first && first.length >= 2) return first.slice(0, 2).toUpperCase();
  return "SP";
}

export function TeamManagement({ tenant, mode }: { tenant: string; mode: "demo" | "live" | "unavailable" }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [currentRole, setCurrentRole] = useState<Role>("owner");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<Role, "owner">>("editor");
  const [copyLink, setCopyLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (mode === "demo") {
      setMembers(DEMO_MEMBERS);
      setInvitations(DEMO_INVITATIONS);
      setCurrentRole("owner");
      setLoading(false);
      return;
    }
    if (mode !== "live") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/${encodeURIComponent(tenant)}/members`, { cache: "no-store" });
      if (response.status === 403) {
        setMembers([]);
        setInvitations([]);
        setError("");
        return;
      }
      if (!response.ok) throw new Error("Team details could not be loaded.");
      const result = (await response.json()) as { currentRole?: Role; members: Member[]; invitations: Invitation[] };
      if (result.currentRole) setCurrentRole(result.currentRole);
      setMembers(result.members);
      setInvitations(result.invitations);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load().catch((loadError: unknown) => {
      setLoading(false);
      setError(loadError instanceof Error ? loadError.message : "Team details could not be loaded.");
    });
  }, [mode, tenant]);

  async function copyToClipboard(url: string) {
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  }

  async function action(body: Record<string, string>) {
    setPending(true);
    setError("");
    setMessage("");
    try {
      if (mode === "demo") {
        if (body.action === "invite") {
          const newInvite: Invitation = {
            id: `demo-invite-${Date.now()}`,
            email_display: body.email ?? "",
            role: (body.role as Exclude<Role, "owner">) || "editor",
            expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
            created_at: new Date().toISOString(),
          };
          setInvitations((prev) => [newInvite, ...prev]);
          const url = `${window.location.origin}/invite/sample-${Date.now().toString(36)}`;
          setCopyLink(url);
          void copyToClipboard(url);
          setEmail("");
          setMessage("Sample invitation created. Copy the link below to share it.");
        } else if (body.action === "resend") {
          const url = `${window.location.origin}/invite/sample-${Date.now().toString(36)}`;
          setCopyLink(url);
          void copyToClipboard(url);
          setMessage("Sample invitation resent and link copied.");
        } else if (body.action === "revoke") {
          setInvitations((prev) => prev.filter((i) => i.id !== body.invitationId));
          setMessage("Sample invitation revoked.");
        } else if (body.action === "role") {
          setMembers((prev) => prev.map((m) => (m.user_id === body.userId ? { ...m, role: body.role as Role } : m)));
          setMessage("Workspace access updated.");
        } else if (body.action === "remove") {
          setMembers((prev) => prev.filter((m) => m.user_id !== body.userId));
          setMessage("Member removed from workspace.");
        }
        return;
      }
      const response = await fetch(`/api/${encodeURIComponent(tenant)}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { error?: string; inviteUrl?: string; emailSent?: boolean };
      if (!response.ok) throw new Error(result.error ?? "Membership action failed.");
      if (result.inviteUrl) {
        setCopyLink(result.inviteUrl);
        void copyToClipboard(result.inviteUrl);
        setMessage(result.emailSent ? "Invitation sent and link copied." : "Invitation created. Copy the link below to share it.");
        setEmail("");
      } else {
        setMessage("Workspace access updated.");
      }
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Membership action failed.");
    } finally {
      setPending(false);
    }
  }

  if (mode === "unavailable") return null;

  const isOwner = currentRole === "owner";

  return (
    <Panel
      title="Team access"
      description="Invite people to work in this workspace. Invitations expire after 24 hours."
      action={<ShieldCheck aria-hidden="true" className="size-4 text-admin-muted" />}
    >
      <div className="grid gap-5 p-5">
        {isOwner ? (
          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void action({ action: "invite", email, role });
            }}
          >
            <input
              className={inputClass}
              type="email"
              required
              placeholder="teammate@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Invite email"
            />
            <div className="relative inline-flex items-center">
              <select
                className="min-h-11 w-full appearance-none border border-admin-border bg-admin-bg pl-3 pr-8 text-sm font-medium text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary sm:w-32 cursor-pointer"
                value={role}
                onChange={(event) => setRole(event.target.value as Exclude<Role, "owner">)}
                aria-label="Invite role"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 size-4 text-admin-muted" />
            </div>
            <Button type="submit" variant="primary" disabled={pending}>
              <MailPlus aria-hidden="true" className="size-4" />
              Invite
            </Button>
          </form>
        ) : (
          <p className="text-xs text-admin-muted">
            Only the workspace owner can invite new members or change workspace roles.
          </p>
        )}

        {copyLink && (
          <div className="border border-admin-border bg-admin-raised p-4 transition-all">
            <div className="flex items-center justify-between gap-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center bg-admin-primary text-admin-on-primary">
                  <Link2 aria-hidden="true" className="size-3" />
                </span>
                <span className="text-xs font-semibold text-admin-ink">Invitation link created</span>
              </div>
              <button
                type="button"
                onClick={() => setCopyLink("")}
                className="p-1 text-admin-muted hover:text-admin-ink transition-colors cursor-pointer"
                aria-label="Dismiss link"
                title="Dismiss link"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <p className="pb-3 text-xs text-admin-muted">
              Share this private link with your teammate. It will expire in 24 hours.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center border border-admin-border bg-admin-bg px-3 py-2 text-xs">
                <span className="truncate font-mono text-admin-ink select-all">{copyLink}</span>
              </div>
              <Button
                type="button"
                variant={copied ? undefined : "primary"}
                className={copied ? "border-admin-success! text-admin-success!" : ""}
                onClick={() => void copyToClipboard(copyLink)}
              >
                {copied ? (
                  <>
                    <Check aria-hidden="true" className="size-4 text-admin-success" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="size-4" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <Feedback error={error} message={loading ? "Loading team access…" : message} />

        <div className="grid gap-2">
          {members.map((member) => (
            <div key={member.user_id} className="flex flex-wrap items-center gap-3 border-t border-admin-border py-3">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt=""
                  className="size-9 shrink-0 rounded-full border border-admin-border object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-admin-border bg-admin-raised text-[11px] font-semibold text-admin-ink">
                  {memberInitials(member.display_name, member.email)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">
                  {member.display_name || member.email || `Member ${member.user_id.slice(0, 8)}`}
                </span>
                <span className="block truncate text-[11px] text-admin-muted">{member.email || member.user_id}</span>
                {member.role === "owner" && (
                  <span className="mt-1 inline-flex items-center rounded-full border border-admin-border bg-admin-raised px-2 py-0.5 text-[10px] font-medium text-admin-ink">
                    Owner
                  </span>
                )}
              </span>
              {member.role === "owner" ? null : isOwner ? (
                <>
                  <div className="relative inline-flex items-center">
                    <select
                      className="appearance-none border border-admin-border bg-admin-surface pl-2.5 pr-7 py-1.5 text-xs font-medium text-admin-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-admin-primary"
                      value={member.role}
                      disabled={pending}
                      onChange={(event) => void action({ action: "role", userId: member.user_id, role: event.target.value })}
                      aria-label={`Role for ${member.email || member.user_id}`}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 size-3.5 text-admin-muted" />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Remove this member from the workspace?")) {
                        void action({ action: "remove", userId: member.user_id });
                      }
                    }}
                    aria-label={`Remove ${member.email || member.user_id}`}
                    title="Remove member"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </>
              ) : (
                <Badge>{roleLabels[member.role]}</Badge>
              )}
            </div>
          ))}
        </div>

        {isOwner && invitations.length > 0 && (
          <div className="border-t border-admin-border pt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Pending invitations</p>
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex flex-wrap items-center gap-3 border-t border-admin-border py-3 text-xs">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{invitation.email_display}</span>
                  <span className="text-[11px] text-admin-muted">
                    {roleLabels[invitation.role]} · expires {new Date(invitation.expires_at).toLocaleString("en-IN")}
                  </span>
                </span>
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    void action({
                      action: "resend",
                      invitationId: invitation.id,
                      email: invitation.email_display,
                      role: invitation.role,
                    })
                  }
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Resend
                </Button>
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() => void action({ action: "revoke", invitationId: invitation.id })}
                  aria-label={`Revoke invitation for ${invitation.email_display}`}
                  title="Revoke invitation"
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}