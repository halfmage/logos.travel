import { defineCollection, z } from 'astro:content';

const logosCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    country: z.string().optional(),
    founded: z.string().optional(),
    tags: z.array(z.string()).optional(),
    website: z.string().url().optional(),
  }),
});

export const collections = {
  logos: logosCollection,
};
