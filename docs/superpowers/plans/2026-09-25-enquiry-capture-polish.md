# Enquiry Capture Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make lead capture and enquiry updates international, readable, immediately reflected in the UI, and visibly marked as recently updated.

**Architecture:** Keep the existing server action as the authorization and persistence boundary. Add generic phone normalization and project-type validation in the dashboard component helpers, use the existing international phone control for lead creation, and add a persisted `updated_at` column maintained by the database update RPC. The client merges the saved lead into local state immediately, while the badge derives its visibility from the timestamp and needs no scheduled cleanup.

**Tech Stack:** Next.js React client/server components, TypeScript, `react-international-phone`, Supabase Postgres migration/RPC, Node assertion scripts.

---

## File map

- Create `backend/supabase/migrations/0021_lead_updated_at.sql`: add and maintain the lead update timestamp.
- Modify `backend/src/db/types.ts`: expose nullable `updated_at` on `Lead` for existing fixtures and live rows.
- Modify `frontend/app/[tenant]/(admin)/dashboard/components/types.ts`: generic phone normalization, project options, project validation, and recent-update helper.
- Modify `frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDialogs.tsx`: international mobile input, project dropdown with editable `Other`, corrected UTF-8 strings, and immediate saved-value merge.
- Modify `frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDesk.tsx`: render the recent `Updated` badge and corrected UTF-8 strings.
- Modify `frontend/app/[tenant]/(admin)/dashboard/components/DashboardShell.tsx`: merge submitted notes/status and update timestamp into local state after save.
- Modify `frontend/app/[tenant]/(admin)/dashboard/page.tsx`: use generic phone validation and pass the saved lead fields through the server action.
- Create `scripts/test-enquiry-capture.ts`: focused helper and source-contract tests.
- Modify `package.json`: add `test:enquiry-capture`.
- Modify `backend/src/db/types.ts` and `frontend/app/[tenant]/(admin)/dashboard/components/demo-data.ts` only if TypeScript requires explicit fixture timestamps; keep demo timestamps optional where possible.

---

### Task 1: Add failing helper and source tests

**Files:**
- Create: `scripts/test-enquiry-capture.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing tests**

Add a Node assertion script importing the dashboard helpers and reading the enquiry components. It must assert:

```ts
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
assert.equal(isRecentlyUpdated("2026-09-24T12:00:00.000Z", "2026-09-20T12:00:00.000Z", new Date("2026-09-25T12:00:00.000Z")), true);
assert.equal(isRecentlyUpdated("2026-09-21T11:59:59.000Z", "2026-09-20T12:00:00.000Z", new Date("2026-09-25T12:00:00.000Z")), false);
assert.equal(isRecentlyUpdated("2026-09-20T12:00:00.000Z", "2026-09-20T12:00:00.000Z", new Date("2026-09-25T12:00:00.000Z")), false);
assert.deepEqual(projectTypeOptions.at(-1), { value: "Other", label: "Other" });

const enquiryDialogs = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDialogs.tsx", "utf8");
const enquiryDesk = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDesk.tsx", "utf8");
assert.match(enquiryDialogs, /InternationalPhoneInput/);
assert.match(enquiryDialogs, /Describe the project type/);
assert.match(enquiryDesk, /Updated/);
assert.doesNotMatch(enquiryDialogs, /Savingâ€¦|Â·|preferencesâ€¦/);
assert.doesNotMatch(enquiryDesk, /Â·/);

console.log("Enquiry capture tests passed.");
```

Add the script entry:

```json
"test:enquiry-capture": "node --env-file-if-exists=.env --import tsx scripts/test-enquiry-capture.ts"
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:enquiry-capture
```

Expected: FAIL because the generic helpers, project options, updated timestamp helper, international input, and updated badge do not exist yet.

- [ ] **Step 3: Commit the red test**

```bash
git add scripts/test-enquiry-capture.ts package.json
git commit -m "test: define enquiry capture polish behavior"
```

---

### Task 2: Add generic lead helpers and database timestamp contract

**Files:**
- Modify: `frontend/app/[tenant]/(admin)/dashboard/components/types.ts`
- Modify: `backend/src/db/types.ts`
- Create: `backend/supabase/migrations/0021_lead_updated_at.sql`

- [ ] **Step 1: Implement helper contracts**

In `types.ts`, replace the India-only normalization used by dashboard lead capture with:

```ts
export type ProjectTypeOption = { value: string; label: string };

export const projectTypeOptions: ProjectTypeOption[] = [
  { value: "Full home", label: "Full home" },
  { value: "Renovation", label: "Renovation" },
  { value: "Modular kitchen", label: "Modular kitchen" },
  { value: "Living & dining", label: "Living & dining" },
  { value: "Bedroom & storage", label: "Bedroom & storage" },
  { value: "Home office", label: "Home office" },
  { value: "Commercial", label: "Commercial" },
  { value: "Other", label: "Other" },
];

export function normalizeContactPhone(value: string): string | null {
  if (!/^[+\d\s().-]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, "");
  return /^\d{7,15}$/.test(digits) ? digits : null;
}

export function contactPhone(value: string): string | null {
  return normalizeContactPhone(value);
}

export function projectTypeValue(selection: string, custom: string): string | null {
  if (selection === "Other") {
    const value = custom.trim();
    return value ? value : null;
  }
  return selection.trim() || null;
}

export function isRecentlyUpdated(
  updatedAt: string | null | undefined,
  createdAt: string,
  now = new Date(),
): boolean {
  if (!updatedAt) return false;
  const updated = Date.parse(updatedAt);
  const created = Date.parse(createdAt);
  const age = now.getTime() - updated;
  return updated > created && age >= 0 && age <= 3 * 24 * 60 * 60 * 1000;
}
```

Keep `normalizeIndianPhone` as a compatibility alias only if existing callers or tests still import it, but route dashboard creation through `normalizeContactPhone`.

Add `updated_at?: string | null` to `Lead` so existing demo fixture objects remain valid.

- [ ] **Step 2: Write the migration**

Create `0021_lead_updated_at.sql`:

```sql
begin;

alter table public.leads
  add column if not exists updated_at timestamptz;

update public.leads
set updated_at = created_at
where updated_at is null;

alter table public.leads
  alter column updated_at set default now();

alter table public.leads
  alter column updated_at set not null;

create or replace function public.update_lead_work(
  p_lead_id uuid,
  p_status public.lead_status,
  p_notes text
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_role text;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then raise exception 'lead not found' using errcode = 'no_data_found'; end if;

  v_role := public.current_tenant_role(v_lead.tenant_id);
  if v_role is null then
    raise exception 'you cannot update this lead' using errcode = '42501';
  end if;
  if v_role = 'editor' and (v_lead.assigned_to is null or v_lead.assigned_to <> auth.uid()) then
    raise exception 'editors can update only enquiries assigned to them' using errcode = '42501';
  end if;
  if v_role not in ('owner', 'editor', 'viewer') then
    raise exception 'you cannot update this lead' using errcode = '42501';
  end if;

  update public.leads
  set status = p_status,
      notes = nullif(trim(p_notes), ''),
      updated_at = now()
  where id = p_lead_id
  returning * into v_lead;

  return v_lead;
end;
$$;

commit;
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
npm run test:enquiry-capture
```

Expected: PASS for helper behavior, with source assertions still failing until the UI changes are complete.

- [ ] **Step 4: Commit the data contract**

```bash
git add frontend/app/[tenant]/(admin)/dashboard/components/types.ts backend/src/db/types.ts backend/supabase/migrations/0021_lead_updated_at.sql
 git commit -m "feat: track lead update timestamps"
```

The migration must be applied to Supabase by the Supabase-capable agent before live verification. Do not put service-role credentials in Next.js or browser code.

---

### Task 3: Update lead creation UI and server validation

**Files:**
- Modify: `frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDialogs.tsx`
- Modify: `frontend/app/[tenant]/(admin)/dashboard/page.tsx`

- [ ] **Step 1: Add international phone and project state**

In `EnquiryDialogs.tsx`, import `PhoneInput` as `InternationalPhoneInput` from `react-international-phone`, reuse the existing phone field class pattern from `SupportingTabs.tsx`, and add `projectTypeOther` state alongside `values`.

Render the phone field with:

```tsx
<Field label="Mobile number" hint="Choose a country, then enter the mobile number.">
  <div className={phoneFieldClass}>
    <InternationalPhoneInput
      defaultCountry="in"
      forceDialCode
      required
      value={values.phone}
      onChange={(value) => setValues({ ...values, phone: value })}
    />
  </div>
</Field>
```

Render the project field as a select from `projectTypeOptions`. When its value is `Other`, render:

```tsx
<Field label="Describe the project type">
  <input
    className={inputClass}
    required
    maxLength={160}
    value={projectTypeOther}
    onChange={(event) => setProjectTypeOther(event.target.value)}
  />
</Field>
```

Use `projectTypeValue(values.projectType, projectTypeOther)` before submission. Reject `Other` without a description.

- [ ] **Step 2: Remove India-only validation**

Submit `normalizeContactPhone(values.phone)` and pass the normalized `+${phone}` to the existing action. Change the error to `Enter a valid international mobile number.`.

In `dashboard/page.tsx`, import `normalizeContactPhone` and validate the create action with it. Keep the stored value as `+${phone}` so existing database records and contact links remain compatible.

- [ ] **Step 3: Run source and type checks**

Run:

```bash
npm run test:enquiry-capture
npm run typecheck
```

Expected: the phone/project source assertions pass, and TypeScript reports no errors.

- [ ] **Step 4: Commit the creation UI**

```bash
git add frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDialogs.tsx frontend/app/[tenant]/(admin)/dashboard/page.tsx
 git commit -m "feat: improve enquiry mobile and project fields"
```

---

### Task 4: Fix immediate updates and recent-update badge

**Files:**
- Modify: `frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDialogs.tsx`
- Modify: `frontend/app/[tenant]/(admin)/dashboard/components/DashboardShell.tsx`
- Modify: `frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDesk.tsx`

- [ ] **Step 1: Merge submitted values after save**

In `EnquiryDetails.submit`, after the update action succeeds, create a merged row before assignment:

```ts
let saved = {
  ...result.data,
  status,
  notes: notes.trim() || null,
  updated_at: result.data.updated_at ?? new Date().toISOString(),
};
```

If assignment follows, merge assignment data while preserving the saved status, notes, and timestamp. Call `onUpdated(saved)` once.

In `DashboardShell.tsx`, update the matching enquiry with the returned row and use a functional state update. The existing map structure is correct; preserve the returned `updated_at` field.

- [ ] **Step 2: Fix phone rendering**

In the details footer, render `contactPhone(enquiry.phone)` directly instead of prepending `+`. Keep `tel:+` and `wa.me/` links based on the normalized digit string.

- [ ] **Step 3: Add the badge**

Import `isRecentlyUpdated` and render a small badge next to the client name when it returns true:

```tsx
{isRecentlyUpdated(item.updated_at, item.created_at) && (
  <span className="ml-2 inline-flex items-center border border-admin-success px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-admin-success">
    Updated
  </span>
)}
```

Do not use a timer. The badge naturally disappears after three days when the component renders again.

- [ ] **Step 4: Replace mojibake**

Replace corrupted literals in the touched enquiry components:

- `Savingâ€¦` → `Saving…`
- `preferencesâ€¦` → `preferences…`
- `Â·` → `·`

Search the touched files for `â`, `Â`, and `Ã`; no results should remain.

- [ ] **Step 5: Run focused verification**

Run:

```bash
npm run test:enquiry-capture
npm run typecheck
npm run lint
npm run check:hardcode
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the update UX**

```bash
git add frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDialogs.tsx frontend/app/[tenant]/(admin)/dashboard/components/DashboardShell.tsx frontend/app/[tenant]/(admin)/dashboard/components/EnquiryDesk.tsx
 git commit -m "fix: update enquiries without refresh"
```

---

### Task 5: Apply and verify the database migration

**Files:**
- Apply: `backend/supabase/migrations/0021_lead_updated_at.sql`
- Test: `scripts/test-authorization.ts`

- [ ] **Step 1: Apply the migration through the approved Supabase workflow**

Use the Supabase-capable agent or authenticated Supabase MCP. Do not paste secrets into chat. Confirm the migration applies once and that `public.leads.updated_at` is non-null for existing rows.

- [ ] **Step 2: Verify the RPC response**

With a test owner or viewer session, update notes/status through `update_lead_work` and verify the returned row contains:

```text
notes = submitted notes
status = submitted status
updated_at > created_at
```

Verify an editor still cannot update an unassigned lead and a viewer can update status and notes according to the existing authorization matrix.

- [ ] **Step 3: Run authorization tests**

Run:

```bash
npm run test:authorization
npm run test:rls
```

Expected: PASS without changes to existing role permissions.

- [ ] **Step 4: Commit any test-only assertion changes**

```bash
git status --short
git diff --check
```

Do not commit generated artifacts or unrelated working-tree changes.

---

### Task 6: Final verification

**Files:**
- Test: `scripts/test-enquiry-capture.ts`
- Test: existing project checks

- [ ] **Step 1: Run the focused and required checks**

```bash
npm run test:enquiry-capture
npm run typecheck
npm run lint
npm run check:hardcode
npm run check:tenant-isolation
npm run test:authorization
```

- [ ] **Step 2: Run the complete check suite**

```bash
npm run check:all
```

Expected: all checks pass except the already documented pre-existing `check:tiers` failure, if it remains present in `clients/ashish-interiors.json`.

- [ ] **Step 3: Perform the manual acceptance pass**

At 375px and desktop widths:

1. Open the live enquiry dialog.
2. Choose a non-India country and enter an international mobile number.
3. Choose a standard project type and save the lead.
4. Choose `Other`, enter custom project text, and save another lead.
5. Open a lead, change private notes and status, and save.
6. Confirm the table updates without refreshing.
7. Confirm the phone displays one `+`, not `++`.
8. Confirm the `Updated` badge appears after a saved change and is absent on a newly created lead.

- [ ] **Step 4: Review the final diff**

```bash
git diff HEAD~5..HEAD --stat
git status --short
```

Confirm no secrets, raw customer data, or unrelated files are included.
