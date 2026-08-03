import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/queryClient';
import { useArticle } from '../hooks/queries/useArticles';

const notFound = () =>
    new Response(JSON.stringify({ message: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
    });

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('a missing article surfaces as an error, not an endless load', () => {
    beforeEach(() => {
        queryClient.clear();
        localStorage.clear();
    });

    it('settles into an error state', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(notFound()));

        const { result } = renderHook(() => useArticle('6a6facf5c2b82e683114aaaa'), { wrapper });

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            { timeout: 10_000 },
        );

        expect(result.current.isPending).toBe(false);
        expect(result.current.error?.message).toBe('Article not found');
    });
});
