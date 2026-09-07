import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import FollowingList from '../components/following-list/FollowingList';

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const following = {
    users: [{ _id: '6a70f390ded8b6af8d8e0111', username: 'SatoshiV2', profilePicture: '' }],
    collections: [{
        _id: '6a70f390ded8b6af8d8e0222',
        title: 'Bitcoin Foundations',
        slug: 'bitcoin-foundations',
        coverImage: '',
        articleCount: 3,
        _ownerId: { _id: '6a70f390ded8b6af8d8e0111', username: 'SatoshiV2' },
    }],
};

const renderList = () => render(
    <MemoryRouter>
        <QueryClientProvider client={queryClient}>
            <FollowingList />
        </QueryClientProvider>
    </MemoryRouter>,
);

describe('the following list', () => {
    beforeEach(() => {
        queryClient.clear();
        vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
            const method = (init as RequestInit | undefined)?.method ?? 'GET';
            if (method === 'POST') return Promise.resolve(json({ following: false, followers: 0 }));
            if (String(input).includes('/follows/following')) return Promise.resolve(json(following));
            return Promise.resolve(json({}));
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('lists the accounts the reader follows', async () => {
        renderList();

        expect(await screen.findByText('SatoshiV2')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument();
    });

    it('shows followed collections on the other tab', async () => {
        renderList();
        await screen.findByText('SatoshiV2');

        await userEvent.click(screen.getByRole('tab', { name: /collections/i }));

        expect(await screen.findByText('Bitcoin Foundations')).toBeInTheDocument();
        expect(screen.getByText(/3 parts · by SatoshiV2/)).toBeInTheDocument();
    });

    it('unfollows straight from the list', async () => {
        renderList();
        await screen.findByText('SatoshiV2');

        await userEvent.click(screen.getByRole('button', { name: /unfollow/i }));

        await waitFor(() => {
            const posted = vi.mocked(globalThis.fetch).mock.calls
                .filter(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
            expect(posted).toHaveLength(1);
        });
    });

    it('points nowhere-yet readers at the catalog', async () => {
        vi.mocked(globalThis.fetch).mockImplementation(() =>
            Promise.resolve(json({ users: [], collections: [] })));

        renderList();

        expect(await screen.findByText(/aren't following anyone yet/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /find authors/i })).toBeInTheDocument();
    });
});
