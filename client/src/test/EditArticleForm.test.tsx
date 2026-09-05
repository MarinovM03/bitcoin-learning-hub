import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../contexts/AuthContext';
import Edit from '../components/edit/Edit';
import { queryKeys } from '../lib/queryKeys';

const ARTICLE_ID = '6a70f390ded8b6af8d8e0225';
const OWNER_ID = '6a70f390ded8b6af8d8e0111';

const article = {
    _id: ARTICLE_ID,
    title: 'The original stored title',
    summary: 'The original stored summary.',
    content: 'The original stored content.',
    category: 'Technology',
    difficulty: 'Beginner',
    imageUrl: 'https://example.com/cover.jpg',
    readingTime: 4,
    views: 12,
    status: 'published',
    seriesName: '',
    seriesPart: null,
    quiz: [
        { question: 'A stored question?', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    _ownerId: { _id: OWNER_ID, username: 'authoruser', profilePicture: '' },
};

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const renderEdit = () =>
    render(
        <MemoryRouter initialEntries={[`/articles/${ARTICLE_ID}/edit`]}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <Routes>
                        <Route path="/articles/:articleId/edit" element={<Edit />} />
                    </Routes>
                </AuthProvider>
            </QueryClientProvider>
        </MemoryRouter>,
    );

describe('editing an article', () => {
    beforeEach(() => {
        queryClient.clear();
        localStorage.clear();
        localStorage.setItem('auth', JSON.stringify({
            _id: OWNER_ID, username: 'authoruser', email: 'a@example.com',
            role: 'user', emailVerified: true, expiresAt: Date.now() + 3_600_000,
        }));
        vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
            const url = String(input);
            if (/\/articles\/series\/mine/.test(url)) return Promise.resolve(json({ parts: [] }));
            if (/\/articles\/[a-f0-9]+$/.test(url)) return Promise.resolve(json(article));
            return Promise.resolve(json({}));
        });
    });

    it('fills the form from the stored article', async () => {
        renderEdit();

        const title = await screen.findByLabelText(/article title/i, {}, { timeout: 10_000 });
        await waitFor(() => expect(title).toHaveValue(article.title));
        expect(screen.getByLabelText(/image url/i)).toHaveValue(article.imageUrl);
    });

    it('keeps unsaved edits when the article is fetched again', async () => {
        const user = userEvent.setup();
        renderEdit();

        const title = await screen.findByLabelText(/article title/i, {}, { timeout: 10_000 });
        await waitFor(() => expect(title).toHaveValue(article.title));

        await user.clear(title);
        await user.type(title, 'My unsaved rewrite');
        expect(title).toHaveValue('My unsaved rewrite');

        await queryClient.refetchQueries({ queryKey: queryKeys.articles.detail(ARTICLE_ID) });

        await waitFor(() => {
            expect(screen.getByLabelText(/article title/i)).toHaveValue('My unsaved rewrite');
        });
    });

    it('refreshes the cached article after a successful save', async () => {
        const user = userEvent.setup();
        const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

        renderEdit();

        const title = await screen.findByLabelText(/article title/i, {}, { timeout: 10_000 });
        await waitFor(() => expect(title).toHaveValue(article.title));

        await user.clear(title);
        await user.type(title, 'A properly rewritten title');
        await user.click(screen.getByRole('button', { name: /save & publish/i }));

        await waitFor(() => {
            expect(invalidate).toHaveBeenCalledWith(
                expect.objectContaining({ queryKey: queryKeys.articles.all }),
            );
        }, { timeout: 10_000 });

        const put = vi.mocked(globalThis.fetch).mock.calls
            .find(([, init]) => (init as RequestInit | undefined)?.method === 'PUT');
        expect(put).toBeDefined();
    }, 20_000);

    it('keeps a removed quiz question removed when the article is fetched again', async () => {
        const user = userEvent.setup();
        renderEdit();

        await screen.findByLabelText(/article title/i, {}, { timeout: 10_000 });
        await waitFor(() => expect(screen.getByText(/question 1/i)).toBeInTheDocument());

        await user.click(screen.getByRole('button', { name: /remove/i }));
        expect(screen.queryByText(/question 1/i)).not.toBeInTheDocument();

        await queryClient.refetchQueries({ queryKey: queryKeys.articles.detail(ARTICLE_ID) });

        await waitFor(() => {
            expect(screen.queryByText(/question 1/i)).not.toBeInTheDocument();
        });
    });
});
