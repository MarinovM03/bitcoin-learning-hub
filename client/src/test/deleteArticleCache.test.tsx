import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/queryClient';
import { queryKeys } from '../lib/queryKeys';
import { useDeleteArticle } from '../hooks/mutations/useArticleMutations';

const ARTICLE_ID = '6a70f390ded8b6af8d8e0225';

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('deleting an article', () => {
    beforeEach(() => {
        queryClient.clear();
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(new Response(JSON.stringify({ message: 'Article deleted successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })),
        );
    });

    it('forgets the deleted article instead of refetching it', async () => {
        queryClient.setQueryData(queryKeys.articles.detail(ARTICLE_ID), { _id: ARTICLE_ID });
        queryClient.setQueryData(queryKeys.articles.related(ARTICLE_ID), []);
        queryClient.setQueryData(queryKeys.articles.series(ARTICLE_ID), { seriesName: '', parts: [] });
        queryClient.setQueryData(queryKeys.comments.forArticle(ARTICLE_ID), { comments: [] });
        queryClient.setQueryData(queryKeys.likes.forArticle(ARTICLE_ID), { totalLikes: 0 });

        const { result } = renderHook(() => useDeleteArticle(), { wrapper });

        await result.current.mutateAsync(ARTICLE_ID);

        await waitFor(() => {
            expect(queryClient.getQueryData(queryKeys.articles.detail(ARTICLE_ID))).toBeUndefined();
        });

        expect(queryClient.getQueryData(queryKeys.articles.related(ARTICLE_ID))).toBeUndefined();
        expect(queryClient.getQueryData(queryKeys.articles.series(ARTICLE_ID))).toBeUndefined();
        expect(queryClient.getQueryData(queryKeys.comments.forArticle(ARTICLE_ID))).toBeUndefined();
        expect(queryClient.getQueryData(queryKeys.likes.forArticle(ARTICLE_ID))).toBeUndefined();
    });

    it('leaves other articles in the cache alone', async () => {
        const OTHER_ID = '6a70f390ded8b6af8d8e0999';
        queryClient.setQueryData(queryKeys.articles.detail(ARTICLE_ID), { _id: ARTICLE_ID });
        queryClient.setQueryData(queryKeys.articles.detail(OTHER_ID), { _id: OTHER_ID });

        const { result } = renderHook(() => useDeleteArticle(), { wrapper });

        await result.current.mutateAsync(ARTICLE_ID);

        await waitFor(() => {
            expect(queryClient.getQueryData(queryKeys.articles.detail(ARTICLE_ID))).toBeUndefined();
        });

        expect(queryClient.getQueryData(queryKeys.articles.detail(OTHER_ID))).toEqual({ _id: OTHER_ID });
    });
});
