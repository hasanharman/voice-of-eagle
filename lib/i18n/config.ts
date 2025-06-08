export const defaultLocale = 'tr'
export const locales = ['tr', 'en'] as const

export type Locale = typeof locales[number]

export const localeNames = {
  tr: 'Türkçe',
  en: 'English'
} as const
