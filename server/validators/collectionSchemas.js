import { z } from 'zod';
import { objectId, httpUrl } from './shared.js';

const titleRule = z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(80, 'Title must be at most 80 characters');

const descriptionRule = z
    .string()
    .trim()
    .max(300, 'Description must be at most 300 characters');

const coverRule = httpUrl.or(z.literal(''));

const articlesRule = z
    .array(objectId)
    .max(100, 'A collection can hold at most 100 articles');

export const createCollectionSchema = z.object({
    title: titleRule,
    description: descriptionRule.optional(),
    coverImage: coverRule.optional(),
    articles: articlesRule.optional(),
});

export const updateCollectionSchema = z.object({
    title: titleRule.optional(),
    description: descriptionRule.optional(),
    coverImage: coverRule.optional(),
    articles: articlesRule.optional(),
});

export const collectionIdParam = z.object({ collectionId: objectId });

export const collectionSlugParam = z.object({
    slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, 'Invalid collection address'),
});
