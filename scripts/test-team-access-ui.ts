import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { dashboardMode } from "../frontend/app/[tenant]/(admin)/dashboard/components/types.ts";

const source = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/TeamManagement.tsx", "utf8");

assert.equal(dashboardMode(undefined, true), "live", "signed-in workspaces must load live membership data");
assert.equal(dashboardMode(undefined, false), "demo", "ineligible workspaces can remain in demo mode");
assert.match(source, /if \(mode === "demo" \|\| mode === "unavailable"\) return null/, "sample mode must not render Team Access");
assert.doesNotMatch(source, /Ashish Sharma|ashish@ashishinteriors\.com/, "Team Access must not contain a fake owner");

console.log("team access UI checks passed");
