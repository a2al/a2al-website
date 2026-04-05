import type { Locale } from './config'

/** Localized marketing path. English stays at site root. */
export function localizePath(locale: Locale, path: string): string {
  const normalized =
    !path || path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`
  if (locale === 'en') return normalized
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`
}

/** Starlight docs stay under /docs (single locale). */
export function docsPath(slug: string): string {
  const s = slug.startsWith('/') ? slug : `/${slug}`
  return s.startsWith('/docs') ? s : `/docs${s}`
}
