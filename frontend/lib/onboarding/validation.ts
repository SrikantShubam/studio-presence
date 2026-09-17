import { EMPTY_ONBOARDING_DRAFT, type OnboardingDraft, type OnboardingErrors } from './types'

const PHONE_PATTERN = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STRING_FIELDS = ['studioName', 'otherService', 'primaryPhone', 'whatsapp', 'publicEmail', 'introduction'] as const
const LIST_FIELDS = ['serviceAreas', 'categories', 'services'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const cleanList = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))]

/** Parse the untrusted JSON body before normalization can call string methods. */
export function parseOnboardingDraftInput(input: unknown): { draft: OnboardingDraft; errors: OnboardingErrors } {
  if (!isRecord(input)) {
    return { draft: EMPTY_ONBOARDING_DRAFT, errors: { studioName: 'Invalid onboarding submission.' } }
  }

  const draft: OnboardingDraft = { ...EMPTY_ONBOARDING_DRAFT }
  const errors: OnboardingErrors = {}

  for (const field of STRING_FIELDS) {
    const value = input[field]
    if (value === undefined) continue
    if (typeof value !== 'string') errors[field] = 'Enter text in this field.'
    else draft[field] = value
  }

  for (const field of LIST_FIELDS) {
    const value = input[field]
    if (value === undefined) continue
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      errors[field] = 'Choose valid options.'
    } else {
      draft[field] = value
    }
  }

  const usePhoneForWhatsapp = input.usePhoneForWhatsapp
  if (usePhoneForWhatsapp !== undefined) {
    if (typeof usePhoneForWhatsapp !== 'boolean') errors.usePhoneForWhatsapp = 'Choose whether to reuse your business number.'
    else draft.usePhoneForWhatsapp = usePhoneForWhatsapp
  }

  return { draft, errors }
}

export function normalizeOnboardingDraft(input: OnboardingDraft): OnboardingDraft {
  const primaryPhone = input.primaryPhone.trim()
  const services = cleanList(input.services)
  return {
    ...input,
    studioName: input.studioName.trim(),
    serviceAreas: cleanList(input.serviceAreas),
    categories: cleanList(input.categories),
    services,
    otherService: services.includes('Other service') ? input.otherService.trim() : '',
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

const STAGE_FIELDS: Record<1 | 2 | 3, Array<keyof OnboardingDraft>> = {
  1: ['studioName', 'serviceAreas', 'categories', 'services', 'otherService'],
  2: [],
  3: ['primaryPhone', 'whatsapp', 'publicEmail'],
}

/** Validate only the visible stage; final submission still validates the full draft. */
export function validateOnboardingStage(input: OnboardingDraft, stage: 1 | 2 | 3): { draft: OnboardingDraft; errors: OnboardingErrors } {
  const result = validateOnboardingDraft(input)
  const allowed = new Set(STAGE_FIELDS[stage])
  return {
    draft: result.draft,
    errors: Object.fromEntries(Object.entries(result.errors).filter(([field]) => allowed.has(field as keyof OnboardingDraft))),
  }
}

export function suggestedIntroduction(draft: OnboardingDraft): string {
  const services = [...draft.services.filter((service) => service !== 'Other service'), ...(draft.otherService ? [draft.otherService] : [])]
  return `${draft.studioName || 'Your studio'} creates thoughtful ${(draft.categories.slice(0, 2).join(' and ') || 'spaces').toLowerCase()} across ${draft.serviceAreas[0] || 'your area'}${services.length ? `, with ${services.slice(0, 2).join(' and ').toLowerCase()}.` : '.'}`
}
