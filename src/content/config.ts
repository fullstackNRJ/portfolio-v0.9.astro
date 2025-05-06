import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.date(),
    image: z.string().url(),
    tags: z.array(z.string()),
    author: z.string().default('Neeraj Mukta')
  })
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().url(),
    tags: z.array(z.string()),
    link: z.string().url().optional(),
    featured: z.boolean().default(false)
  })
});

const skills = defineCollection({
  type: 'content',
  schema: z.object({
    category: z.string(),
    items: z.array(z.object({
      name: z.string(),
      level: z.number().min(0).max(100),
      icon: z.string().optional()
    }))
  })
});

export const collections = {
  blog,
  projects,
  skills
};