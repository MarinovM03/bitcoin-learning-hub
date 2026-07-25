import { sendEmail } from './sendEmail.js';

export const clientBaseUrl = () =>
    (process.env.CLIENT_URL || '').split(',')[0].trim().replace(/\/$/, '');

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildPasswordResetEmail = ({ to, username, rawToken }) => {
    const resetUrl = `${clientBaseUrl()}/reset-password?token=${rawToken}`;
    const safeName = escapeHtml(username);
    const safeUrl = escapeHtml(resetUrl);

    return {
        to,
        subject: 'Reset your Bitcoin Learning Hub password',
        text: `Hi ${username},\n\nSomeone requested a password reset for your account. If this was you, open the link below within 30 minutes to set a new password:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `<p>Hi ${safeName},</p><p>Someone requested a password reset for your account. If this was you, click the link below within <strong>30 minutes</strong> to set a new password:</p><p><a href="${safeUrl}">Reset your password</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    };
};

export const buildVerificationEmail = ({ to, username, rawToken }) => {
    const verifyUrl = `${clientBaseUrl()}/verify-email?token=${rawToken}`;
    const safeName = escapeHtml(username);
    const safeUrl = escapeHtml(verifyUrl);

    return {
        to,
        subject: 'Confirm your Bitcoin Learning Hub email',
        text: `Hi ${username},\n\nWelcome to Bitcoin Learning Hub. Confirm this email address to unlock publishing, comments, and glossary contributions:\n\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn't create an account, you can safely ignore this email.`,
        html: `<p>Hi ${safeName},</p><p>Welcome to Bitcoin Learning Hub. Confirm this email address to unlock publishing, comments, and glossary contributions:</p><p><a href="${safeUrl}">Confirm my email</a></p><p>This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>`,
    };
};

export const sendPasswordResetEmail = (options) => sendEmail(buildPasswordResetEmail(options));

export const sendVerificationEmail = (options) => sendEmail(buildVerificationEmail(options));
