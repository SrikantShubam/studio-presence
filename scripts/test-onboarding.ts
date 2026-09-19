import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { EMPTY_ONBOARDING_DRAFT } from '../frontend/lib/onboarding/types.ts'
import {
  parseOnboardingDraftInput,
  suggestedIntroduction,
  validateOnboardingDraft,
  validateOnboardingStage,
} from '../frontend/lib/onboarding/validation.ts'
import { onboardingRpcStatus, retrySerialization } from '../frontend/lib/onboarding/retry.ts'

const invalid = validateOnboardingDraft(EMPTY_ONBOARDING_DRAFT)
assert.ok(invalid.errors.studioName && invalid.errors.serviceAreas && invalid.errors.categories && invalid.errors.services && invalid.errors.primaryPhone)
const valid = validateOnboardingDraft({ ...EMPTY_ONBOARDING_DRAFT, studioName: '  GG Studio ', serviceAreas: ['South Delhi', ' South Delhi '], categories: ['Residential'], services: ['Other service'], otherService: 'Lighting design', primaryPhone: '+91 9876543210' })
assert.deepEqual(valid.errors, {})
assert.deepEqual(valid.draft.serviceAreas, ['South Delhi'])
assert.equal(valid.draft.whatsapp, '+91 9876543210')
assert.match(suggestedIntroduction(valid.draft), /GG Studio/)
assert.equal(
  validateOnboardingStage({ ...valid.draft, primaryPhone: 'not-a-phone' }, 1).errors.primaryPhone,
  undefined,
)
assert.ok(validateOnboardingStage({ ...valid.draft, primaryPhone: 'not-a-phone' }, 3).errors.primaryPhone)
assert.equal(
  validateOnboardingDraft({ ...valid.draft, services: ['Renovation'], otherService: 'stale value' }).draft.otherService,
  '',
)
const malformed = parseOnboardingDraftInput({ ...valid.draft, serviceAreas: null, usePhoneForWhatsapp: 'yes' })
assert.ok(malformed.errors.serviceAreas)
assert.ok(malformed.errors.usePhoneForWhatsapp)

let recoveredAttempts = 0
const recovered = await retrySerialization(async () => {
  recoveredAttempts += 1
  return recoveredAttempts < 3
    ? { data: null, error: { code: '40001', message: 'allocation race' } }
    : { data: { tenant_slug: 'gg-studio' }, error: null }
})
assert.equal(recoveredAttempts, 3)
assert.deepEqual(recovered.data, { tenant_slug: 'gg-studio' })

let exhaustedAttempts = 0
const exhausted = await retrySerialization(async () => {
  exhaustedAttempts += 1
  return { data: null, error: { code: '40001', message: 'allocation race' } }
})
assert.equal(exhaustedAttempts, 3)
assert.equal(exhausted.error?.code, '40001')

for (const code of ['42501', '23505']) {
  let attempts = 0
  await retrySerialization(async () => {
    attempts += 1
    return { data: null, error: { code, message: 'non-retryable error' } }
  })
  assert.equal(attempts, 1)
}

assert.equal(onboardingRpcStatus({ code: '40001' }), 409)
assert.equal(onboardingRpcStatus({ code: '42501' }), 403)
assert.equal(onboardingRpcStatus({ code: '23505' }), 409)
assert.equal(onboardingRpcStatus({ code: '22000' }), 400)

const onboardingPage = readFileSync(join(process.cwd(), 'frontend', 'app', 'onboarding', 'page.tsx'), 'utf8')
const onboardingForm = readFileSync(join(process.cwd(), 'frontend', 'app', 'onboarding', 'OnboardingForm.tsx'), 'utf8')

assert.match(onboardingPage, /ThemeToggle/, 'onboarding must expose the explicit system/light/dark theme control')
assert.match(onboardingPage, /NO_FLASH_SCRIPT/, 'onboarding must apply a stored theme before first paint')
assert.match(onboardingPage, /aria-labelledby/, 'onboarding page must have a labelled main content region')
assert.match(onboardingPage, /bg-admin-primary-soft/, 'onboarding page must establish a neutral admin visual hierarchy')
assert.match(onboardingForm, /isHydrating/, 'onboarding must expose a draft hydration state')
assert.match(onboardingForm, /aria-label="Onboarding progress"/, 'stage navigation must be announced as onboarding progress')
assert.match(onboardingForm, /aria-current=\{active \? 'step'/, 'the active onboarding stage must be identified to assistive technology')
assert.match(onboardingForm, /motion-reduce:transition-none/, 'onboarding transitions must respect reduced-motion preferences')
assert.match(onboardingForm, /focus-visible:ring-2 focus-visible:ring-admin-primary/, 'interactive controls must have visible admin focus states')
assert.doesNotMatch(onboardingForm, /bg-(?:amber|stone|zinc|black)-/, 'onboarding must use admin theme tokens instead of raw palette classes')
assert.doesNotMatch(onboardingForm, /style\s*=/, 'onboarding must not introduce inline styles')

console.log('onboarding validation checks passed')
