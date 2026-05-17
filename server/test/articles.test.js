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
