import type { ComponentType } from 'react'
import * as Flags from 'country-flag-icons/react/3x2'

export interface CountryDialCode {
  name: string
  code: string
  dialCode: string
  flag: string
}

export function CountryFlag({ code, className = 'h-3.5 w-5' }: { code: string; className?: string }) {
  const Flag = (Flags as Record<string, ComponentType<{ className?: string; title?: string }>>)[code]
  if (!Flag) return null
  return <Flag className={className} title={code} />
}

export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰' },
]

export function splitPhoneAndCountry(rawPhone: string): { dialCode: string; nationalNumber: string } {
  const trimmed = (rawPhone || '').trim()
  if (!trimmed) {
    return { dialCode: '+91', nationalNumber: '' }
  }

  const sorted = [...COUNTRY_DIAL_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length)
  for (const country of sorted) {
    if (trimmed.startsWith(country.dialCode)) {
      const rest = trimmed.slice(country.dialCode.length).trim()
      return { dialCode: country.dialCode, nationalNumber: rest }
    }
  }

  return { dialCode: '+91', nationalNumber: trimmed.replace(/^\+91\s*/, '') }
}

const DEFAULT_COUNTRY: CountryDialCode = { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' }

export function getCountryByDialCode(dialCode: string): CountryDialCode {
  return (
    COUNTRY_DIAL_CODES.find((c) => c.dialCode === dialCode) ?? DEFAULT_COUNTRY
  )
}
