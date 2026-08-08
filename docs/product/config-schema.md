# Client config schema

The single most important artifact in the codebase. Every client site is one JSON file.
Tiering is a flag in this file — never a code change, never a branch, never a fork.

Location: `clients/<slug>.json`. The slug is the demo subdomain: `ashish.vectorveda.online`.

---

## Design rules

1. **Nothing is hardcoded in a component.** If a string, colour, phone number or image path
   appears in JSX, it belongs here instead.
2. **Every section is independently toggleable.** A section renders only if its config block
   exists and `enabled` is true.
3. **The `tier` field sets defaults; explicit blocks override.** Setting `"tier": "t1"` turns on the
   T1 section set. Adding a `reviews` block to a T1 client is how you grant an exception without
   moving them to T2 — useful during negotiation.
4. **Validate before deploy.** A malformed config must fail loudly at build, not render a broken
   page on a client's subdomain.
5. **Never put secrets here.** API keys live in environment variables. This file is committed.

---

## Schema

```json
{
  "$schema": "./client.schema.json",
  "slug": "ashish-interiors",
  "tier": "t1",
  "status": "demo",
  "vertical": "interior-design",

  "business": {
    "name": "Ashish Interiors",
    "tagline": "Interiors that feel like home",
    "ownerName": "Ashish Kumar",
    "phone": "+919876543210",
    "whatsapp": "+919876543210",
    "email": "hello@ashishinteriors.in",
    "yearFounded": 2016,
    "address": {
      "line1": "Boring Road",
      "locality": "Patna",
      "city": "Patna",
      "state": "Bihar",
      "pincode": "800001",
      "mapsEmbedUrl": "https://www.google.com/maps/embed?pb=..."
    },
    "serviceAreas": ["Patna", "Danapur", "Phulwari Sharif"],
    "hours": "Mon-Sat, 10am - 7pm"
  },

  "brand": {
    "logo": "/clients/ashish-interiors/logo.svg",
    "favicon": "/clients/ashish-interiors/favicon.png",
    "ogImage": "/clients/ashish-interiors/og.jpg",
    "palette": { "primary": "#1D9E75", "surface": "#FCFCFB", "ink": "#0B0B0B" },
    "font": "inter"
  },

  "domain": {
    "demoSubdomain": "ashish",
    "customDomain": null,
    "procuredByUs": false,
    "renewalDue": null
  },

  "sections": {
    "hero": {
      "enabled": true,
      "headline": "Interiors that feel like home",
      "sub": "Full-home and modular interiors in Patna. 40+ homes delivered.",
      "image": "/clients/ashish-interiors/hero.jpg",
      "ctaLabel": "Get a free consultation"
    },
    "services": {
      "enabled": true,
      "items": [
        { "title": "Full home interiors", "blurb": "Turnkey design and execution." },
        { "title": "Modular kitchens", "blurb": "Built to your space and budget." },
        { "title": "Office interiors", "blurb": "Workspaces that work." }
      ]
    },
    "portfolio": {
      "enabled": true,
      "detailPages": false,
      "projects": [
        {
          "title": "3BHK, Boring Road",
          "cover": "/clients/ashish-interiors/p1.jpg",
          "images": ["/clients/ashish-interiors/p1-a.jpg"],
          "blurb": "Contemporary 3BHK, 4-month turnaround.",
          "slug": "3bhk-boring-road",
          "location": "Boring Road, Patna",
          "duration": "45 days",
          "projectType": "residential",
          "area": "1450 sq ft"
        }
      ]
    },
    "beforeAfter": {
      "enabled": false,
      "pairs": [{ "before": "", "after": "", "caption": "" }]
    },
    "about": {
      "enabled": true,
      "heading": "About Ashish Interiors",
      "body": "Nine years designing homes across Patna...",
      "image": "/clients/ashish-interiors/owner.jpg"
    },
    "team": { "enabled": false, "members": [] },
    "testimonials": {
      "enabled": true,
      "items": [{ "quote": "", "author": "", "context": "" }]
    },
    "reviews": {
      "enabled": false,
      "googlePlaceId": null,
      "fetchAtBuild": true
    },
    "awards": { "enabled": false, "items": [] },
    "instagram": {
      "enabled": false,
      "handle": "@ashishinteriors",
      "embedPostUrls": []
    },
    "inquiryForm": {
      "enabled": false,
      "provider": "web3forms",
      "accessKeyEnv": "WEB3FORMS_ASHISH",
      "fields": ["name", "phone", "roomType", "budget", "timeline"]
    },
    "blog": { "enabled": false, "posts": [] },
    "map": { "enabled": true },
    "contact": { "enabled": true }
  },

  "cta": {
    "whatsappMessage": "Hi {{business.name}}, I saw your website and I'd like to discuss an interior project.",
    "stickyOnMobile": true,
    "showCallButton": true
  },

  "seo": {
    "title": "Ashish Interiors — Interior Designers in Patna",
    "description": "Full-home interiors, modular kitchens and office design in Patna.",
    "keywords": ["interior designer patna", "modular kitchen patna"],
    "localBusinessSchema": true,
    "sitemap": true,
    "noindex": true
  },

  "integrations": {
    "umami": { "enabled": true, "clientDashboardAccess": false },
    "searchConsole": { "enabled": false },
    "uptimeMonitor": { "enabled": false },
    "gbpManaged": false
  },

  "legal": {
    "privacyPolicy": true,
    "terms": true,
    "dataRetentionNote": "Inquiry form submissions are retained for 12 months."
  },

  "internal": {
    "demoWatermark": true,
    "createdAt": "2026-07-26",
    "leadSource": "scrutinized_leads.csv",
    "paymentStatus": "none",
    "notes": ""
  }
}
```

---

## Field reference

### Top level
| Field | Type | Notes |
|---|---|---|
| `slug` | string | Unique. Lowercase, hyphens only. Directory + subdomain key |
| `tier` | `t0` \| `t1` \| `t2` \| `t3` | Sets the default section set |
| `status` | `demo` \| `sold` \| `live` \| `archived` | **Drives the go-live gate** |
| `vertical` | string | `interior-design` today; `studio`, `salon`, `architect` later |

### `status` — the payment gate
This field is the structural payment gate from the plan. The deploy script must refuse to attach a
custom domain unless `status` is `live`.

| Status | Subdomain | Custom domain | Watermark | `noindex` |
|---|---|---|---|---|
| `demo` | yes | **blocked** | yes | yes |
| `sold` | yes | **blocked** | yes | yes |
| `live` | yes | allowed | no | no |
| `archived` | no | no | — | — |

`sold` means the 50% has cleared and real build is underway — still no live domain until the
balance clears. Moving to `live` is a deliberate manual step, never automatic.

### Tier defaults
Setting `tier` enables this section set. Explicit blocks in the file always win.

| Tier | Sections on by default |
|---|---|
| `t0` | hero, portfolio (5 photos, no detail pages), map, contact, cta |
| `t1` | + services, about, team, testimonials, seo schema, umami, legal, instagram |
| `t2` | + portfolio.detailPages, beforeAfter, reviews, awards, inquiryForm, blog, searchConsole |
| `t3` | + i18n, leadDashboard, umami.clientDashboardAccess, reviewRequestFlow |

### Validation rules (enforce at build)
- `slug` matches `^[a-z0-9-]+$` and is unique across `clients/`.
- `business.phone` and `business.whatsapp` are E.164 (`+91` prefix, 12 digits total).
- Every image path referenced exists on disk.
- `sections.portfolio.projects` has at least 3 entries for `t1`+ (a 1-project portfolio looks worse
  than none). **No upper limit** — a studio with 40 projects should be able to list 40.
- `projects[].duration` is optional but strongly encouraged. In this vertical it is a direct trust
  signal — it says *we finish on time*, which is the buyer's actual fear. Prompt for it at intake.
- `seo.noindex` is `true` whenever `status` is `demo` or `sold`. Fail the build otherwise —
  a demo indexed by Google under the client's name is a real problem.
- `reviews.enabled` requires `googlePlaceId`.
- `inquiryForm.enabled` requires the env var named in `accessKeyEnv` to exist.
- If `domain.customDomain` is set, `status` must be `live`.

### Template variables
`{{business.name}}`, `{{business.locality}}`, `{{business.ownerName}}` interpolate inside any
string field — used mainly in `cta.whatsappMessage` and `seo.*`.

---

## Minimum viable config (Tier 0)

Everything else has a sane default. This is the smallest file that produces a working site:

```json
{
  "slug": "ashish-interiors",
  "tier": "t0",
  "status": "demo",
  "vertical": "interior-design",
  "business": {
    "name": "Ashish Interiors",
    "phone": "+919876543210",
    "whatsapp": "+919876543210",
    "address": { "locality": "Boring Road", "city": "Patna", "state": "Bihar" }
  },
  "sections": {
    "hero": { "enabled": true, "headline": "Interiors that feel like home" },
    "portfolio": { "enabled": true, "projects": [] }
  }
}
```

These are also exactly the fields the intake form must collect before a demo can be built —
see `../ops/onboarding-sop.md`.

---

## What must NOT go in this file
- API keys, access tokens, Contentful credentials → environment variables
- Client passwords of any kind → never collected in the first place
- Anything from another client's config → no cross-client references
