# Astra Concept 03 — Studio Presence

## Visual invariants
- Preserve the supplied Concept 03 dashboard proportions and hierarchy.
- Inter is the base font at 13px. Use JetBrains Mono for metric values, currency, budgets, and square-foot values.
- Use Shadcn Zinc semantic tokens through `hsl(var(--*))`; define all theme colors in `src/app/globals.css`.
- Square corners everywhere. No drop shadows. No CSS or SVG gradients.
- Do not introduce map silhouettes, heat maps, blobs, or decorative illustrations in the overview.
- City demand is the accessible, clickable progress-bar list headed “Where your next project begins”. Clicking a city filters the enquiry desk.
- Keep the overview, enquiry desk, calculator, and website editor in their named modular components.

## Engineering
- React and TypeScript with Next.js App Router. No direct DOM HTML injection.
- Drizzle is the only database access layer. Validate all API writes on the server.
- Preserve loading, error, empty, keyboard, mobile, and reduced-motion states.
- Metrics labeled as samples must not be represented as live analytics.
- The public website uses the published snapshot, not an unsaved editor draft.
- This is a single shared sample workspace; add authentication and per-workspace authorization before a multi-tenant deployment.
- Run route type generation, TypeScript, production build, and managed health validation after changes.
