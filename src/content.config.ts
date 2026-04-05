import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'

export const collections = {
  docs: defineCollection({
    loader: docsLoader({
      generateId: ({ entry }) =>
        'docs/' + entry.replace(/\.[^.]+$/, '').replace(/\\/g, '/'),
    }),
    schema: docsSchema(),
  }),
}
