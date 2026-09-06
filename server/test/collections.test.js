import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle, userFixtures } from './helpers.js';
import Collection from '../models/Collection.js';
import Article from '../models/Article.js';

const createCollection = (token, body) =>
    request(app()).post('/collections').set('Cookie', token).send(body);

describe('creating a collection', () => {
    it('requires authentication', async () => {
        const res = await request(app()).post('/collections').send({ title: 'Bitcoin Basics' });
        expect(res.status).toBe(401);
    });

    it('derives a readable address from the title', async () => {
        const { token } = await registerAndToken();
        const res = await createCollection(token, { title: 'Bitcoin Foundations' });

        expect(res.status).toBe(201);
        expect(res.body.slug).toBe('bitcoin-foundations');
        expect(res.body.articles).toEqual([]);
    });

    it('keeps addresses unique across collections', async () => {
        const { token } = await registerAndToken();
        await createCollection(token, { title: 'Bitcoin Foundations' });
        const second = await createCollection(token, { title: 'Bitcoin Foundations' });

        expect(second.status).toBe(201);
        expect(second.body.slug).toBe('bitcoin-foundations-2');
    });

    it('rejects a title that is too short', async () => {
        const { token } = await registerAndToken();
        const res = await createCollection(token, { title: 'Hi' });
        expect(res.status).toBe(400);
    });

    it('accepts only the author\'s own articles', async () => {
        const { token } = await registerAndToken();
        const { body: mine } = await createArticle(token, { title: 'My own article' });

        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: theirs } = await createArticle(otherToken, { title: 'Someone elses article' });

        const res = await createCollection(token, {
            title: 'Mixed ownership',
            articles: [mine._id, theirs._id],
        });

        expect(res.status).toBe(201);
        expect(res.body.articles.map(String)).toEqual([String(mine._id)]);
    });
});

describe('reading collections', () => {
    it('keeps the author\'s chosen order', async () => {
        const { token } = await registerAndToken();
        const { body: first } = await createArticle(token, { title: 'The first part here' });
        const { body: second } = await createArticle(token, { title: 'The second part here' });
        const { body: third } = await createArticle(token, { title: 'The third part here' });

        await createCollection(token, {
            title: 'Ordered Guide',
            articles: [third._id, first._id, second._id],
        });

        const res = await request(app()).get('/collections/ordered-guide');
        expect(res.status).toBe(200);
        expect(res.body.articles.map(a => a.title)).toEqual([
            'The third part here',
            'The first part here',
            'The second part here',
        ]);
    });

    it('hides unpublished articles from readers but not the author', async () => {
        const { token } = await registerAndToken();
        const { body: live } = await createArticle(token, { title: 'A published part' });
        const { body: hidden } = await createArticle(token, { title: 'A drafted part', status: 'draft' });

        await createCollection(token, { title: 'Partly Ready', articles: [live._id, hidden._id] });

        const reader = await request(app()).get('/collections/partly-ready');
        expect(reader.body.articles.map(a => a.title)).toEqual(['A published part']);

        const author = await request(app()).get('/collections/partly-ready').set('Cookie', token);
        expect(author.body.articles).toHaveLength(2);
    });

    it('leaves empty collections out of the public list', async () => {
        const { token } = await registerAndToken();
        await createCollection(token, { title: 'Nothing In Here Yet' });

        const res = await request(app()).get('/collections');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    it('returns 404 for an unknown address', async () => {
        const res = await request(app()).get('/collections/does-not-exist');
        expect(res.status).toBe(404);
    });
});

describe('an article inside a collection', () => {
    it('reports its position with neighbours', async () => {
        const { token } = await registerAndToken();
        const { body: one } = await createArticle(token, { title: 'Chapter one here' });
        const { body: two } = await createArticle(token, { title: 'Chapter two here' });
        const { body: three } = await createArticle(token, { title: 'Chapter three here' });

        await createCollection(token, {
            title: 'Reading Path',
            articles: [one._id, two._id, three._id],
        });

        const res = await request(app()).get(`/articles/${two._id}/collections`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({ title: 'Reading Path', position: 2, total: 3 });
        expect(res.body[0].prev.title).toBe('Chapter one here');
        expect(res.body[0].next.title).toBe('Chapter three here');
    });

    it('reports nothing for an article in no collection', async () => {
        const { token } = await registerAndToken();
        const { body: loner } = await createArticle(token);

        const res = await request(app()).get(`/articles/${loner._id}/collections`);
        expect(res.body).toEqual([]);
    });
});

describe('changing a collection', () => {
    it('lets the owner reorder and rename it', async () => {
        const { token } = await registerAndToken();
        const { body: a } = await createArticle(token, { title: 'Article A here' });
        const { body: b } = await createArticle(token, { title: 'Article B here' });
        const { body: collection } = await createCollection(token, {
            title: 'Original Name',
            articles: [a._id, b._id],
        });

        const res = await request(app())
            .put(`/collections/${collection._id}`)
            .set('Cookie', token)
            .send({ title: 'Renamed Path', articles: [b._id, a._id] });

        expect(res.status).toBe(200);
        expect(res.body.slug).toBe('renamed-path');
        expect(res.body.articles.map(String)).toEqual([String(b._id), String(a._id)]);
    });

    it('forbids editing someone else\'s collection', async () => {
        const { token } = await registerAndToken();
        const { body: collection } = await createCollection(token, { title: 'Private Path' });

        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const res = await request(app())
            .put(`/collections/${collection._id}`)
            .set('Cookie', otherToken)
            .send({ title: 'Hijacked Path' });

        expect(res.status).toBe(403);
    });

    it('drops a deleted article out of every collection', async () => {
        const { token } = await registerAndToken();
        const { body: keep } = await createArticle(token, { title: 'Surviving article' });
        const { body: doomed } = await createArticle(token, { title: 'Doomed article here' });
        const { body: collection } = await createCollection(token, {
            title: 'Shrinking Path',
            articles: [keep._id, doomed._id],
        });

        await request(app()).delete(`/articles/${doomed._id}`).set('Cookie', token);

        const stored = await Collection.findById(collection._id).lean();
        expect(stored.articles.map(String)).toEqual([String(keep._id)]);
        expect(await Article.countDocuments()).toBe(1);
    });

    it('lets the owner delete it', async () => {
        const { token } = await registerAndToken();
        const { body: collection } = await createCollection(token, { title: 'Temporary Path' });

        const res = await request(app())
            .delete(`/collections/${collection._id}`)
            .set('Cookie', token);

        expect(res.status).toBe(200);
        expect(await Collection.countDocuments()).toBe(0);
    });
});
