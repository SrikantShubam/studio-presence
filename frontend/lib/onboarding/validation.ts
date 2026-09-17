import type { OnboardingDraft, OnboardingErrors } from './types'

const PHONE_PATTERN = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanList(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

export function normalizeOnboardingDraft(draft: OnboardingDraft): OnboardingDraft {
  const primaryPhone = draft.primaryPhone.trim()
  return {
    ...draft,
    studioName: draft.studioName.trim(),
    serviceAreas: cleanList(draft.serviceAreas),
    categories: cleanList(draft.categories),
    services: cleanList(draft.services),
    otherService: draft.otherService.trim(),
    primaryPhone,
    whatsapp: draft.usePhoneForWhatsapp ? primaryPhone : draft.whatsapp.trim(),
    publicEmail: draft.publicEmail.trim().toLowerCase(),
    introduction: draft.introduction.trim(),
  }
}

export function validateOnboardingDraft(input: OnboardingDraft): { draft: OnboardingDraft; errors: OnboardingErrors } {
  const draft = normalizeOnboardingDraft(input)
  const errors: OnboardingErrors = {}
  if (!draft.studioName) errors.studioName = 'Enter your studio name.'
  if (!draft.serviceAreas.length) errors.serviceAreas = 'Add at least one service area.'
  if (!draft.categories.length) errors.categories = 'Choose at least one category.'
  if (!draft.services.length) errors.services = 'Choose at least one service.'
  if (!PHONE_PATTERN.test(draft.primaryPhone.replace(/[()]/g, ''))) errors.primaryPhone = 'Enter a valid Indian mobile number.'
  if (!draft.usePhoneForWhatsapp && !PHONE_PATTERN.test(draft.whatsapp.replace(/[()]/g, ''))) errors.whatsapp = 'Enter a valid WhatsApp number or use your business number.'
  if (draft.publicEmail && !EMAIL_PATTERN.test(draft.publicEmail)) errors.publicEmail = 'Enter a valid public email.'
  return { draft, errors }
}

export function suggestedIntroduction(draft: OnboardingDraft) {
  const area = draft.serviceAreas[0] || 'your area'
  const categories = draft.categories.slice(0, 2).join(' and ') || 'beautiful spaces'
  return `${draft.studioName || 'Your studio'} creates thoughtful ${categories.toLowerCase()} across ${area}.`
}
