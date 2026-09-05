import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../contexts/AuthContext';
import AdminComments from '../components/admin/AdminComments';
import AdminUsers from '../components/admin/AdminUsers';

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const comment = (id: string, text: string) => ({
    _id: id,
    text,
    createdAt: '2026-01-01T00:00:00.000Z',
    _ownerId: { _id: 'u1', username: 'someone', profilePicture: '' },
    articleId: { _id: 'a1', title: 'An article' },
});

const user = (id: string, username: string) => ({
    _id: id,
    username,
    email: `${username}@example.com`,
    role: 'user',
    profilePicture: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    isTrusted: false,
    approvedArticles: 0,
});

const wrap = (ui: ReactNode) =>
    render(
        <MemoryRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>{ui}</AuthProvider>
            </QueryClientProvider>
        </MemoryRouter>,
    );

const requestedUrls = () =>
    vi.mocked(globalThis.fetch).mock.calls.map(([input]) => String(input));

describe('admin comments panel', () => {
    beforeEach(() => {
        queryClient.clear();
        localStorage.clear();
    });

    it('lists comments and removes one without a manual refetch', async () => {
        const client = userEvent.setup();
        let remaining = [comment('c1', 'First comment'), comment('c2', 'Second comment')];

        vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
            if ((init as RequestInit | undefined)?.method === 'DELETE') {
                remaining = remaining.filter(c => !String(input).includes(c._id));
                return Promise.resolve(json({ message: 'Comment deleted.' }));
            }
            return Promise.resolve(json({
                comments: remaining, total: remaining.length, page: 1, totalPages: 1,
            }));
        });

        wrap(<AdminComments />);

        expect(await screen.findByText('First comment', {}, { timeout: 10_000 })).toBeInTheDocument();
        expect(screen.getByText('Second comment')).toBeInTheDocument();

        await client.click(screen.getAllByRole('button', { name: /delete/i })[0]!);
        await client.click(await screen.findByRole('button', { name: /delete comment/i }));

        await waitFor(() => {
            expect(screen.queryByText('First comment')).not.toBeInTheDocument();
        }, { timeout: 10_000 });

        expect(screen.getByText('Second comment')).toBeInTheDocument();
    }, 20_000);
});

describe('admin users panel', () => {
    beforeEach(() => {
        queryClient.clear();
        localStorage.clear();
        vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
            const url = new URL(String(input), 'http://localhost');
            const search = url.searchParams.get('search') ?? '';
            const rows = search ? [user('u2', 'searched')] : [user('u1', 'alpha'), user('u2', 'searched')];
            return Promise.resolve(json({ users: rows, total: rows.length, page: 1, totalPages: 1 }));
        });
    });

    it('debounces the search into a single request', async () => {
        const client = userEvent.setup();
        wrap(<AdminUsers />);

        expect(await screen.findByText('alpha', {}, { timeout: 10_000 })).toBeInTheDocument();

        const before = requestedUrls().filter(u => u.includes('search=')).length;
        await client.type(screen.getByPlaceholderText(/search/i), 'sea');

        await waitFor(() => {
            expect(screen.queryByText('alpha')).not.toBeInTheDocument();
        }, { timeout: 10_000 });

        const searchRequests = requestedUrls().filter(u => u.includes('search='));
        expect(searchRequests.length - before).toBeLessThanOrEqual(1);
        expect(searchRequests.at(-1)).toContain('search=sea');
    }, 20_000);
});
