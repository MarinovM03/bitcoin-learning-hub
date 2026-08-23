import { z } from 'zod';

export const updateUserRoleSchema = z.object({
    role: z.enum(['user', 'admin'], { message: 'Role must be "user" or "admin"' }),
});

export const updateUserTrustSchema = z.object({
    isTrusted: z.boolean({ message: 'isTrusted must be true or false.' }),
});

export const rejectArticleSchema = z.object({
    note: z.string().trim().max(300, 'Keep the note under 300 characters').optional(),
}).default({});
