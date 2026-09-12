import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* Every collection is stored as  <collection>/<lang>/<slug>.md
   so Sveltia CMS can present the English and Chinese versions
   side by side in a single editing screen. */

const localised = (base: string) =>
  glob({ pattern: '**/*.md', base: `./src/content/${base}` });

const services = defineCollection({
  loader: localised('services'),
  schema: z.object({
    title: z.string(),
    order: z.number().default(50),
    summary: z.string(),
    who: z.string(),
    format: z.string(),
    duration: z.string(),
    rate: z.string(),
    rateNote: z.string().optional(),
    includes: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
  }),
});

const testimonials = defineCollection({
  loader: localised('testimonials'),
  schema: z.object({
    order: z.number().default(50),
    pull: z.string(),
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    featured: z.boolean().default(false),
  }),
});

const talks = defineCollection({
  loader: localised('talks'),
  schema: z.object({
    title: z.string(),
    host: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    kind: z.enum(['podcast', 'workshop', 'training', 'conference', 'keynote']),
    summary: z.string(),
    link: z.string().optional(),
    /* Path to an image in /public, e.g. /images/talk-nanjing.jpg */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const partners = defineCollection({
  loader: localised('partners'),
  schema: z.object({
    name: z.string(),
    order: z.number().default(50),
    region: z.string(),
    note: z.string(),
    link: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const resources = defineCollection({
  loader: localised('resources'),
  schema: z.object({
    title: z.string(),
    order: z.number().default(50),
    summary: z.string(),
    forWhom: z.string(),
    gated: z.boolean().default(true),
    /* Path to the PDF in /public, or an external link. */
    file: z.string().optional(),
    /* Form id from your email platform, if the resource is gated. */
    formId: z.string().optional(),
  }),
});

const faqs = defineCollection({
  loader: localised('faqs'),
  schema: z.object({
    question: z.string(),
    order: z.number().default(50),
  }),
});

const posts = defineCollection({
  loader: localised('posts'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    hero: z.string().optional(),
    heroAlt: z.string().optional(),
  }),
});

export const collections = { services, testimonials, talks, partners, resources, faqs, posts };
