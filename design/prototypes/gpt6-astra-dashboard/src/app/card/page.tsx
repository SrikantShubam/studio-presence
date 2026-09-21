import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { StudioCard } from "@/components/dashboard/SupportingTabs";
import { getWorkspaceData } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ashish Interiors · Studio card", description: "A useful first connection. Contact Ashish Interiors or tell us about your next project." };

export default async function PublicCardPage() {
  const { settings } = await getWorkspaceData();
  const publicSettings = { ...settings, alerts: "", ownerName: "", alertNew: false, alertDigest: false };
  return <main className="grid min-h-dvh place-content-center bg-muted/30 px-4 py-10"><div className="w-full max-w-[450px]"><StudioCard settings={publicSettings} /><div className="mt-5 flex items-center justify-between text-[10px] text-muted-foreground"><span>Made with Studio Presence</span><a href="/site" className="flex items-center gap-1">Explore our website<ArrowUpRight className="!size-3" /></a></div></div></main>;
}
