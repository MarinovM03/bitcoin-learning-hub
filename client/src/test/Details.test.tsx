import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../contexts/AuthContext';
import Details from '../components/details/Details';

const ARTICLE_ID = '6a70f390ded8b6af8d8e0225';
const OWNER_ID = '6a70f390ded8b6af8d8e0111';
const OTHER_ID = '6a70f390ded8b6af8d8e0222';

const article = {
    _id: ARTICLE_ID,
    title: 'What a UTXO actually is',
    summary: 'Unspent transaction outputs, explained plainly.',
    content: '# UTXOs\n\nBitcoin has no balances, only unspent outputs.',
    category: 'Technology',
    difficulty: 'Beginner',
    imageUrl: 'https://example.com/cover.jpg',
    readingTime: 4,
    views: 12,
    status: 'published',
    quiz: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    hasRead: false,
    _ownerId: { _id: OWNER_ID, username: 'authoruser', profilePicture: '' },
};

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const routeFetch = (articleResponse: () => Response) => (input: RequestInfo | URL) => {
    const url = String(input);
    if (/\/articles\/[a-f0-9]+\/related/.test(url)) return Promise.resolve(json([]));
    if (/\/articles\/[a-f0-9]+\/series/.test(url)) return Promise.resolve(json({ seriesName: '', parts: [] }));
    if (/\/articles\/[a-f0-9]+$/.test(url)) return Promise.resolve(articleResponse());
    if (url.includes('/likes/')) return Promise.resolve(json({ totalLikes: 3, likedByMe: false }));
    if (url.includes('/bookmarks')) return Promise.resolve(json([]));
    if (url.includes('/comments/')) return Promise.resolve(json([]));
    return Promise.resolve(json({}));
};

const signIn = (userId: string) =>
    localStorage.setItem('auth', JSON.stringify({
        _id: userId, username: 'someone', email: 's@example.com',
        role: 'user', emailVerified: true, expiresAt: Date.now() + 3_600_000,
    }));

const NotFoundProbe = () => <div>not-found-page</div>;

const renderDetails = () =>
    render(
        <MemoryRouter initialEntries={[`/articles/${ARTICLE_ID}/details`]}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <Routes>
                        <Route path="/articles/:articleId/details" element={<Details />} />
                        <Route path="/not-found" element={<NotFoundProbe />} />
                    </Routes>
                </AuthProvider>
            </QueryClientProvider>
        </MemoryRouter>,
    );

describe('Details', () => {
    beforeEach(() => {
        queryClient.clear();
        localStorage.clear();
        vi.stubGlobal('IntersectionObserver', class {
            observe() {}
            unobserve() {}
            disconnect() {}
            takeRecords() { return []; }
            root = null;
            rootMargin = '';
            thresholds = [];
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the article for a signed-out reader', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(routeFetch(() => json(article)));

        renderDetails();

        expect(await screen.findByText(article.title)).toBeInTheDocument();
        expect(screen.getByText(article.summary)).toBeInTheDocument();
    });

    it('offers edit and delete to the author, and no report action', async () => {
        signIn(OWNER_ID);
        vi.spyOn(globalThis, 'fetch').mockImplementation(routeFetch(() => json(article)));

        renderDetails();

        expect(await screen.findByText(article.title)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /edit article/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete article/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^report$/i })).not.toBeInTheDocument();
    });

    it('offers report to a signed-in reader who is not the author', async () => {
        signIn(OTHER_ID);
        vi.spyOn(globalThis, 'fetch').mockImplementation(routeFetch(() => json(article)));

        renderDetails();

        expect(await screen.findByText(article.title)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^report$/i })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /edit article/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete article/i })).not.toBeInTheDocument();
    });

    it('sends the reader to the not-found page when the article is gone', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(
            routeFetch(() => json({ message: 'Article not found' }, 404)),
        );

        renderDetails();

        await waitFor(
            () => {
                expect(screen.getByText('not-found-page')).toBeInTheDocument();
            },
            { timeout: 10_000 },
        );
    });
});
