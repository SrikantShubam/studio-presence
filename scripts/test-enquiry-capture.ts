import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  contactPhone,
  isRecentlyUpdated,
  normalizeContactPhone,
  projectTypeOptions,
  projectTypeValue,
} from "../frontend/app/[tenant]/(admin)/dashboard/components/types.ts";

assert.equal(normalizeContactPhone("+44 20 7946 0958"), "442079460958");
assert.equal(contactPhone("+919939268791"), "919939268791");
assert.equal(contactPhone("++919939268791"), "919939268791");
assert.equal(projectTypeValue("Other", "Bespoke retail interior"), "Bespoke retail interior");
assert.equal(projectTypeValue("Other", ""), null);
assert.equal(projectTypeValue("Modular kitchen", "ignored"), "Modular kitchen");
assert.equal(
  isRecentlyUpdated(
    "2026-09-24T12:00:00.000Z",
    "2026-09-20T12:00:00.000Z",
    new Date("2026-09-25T12:00:00.000Z"),
  ),
  true,
);
assert.equal(
  isRecentlyUpdated(
    "2026-09-21T11:59:59.000Z",
    "2026-09-20T12:00:00.000Z",
    new Date("2026-09-25T12:00:00.000Z"),
  ),
  false,
);
assert.equal(
  isRecentlyUpdated(
    "2026-09-20T12:00:00.000Z",
    "2026-09-20T12:00:00.000Z",
    new Date("2026-09-25T12:00:00.000Z"),
  ),
  false,
);
assert.deepEqual(projectTypeOptions.at(-1), { value: "Other", label: "Other" });

const enquiryDialogs = readFileSync(
  "frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDialogs.tsx",
  "utf8",
);
const enquiryDesk = readFileSync(
  "frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDesk.tsx",
  "utf8",
);
const dashboardShell = readFileSync(
  "frontend/app/[tenant]/(admin)/dashboard/components/DashboardShell.tsx",
  "utf8",
);
const primitives = readFileSync(
  "frontend/app/[tenant]/(admin)/dashboard/components/primitives.tsx",
  "utf8",
);
const supportingTabs = readFileSync(
  "frontend/app/[tenant]/(admin)/dashboard/components/SupportingTabs.tsx",
  "utf8",
);
assert.match(enquiryDialogs, /InternationalPhoneInput/);
assert.match(enquiryDialogs, /Describe the project type/);
assert.match(enquiryDesk, /<StatusBadge status=\{item\.status\} \/>[\s\S]*Updated/);
assert.match(enquiryDesk, /aria-pressed=\{filters\.status === status\}[\s\S]*rounded-xl border px-3[\s\S]*bg-admin-primary-soft/);
assert.doesNotMatch(enquiryDesk, /border-b-2/);
assert.match(dashboardShell, /initialData\.mode !== "demo"\) setData\(initialData\)/);
for (const status of ["new", "contacted", "quoted", "won", "lost"]) {
  assert.match(primitives, new RegExp(`${status}: ".*admin-`));
}
assert.match(supportingTabs, /Workspace timezone[\s\S]*<Select[\s\S]*containerClassName="mt-1"/);
assert.doesNotMatch(enquiryDialogs, /Savingâ€¦|Â·|preferencesâ€¦/);
assert.doesNotMatch(enquiryDesk, /Â·/);

console.log("Enquiry capture tests passed.");
