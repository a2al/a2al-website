import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro:content'
import { defaultLocale, locales } from './i18n/config'

/** Locale folders that live inside `src/content/docs/` (all but the default). */
const nonDefaultLocales = locales.filter((l) => l !== defaultLocale)

export const collections = {
  docs: defineCollection({
    loader: docsLoader({
      /**
       * Entry ids double as route slugs. The site serves the docs at `/docs`,
       * so the root locale keeps the `docs/` prefix; a non-root locale
       * (`zh/user/getting-started.md`) needs the locale as the FIRST segment
       * (`zh/docs/user/getting-started`) for Starlight to route it to
       * `/zh/docs/user/getting-started/` and to keep sidebar slugs
       * (`docs/user/...`) locale-independent.
       */
      generateId: ({ entry }) => {
        const path = entry.replace(/\.[^.]+$/, '').replace(/\\/g, '/')
        const [first, ...rest] = path.split('/')
        if (rest.length > 0 && nonDefaultLocales.includes(first as (typeof locales)[number])) {
          return `${first}/docs/${rest.join('/')}`
        }
        return 'docs/' + path
      },
    }),
    schema: docsSchema({
      extend: z.object({
        /**
         * Who the page is written for. Drives grouping/labels only —
         * never access control.
         *   user       — first contact / non-developer (default)
         *   developer  — integrators
         *   operator   — people running a daemon
         */
        audience: z.enum(['user', 'developer', 'operator']).optional(),
        /**
         * Maturity of what the page documents. When `dev`, the page renders an
         * "In development" badge next to the title. Omit for shipped behaviour.
         */
        stage: z.enum(['dev', 'beta']).optional(),
      }),
    }),
  }),
}
