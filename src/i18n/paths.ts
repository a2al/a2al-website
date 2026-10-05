import { defaultLocale, docsLocales, type Locale } from './config'

/** Localized marketing path. English stays at site root. */
export function localizePath(locale: Locale, path: string): string {
  const normalized =
    !path || path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`
  if (locale === 'en') return normalized
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`
}

/**
 * URL of a docs page for a given locale.
 *
 * Docs live under `/docs/...`; translated trees live under `/<locale>/docs/...`
 * (`src/content/docs/<locale>/`). Locales without a translated tree fall back
 * to the default one, so links never 404 while translations are in flight.
 */
export function docsPath(locale: Locale, slug: string): string {
  const s = slug.startsWith('/') ? slug : `/${slug}`
  const path = s.startsWith('/docs') ? s : `/docs${s}`
  if (locale === defaultLocale || !docsLocales.includes(locale)) return path
  return `/${locale}${path}`
}
