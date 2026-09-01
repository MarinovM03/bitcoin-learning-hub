import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import { queryClient } from '../lib/queryClient';

const emptyJson = () =>
    new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

const renderAt = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </MemoryRouter>,
    );

const storeStaleSession = () => {
    localStorage.setItem('auth', JSON.stringify({
        _id: '6a6facf5c2b82e683114aaaa',
        username: 'martin',
        email: 'martin@example.com',
        role: 'user',
        emailVerified: true,
        expiresAt: Date.now() + 60_000,
    }));
};

describe('password recovery stays reachable with a stored session', () => {
    beforeEach(() => {
        queryClient.clear();
        localStorage.clear();
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(emptyJson()));
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    it('renders the reset form for a signed-in visitor', async () => {
        storeStaleSession();
        renderAt('/reset-password?token=a-reset-token');

        expect(
            await screen.findByRole('heading', { name: /set a new password/i }, { timeout: 10_000 }),
        ).toBeInTheDocument();
    });

    it('renders the reset form for a signed-out visitor', async () => {
        renderAt('/reset-password?token=a-reset-token');

        expect(
            await screen.findByRole('heading', { name: /set a new password/i }, { timeout: 10_000 }),
        ).toBeInTheDocument();
    });

    it('renders the forgot-password form for a signed-in visitor', async () => {
        storeStaleSession();
        renderAt('/forgot-password');

        expect(
            await screen.findByRole('heading', { name: /reset your password/i }, { timeout: 10_000 }),
        ).toBeInTheDocument();
    });
});
