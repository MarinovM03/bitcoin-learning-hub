import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/queryClient';
import { queryKeys } from '../lib/queryKeys';
import { useDeleteArticle } from '../hooks/mutations/useArticleMutations';
import * as articleService from '../services/articleService';

const ARTICLE_ID = '6a70f390ded8b6af8d8e0225';

type ArticleDetail = Awaited<ReturnType<typeof articleService.getOne>>;

const openArticle = { _id: ARTICLE_ID, title: 'Still open' } as unknown as ArticleDetail;

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('deleting an article', () => {
    beforeEach(() => {
        queryClient.clear();
        vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
            const method = (init as RequestInit | undefined)?.method ?? 'GET';
            if (method === 'DELETE') {
                return Promise.resolve(json({ message: 'Article deleted successfully' }));
            }
            if (/\/articles\/[a-f0-9]+$/.test(String(input))) {
                return Promise.resolve(json({ message: 'Article not found' }, 404));
            }
            return Promise.resolve(json({}));
        });
    });

    it('does not re-request the article while the page is still open', async () => {
        const { result } = renderHook(
            () => ({
                remove: useDeleteArticle(),
                detail: useQuery({
                    queryKey: queryKeys.articles.detail(ARTICLE_ID),
                    queryFn: () => articleService.getOne(ARTICLE_ID),
                    initialData: openArticle,
                }),
            }),
            { wrapper },
        );

        await result.current.remove.mutateAsync(ARTICLE_ID);

        await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));

        const refetched = vi.mocked(globalThis.fetch).mock.calls
            .filter(([input, init]) =>
                ((init as RequestInit | undefined)?.method ?? 'GET') === 'GET'
                && new RegExp(`/articles/${ARTICLE_ID}$`).test(String(input)));
        expect(refetched).toHaveLength(0);
    });

    it('refreshes the listings that the article appeared in', async () => {
        const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useDeleteArticle(), { wrapper });
        await result.current.mutateAsync(ARTICLE_ID);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        for (const key of [
            queryKeys.articles.lists,
            queryKeys.articles.mine,
            queryKeys.articles.trending,
            queryKeys.bookmarks.all,
        ]) {
            expect(invalidate).toHaveBeenCalledWith(expect.objectContaining({ queryKey: key }));
        }
    });
});
