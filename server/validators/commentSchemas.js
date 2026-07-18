import { z } from 'zod';
import { objectId } from './shared.js';

const commentTextRule = z
    .string()
    .trim()
    .min(2, 'Comment must be at least 2 characters long!')
    .max(500, 'Comment must be at most 500 characters');

export const createCommentSchema = z.object({
    articleId: objectId,
    text: commentTextRule,
});

export const updateCommentSchema = z.object({
    text: commentTextRule,
});
