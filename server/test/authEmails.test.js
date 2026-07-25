import { describe, it, expect } from 'vitest';
import { buildPasswordResetEmail, buildVerificationEmail } from '../utils/authEmails.js';

describe('auth email templates', () => {
    it('escapes HTML metacharacters in the recipient name', () => {
        const { html } = buildVerificationEmail({
            to: 'someone@example.com',
            username: '<img src=x onerror="alert(1)">',
            rawToken: 'abc123',
        });

        expect(html).not.toContain('<img');
        expect(html).not.toContain('onerror="');
        expect(html).toContain('&lt;img');
    });

    it('escapes the reset recipient name too', () => {
        const { html } = buildPasswordResetEmail({
            to: 'someone@example.com',
            username: "Bob<script>alert('x')</script>",
            rawToken: 'abc123',
        });

        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
    });

    it('leaves the plain-text part readable', () => {
        const { text, html } = buildVerificationEmail({
            to: 'someone@example.com',
            username: 'martin',
            rawToken: 'tok-1',
        });

        expect(text).toContain('Hi martin,');
        expect(text).toContain('/verify-email?token=tok-1');
        expect(html).toContain('/verify-email?token=tok-1');
    });

    it('points each email at its own route', () => {
        expect(buildVerificationEmail({ to: 'a@example.com', username: 'a', rawToken: 't1' }).html)
            .toContain('/verify-email?token=t1');
        expect(buildPasswordResetEmail({ to: 'a@example.com', username: 'a', rawToken: 't2' }).html)
            .toContain('/reset-password?token=t2');
    });

    it('addresses the email to the requested recipient', () => {
        expect(buildVerificationEmail({ to: 'target@example.com', username: 'a', rawToken: 't' }).to)
            .toBe('target@example.com');
    });
});
