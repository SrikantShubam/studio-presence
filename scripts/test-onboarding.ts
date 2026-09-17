import assert from 'node:assert/strict'
import { EMPTY_ONBOARDING_DRAFT } from '../frontend/lib/onboarding/types.ts'
import { suggestedIntroduction, validateOnboardingDraft } from '../frontend/lib/onboarding/validation.ts'

const invalid = validateOnboardingDraft(EMPTY_ONBOARDING_DRAFT)
assert.equal(invalid.draft.whatsapp, '')
assert.ok(invalid.errors.studioName && invalid.errors.serviceAreas && invalid.errors.categories && invalid.errors.services && invalid.errors.primaryPhone)

const valid = validateOnboardingDraft({
  ...EMPTY_ONBOARDING_DRAFT,
  studioName: '  GG Studio ',
  serviceAreas: ['South Delhi', ' South Delhi '],
  categories: ['Residential'],
  services: ['Interior design'],
  primaryPhone: '+91 9876543210',
})
assert.deepEqual(valid.errors, {})
assert.deepEqual(valid.draft.serviceAreas, ['South Delhi'])
assert.equal(valid.draft.whatsapp, '+91 9876543210')
assert.match(suggestedIntroduction(valid.draft), /GG Studio/)

console.log('onboarding validation checks passed')
