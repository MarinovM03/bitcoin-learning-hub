import { z } from 'zod';
import { objectId, optionalHttpUrl } from './shared.js';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const createPathSchema = z.object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters long').max(100, 'Title must be at most 100 characters'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters long').max(300, 'Description must be at most 300 characters'),
    difficulty: z.enum(DIFFICULTIES).optional(),
    coverImage: optionalHttpUrl,
    articles: z.array(objectId).optional(),
});

export const updatePathSchema = createPathSchema.partial();

export const submitQuizSchema = z.object({
    answers: z.array(z.number().int().min(0)),
});
