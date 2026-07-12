import { z } from 'zod';

const CATEGORIES = ['Basics', 'Technology', 'Economics', 'Security', 'History', 'Trading', 'Mining', 'Regulation', 'Culture'] as const;
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;
const STATUSES = ['draft', 'published'] as const;

const httpUrl = z
    .string()
    .trim()
    .max(2048, 'URL is too long')
    .regex(/^https?:\/\//, 'URL must start with http:// or https://');

const quizQuestion = z.object({
    question: z.string().trim().min(1, 'Question is required').max(200, 'Questions must be at most 200 characters'),
    options: z.array(z.string().trim().min(1).max(120, 'Options must be at most 120 characters')).length(4, 'Each question must have exactly 4 options.'),
    correctIndex: z.number().int().min(0).max(3),
});

export const createArticleSchema = z.object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters long').max(150, 'Title must be at most 150 characters'),
    category: z.enum(CATEGORIES),
    difficulty: z.enum(DIFFICULTIES).optional(),
    imageUrl: httpUrl,
    summary: z.string().trim().min(1, 'Summary is required').max(250, 'Summary must be at most 250 characters'),
    content: z.string().min(1, 'Content is required').max(100_000, 'Content is too long'),
    status: z.enum(STATUSES).optional(),
    quiz: z.array(quizQuestion).max(5, 'At most 5 quiz questions allowed').optional(),
    seriesName: z.string().trim().max(80, 'Series name must be at most 80 characters').optional(),
    seriesPart: z.union([z.number().int().min(1).max(99), z.string(), z.null()]).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();
