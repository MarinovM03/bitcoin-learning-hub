import { describe, it, expect } from 'vitest';
import request from 'supertest';
import {
    app, registerAndToken, userFixtures, articleFixture, createArticle,
} from './helpers.js';

describe('POST /articles', () => {
    it('requires authentication', async () => {
        const res = await request(app()).post('/articles').send(articleFixture);
        expect(res.status).toBe(401);
    });

    it('creates an article when authenticated', async () => {
        const { token, user } = await registerAndToken();
        const res = await createArticle(token);
        expect(res.status).toBe(201);
        expect(res.body.title).toBe(articleFixture.title);
        expect(String(res.body._ownerId)).toBe(String(user._id));
        expect(res.body.readingTime).toBeGreaterThanOrEqual(1);
    });

    it('rejects a short title', async () => {
        const { token } = await registerAndToken();
        const res = await createArticle(token, { title: 'No' });
        expect(res.status).toBe(400);
    });

    it('rejects a non-http image url', async () => {
        const { token } = await registerAndToken();
        const res = await createArticle(token, { imageUrl: 'javascript:alert(1)' });
        expect(res.status).toBe(400);
    });

    it('rejects an unknown category', async () => {
        const { token } = await registerAndToken();
        const res = await createArticle(token, { category: 'Aliens' });
        expect(res.status).toBe(400);
    });

    it('rejects duplicate series part for the same owner', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { seriesName: 'Beginners Path', seriesPart: 1 });
        const dup = await createArticle(token, {
            title: 'Another article',
            seriesName: 'Beginners Path',
            seriesPart: 1,
        });
        expect(dup.status).toBe(409);
    });
});

describe('GET /articles', () => {
    it('returns published articles only', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Public one' });
        await createArticle(token, { title: 'A draft article', status: 'draft' });

        const res = await request(app()).get('/articles');
        expect(res.status).toBe(200);
        expect(res.body.articles).toHaveLength(1);
        expect(res.body.articles[0].title).toBe('Public one');
    });

    it('paginates results', async () => {
        const { token } = await registerAndToken();
        for (let i = 0; i < 5; i++) {
            await createArticle(token, { title: `Article number ${i}` });
        }
        const res = await request(app()).get('/articles?page=1&limit=2');
        expect(res.body.articles).toHaveLength(2);
        expect(res.body.total).toBe(5);
        expect(res.body.totalPages).toBe(3);
    });

    it('filters by category', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Basics post', category: 'Basics' });
        await createArticle(token, { title: 'Mining post', category: 'Mining' });

        const res = await request(app()).get('/articles?category=Mining');
        expect(res.body.articles).toHaveLength(1);
        expect(res.body.articles[0].title).toBe('Mining post');
    });

    it('filters by difficulty', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Beginner one', difficulty: 'Beginner' });
        await createArticle(token, { title: 'Advanced one', difficulty: 'Advanced' });

        const res = await request(app()).get('/articles?difficulty=Advanced');
        expect(res.body.articles).toHaveLength(1);
        expect(res.body.articles[0].difficulty).toBe('Advanced');
    });
});

describe('GET /articles/:id', () => {
    it('returns the article and a hasRead flag', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token);
        const res = await request(app())
            .get(`/articles/${created._id}`)
            .set('x-authorization', token);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(created._id);
        expect(res.body).toHaveProperty('hasRead');
    });

    it('hides drafts from non-owners', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: draft } = await createArticle(ownerToken, { status: 'draft' });

        const asOwner = await request(app())
            .get(`/articles/${draft._id}`)
            .set('x-authorization', ownerToken);
        expect(asOwner.status).toBe(200);

        const asOther = await request(app())
            .get(`/articles/${draft._id}`)
            .set('x-authorization', otherToken);
        expect(asOther.status).toBe(404);
    });

    it('returns 400 for an invalid id', async () => {
        const res = await request(app()).get('/articles/not-an-id');
        expect(res.status).toBe(400);
    });
});

describe('PUT /articles/:id', () => {
    it('updates owned article fields', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token);
        const res = await request(app())
            .put(`/articles/${created._id}`)
            .set('x-authorization', token)
            .send({ title: 'Updated title', summary: 'New summary' });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated title');
        expect(res.body.summary).toBe('New summary');
    });

    it('forbids updating someone else\'s article', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: created } = await createArticle(ownerToken);
        const res = await request(app())
            .put(`/articles/${created._id}`)
            .set('x-authorization', otherToken)
            .send({ title: 'Hijacked title' });
        expect(res.status).toBe(403);
    });
});

describe('DELETE /articles/:id', () => {
    it('deletes the owner\'s article', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token);
        const res = await request(app())
            .delete(`/articles/${created._id}`)
            .set('x-authorization', token);
        expect(res.status).toBe(200);
        const gone = await request(app()).get(`/articles/${created._id}`);
        expect(gone.status).toBe(404);
    });

    it('forbids deleting another user\'s article', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: created } = await createArticle(ownerToken);
        const res = await request(app())
            .delete(`/articles/${created._id}`)
            .set('x-authorization', otherToken);
        expect(res.status).toBe(403);
    });
});

describe('GET /articles/my', () => {
    it('returns only the caller\'s articles (including drafts)', async () => {
        const { token: a } = await registerAndToken();
        const { token: b } = await registerAndToken(userFixtures.secondary);

        const r1 = await createArticle(a, { title: 'Article A one' });
        const r2 = await createArticle(a, { title: 'Article A two', status: 'draft' });
        const r3 = await createArticle(b, { title: 'Article B one' });
        expect(r1.status).toBe(201);
        expect(r2.status).toBe(201);
        expect(r3.status).toBe(201);

        const res = await request(app()).get('/articles/my').set('x-authorization', a);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });
});

const quizFixture = [
    {
        question: 'What is the maximum Bitcoin supply?',
        options: ['21 million', '42 million', '100 million', 'Unlimited'],
        correctIndex: 0,
    },
    {
        question: 'Who mined the genesis block?',
        options: ['Hal Finney', 'Satoshi Nakamoto', 'Nick Szabo', 'Adam Back'],
        correctIndex: 1,
    },
];

describe('Quiz payload visibility', () => {
    it('hides quiz answers from guests and non-owners', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token, { quiz: quizFixture });

        const guestRes = await request(app()).get(`/articles/${created._id}`);
        expect(guestRes.status).toBe(200);
        expect(guestRes.body.quiz).toHaveLength(2);
        expect(guestRes.body.quiz[0].question).toBe(quizFixture[0].question);
        expect(guestRes.body.quiz[0].options).toEqual(quizFixture[0].options);
        for (const q of guestRes.body.quiz) {
            expect(q).not.toHaveProperty('correctIndex');
        }

        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const otherRes = await request(app())
            .get(`/articles/${created._id}`)
            .set('x-authorization', otherToken);
        expect(otherRes.status).toBe(200);
        for (const q of otherRes.body.quiz) {
            expect(q).not.toHaveProperty('correctIndex');
        }
    });

    it('keeps quiz answers visible to the owner', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token, { quiz: quizFixture });

        const res = await request(app())
            .get(`/articles/${created._id}`)
            .set('x-authorization', token);
        expect(res.status).toBe(200);
        expect(res.body.quiz[0].correctIndex).toBe(0);
        expect(res.body.quiz[1].correctIndex).toBe(1);
    });

    it('omits content and quiz from list endpoints', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { quiz: quizFixture });

        const listRes = await request(app()).get('/articles');
        expect(listRes.status).toBe(200);
        for (const article of listRes.body.articles) {
            expect(article).not.toHaveProperty('content');
            expect(article).not.toHaveProperty('quiz');
        }

        const mineRes = await request(app()).get('/articles/my').set('x-authorization', token);
        expect(mineRes.status).toBe(200);
        for (const article of mineRes.body) {
            expect(article).not.toHaveProperty('content');
            expect(article).not.toHaveProperty('quiz');
        }
    });
});

describe('POST /articles/:id/quiz/check', () => {
    it('grades a correct answer', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token, { quiz: quizFixture });

        const res = await request(app())
            .post(`/articles/${created._id}/quiz/check`)
            .send({ questionIndex: 0, answerIndex: 0 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ isCorrect: true, correctIndex: 0 });
    });

    it('grades an incorrect answer', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token, { quiz: quizFixture });

        const res = await request(app())
            .post(`/articles/${created._id}/quiz/check`)
            .send({ questionIndex: 1, answerIndex: 3 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ isCorrect: false, correctIndex: 1 });
    });

    it('returns 404 for a missing question index', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token, { quiz: quizFixture });

        const res = await request(app())
            .post(`/articles/${created._id}/quiz/check`)
            .send({ questionIndex: 5, answerIndex: 0 });
        expect(res.status).toBe(404);
    });

    it('hides draft article quizzes from non-owners', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token, { quiz: quizFixture, status: 'draft' });

        const guestRes = await request(app())
            .post(`/articles/${created._id}/quiz/check`)
            .send({ questionIndex: 0, answerIndex: 0 });
        expect(guestRes.status).toBe(404);

        const ownerRes = await request(app())
            .post(`/articles/${created._id}/quiz/check`)
            .set('x-authorization', token)
            .send({ questionIndex: 0, answerIndex: 0 });
        expect(ownerRes.status).toBe(200);
    });

    it('rejects an out-of-range answer index', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token, { quiz: quizFixture });

        const res = await request(app())
            .post(`/articles/${created._id}/quiz/check`)
            .send({ questionIndex: 0, answerIndex: 7 });
        expect(res.status).toBe(400);
    });
});

describe('Article delete cascade', () => {
    it('removes interactions and path references when an article is deleted', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: readerToken } = await registerAndToken(userFixtures.secondary);
        const { body: article } = await createArticle(ownerToken);
        const keepRes = await createArticle(ownerToken, { title: 'Article that stays' });
        const keeper = keepRes.body;

        await request(app()).post('/comments').set('x-authorization', readerToken)
            .send({ articleId: article._id, text: 'Nice write-up!' });
        await request(app()).post('/likes').set('x-authorization', readerToken)
            .send({ articleId: article._id });
        await request(app()).post('/bookmarks').set('x-authorization', readerToken)
            .send({ articleId: article._id });
        await request(app()).post(`/articles/${article._id}/read`).set('x-authorization', readerToken);

        const pathRes = await request(app()).post('/paths').set('x-authorization', ownerToken).send({
            title: 'Cascade path',
            description: 'Path containing the doomed article.',
            articles: [article._id, keeper._id],
        });
        expect(pathRes.status).toBe(201);

        const del = await request(app())
            .delete(`/articles/${article._id}`)
            .set('x-authorization', ownerToken);
        expect(del.status).toBe(200);

        const comments = await request(app()).get(`/comments/${article._id}`);
        expect(comments.body).toHaveLength(0);

        const likes = await request(app()).get(`/likes/${article._id}`);
        expect(likes.body.totalLikes).toBe(0);

        const bookmarks = await request(app()).get('/bookmarks').set('x-authorization', readerToken);
        expect(bookmarks.body).toHaveLength(0);

        const path = await request(app()).get(`/paths/${pathRes.body._id}`);
        expect(path.status).toBe(200);
        expect(path.body.articles.map(a => a._id)).toEqual([keeper._id]);
    });
});

describe('Interaction existence checks', () => {
    it('rejects comments on missing articles', async () => {
        const { token } = await registerAndToken();
        const res = await request(app()).post('/comments').set('x-authorization', token)
            .send({ articleId: '64b000000000000000000000', text: 'Ghost comment' });
        expect(res.status).toBe(404);
    });

    it('rejects likes and bookmarks on drafts from non-owners', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: draft } = await createArticle(ownerToken, { status: 'draft' });

        const like = await request(app()).post('/likes').set('x-authorization', otherToken)
            .send({ articleId: draft._id });
        expect(like.status).toBe(404);

        const bookmark = await request(app()).post('/bookmarks').set('x-authorization', otherToken)
            .send({ articleId: draft._id });
        expect(bookmark.status).toBe(404);

        const ownBookmark = await request(app()).post('/bookmarks').set('x-authorization', ownerToken)
            .send({ articleId: draft._id });
        expect(ownBookmark.status).toBe(201);
    });
});

describe('Series partial updates', () => {
    it('keeps the series intact when only one series field is sent', async () => {
        const { token } = await registerAndToken();
        const { body: created } = await createArticle(token, {
            seriesName: 'Bitcoin Basics',
            seriesPart: 2,
        });

        const res = await request(app())
            .put(`/articles/${created._id}`)
            .set('x-authorization', token)
            .send({ seriesPart: 3 });
        expect(res.status).toBe(200);
        expect(res.body.seriesName).toBe('Bitcoin Basics');
        expect(res.body.seriesPart).toBe(3);
    });
});

describe('List pagination clamps', () => {
    it('caps the page size and tolerates malformed paging params', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Clamp check article' });

        const huge = await request(app()).get('/articles?limit=5000');
        expect(huge.status).toBe(200);
        expect(huge.body.articles.length).toBeLessThanOrEqual(50);

        const negative = await request(app()).get('/articles?page=-3&limit=-10');
        expect(negative.status).toBe(200);
        expect(negative.body.page).toBe(1);
    });
});
