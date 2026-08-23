import { applyI18nOverlay, loadI18nOverlay, loadI18nSeed, loadPublicClientConfig, type ClientConfig } from '@studio/backend'
import type { PublicLocale } from './i18n-client'

export type { PublicLocale } from './i18n-client'

export function publicLocaleFrom(value: string | undefined): PublicLocale | null {
  if (!value || value === 'en') return 'en'
  if (value === 'hi') return 'hi'
  return null
}

function withLocaleAvailability(site: ClientConfig, tenant: string): ClientConfig {
  const hasHindi = Boolean(loadI18nSeed(tenant, 'hi'))
  if (!hasHindi || site.i18n.locales.includes('hi')) return site
  return {
    ...site,
    i18n: {
      ...site.i18n,
      enabled: true,
      locales: [...site.i18n.locales, 'hi'],
    },
  }
}

export async function loadPublicClientConfigForLocale(
  tenant: string,
  locale: PublicLocale = 'en',
): Promise<ClientConfig | null> {
  const site = withLocaleAvailability(await loadPublicClientConfig(tenant), tenant)
  if (locale === 'en') return site

  const overlay = await loadI18nOverlay(tenant, locale)
  if (!overlay) return null
  const translated = applyI18nOverlay(site, overlay)
  return {
    ...translated,
    i18n: {
      ...translated.i18n,
      defaultLocale: locale,
    },
  }
}
