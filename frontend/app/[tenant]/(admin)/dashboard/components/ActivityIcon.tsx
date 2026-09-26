import {
  Activity,
  BarChart3,
  Globe2,
  StickyNote,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import type { ActivityEventType } from "@studio/backend";

const activityIcons: Record<ActivityEventType, { icon: typeof Activity; color: string }> = {
  lead_created: { icon: UserPlus, color: "text-admin-success" },
  lead_assigned: { icon: Users, color: "text-admin-primary" },
  lead_reassigned: { icon: Users, color: "text-admin-primary" },
  lead_status_changed: { icon: Activity, color: "text-admin-primary" },
  lead_note_updated: { icon: StickyNote, color: "text-admin-primary" },
  member_invitation_created: { icon: UserPlus, color: "text-admin-alert" },
  member_invitation_accepted: { icon: Users, color: "text-admin-alert" },
  member_invitation_revoked: { icon: UserMinus, color: "text-admin-alert" },
  member_role_changed: { icon: Users, color: "text-admin-alert" },
  member_removed: { icon: UserMinus, color: "text-admin-alert" },
  content_published: { icon: Globe2, color: "text-admin-primary" },
  analytics_monthly_summary: { icon: BarChart3, color: "text-admin-success" },
};

export function ActivityIcon({ type }: { type: ActivityEventType }) {
  const { icon: Icon, color } = activityIcons[type] ?? { icon: Activity, color: "text-admin-muted" };
  return <Icon aria-hidden="true" className={`size-5 shrink-0 ${color}`} strokeWidth={1.7} />;
}
