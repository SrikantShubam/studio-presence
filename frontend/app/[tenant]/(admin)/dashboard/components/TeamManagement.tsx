"use client";

import { Copy, MailPlus, RefreshCw, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Feedback, Panel, inputClass } from "./primitives";

type Role = "owner" | "editor" | "viewer";
type Member = { user_id: string; role: Role; email: string | null; display_name: string | null; created_at: string };
type Invitation = { id: string; email_display: string; role: Exclude<Role, "owner">; expires_at: string; created_at: string };
const roleLabels: Record<Exclude<Role, "owner">, string> = { editor: "Editor", viewer: "Viewer" };

export function TeamManagement({ tenant, mode }: { tenant: string; mode: "demo" | "live" | "unavailable" }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<Role, "owner">>("editor");
  const [copyLink, setCopyLink] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (mode !== "live") return;
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
      const result = (await response.json()) as { members: Member[]; invitations: Invitation[] };
      setMembers(result.members);
      setInvitations(result.invitations);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load().catch((loadError: unknown) => { setLoading(false); setError(loadError instanceof Error ? loadError.message : "Team details could not be loaded."); }); }, [mode, tenant]);

  async function action(body: Record<string, string>) {
    setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/${encodeURIComponent(tenant)}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = (await response.json()) as { error?: string; inviteUrl?: string; emailSent?: boolean };
      if (!response.ok) throw new Error(result.error ?? "Membership action failed.");
      if (result.inviteUrl) { setCopyLink(result.inviteUrl); await navigator.clipboard?.writeText(result.inviteUrl).catch(() => undefined); setMessage(result.emailSent ? "Invitation sent and link copied." : "Invitation created. Copy the link below to share it."); }
      else setMessage("Workspace access updated.");
      await load();
    } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Membership action failed."); }
    finally { setPending(false); }
  }

  if (mode !== "live") return null;
  return (
    <Panel title="Team access" description="Invite people to work in this workspace. Invitations expire after 24 hours." action={<ShieldCheck aria-hidden="true" className="size-4 text-admin-muted" />}>
      <div className="grid gap-5 p-5">
        <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto]" onSubmit={(event) => { event.preventDefault(); void action({ action: "invite", email, role }); }}>
          <input className={inputClass} type="email" required placeholder="teammate@example.com" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Invite email" />
          <select className={inputClass} value={role} onChange={(event) => setRole(event.target.value as Exclude<Role, "owner">)} aria-label="Invite role"><option value="editor">Editor</option><option value="viewer">Viewer</option></select>
          <Button type="submit" variant="primary" disabled={pending}><MailPlus aria-hidden="true" className="size-4" />Invite</Button>
        </form>
        {copyLink && <div className="flex flex-wrap items-center gap-2 border border-admin-border bg-admin-bg p-3 text-xs"><span className="min-w-0 flex-1 truncate text-admin-muted">{copyLink}</span><Button type="button" onClick={() => void navigator.clipboard?.writeText(copyLink)}><Copy aria-hidden="true" className="size-4" />Copy link</Button><Button type="button" onClick={() => setCopyLink("")} aria-label="Dismiss invitation link" title="Dismiss invitation link"><X aria-hidden="true" className="size-4" /></Button></div>}
        <Feedback error={error} message={loading ? "Loading team access…" : message} />
        <div className="grid gap-2">
          {members.map((member) => <div key={member.user_id} className="flex flex-wrap items-center gap-3 border-t border-admin-border py-3"><span className="flex size-8 items-center justify-center border border-admin-border bg-admin-raised"><UserRound aria-hidden="true" className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{member.display_name || member.email || `Member ${member.user_id.slice(0, 8)}`}</span><span className="block truncate text-[11px] text-admin-muted">{member.email || member.user_id}</span></span>{member.role === "owner" ? <Badge>Owner</Badge> : <><select className="border border-admin-border bg-admin-surface px-2 py-2 text-xs" value={member.role} disabled={pending} onChange={(event) => void action({ action: "role", userId: member.user_id, role: event.target.value })} aria-label={`Role for ${member.email || member.user_id}`}><option value="editor">Editor</option><option value="viewer">Viewer</option></select><Button type="button" onClick={() => { if (window.confirm("Remove this member from the workspace?")) void action({ action: "remove", userId: member.user_id }); }} aria-label={`Remove ${member.email || member.user_id}`} title="Remove member"><Trash2 aria-hidden="true" className="size-4" /></Button></>}</div>)}
        </div>
        {invitations.length > 0 && <div className="border-t border-admin-border pt-4"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Pending invitations</p>{invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center gap-3 border-t border-admin-border py-3 text-xs"><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{invitation.email_display}</span><span className="text-[11px] text-admin-muted">{roleLabels[invitation.role]} · expires {new Date(invitation.expires_at).toLocaleString("en-IN")}</span></span><Button type="button" disabled={pending} onClick={() => void action({ action: "resend", invitationId: invitation.id, email: invitation.email_display, role: invitation.role })}><RefreshCw aria-hidden="true" className="size-4" />Resend</Button><Button type="button" disabled={pending} onClick={() => void action({ action: "revoke", invitationId: invitation.id })} aria-label={`Revoke invitation for ${invitation.email_display}`} title="Revoke invitation"><X aria-hidden="true" className="size-4" /></Button></div>)}</div>}
      </div>
    </Panel>
  );
}