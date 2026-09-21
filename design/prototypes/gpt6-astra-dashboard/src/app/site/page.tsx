import type { Metadata } from "next";
import { StudioWebsite } from "@/components/site/StudioWebsite";
import { getWorkspaceData } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ashish Interiors · Spaces shaped around you", description: "Thoughtful interior design for homes in Patna and beyond." };

export default async function PublicWebsitePage() {
  const { websitePublished, pricing, settings } = await getWorkspaceData();
  const publicSettings = { ...settings, alerts: "", ownerName: "", alertNew: false, alertDigest: false };
  return <main className="mx-auto min-h-screen max-w-[1440px]"><StudioWebsite content={websitePublished} settings={publicSettings} pricing={pricing} /></main>;
}
