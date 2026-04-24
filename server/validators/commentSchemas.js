import { z } from 'zod';
import { objectId } from './shared.js';

export const createCommentSchema = z.object({
    articleId: objectId,
    text: z
        .string()
        .trim()
        .min(2, 'Comment must be at least 2 characters long!')
        .max(500, 'Comment must be at most 500 characters'),
});
