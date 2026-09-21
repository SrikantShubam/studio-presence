# Studio Presence — Client Admin Dashboard Master Prompt

> **Instructions for the Agent / Subagent:**  
> You are building a standalone, production-grade HTML prototype of the Studio Presence client dashboard (`/dashboard`).  
> This dashboard is designed specifically for an interior design studio owner in Tier 2/3 Indian cities (e.g. Patna, Lucknow, Ranchi, Indore) where every enquiry represents ₹2L–₹25L of potential business.  
> Read this entire document before writing any code. Follow all architectural, visual, and behavioral rules strictly.

---

## 1. Aesthetic & Design System Invariants

1. **Pure Shadcn / AdminCN Zinc Theme (Light & Dark)**:
   - Must use authentic Shadcn Zinc tokens (`hsl(var(--background))`, `hsl(var(--foreground))`, `hsl(var(--card))`, `hsl(var(--border))`, `hsl(var(--primary))`, etc.).
   - Dark mode canvas: `#09090b` / `240 10% 3.9%`.
   - Light mode canvas: `#ffffff` / `#fafafa`.
   - Border: `#27272a` in dark, `#e4e4e7` in light.
   - **NO custom brand greens, blues, or purples on the admin chrome.** The dashboard is a neutral, universal work tool. Green is reserved ONLY for WhatsApp actions and verified success states; red is reserved ONLY for urgent uncontacted alerts and destructive actions.
2. **Typography**:
   - Primary UI: `Inter` (-apple-system, sans-serif).
   - Metrics, currency figures, and slugs: `JetBrains Mono` monospace.
3. **Iconography**:
   - Use `Lucide Icons` cleanly scaled (14–16px, stroke-width: 1.75). No hacky SVGs or misaligned elements.
4. **Standalone Single-File HTML**:
   - Must run in any browser with zero build steps or server runtime.
   - Use Tailwind CSS CDN with Shadcn Zinc color configuration, Google Fonts CDN, and unpkg Lucide CDN. All state logic must be written in clean vanilla JavaScript.

---

## 2. Product Features & Dashboard Architecture

### A. Overview Hub
1. **6 High-Value Executive Studio KPIs**:
   - **New Enquiries**: Current month vs last month (`+55%` trend).
   - **Active Pipeline Value**: Estimated aggregate value from open enquiry budget bands (e.g., `₹46.5L`).
   - **Avg First Response Time**: Tracked response velocity (e.g., `24m`), with visual urgency indicator if uncontacted leads exist.
   - **Verified Visitors**: Real visitors tracked by Umami (e.g., `1,248`).
   - **WhatsApp Action Clicks**: Number of times prospective clients clicked WhatsApp CTAs (e.g., `86`).
   - **Digital Card / QR Scans**: Inbound scans from physical business cards or site signage (e.g., `34`).
2. **Interactive Traffic & Enquiries Area Curve**:
   - Recharts-style smooth SVG curve with gradient fill and drop-shadow glow filter.
   - Dual-metric display: Site visits vs consultation enquiries over the last 6 months.
   - Interactive hover points showing a popover tooltip with month, visitor count, and lead count.
3. **Umami-Backed India & Regional Geographic Demand Map**:
   - Clean stylized SVG map of India with subtle state divisions.
   - Do NOT render a generic radar or concentric circle widget.
   - Render pulsing city dot hotspots representing real visitor distribution from Umami's GeoIP city/region data:
     - **Patna (Studio HQ)**: 612 visits, 14 leads
     - **Ranchi**: 128 visits, 3 leads
     - **Varanasi / UP**: 84 visits, 2 leads
     - **Kolkata**: 96 visits, 1 lead
     - **Delhi NCR**: 142 visits, 3 leads
     - **Bengaluru**: 54 visits, 1 lead
   - **Clicking any city hotspot must dynamically filter the enquiries table** to show leads from that territory.
4. **Quick Action Growth CTAs Bar**:
   - Top-level action buttons: `Log Walk-in Lead`, `Share WhatsApp vCard`, `Tune Pricing ₹/SqFt`, `View Live Site ↗`.
   - Do NOT force a 3-stage onboarding wizard into the primary dashboard view—active studios need fast daily operational actions.
5. **High-Density Enquiries Table**:
   - Clean, professional desktop table with columns: Client & Locality, Project Type & Value, Source Channel, Status Badge, Timeline, and One-Tap Quick Contact (WhatsApp with pre-filled message, Phone Call, View Notes).
   - Automatic responsive card fallback on mobile viewports.

---

### B. Leads & Enquiries CRM
1. **Status Filter Tabs**: `All`, `New`, `Contacted`, `Quoted`, `Won`.
2. **Instant Search Bar**: Filter by client name, locality, budget, or notes.
3. **One-Tap Thumb Actions**: Every row/card must offer direct WhatsApp (`https://wa.me/91...`) and Call (`tel:...`) links.
4. **Slide-Over Sheet / Drawer**:
   - Clicking any lead opens a right-side drawer.
   - Displays: Client details, estimated budget band, timeline, originating source (`Estimate Calculator`, `WhatsApp Floating CTA`, `Digital QR Card`, `Website Direct Form`), full client brief message, lead status dropdown updater, and private studio notes textarea (saved to state).
   - Sticky bottom action buttons for WhatsApp and Phone Call.
5. **Offline Lead Modal**: Ability to log a walk-in visitor or phone consultation directly into the CRM.

---

### C. Dedicated "Estimate Calculator" Configurator & Live Tuner
The estimate calculator is a core feature from `backend/src/config/schema.ts` (`sections.estimate`). The dashboard must provide a dedicated screen allowing the owner to tune and test their pricing:
1. **Per-Sqft Baseline Pricing**: Input fields for Essential (`₹1,200`), Premium (`₹1,800`), and Luxe (`₹2,600`) rates.
2. **Home Type Multipliers**: Factors for 1 BHK (`0.94x`), 2 BHK (`1.00x`), 3 BHK (`1.06x`), 4 BHK (`1.12x`).
3. **Disclaimer & Inclusions**: Configurable result disclaimer note.
4. **Interactive Live Testing Simulator (Right Panel)**:
   - Carpet area range slider (400 to 3,500 sqft).
   - Home type and finish package selection buttons.
   - Real-time calculation showing the exact quote range (e.g. `₹23.5L – ₹28.8L`), effective rate per sqft, and typical timeline in weeks.
   - `Publish Rates to Site` and `Reset Defaults` buttons with toast notifications.

---

### D. Dedicated "Digital Card & QR" Suite
Designed for physical studio networking, site signage, and client handshakes (`docs/product/whatsapp-integration.md`):
1. **High-Resolution SVG QR Graphic**: Branded with studio name and URL (`ashish-interiors.in/card`).
2. **Action Tools**: `Export Print QR (SVG)`, `Copy Public Card URL`, `Download vCard (.vcf)`.
3. **Feature Toggles**:
   - Direct 1-tap WhatsApp consultation link.
   - Short project brief capture form.
   - Save contact to phone address book (.vcf).
4. **Honest Attribution**: Explanation that QR card submissions are explicitly tagged with `source: "Digital QR Card"`, while WhatsApp clicks track link-clicks without claiming private chat snooping.

---

### E. Traffic & Analytics (Umami Grounded)
1. **Four Core Questions**:
   - Enquiries this month vs last month.
   - Total visitors this month vs last month.
   - Top action channel (WhatsApp vs form).
   - Most-viewed project (e.g., Boring Road Modular Kitchen).
2. **Attribution Channels**: Visual distribution bar of where actions started.
3. **Top Viewed Projects List**: Views count and consultation leads generated per project.

---

### F. Settings & Security (Strict Separation)
Organize settings into clean, distinct cards:
1. **Studio Identity & Domain**: Name, tagline, primary city, custom domain.
2. **Account Credentials & Lead Routing**:
   - Primary login email (`ashish@ashish-interiors.in`).
   - **Secondary notification email** (`leads@ashish-interiors.in`) dedicated to receiving incoming enquiry alerts.
   - Studio WhatsApp number and password reset action.
3. **Team Access & Workspace Isolation**:
   - Team member list with roles (`Owner`, `Editor`, `Viewer`).
   - `Invite Member` CTA.
   - Explanation of Postgres Row-Level Security (RLS) isolating studio tenant data.
4. **Notification Preferences**: Instant WhatsApp lead alerts toggle, daily summary email digest toggle.
5. **Appearance**: Explicit Light, Dark, and System theme switches.

---

### G. Meta Developer & Social API Integrations (Instagram / Facebook / WhatsApp WABA)
The dashboard and settings must explicitly represent the Meta Graph API token infrastructure:
1. **Instagram oEmbed Meta App Credentials (`graph.facebook.com`)**:
   - **Background Invariant**: Meta terminated the Instagram Basic Display API in December 2024. Live automated feeds are dead. Under `schema.ts` (`sections.instagram.embedPostUrls`), studio owners hand-curate up to 6 post or reel URLs.
   - **Meta App ID (`META_APP_ID`)**: Client app ID required for authenticated oEmbed queries.
   - **Meta App Secret / System User Token (`META_APP_SECRET`)**: Masked token field with show/hide toggle.
   - **Rate Limit & Constraints**: 1,000 req/hour. Prohibits saving or deriving from metadata; renders verified oEmbed HTML only.
   - **Action**: "Validate Meta Token" button with live status ping.
2. **Instagram Curated Strip Manager (Site Sections view)**:
   - 6 URL input slots for curated post/reel links (`https://www.instagram.com/p/...`).
   - Live visual simulation showing the 3-tile embedded Instagram grid on the homepage with verified oEmbed badges.
   - "Validate & Sync oEmbeds" action.
3. **Meta WhatsApp Business Platform (WABA) Cloud API (Optional Enterprise Add-on)**:
   - Credentials configuration for studios upgrading beyond standard `wa.me` deep-links:
     - WhatsApp Business Account ID (`WABA_ID`).
     - Phone Number ID (`PHONE_ID`).
     - Permanent System User Access Token.
     - Webhook Verification Endpoint (`https://api.studio-presence.in/webhooks/meta-waba`).

---

## 3. Anti-Goals — What NOT to Do
- **NO Automated Instagram Scraping**: Respect Meta's Dec 2024 Basic Display deprecation; hand-curate URLs via oEmbed.
- **NO Salesforce Bloat**: No complex kanban pipeline boards, deal stages with probabilities, or 50-field forms. The owner has 20 leads a month, not 2,000.
- **NO Unactionable Analytics**: No bounce rates, session durations, or complex funnel drop-off diagrams.
- **NO Hardcoded Non-Standard Hex Colors**: Stick strictly to Shadcn zinc tokens.
- **NO Cluttered Onboarding in Primary Navigation**: Keep navigation focused on daily operations.
