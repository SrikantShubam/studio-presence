# Implementation Plan: Onboarding Overhaul, Tiered Storage (Supabase vs R2), and UX Architecture

**Date**: 2026-09-18  
**Status**: Ready for Execution  
**Target Branch**: `candidate`  

---

## 1. Context & Architecture

This plan establishes a complete, robust onboarding pipeline for interior design studios on Studio Presence. It resolves critical database gaps, fixes broken phone validation and middleware routing, introduces client-side WebP image compression, and establishes the tiered storage separation between Demo (`t0`) and Paying (`t1`, `t2`, `t3`) studios.

---

## 2. Storage Tier Architecture & Capacity Model

### 2.1 Storage Allocation per Studio

| Studio Profile | Assets Included | Total Size (Compressed WebP) | Backend Storage Provider | Bandwidth / Egress Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Studio (`t0`)** | 1 Logo + up to 3 showcase photos | **~0.8 MB to 1.0 MB** | Supabase Storage (`tenant-assets`) | $0.00 (within 2GB pool) |
| **Paid Studio (`t1`, `t2`, `t3`)** | 1 Logo + 20–80 portfolio project photos | **15 MB to 30 MB** | Cloudflare R2 (`studio-presence-assets`) | **$0.00 Forever (Zero Egress)** |

### 2.2 Client-Side Compression Engine (`frontend/lib/onboarding/image-compression.ts`)
- Implemented using native browser HTML5 Canvas + `createImageBitmap`.
- Automatically downsizes logos to max 512×512px, photos to max 1920×1080px.
- Encodes to WebP at 0.82 quality.
- Automatically strips camera EXIF metadata and GPS coordinates.
- Prevents users from uploading 10MB raw photos, reducing upload payload by ~95%.

---

## 3. Database Schema (`backend/supabase/migrations/`)

### 3.1 Migration Components:
1. `tenant_workspaces`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `tenant_slug TEXT NOT NULL UNIQUE`
   - `studio_name TEXT NOT NULL`
   - `tier TEXT NOT NULL DEFAULT 't0'`
   - `status TEXT NOT NULL DEFAULT 'demo'`
   - `owner_user_id UUID REFERENCES auth.users(id)`
   - `storage_provider TEXT NOT NULL DEFAULT 'supabase'` (values: `'supabase'`, `'r2'`)
   - `storage_bucket TEXT NOT NULL DEFAULT 'tenant-assets'`
   - `storage_prefix TEXT NOT NULL DEFAULT ''`
   - `cdn_base_url TEXT`
   - `storage_quota_bytes BIGINT NOT NULL DEFAULT 5242880` (5MB for demo)
   - `storage_used_bytes BIGINT NOT NULL DEFAULT 0`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
   - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

2. `tenant_hostnames`:
   - `hostname TEXT PRIMARY KEY`
   - `tenant_slug TEXT NOT NULL REFERENCES tenant_workspaces(tenant_slug)`
   - `is_primary BOOLEAN NOT NULL DEFAULT true`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

3. `onboarding_drafts`:
   - `user_id UUID PRIMARY KEY REFERENCES auth.users(id)`
   - `payload JSONB NOT NULL DEFAULT '{}'::jsonb`
   - `current_step INTEGER NOT NULL DEFAULT 1`
   - `completed_at TIMESTAMPTZ`
   - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

4. RPC `complete_onboarding`:
   - Atomically reserves `tenant_slug`, creates workspace in `tenant_workspaces`, maps hostnames in `tenant_hostnames`, writes initial `ClientConfig`, and marks draft completed.

---

## 4. UX Overhaul Specifications (`OnboardingForm.tsx`)

1. **Stage 1 (Identity & Operations)**:
   - Studio Name input.
   - **Primary City / Base**: Clean text input with autofill suggestions.
   - **Service Areas**: Tag/pill input component. User types locality/city and presses `Enter` or `,` to create a pill. Clicking `×` removes it cleanly.
   - **Category & Services**: Pre-defined checkboxes + **Multiple custom services** tag input (allows adding unlimited specific services).

2. **Stage 2 (Visual Branding)**:
   - **Logo Upload Dropzone**: Drag-and-drop file picker with instant client-side WebP compression and visual preview.
   - **Identity Palettes**: 4 curated architectural palettes (Editorial Crisp, Warm Earth, Charcoal Modern, Monolith Dark).

3. **Stage 3 (Contact & Voice)**:
   - **Email**: Pre-filled automatically from authenticated Google / Supabase user session (`session.user.email`), with editable override.
   - **Phone & WhatsApp**: Country code selector (`+91` India default) + 10-digit number. Backend normalizes to E.164 (`+91XXXXXXXXXX`) to satisfy schema.
   - **AI Introduction**: Suggested introductory blurb rendered in an editable textarea so studios can personalize their voice.
   - **Auto-save**: Form changes debounced and synced to `/api/onboarding/draft`.

---

## 5. Verification & Acceptance Criteria

1. `npm run check:all` passes with exit 0 (excluding pre-existing fixture pins).
2. Onboarding completes successfully without PostgREST errors.
3. Created demo tenant routes properly without triggering `retired-tenant` lockout.
4. Logo and photos upload with WebP compression and correct storage provider routing.
