# Demo-First Admin Platform Design

Date: 2026-08-21
Status: Approved defaults, pending implementation plan

## Purpose

Studio Presence is a demo-led vertical sales platform for Indian interior design studios. The demo is the pitch. Prospects should experience a credible version of their own site before paying, while Studio Presence keeps publishing, ownership, domain launch, and saved editing under operator control until activation.

This design separates four concepts that must not collapse into one another:

- A prospect demo is a temporary sales asset.
- A local demo draft is a browser-only preview patch.
- A tenant is a commercial account.
- Tenant membership is operator-controlled authorization.

## Business Model

The platform should support high-volume demo generation without creating high-volume support load. A prospect may receive a seven-day demo before being deeply qualified. That is intentional. Qualification happens through behavior: opening the demo, using the editor, asking for changes, requesting activation, or discussing price.

The offer is not a generic website builder. The offer is a credible, conversion-ready studio website delivered quickly, with content the studio can later update and structure controlled by Studio Presence.

Default packages:

- T1 Presence: the default demo and core paid product.
- T2 Presence Plus: used when the prospect has enough content and reason for richer pages/features.
- T3 Growth: from Rs 45,000, priced through deterministic add-ons and founder approval.

The demo should not quietly show a T3 experience and then sell T1 unless higher-tier features are visibly locked or labelled as add-ons.

## State Model

The existing `demo`, `sold`, `live`, and `archived` statuses remain commercial/rendering gates:

- `demo`: subdomain available, watermark on, noindex on, no custom domain.
- `sold`: payment/activation underway, watermark on, noindex on, no custom domain.
- `live`: custom domain allowed, watermark off, indexing allowed.
- `archived`: site unavailable or retired.

These statuses are not enough for daily operations. Add a separate workflow state for the sales/demo lifecycle:

- `generated`
- `review_failed`
- `review_passed`
- `sent`
- `opened`
- `editor_opened`
- `edited_locally`
- `activation_requested`
- `expired`
- `payment_confirmed`
- `activated`
- `domain_live`
- `lost`
- `removed`

The workflow state drives super-admin queues. The commercial status drives rendering and payment gates.

## Demo Lifecycle

The seven-day demo period starts when the demo is sent to the prospect, not when generated. Generated demos should have a hard cap, defaulting to fourteen days, so unsent demos do not accumulate forever.

Demo URL behavior:

- Unlisted randomized subdomain or slug.
- `noindex` and `nofollow`.
- Visible watermark or preview state.
- Exact expiry date/time visible.
- Correction/removal path available without login.

On expiry:

- Public demo content should stop serving or show a neutral expired state.
- Editing is locked.
- Activation/contact CTA remains available.
- Super-admin may extend once.

## Demo Integrity

The demo must use accurate business details. Wrong data damages trust.

Allowed sources:

- Prospect-provided facts.
- Public business profile facts.
- Public Instagram/website facts where provenance is recorded.
- Operator-entered corrections.

Each imported fact or asset should track source URL or source label, retrieval date, confidence, and verification status.

Never infer:

- Testimonials.
- Awards.
- Credentials.
- Project counts.
- Client names.
- Budgets.
- Business history.
- Guarantees or legal claims.

If proof content is missing, omit it or mark it unmistakably as sample content in demo mode.

## Demo Editor

The demo editor is a conversion mechanic, not a free website builder. It lets the prospect make the preview feel like theirs while keeping publishing locked behind activation.

Demo editor copy should be honest and low-friction:

> This is a private 7-day preview. You can change the text and images to see how your site could look. Your edits are saved only in this browser and are not published or uploaded. Paid activation saves the approved version and puts it on your domain.

Use labels such as:

- Preview changes.
- Applied to this preview.
- Saved on this device.
- Not published yet.
- Keep this version.
- Activate from Rs 15,000.

Avoid labels such as:

- Save to website.
- Publish changes.
- Go live.

Those labels are reserved for paid activated accounts.

## Editable Fields

The demo editor and paid panel share the same content allowlist:

- Contact details: phone, WhatsApp, email, address, working hours.
- Hero copy and hero image.
- Services: title, one-line description, optional price hint.
- Projects: title, location, room type, photos, description, optional quote.
- About text.
- Testimonials, only when real/prospect-provided.
- Instagram post links.

Not editable in demo or paid client panel:

- Tier.
- Template.
- Palette.
- Fonts.
- Layout.
- Section order.
- Navigation structure.
- SEO gates.
- Domain settings.
- Analytics.
- Integration configuration.
- Admin access.

Content is theirs. Structure is ours.

## Local Draft Engine

Demo edits are stored only in the browser, preferably as versioned patches in IndexedDB. The generated demo baseline is immutable.

Draft behavior:

- Patch is pinned to a base revision.
- Draft can survive refresh on the same browser/device.
- Draft may disappear if browser storage is cleared, incognito mode is used, or the user changes device.
- UI must say this plainly.
- Support per-field reset and full reset.
- Provide export/import if cross-device continuity becomes necessary.

If the base demo changes while a local draft exists, show a conflict review instead of silently merging.

## Activation Handoff

Activation is the boundary where browser-local intent becomes server-side customer state.

Activation flow:

1. Prospect clicks Keep this version or Activate.
2. WhatsApp/payment/founder handoff starts.
3. Operator confirms payment or approved activation.
4. Prospect authenticates through Supabase magic link.
5. Browser uploads the local patch after authentication.
6. Server validates every field against the allowlist.
7. Media is scanned, normalized, and processed.
8. Valid patch becomes a paid draft.
9. Operator or owner reviews.
10. Publish explicitly applies the draft to `client_overrides`.

Never trust a client-side paid flag. Only an operator-recorded server-side payment event unlocks persistence.

## Paid Publishing

Paid clients get real persistence, but saving and publishing should still be distinct.

Recommended paid model:

- Save creates a paid draft.
- Publish is explicit.
- Publishing records actor, revision, and timestamp.
- Revalidation runs after publish.
- Owner and operator can restore a previous published version.

This protects live sites from accidental or low-quality edits while still giving clients control over content.

## Super Admin

Super Admin is the operating console for the business.

Core queues:

- Demo generation queue.
- Review queue.
- Sent demos.
- Expiring demos.
- Activation requests.
- Paid drafts awaiting review.
- Domain launch queue.
- Access incidents.

Core actions:

- Review generated demo.
- Approve/send demo.
- Extend demo once.
- Expire demo.
- Remove/correct demo.
- Mark activation requested.
- Confirm payment.
- Promote demo to tenant.
- Grant owner access.
- Revoke owner access.
- Transfer ownership.
- Import validated local draft.
- Publish paid draft.
- Roll back live content.
- Attach domain after launch checklist.
- Archive tenant.

The review page should show the public demo preview beside the data/provenance checklist.

Review checklist:

- Business identity verified.
- Contact details verified.
- Images load and have acceptable provenance.
- No fabricated credibility signals.
- No broken routes.
- Mobile rendering acceptable.
- Watermark present.
- `noindex` active.
- Expiry set.
- WhatsApp/call behavior correct for demo mode.

Target operator review time: five minutes or less per demo. If review routinely exceeds this, the demo-generation pipeline is not scalable.

## Identity And Access

Prospects do not receive real tenant membership merely because they saw a demo.

Rules:

- Super-admin controls grant, revoke, and transfer.
- MVP supports one primary owner per tenant.
- No self-claiming.
- No silent tenant selection for emails belonging to multiple studios.
- Multi-tenant owner picker is deferred until real demand exists.
- Revoke removes membership and invalidates active sessions where possible.
- Sensitive requests re-check current membership server-side.

Operator accounts need stronger protection than client accounts. Client accounts can use magic links initially; operator access must be auditable and should support stricter controls.

## Demo Interactions

Demo mode should avoid side effects.

Default behavior:

- Lead forms disabled or labelled as preview.
- File uploads local-only unless explicitly consented.
- WhatsApp/call links may work only when the contact number is verified.
- Analytics should track coarse consent-safe events, not draft content.

Track:

- Demo generated.
- Review passed.
- Sent.
- Opened.
- Editor opened.
- First local edit.
- Activation clicked.
- Payment confirmed.
- Draft imported.
- Published.
- Domain live.
- Expired.
- Removed.

Do not collect the prospect's edited content by default before activation.

## Domain Launch

Custom-domain launch is an atomic gate. It requires:

- Payment confirmed.
- Owner granted.
- Content approved.
- Domain verified.
- SSL healthy.
- Forms tested.
- WhatsApp/call tested.
- Watermark removal ready.
- `noindex` removal ready.
- Final operator launch approval.

No custom domain attaches before `status: "live"`.

## Retention And Abuse Controls

The system needs guardrails before high-volume generation:

- Deduplicate by business name, phone, domain, Instagram handle, and city.
- Cap image counts and compress assets.
- Expire unused demos automatically.
- Remove public demo content at expiry.
- Retain only minimal operational metadata under a documented retention policy.
- Provide correction/removal actions.
- Quota generation by operator/seller/source.
- Audit every grant, revoke, transfer, publish, rollback, domain launch, and archive.

Legal review is needed before finalizing retention windows and public-source asset usage rules.

## Go Criteria

Move from spec to implementation only when these are accepted:

- Device-only draft limitation.
- Exact paid draft-import flow.
- Shared field allowlist for demo editor, paid panel, and server validation.
- Provenance policy and forbidden-claim list.
- Ownership matrix for grant, revoke, transfer, session invalidation, and audit.
- T1/T2/T3 entitlement and pricing rules.
- Demo interaction behavior for forms, WhatsApp, uploads, analytics, and expiry.
- Domain-launch checklist.
- Cost, review-time, conversion, and retention targets.

## Pilot Criteria

Before scaling toward 100 demos/day, run a measured pilot of 25-50 demos.

Track:

- Variable cost per demo.
- Operator review minutes.
- Demo open rate.
- Editor open rate.
- First-edit rate.
- Activation CTA rate.
- Paid activation rate.
- Time to payment.
- Support/confusion messages.
- Refund or removal requests.

Stop or revise if:

- Operator review exceeds five minutes per demo.
- Prospects frequently believe local edits were published.
- Demo data inaccuracies become a common objection.
- Activation import causes rework.
- T1 delivery exceeds its founder/operator time budget.

Proceed to scale only when paid conversion and contribution margin remain positive after operator and founder time.
