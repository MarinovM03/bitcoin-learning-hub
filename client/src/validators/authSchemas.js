import { z } from 'zod';

const usernameRule = z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long!')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers!');

const emailRule = z
    .string()
    .trim()
    .regex(/.+@.+\..+/, 'Please enter a valid email address');

const passwordRule = z.string().min(8, 'Password must be at least 8 characters long!');

const profilePictureRule = z
    .string()
    .trim()
    .regex(/^https?:\/\//, 'Profile picture must be a valid URL')
    .or(z.literal(''))
    .optional();

export const registerSchema = z.object({
    username: usernameRule,
    email: emailRule,
    password: passwordRule,
    confirmPassword: z.string(),
    profilePicture: profilePictureRule,
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
});

export const loginSchema = z.object({
    identifier: z.string().trim().min(1, 'Please enter your email or username!'),
    password: z.string().min(1, 'Please enter your password'),
});

export const updateProfileSchema = z.object({
    username: usernameRule.optional().or(z.literal('')),
    email: emailRule.optional().or(z.literal('')),
    profilePicture: profilePictureRule,
    password: z.union([passwordRule, z.literal('')]).optional(),
    confirmPassword: z.string().optional(),
}).refine(
    (data) => !data.password || data.password === data.confirmPassword,
    { message: 'Passwords do not match!', path: ['confirmPassword'] },
);
