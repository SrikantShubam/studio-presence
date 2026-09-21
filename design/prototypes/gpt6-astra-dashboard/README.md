# Studio Presence — Astra Concept 03

A React/TypeScript App Router implementation of the supplied Concept 03 prototype. The starting screen is `src/components/dashboard/OverviewTab.tsx`.

## Components
- `OverviewTab.tsx`: hero actions, first-response notice, six metrics, accessible trend chart, and clickable city-demand bars.
- `EnquiryDesk.tsx`: search, status and city filters, empty states, CSV export, and enquiry contact actions.
- `CalculatorTab.tsx`: editable pricing and home multipliers, interactive quote simulation, and publishing.
- `WebsiteEditor.tsx`: section editing, desktop/phone previews, database-backed drafts, review, and publication.
- `DashboardShell.tsx`: responsive navigation, theme preference, shared enquiry state, and dialogs.

## Data and routes
The existing PostgreSQL connection uses `DATABASE_URL`. All database access is through Drizzle. Apply tables with `npx drizzle-kit push` after the environment is initialized. A transaction seeds the seven sample enquiries only on first workspace creation.

- `/`: studio dashboard
- `/site`: published website with working project enquiry form and published pricing
- `/card`: public contact card, linked by a real downloadable QR
- `/api/enquiries`: list/create enquiries
- `/api/enquiries/[id]`: update status/private notes
- `/api/workspace`: retrieve/update settings, pricing, draft, and publication
- `/api/health`: database health check

Server-side Zod validation covers all writes. CSV output guards formula injection. Native dialogs provide focus containment, Escape handling, and focus restoration. Fonts and the reference interior image are self-hosted.

## Scope and deployment
This is a functional **single shared sample workspace**, not an authenticated multi-tenant service. Before a private production deployment, add identity, workspace authorization to every read/write endpoint, request rate limits, a privacy policy, backups, and operational monitoring. The sample analytics are explicitly labeled and do not represent a connected tracking service. Email preferences persist, but email delivery is not configured. Displaying a custom domain does not configure its DNS.

`AGENTS.md` documents the strict square-corner, no-shadow, no-gradient design rules. The components use standard React 19 and App Router APIs compatible with Next.js 15; the supplied project's installed Next.js runtime is retained.

## Validation
Run `npx next typegen`, `npm exec tsc -- --noEmit --pretty false`, and `npm run build`, then use the managed preview health check. Environment setup must precede schema application.
