import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("frontend/app/[tenant]/(admin)/dashboard/page.tsx", "utf8");
const shell = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/DashboardShell.tsx", "utf8");
const settings = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/SupportingTabs.tsx", "utf8");
const team = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/TeamManagement.tsx", "utf8");

assert.match(page, /let teamAccess/, "the dashboard must prepare real Team Access data on the server");
assert.match(page, /teamAccess,/, "the dashboard must pass the Team Access snapshot to the client");
assert.match(shell, /teamAccess=\{data\.teamAccess\}/, "the dashboard shell must pass Team Access data to settings");
assert.match(settings, /initialData=\{teamAccess\}/, "settings must pass server Team Access data to the panel");
assert.match(team, /initialData\?: TeamAccessSnapshot/, "Team Access must accept server-loaded data");
assert.match(team, /const \[loading, setLoading\] = useState\(!initialData\)/, "server-loaded Team Access must render without a loading wait");
assert.match(team, /if \(initialData\) return;/, "Team Access must skip its initial browser fetch when server data is present");

console.log("team access initial-load checks passed");
