import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../contexts/AuthContext';
import { useArticle } from '../hooks/queries/useArticles';

const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    </MemoryRouter>
);

describe('a session expiring while the page is still loading', () => {
    beforeEach(() => {
        queryClient.clear();
        localStorage.clear();
        localStorage.setItem('auth', JSON.stringify({ _id: 'u1', expiresAt: Date.now() + 3_600_000 }));
    });

    it('lets the page finish loading instead of stranding it on a skeleton', async () => {
        let release: (r: Response) => void = () => {};
        vi.spyOn(globalThis, 'fetch').mockImplementation(
            () => new Promise<Response>((resolve) => { release = resolve; }),
        );

        const { result } = renderHook(() => useArticle('6a6facf5c2b82e683114aaaa'), { wrapper });
        await waitFor(() => expect(result.current.isPending).toBe(true));

        act(() => { window.dispatchEvent(new Event('auth:unauthorized')); });
        await act(async () => { release(json({ _id: '6a6facf5c2b82e683114aaaa', title: 'Still here' }, 200)); });

        await waitFor(
            () => {
                expect(result.current.isPending).toBe(false);
            },
            { timeout: 8000 },
        );
    });
});
