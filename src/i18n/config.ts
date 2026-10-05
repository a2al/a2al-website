export const locales = ['en', 'zh', 'ja'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

/**
 * Locales whose docs tree is actually translated and served under
 * `<locale>/docs/...` (see `src/content/docs/<locale>/`).
 * Everything else points at the default (English) docs tree — ja docs are
 * still pending, so ja keeps reading `/docs/...` until they land.
 */
export const docsLocales: Locale[] = ['en', 'zh', 'ja']
