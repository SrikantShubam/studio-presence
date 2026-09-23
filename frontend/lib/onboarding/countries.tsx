import type { ComponentType } from 'react'
import * as Flags from 'country-flag-icons/react/3x2'
import { getCountries, getCountryCallingCode, type Country } from 'react-phone-number-input'

export interface CountryDialCode {
  name: string
  code: string
  dialCode: string
  flag: string
}

export function countryOptionLabel(name: string, dialCode: string): string {
  return `${dialCode} ${name}`
}

export function CountryFlag({ code, className = 'h-3.5 w-5' }: { code: string; className?: string }) {
  const Flag = (Flags as Record<string, ComponentType<{ className?: string; title?: string }>>)[code]
  if (!Flag) return null
  return <Flag className={className} title={code} />
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })

function flagForCountry(code: string): string {
  return [...code].map((letter) => String.fromCodePoint(letter.charCodeAt(0) + 127397)).join('')
}

export const COUNTRY_DIAL_CODES: CountryDialCode[] = getCountries()
  .map((code: Country) => ({
    name: countryNames.of(code) ?? code,
    code,
    dialCode: `+${getCountryCallingCode(code)}`,
    flag: flagForCountry(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))
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

const DEFAULT_COUNTRY: CountryDialCode = COUNTRY_DIAL_CODES.find((country) => country.code === 'IN') ?? {
  name: 'India',
  code: 'IN',
  dialCode: '+91',
  flag: '🇮🇳',
}

export function getCountryByDialCode(dialCode: string): CountryDialCode {
  return (
    COUNTRY_DIAL_CODES.find((c) => c.dialCode === dialCode) ?? DEFAULT_COUNTRY
  )
}
