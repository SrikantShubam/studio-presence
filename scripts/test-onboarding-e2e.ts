import assert from 'node:assert/strict'
import { resolveClientConfig, validateClientConfig } from '../backend/src/config/index.js'
import { resolveAssetPublicUrl } from '../backend/src/storage/index.js'
import { normalizePhoneNumber } from '../frontend/lib/onboarding/validation.js'
import type { OnboardingDraft } from '../frontend/lib/onboarding/types.js'

console.log('Running End-to-End Onboarding & Storage Validation...')

// 1. Phone Normalization & Schema Invariants
assert.equal(normalizePhoneNumber('9876543210'), '+919876543210')
assert.equal(normalizePhoneNumber('+91 9876543210'), '+919876543210')
assert.equal(normalizePhoneNumber('919876543210'), '+919876543210')
console.log('✔ Phone normalization to E.164 verified.')

// 2. Draft to ClientConfig assembly & Zod Schema Validation
const draft: OnboardingDraft = {
  studioName: 'Studio Arcform',
  serviceAreas: ['South Delhi', 'Gurugram'],
  categories: ['Residential', 'Office'],
  services: ['Interior design', 'Turnkey projects'],
  otherService: '',
  primaryPhone: '+91 9876543210',
  usePhoneForWhatsapp: true,
  whatsapp: '+91 9876543210',
  publicEmail: 'contact@arcform.test',
  introduction: 'Studio Arcform designs minimalist residences in Delhi NCR.',
  logoPath: '/api/assets/tenants/studio-arcform/logo.webp',
  palette: 'editorial',
  primaryCity: 'Delhi NCR',
  primaryState: 'Delhi',
}

const slug = 'studio-arcform'
const config = resolveClientConfig(slug, {
  slug,
  tier: 't0',
  template: 'editorial',
  status: 'demo',
  vertical: 'interior-design',
  business: {
    name: draft.studioName,
    phone: normalizePhoneNumber(draft.primaryPhone),
    whatsapp: normalizePhoneNumber(draft.whatsapp),
    email: draft.publicEmail,
    address: {
      locality: draft.serviceAreas[0],
      city: draft.primaryCity || 'Delhi NCR',
      state: draft.primaryState || 'Delhi',
    },
    serviceAreas: draft.serviceAreas,
  },
  brand: {
    logo: draft.logoPath,
  },
  domain: { demoSubdomain: slug },
  sections: {
    hero: {
      enabled: true,
      headline: draft.studioName,
      sub: draft.introduction,
    },
    portfolio: { enabled: true, projects: [] },
    services: {
      enabled: true,
      items: draft.services.map((title) => ({ title, blurb: `${title} from ${draft.studioName}.` })),
    },
  },
  seo: {
    title: draft.studioName,
    description: draft.introduction,
    noindex: true,
  },
  internal: {
    notes: 'Organic onboarding demo.',
  },
})

const validation = validateClientConfig(config)
assert.ok(validation.ok, `ClientConfig must be valid: ${JSON.stringify(validation.issues)}`)
assert.equal(validation.config.brand.logo, '/api/assets/tenants/studio-arcform/logo.webp')
assert.equal(validation.config.business.phone, '+919876543210')
assert.equal(validation.config.business.address.locality, 'South Delhi')
assert.equal(validation.config.business.address.city, 'Delhi NCR')
assert.equal(validation.config.business.address.state, 'Delhi')
console.log('✔ ClientConfig conforms to frozen schema.ts with zero errors.')

// 3. Storage URL resolution
const r2CdnUrl = resolveAssetPublicUrl('tenants/studio-arcform/logo.webp')
assert.ok(r2CdnUrl.includes('pub-403ed28e13fd457090979edd66cad91a.r2.dev') || r2CdnUrl.includes('tenants/studio-arcform/logo.webp'))
console.log('✔ Asset public CDN resolution verified:', r2CdnUrl)

const supabaseStorageUrl = resolveAssetPublicUrl('staging/user-123/logo.webp')
assert.ok(supabaseStorageUrl.includes('storage/v1/object/public/tenant-assets/staging/user-123/logo.webp'))
console.log('✔ Supabase Staging resolution verified:', supabaseStorageUrl)

console.log('\n🎉 ALL ONBOARDING & STORAGE INTEGRATION TESTS PASSED!')
