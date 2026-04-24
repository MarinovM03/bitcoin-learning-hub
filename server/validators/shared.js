import { z } from 'zod';
import mongoose from 'mongoose';

export const objectId = z
    .string()
    .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'Invalid ID' });

export const httpUrl = z
    .string()
    .trim()
    .regex(/^https?:\/\//, 'URL must start with http:// or https://');

export const optionalHttpUrl = z
    .string()
    .trim()
    .regex(/^https?:\/\//, 'URL must start with http:// or https://')
    .or(z.literal(''))
    .optional();

export const articleIdParam = z.object({ articleId: objectId });
export const pathIdParam = z.object({ pathId: objectId });
export const termIdParam = z.object({ termId: objectId });
export const commentIdParam = z.object({ commentId: objectId });
export const certIdParam = z.object({ certId: objectId });
export const userIdParam = z.object({ userId: objectId });
