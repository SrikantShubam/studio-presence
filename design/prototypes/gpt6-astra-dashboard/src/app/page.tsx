import DashboardShell from "@/components/dashboard/DashboardShell";
import { getWorkspaceData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getWorkspaceData();
  return <DashboardShell initialData={data} />;
}
