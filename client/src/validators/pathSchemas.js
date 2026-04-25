import { z } from 'zod';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const optionalHttpUrl = z
    .string()
    .trim()
    .regex(/^https?:\/\//, 'URL must start with http:// or https://')
    .or(z.literal(''))
    .optional();

export const createPathSchema = z.object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters long').max(100, 'Title must be at most 100 characters'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters long').max(300, 'Description must be at most 300 characters'),
    difficulty: z.enum(DIFFICULTIES).optional(),
    coverImage: optionalHttpUrl,
    articles: z.array(z.string()).optional(),
});

export const updatePathSchema = createPathSchema.partial();
