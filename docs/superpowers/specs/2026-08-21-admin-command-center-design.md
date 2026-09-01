# Admin Command Center Design

## Goal

Give a studio operator one calm starting point for daily work: see what needs attention, open the relevant workspace quickly, and understand whether the tenant website is ready without fabricated performance data.

## Product stance

- The dashboard is an operating workspace, not a reporting landing page.
- Zero is a valid state. Empty data is explained, not replaced with invented figures.
- Content, leads, analytics, and access are separate jobs, but share one persistent shell.
- Navigation changes the active workspace in place. It does not send the user through a chain of splash pages.
- Demo or seeded data is labelled at the point of use.
- Platform branding remains `Studio Presence by Vector Veda`; tenant branding belongs to the public website.

## Primary shell

- Persistent left navigation: Today, Leads, Content, Analytics, Access.
- Compact top bar: tenant identifier, environment/status, theme, account menu.
- Main area has one page title, one clear next action, and a small number of supporting blocks.
- Mobile collapses the left navigation into a compact top navigation while preserving the same view model.
- The first implementation pass is dark-first: graphite page and surface tones, high-contrast text, and one restrained green action colour. A light theme can follow after the dark workflow is accepted.
- A narrow activity/status column is allowed when it reports recorded tenant state. It must not become a decorative feed or a source of invented metrics.

## Views

### Today

Shows the next operational action, lead response state, website readiness, and access state. It should answer: what should I do now?

### Leads

Shows the enquiry queue, filter controls, contact actions, and a useful empty state. It should never imply demand where there is no demand.

### Content

Shows the editable website areas and publication state. It distinguishes local demo edits from globally published customer edits.

### Analytics

Shows only available signals. When there is no connected data, it explains what will become available after traffic arrives rather than rendering theatrical charts.

### Access

Shows tenant membership, pending invitations/grants, operator controls, and the difference between authenticated and authorized users.

## Prototype interaction

The HTML prototype uses local view switching so the transition is immediate. It includes realistic empty states and a small controlled interaction for opening a lead detail drawer. This is a design test, not a data or auth implementation.

## Acceptance criteria for the prototype

- A user can reach every primary workspace from the shell.
- The active workspace is always obvious.
- No view uses fake metrics as its main proof of value.
- Empty states state the next useful action.
- The layout remains usable at narrow widths without horizontal scrolling.
- The prototype can be opened as a local HTML file without a build step.

## Implementation boundary

Do not convert this into React, connect Supabase, or change the current dashboard routes until the HTML direction is reviewed and approved. After approval, implement the shell and view model first, then wire each view to existing tenant-safe data paths.
