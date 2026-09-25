# Studio Presence role and permission research

Date: 2026-09-25  
Scope: small multi-tenant SaaS for Indian interior-design studios; customer workspace roles only

## Bottom line

Three customer-facing roles are sufficient for the current product:

1. **Studio owner** — owns the workspace and has full authority.
2. **Website & content manager** — maintains website and editorial content, including publishing.
3. **Lead coordinator** — follows up enquiries and maintains private lead-work notes and status.

Keep the internal role keys `owner`, `editor`, and `viewer` for compatibility if useful, but do not
show **Viewer** as the product label. A person who can change lead status and write notes is not
read-only. **Lead coordinator** describes the job more accurately.

The role should not be the whole authorization model. Model four separate questions:

- **Visibility:** which tenant data can the member see?
- **Action:** can they view, create, edit, publish, assign, export, archive, or delete it?
- **Relationship:** can they act on all records, only assigned records, or only their own records?
- **Workspace authority:** can they manage members, billing, integrations, domains, or security?

This matches Pipedrive's explicit separation between visibility groups and permission sets, including
different permissions for creating, editing, deleting, importing/exporting, and reporting. It also
matches Webflow's separation of workspace roles from site roles. ([Pipedrive permissions and
visibility](https://support.pipedrive.com/en/article/visibility-and-permissions-overview),
[Webflow workspace roles](https://help.webflow.com/hc/en-us/articles/41015530193811-Workspace-roles-and-permissions))

## Recommended role model

| Product label | Primary job | Recommended default authority |
| --- | --- | --- |
| **Studio owner** | Owns the studio workspace and makes high-impact decisions | Full tenant access; members, billing, integrations, publishing, assignment, export, archive/delete, and live activation |
| **Website & content manager** | Keeps the public website and blog accurate and current | View/edit/publish website and blog content; upload media; manage allowed SEO/content fields; no billing, member administration, tenant deletion, or lead reassignment |
| **Lead coordinator** | Contacts prospects and keeps the enquiry pipeline current | View all visible leads; add/read private studio notes; change lead status; no website/content editing, calculator or digital-card settings, integrations, assignment, export, or deletion |

The second role should be called **Website & content manager**, not simply Editor. “Editor” is
ambiguous: WordPress uses it for a role that can publish and manage other authors' posts, while
HubSpot separates content **view**, **edit**, and **publish** permissions. ([WordPress roles and
capabilities](https://wordpress.org/documentation/article/roles-and-capabilities/), [HubSpot user
permissions](https://knowledge.hubspot.com/user-management/hubspot-user-permissions-guide))

The third role should be called **Lead coordinator** or **Lead follow-up** in the UI. It is an
operational role, not a passive viewer. The internal `viewer` key can remain temporarily to avoid a
data migration, but its capabilities must not be read-only.

## Permission matrix

| Permission category | Studio owner | Website & content manager | Lead coordinator |
| --- | --- | --- | --- |
| Overview and traffic analytics | View | View | View |
| Leads: view | All tenant leads | All tenant leads, if needed for context | All visible tenant leads |
| Leads: create from dashboard | Yes, if this remains a product feature | No by default | No |
| Leads: status and private notes | All leads | Assigned-only only if the workflow requires it; otherwise view-only | All visible leads |
| Leads: assignment/reassignment | Yes | No | No |
| Leads: archive/delete | Yes, with confirmation | No | No |
| Website content | View/edit/publish | View/edit/publish | View-only or hidden behind disabled navigation |
| Blog/editorial content | View/edit/publish | View/edit/publish | View-only or disabled |
| Media uploads | Yes | Yes, limited to website assets | No |
| Estimate calculator content/settings | Yes | Only if explicitly classified as public content; otherwise owner-only | No |
| Digital card / QR content | Yes | Only if explicitly classified as public content; otherwise owner-only | No |
| Integrations, tracking, webhooks, API keys | Manage | View status only | No |
| Members and invitations | Manage | No | No |
| Billing, plan, invoices, payment method | Manage | No | No |
| Exports and bulk downloads | Yes | No by default | No |
| Tenant deletion and destructive actions | Yes, preferably with re-authentication | No | No |
| Audit/activity history | View all | View relevant content activity | View lead activity relevant to their work |

The exact editor lead rule still needs one product decision. The safest default is: the content
manager can see leads for context but cannot edit them unless a lead is assigned to that person;
the owner alone assigns and reassigns. Pipedrive and HubSpot both demonstrate this useful split
between broad visibility and narrower ownership/editing scope. ([Pipedrive ownership and
visibility](https://support.pipedrive.com/en/article/visibility-and-permissions-overview),
[HubSpot record access](https://knowledge.hubspot.com/records/assign-access-to-records))

## Categories that must not be omitted

- **Publish versus edit:** editing a draft is not the same as publishing live website or blog
  content. Webflow's content editor can edit content, while publishing can be separately enabled;
  HubSpot also exposes blog edit and publish separately. ([Webflow content editor](https://help.webflow.com/hc/en-us/articles/33961251014931-Edit-site-content-as-a-content-editor),
  [HubSpot blog permissions](https://knowledge.hubspot.com/user-management/hubspot-user-permissions-guide))
- **Assignment and ownership:** a user may view every lead but edit only assigned leads. Do not
  infer assignment authority from edit authority.
- **Private notes:** keep internal studio notes distinct from visitor-facing website copy and from
  any future customer-visible communication log. Define who can read, create, edit, and delete
  them; the lead coordinator should not be able to erase the audit trail.
- **Exports:** CSV/download/export is a separate data-exfiltration permission, not a side effect of
  viewing analytics or leads. Pipedrive lists import/export separately from ordinary item actions.
- **Deletes and archives:** use separate archive/delete permissions and owner-only destructive
  actions. The UI should use confirmation and, for tenant-wide actions, re-authentication.
- **Members and billing:** invitation, role changes, removal, payment methods, plan changes, and
  invoice access belong to the owner. Webflow explicitly separates these workspace permissions
  from site/content roles. ([Webflow workspace permissions](https://help.webflow.com/hc/en-us/articles/41015530193811-Workspace-roles-and-permissions))
- **Integrations and secrets:** connecting WhatsApp, analytics, email, webhooks, domains, or API
  keys should be owner-only unless a future narrowly scoped integration manager is justified.
- **Analytics:** viewing dashboards can be granted broadly; changing tracking IDs, connected
  analytics accounts, retention, or exports should not be bundled with view access.
- **Auditability:** record role changes, invitations/removals, exports, assignments, publishing,
  integration changes, and destructive actions. OWASP recommends enforcing authorization on every
  request and logging authorization events.

## Security and implementation implications

Use least privilege and deny-by-default. OWASP specifically recommends deciding authorization
before implementation, enforcing it on every request, denying access unless explicitly granted,
and testing function-, data-, and field-level rules. ([OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html),
[OWASP access-control checklist](https://devguide.owasp.org/en/04-design/02-web-app-checklist/07-access-controls/))

For this Supabase-backed multi-tenant app, the membership row and tenant scope should be the source
of authorization truth. Enforce the same matrix in server actions/API routes and Postgres RLS; a
disabled button is only usability, not security. Supabase documents `auth.uid()` for identity and
warns that user-editable `user_metadata` is not safe authorization data; authorization data belongs
in server-controlled membership/app metadata. ([Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security))

Do not add a customer-facing “Admin” role merely because other SaaS products use that label. Keep
platform support/operator access outside the studio's tenant roles, with separate audited operator
authorization. Add finer-grained custom permissions only when a real workflow requires them; start
with explicit capability names such as `leads.status.update`, `leads.notes.write`,
`leads.assign`, `content.publish`, `members.manage`, `billing.manage`, `integrations.manage`,
`data.export`, and `tenant.delete`.

## Recommended product decision

Proceed with three roles, but present them as job-based roles:

- Studio owner: everything.
- Website & content manager: website/blog/media/content publishing, no workspace administration.
- Lead coordinator: lead follow-up only, including private notes and status changes, no assignment.

Keep analytics read access available to all three unless a studio owner explicitly restricts it.
Keep Website, Calculator, Digital Card, Settings, and Integrations visible but disabled for the
lead coordinator, with a short explanation of which role can unlock each area. The final capability
matrix should be the source of truth for both the UI and server/RLS tests.

