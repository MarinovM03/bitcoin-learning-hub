import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/queryClient';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useMyBookmarks } from '../hooks/queries/useBookmarks';

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    </MemoryRouter>
);

const bookmarkCalls = () => vi.mocked(globalThis.fetch).mock.calls
    .filter(([input]) => String(input).includes('/bookmarks'));

describe('logging out while authenticated data is on screen', () => {
    beforeEach(() => {
        queryClient.clear();
        localStorage.clear();
        localStorage.setItem('auth', JSON.stringify({ _id: 'u1', expiresAt: Date.now() + 3_600_000 }));

        vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
            if (String(input).includes('/bookmarks')) return Promise.resolve(json([]));
            return Promise.resolve(json({}));
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('does not re-request data the signed-out reader can no longer fetch', async () => {
        const { result } = renderHook(
            () => {
                const auth = useAuth();
                return { auth, bookmarks: useMyBookmarks(auth.isAuthenticated) };
            },
            { wrapper },
        );

        await waitFor(() => expect(result.current.bookmarks.isSuccess).toBe(true));
        const before = bookmarkCalls().length;
        expect(before).toBeGreaterThan(0);

        await act(async () => {
            await result.current.auth.logoutHandler();
        });

        expect(result.current.auth.isAuthenticated).toBe(false);
        expect(bookmarkCalls()).toHaveLength(before);
    });
});
