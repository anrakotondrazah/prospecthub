export const locales = ['fr', 'en', 'es', 'de', 'pt', 'it', 'nl', 'ar', 'zh'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

export const localeNames: Record<Locale, string> = {
  fr: 'Francais',
  en: 'English',
  es: 'Espanol',
  de: 'Deutsch',
  pt: 'Portugues',
  it: 'Italiano',
  nl: 'Nederlands',
  ar: 'العربية',
  zh: '中文',
}

export const localeFlags: Record<Locale, string> = {
  fr: 'FR',
  en: 'GB',
  es: 'ES',
  de: 'DE',
  pt: 'PT',
  it: 'IT',
  nl: 'NL',
  ar: 'SA',
  zh: 'CN',
}

export const rtlLocales: Locale[] = ['ar']

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}
