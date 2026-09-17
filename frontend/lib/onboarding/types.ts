export type OnboardingDraft = {
  studioName: string
  serviceAreas: string[]
  categories: string[]
  services: string[]
  otherService: string
  primaryPhone: string
  usePhoneForWhatsapp: boolean
  whatsapp: string
  publicEmail: string
  introduction: string
}

export type OnboardingErrors = Partial<Record<keyof OnboardingDraft, string>>

export const EMPTY_ONBOARDING_DRAFT: OnboardingDraft = {
  studioName: '', serviceAreas: [], categories: [], services: [], otherService: '',
  primaryPhone: '', usePhoneForWhatsapp: true, whatsapp: '', publicEmail: '', introduction: '',
}
