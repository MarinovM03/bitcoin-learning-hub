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
    .toLowerCase()
    .max(254, 'Email is too long')
    .regex(/.+@.+\..+/, 'Please enter a valid email address');

const passwordRule = z
    .string()
    .min(8, 'Password must be at least 8 characters long!')
    .max(128, 'Password must be at most 128 characters');

const profilePictureRule = z
    .string()
    .trim()
    .max(2048, 'URL is too long')
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

export const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Enter your password to delete your account.'),
});

export const forgotPasswordSchema = z.object({
    email: emailRule,
});

export const resetPasswordSchema = z.object({
    token: z.string().trim().min(1, 'Reset token is required'),
    password: passwordRule,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
    username: usernameRule.optional(),
    email: emailRule.optional(),
    profilePicture: profilePictureRule,
    password: passwordRule.or(z.literal('')).optional(),
    confirmPassword: z.string().optional(),
    currentPassword: z.string().optional(),
}).refine(
    (data) => !data.password || data.password === data.confirmPassword,
    { message: 'Passwords do not match!', path: ['confirmPassword'] },
);
