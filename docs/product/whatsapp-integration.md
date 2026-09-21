# WhatsApp integration design

Status: product design note. This is not an implemented feature or a customer promise.

## The problem

Most interior-studio enquiries start on WhatsApp. A normal `wa.me` link opens a conversation, but it does not give Studio Presence access to the conversation.

We must separate three events:

| Event | What we know | What we do not know |
|---|---|---|
| WhatsApp click | Someone clicked the site's WhatsApp action | Whether the person sent a message, replied, or became a client |
| Form or QR submission | Someone submitted structured contact details | What happened later inside WhatsApp |
| WhatsApp API message | The connected business account received or sent a message event | The result of a conversation unless the business records it |

The landing page and dashboard must use these names accurately.

## Current state

The product currently supports:

- WhatsApp deep links with a prefilled message;
- phone and WhatsApp actions on the public site;
- Umami visitor statistics;
- website lead submission through the internal enquiry pipeline; and
- tenant-scoped lead storage and owner notification.

The product does not currently support:

- reading WhatsApp conversations;
- importing WhatsApp history;
- knowing whether a WhatsApp click became a conversation;
- assigning a WhatsApp conversation to a project; or
- reporting WhatsApp revenue.

The current frontend does not have a confirmed WhatsApp click-event pipeline. Visitor analytics are not the same as WhatsApp conversion analytics.

## Recommended rollout

### Stage 1: measure the click

Keep the direct WhatsApp link. Add a privacy-safe Umami event for the click.

Suggested event:

```text
whatsapp_click
```

Suggested event properties:

- tenant identifier;
- source page;
- button placement;
- locale; and
- campaign identifier when present.

Never send the visitor's phone number, WhatsApp message, name, email, or project details to Umami.

This gives us a count of click attempts. It does not create a lead.

### Stage 2: add the QR digital card

The QR code should point to a Studio Presence route instead of directly to `wa.me`.

Example flow:

```text
QR code → digital card page → WhatsApp or short enquiry form
```

The link should contain an opaque campaign identifier, such as `card_frontdesk_01`. It must not contain a person's phone number or other personal data.

The digital card page should offer:

- studio name and contact details;
- website link;
- WhatsApp action;
- call action; and
- a short form with name, phone, locality, and message.

The form should write to the existing lead pipeline. The current lead source values do not include `digital_card`, so implementation must not invent that enum value in the frontend. Until the schema is deliberately extended, use the existing form source plus a separate opaque campaign identifier, or stop and make the schema change through the normal product decision. Keep the campaign identifier tenant-scoped.

After a form submission, show a confirmation and a WhatsApp action. Do not force every visitor through a form.

### Stage 3: use the WhatsApp Business Platform

True conversation tracking requires the Meta WhatsApp Business Platform Cloud API. It is a separate integration, not an enhancement to a `wa.me` link.

Each connected studio would need:

- a WhatsApp Business Account;
- a business phone number registered for the platform;
- an onboarding or embedded-signup flow;
- tenant-specific credentials stored outside client configuration;
- webhook verification and signature checks;
- inbound message handling;
- outbound message and delivery-status handling;
- message identifiers and conversation state; and
- a retention and deletion policy for message data.

The implementation also needs a verified onboarding path, a functional webhook callback, session logging for embedded signup, and a plan for Meta's customer-service window and template-message rules. Access to business messaging history is a separate, permissioned operation and must not be assumed.

This has a real operating cost. The offer may need Meta messaging charges, provider or infrastructure cost, onboarding support, webhook maintenance, and data-retention work. Do not hide those costs inside Growth until a real customer has completed onboarding and the unit economics are known. Sell it as an activated add-on with a setup fee and any message or provider charges passed through clearly.

This should be a Growth add-on after the basic QR and form flow has proved useful. It should not be promised in Presence or Presence Plus.

## Tier placement

| Capability | Presence | Presence Plus | Growth |
|---|---|---|---|
| Direct WhatsApp button | Included | Included | Included |
| Prefilled WhatsApp message | Included | Included | Included |
| WhatsApp click count | Simple count once Stage 1 ships | Simple count once Stage 1 ships | Count with source and placement filters once Stage 1 ships |
| Visitor count | Current period and all-time total | Trends and comparisons | Deeper date filters and exports when available |
| Top page views | Current period | Trends and comparisons | Deeper date filters and exports when available |
| Website enquiry form | Simple form | Included | Named custom scope |
| QR digital card | No | One card when ready or paid add-on | Named custom scope |
| Campaign source tracking | No | Form and QR sources only | All implemented sources |
| WhatsApp conversation sync | No | No | Separate add-on after Stage 3 |

The visitor-history limits are presentation and reporting limits. They are not data-loss rules. Retain the underlying data according to the platform retention policy.

## Why Google Forms should not be the main path

Google Forms can collect data quickly, but it creates a separate owner experience, weakens source attribution, and makes tenant-specific reporting harder.

Use the existing internal form pipeline for the product. Use Google Forms only as a temporary experiment with a unique campaign link and a clear export path.

## Dashboard language

Use:

- “WhatsApp clicks” for link clicks;
- “Website enquiries” for form submissions;
- “QR enquiries” for digital-card submissions; and
- “WhatsApp conversations” only after the Cloud API receives verified message events.

Never use “WhatsApp leads” for a raw click.

## Success measures

Stage 1:

- WhatsApp clicks by tenant and page;
- no personal data in analytics; and
- no false claim that clicks are leads.

Stage 2:

- QR visits;
- QR form submissions;
- form-to-WhatsApp click rate; and
- campaign-level source reporting.

Stage 3:

- inbound conversations received by webhook;
- message delivery status;
- opt-in and template-message compliance; and
- tenant-isolated conversation records.

## Source basis

The Cloud API design follows the current Meta developer documentation for business onboarding, phone-number registration, template messages, webhooks, and permissioned message-history synchronization. The official documentation was checked through Context7 on 2026-09-19.
