import { z } from 'zod';

export const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const httpUrl = z
    .string()
    .trim()
    .max(2048, 'URL is too long')
    .regex(/^https?:\/\//, 'URL must start with http:// or https://');

export const articleIdParam = z.object({ articleId: objectId });
export const termIdParam = z.object({ termId: objectId });
export const commentIdParam = z.object({ commentId: objectId });
export const userIdParam = z.object({ userId: objectId });
export const reportIdParam = z.object({ reportId: objectId });
