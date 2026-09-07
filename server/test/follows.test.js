import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle, userFixtures } from './helpers.js';
import Follow from '../models/Follow.js';

const follow = (token, targetType, targetId) =>
    request(app()).post('/follows').set('Cookie', token).send({ targetType, targetId });

describe('following an account', () => {
    it('requires authentication', async () => {
        const { user } = await registerAndToken();
        const res = await request(app())
            .post('/follows')
            .send({ targetType: 'user', targetId: String(user._id) });
        expect(res.status).toBe(401);
    });

    it('follows and unfollows the same account', async () => {
        const { user: author } = await registerAndToken();
        const { token: reader } = await registerAndToken(userFixtures.secondary);

        const on = await follow(reader, 'user', String(author._id));
        expect(on.status).toBe(201);
        expect(on.body).toEqual({ following: true, followers: 1 });

        const off = await follow(reader, 'user', String(author._id));
        expect(off.status).toBe(200);
        expect(off.body).toEqual({ following: false, followers: 0 });
    });

    it('refuses to let someone follow themselves', async () => {
        const { token, user } = await registerAndToken();
        const res = await follow(token, 'user', String(user._id));
        expect(res.status).toBe(400);
    });

    it('refuses an account that no longer exists', async () => {
        const { token } = await registerAndToken();
        const res = await follow(token, 'user', '6a70f390ded8b6af8d8e0999');
        expect(res.status).toBe(404);
    });

    it('counts followers only once per reader', async () => {
        const { user: author } = await registerAndToken();
        const { token: reader } = await registerAndToken(userFixtures.secondary);

        await follow(reader, 'user', String(author._id));
        await Follow.create({
            _followerId: (await registerAndToken(userFixtures.tertiary)).user._id,
            targetType: 'user',
            targetId: author._id,
        });

        const res = await request(app()).get(`/follows/user/${author._id}`);
        expect(res.status).toBe(200);
        expect(res.body.followers).toBe(2);
    });

    it('tells a reader whether they already follow the account', async () => {
        const { user: author } = await registerAndToken();
        const { token: reader } = await registerAndToken(userFixtures.secondary);

        const before = await request(app())
            .get(`/follows/user/${author._id}`)
            .set('Cookie', reader);
        expect(before.body.followedByMe).toBe(false);

        await follow(reader, 'user', String(author._id));

        const after = await request(app())
            .get(`/follows/user/${author._id}`)
            .set('Cookie', reader);
        expect(after.body.followedByMe).toBe(true);
    });
});

describe('the following feed', () => {
    it('requires authentication', async () => {
        const res = await request(app()).get('/feed');
        expect(res.status).toBe(401);
    });

    it('is empty until the reader follows someone', async () => {
        const { token } = await registerAndToken();
        const res = await request(app()).get('/feed').set('Cookie', token);
        expect(res.status).toBe(200);
        expect(res.body.articles).toEqual([]);
        expect(res.body.following).toBe(0);
    });

    it('shows published articles from followed accounts, newest first', async () => {
        const { token: authorToken, user: author } = await registerAndToken();
        await createArticle(authorToken, { title: 'The earlier article' });
        await createArticle(authorToken, { title: 'The later article' });
        await createArticle(authorToken, { title: 'An unfinished draft', status: 'draft' });

        const { token: reader } = await registerAndToken(userFixtures.secondary);
        await follow(reader, 'user', String(author._id));

        const res = await request(app()).get('/feed').set('Cookie', reader);
        expect(res.status).toBe(200);
        expect(res.body.total).toBe(2);
        expect(res.body.articles.map(a => a.title)).toEqual([
            'The later article',
            'The earlier article',
        ]);
    });

    it('leaves out accounts the reader does not follow', async () => {
        const { token: authorToken } = await registerAndToken();
        await createArticle(authorToken, { title: 'Not in the feed' });

        const { token: reader } = await registerAndToken(userFixtures.secondary);
        const res = await request(app()).get('/feed').set('Cookie', reader);
        expect(res.body.articles).toEqual([]);
    });

    it('pages through a long feed', async () => {
        const { token: authorToken, user: author } = await registerAndToken();
        for (let i = 1; i <= 3; i += 1) {
            await createArticle(authorToken, { title: `Feed article number ${i}` });
        }

        const { token: reader } = await registerAndToken(userFixtures.secondary);
        await follow(reader, 'user', String(author._id));

        const first = await request(app()).get('/feed?page=1&limit=2').set('Cookie', reader);
        expect(first.body.articles).toHaveLength(2);
        expect(first.body.totalPages).toBe(2);

        const second = await request(app()).get('/feed?page=2&limit=2').set('Cookie', reader);
        expect(second.body.articles).toHaveLength(1);
    });
});

describe('following a collection', () => {
    it('brings its articles into the feed', async () => {
        const { token: authorToken } = await registerAndToken();
        const { body: article } = await createArticle(authorToken, { title: 'A collected article' });
        const { body: collection } = await request(app())
            .post('/collections')
            .set('Cookie', authorToken)
            .send({ title: 'Followed Path', articles: [article._id] });

        const { token: reader } = await registerAndToken(userFixtures.secondary);
        await follow(reader, 'collection', String(collection._id));

        const res = await request(app()).get('/feed').set('Cookie', reader);
        expect(res.body.articles.map(a => a.title)).toEqual(['A collected article']);
    });

    it('drops its followers when the collection goes', async () => {
        const { token: authorToken } = await registerAndToken();
        const { body: collection } = await request(app())
            .post('/collections')
            .set('Cookie', authorToken)
            .send({ title: 'Doomed Path' });

        const { token: reader } = await registerAndToken(userFixtures.secondary);
        await follow(reader, 'collection', String(collection._id));
        expect(await Follow.countDocuments()).toBe(1);

        await request(app())
            .delete(`/collections/${collection._id}`)
            .set('Cookie', authorToken);

        expect(await Follow.countDocuments()).toBe(0);
    });
});
