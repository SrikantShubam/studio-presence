import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("frontend/app/api/[tenant]/members/route.ts", "utf8");
const getRoute = route.slice(route.indexOf("export async function GET"), route.indexOf("export async function POST"));
const component = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/TeamManagement.tsx", "utf8");

assert.match(
  route,
  /Promise\.all\(\[\s*supabase\.auth\.getUser\(\),\s*supabase\.auth\.getSession\(\)/,
  "Team Access must start user verification and session retrieval together",
);
assert.doesNotMatch(getRoute, /current_tenant_role/, "Team Access must derive the current role from the member read");
assert.match(component, /className="grid gap-3 px-4 pb-4 pt-2"/, "Team Access must use the compact panel body spacing");
assert.match(component, /<Panel[\s\S]*className="mb-5"/, "Team Access must have bottom margin");
assert.match(component, /border-t border-admin-border py-2/, "Team Access member rows must use compact vertical spacing");

console.log("team access performance checks passed");
