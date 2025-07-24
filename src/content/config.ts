import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.date(),
    image: z.string().url(),
    tags: z.array(z.string()),
    author: z.string().default('Neeraj Mukta'),
    // Enhanced metadata for comprehensive blog system
    readingTime: z.number().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    category: z.string().default('Technology'),
    featured: z.boolean().default(false),
    enableVoiceReader: z.boolean().default(true),
    enableComments: z.boolean().default(true),
    seoKeywords: z.array(z.string()).default([]),
    socialImage: z.string().url().optional(),
    canonicalUrl: z.string().url().optional(),
    lastModified: z.date().optional(),
    // AI-generated content
    aiSummary: z.string().optional(),
    aiHashtags: z.array(z.string()).default([]),
    relatedPosts: z.array(z.string()).default([])
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