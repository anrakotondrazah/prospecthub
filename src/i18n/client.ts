'use client'

import { useTranslations as useNextIntlTranslations, useLocale as useNextIntlLocale } from 'next-intl'
import { locales, defaultLocale, localeNames, isRtlLocale, type Locale } from './config'

export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace)
}

export function useLocale(): Locale {
  return useNextIntlLocale() as Locale
}

export function useLocaleInfo() {
  const locale = useLocale()
  return {
    locale,
    isRtl: isRtlLocale(locale),
    name: localeNames[locale],
    availableLocales: locales,
    defaultLocale,
  }
}

export function setLocale(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
  window.location.reload()
}

export { locales, defaultLocale, localeNames, isRtlLocale, type Locale }
