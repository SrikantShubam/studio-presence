# Enquiry capture polish design

## Goal

Make the live enquiry workflow reliable and clear when an owner logs or updates a lead.

## Scope

- Remove mojibake from the enquiry UI.
- Reuse the international phone input used by Workspace settings for client mobile numbers.
- Accept international numbers without India-only validation.
- Prevent duplicate `+` characters in displayed phone numbers and contact links.
- Replace project-type free text with a dropdown.
- Keep an editable text field available when `Other` is selected.
- Update private notes and status in the enquiry list immediately after saving.
- Show an `Updated` badge for three days after a lead status or notes change.

## Design

### Mobile number

Use `react-international-phone` with the same styling and country selector as Workspace settings. Label the field `Mobile number`. Store the component's normalized international value. Validation accepts a `+`-prefixed or formatted number whose digit count is within the general international range, rather than enforcing an Indian prefix or 10-digit national number.

The display and contact-link helpers normalize leading punctuation once. Call, WhatsApp, detail, and CSV output must not add a second `+`.

### Project type

Render a select with these options:

- Full home
- Renovation
- Modular kitchen
- Living & dining
- Bedroom & storage
- Home office
- Commercial
- Other

When `Other` is selected, render a text input labelled `Describe the project type`. Save that text as the lead's `project_type`. The dropdown selection itself is not saved as an additional field.

### Immediate updates

The server action remains the authorization and persistence boundary. After a successful update, the client replaces the matching enquiry with the returned row and explicitly preserves the submitted status and notes if the returned row omits either value. This keeps the table, search index, and open-dialog state synchronized without a browser refresh.

### Updated badge

Add nullable `updated_at` to the lead database shape. Existing rows receive `created_at` as their initial value. The update RPC sets `updated_at = now()` whenever status or notes are saved. New rows default `updated_at` to `created_at`.

The enquiry table shows a small `Updated` badge when:

- `updated_at` is later than `created_at`, and
- `updated_at` is no more than three days old.

The badge disappears automatically after three days. No scheduled job is required.

### Mojibake

Replace corrupted source literals in the enquiry components, including the save labels, separators, and ellipsis placeholders, with valid UTF-8 text. Add a focused source check so these known corruption sequences do not return in the enquiry UI.

## Error handling

- Reject malformed or clearly too-short/too-long mobile numbers with a generic international-number message.
- Require a project-type description when `Other` is selected.
- Keep existing authorization rules for status, notes, assignment, and lead creation.
- If persistence fails, keep the dialog open and do not update the list optimistically.
- If the update succeeds but the response is incomplete, merge the submitted status and notes into the returned row before updating local state.

## Verification

- Unit tests cover international phone normalization, duplicate-plus prevention, project-type `Other` validation, and the three-day updated-badge window.
- UI/source tests cover the international input, project dropdown, conditional `Other` text field, UTF-8 labels, and updated badge.
- Run the focused dashboard tests, typecheck, lint, hardcode check, and the existing authorization tests.
- Verify the workflow manually at 375px and desktop widths:
  - log a lead with an international number;
  - choose a standard project type;
  - choose `Other` and enter custom text;
  - save notes and status;
  - confirm the table updates without refresh;
  - confirm the `Updated` badge appears and does not show on a newly created lead.
