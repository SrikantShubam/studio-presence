import type { OnboardingDraft, OnboardingErrors } from './types'

const PHONE_PATTERN = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const cleanList = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))]

export function normalizeOnboardingDraft(input: OnboardingDraft): OnboardingDraft {
  const primaryPhone = input.primaryPhone.trim()
  return {
    ...input,
    studioName: input.studioName.trim(),
    serviceAreas: cleanList(input.serviceAreas),
    categories: cleanList(input.categories),
    services: cleanList(input.services),
    otherService: input.otherService.trim(),
    primaryPhone,
    whatsapp: input.usePhoneForWhatsapp ? primaryPhone : input.whatsapp.trim(),
    publicEmail: input.publicEmail.trim().toLowerCase(),
    introduction: input.introduction.trim(),
  }
}

export function validateOnboardingDraft(input: OnboardingDraft): { draft: OnboardingDraft; errors: OnboardingErrors } {
  const draft = normalizeOnboardingDraft(input)
  const errors: OnboardingErrors = {}
  if (!draft.studioName) errors.studioName = 'Enter your studio name.'
  if (!draft.serviceAreas.length) errors.serviceAreas = 'Add at least one service area.'
  if (!draft.categories.length) errors.categories = 'Choose at least one category.'
  if (!draft.services.length) errors.services = 'Choose at least one service.'
  if (draft.services.includes('Other service') && !draft.otherService) errors.otherService = 'Describe the other service.'
  if (!PHONE_PATTERN.test(draft.primaryPhone.replace(/[()]/g, ''))) errors.primaryPhone = 'Enter a valid Indian mobile number.'
  if (!draft.usePhoneForWhatsapp && !PHONE_PATTERN.test(draft.whatsapp.replace(/[()]/g, ''))) errors.whatsapp = 'Enter a valid WhatsApp number.'
  if (draft.publicEmail && !EMAIL_PATTERN.test(draft.publicEmail)) errors.publicEmail = 'Enter a valid public email.'
  return { draft, errors }
}

export function suggestedIntroduction(draft: OnboardingDraft): string {
  const services = [...draft.services.filter((service) => service !== 'Other service'), ...(draft.otherService ? [draft.otherService] : [])]
  return `${draft.studioName || 'Your studio'} creates thoughtful ${(draft.categories.slice(0, 2).join(' and ') || 'spaces').toLowerCase()} across ${draft.serviceAreas[0] || 'your area'}${services.length ? `, with ${services.slice(0, 2).join(' and ').toLowerCase()}.` : '.'}`
}
