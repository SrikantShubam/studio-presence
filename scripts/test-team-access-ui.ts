import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { dashboardMode, sampleDataToggleHref } from "../frontend/app/[tenant]/(admin)/dashboard/components/types.ts";
import { countryOptionLabel } from "../frontend/lib/onboarding/countries.tsx";

const source = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/TeamManagement.tsx", "utf8");
const supportingTabs = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/SupportingTabs.tsx", "utf8");
const frontendPackage = readFileSync("frontend/package.json", "utf8");

assert.equal(dashboardMode(undefined, true), "demo", "signed-in workspaces must preserve sample dashboard data");
assert.equal(dashboardMode(undefined, false), "demo", "ineligible workspaces can remain in demo mode");
assert.equal(
  sampleDataToggleHref("/ashish-interiors/dashboard", "demo=1&tab=settings", "demo"),
  "/ashish-interiors/dashboard?demo=0&tab=settings",
  "sample data off must preserve the active tab",
);
assert.equal(
  sampleDataToggleHref("/ashish-interiors/dashboard", "demo=0&tab=calculator", "live"),
  "/ashish-interiors/dashboard?demo=1&tab=calculator",
  "sample data on must preserve the active tab",
);
assert.equal(
  countryOptionLabel("Afghanistan", "+93"),
  "+93 Afghanistan",
  "country options must show the calling code before the country name",
);
assert.match(frontendPackage, /"react-international-phone"/, "the replacement phone package must be installed");
assert.match(supportingTabs, /<InternationalPhoneInput/, "dashboard phone fields must use the replacement package");
assert.match(supportingTabs, /LEGACY COUNTRY SELECTOR/, "the previous selector must remain available for rollback");
assert.match(source, /createSupabaseBrowserClient\(\)\.auth\.getUser\(\)/, "Team Access must read the authenticated profile");
assert.match(source, /user_id: user\.id/, "Team Access must use the authenticated user's ID");
assert.match(source, /display_name: displayName/, "Team Access must display the authenticated user's name");
assert.match(source, /member\.role === "owner" \? <Badge>Owner<\/Badge>/, "Owner badge must share the member role badge position");
assert.match(source, /member\.avatar_url/, "Team Access must render member avatars when available");
assert.match(source, /if \(mode === "unavailable"\)/, "Team Access must remain available in both sample and live modes");
assert.match(source, /await showCurrentProfile\(\);\s+return;/, "Team Access must fall back to the authenticated profile");
assert.doesNotMatch(source, /Ashish Sharma|ashish@ashishinteriors\.com/, "Team Access must not contain a fake owner");

console.log("team access UI checks passed");
