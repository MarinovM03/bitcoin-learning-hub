import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle, userFixtures } from './helpers.js';

const toggle = (token, articleId) =>
    request(app()).post('/likes').set('Cookie', token).send({ articleId });

describe('Likes', () => {
    it('requires authentication to toggle', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        const res = await request(app()).post('/likes').send({ articleId: article._id });
        expect(res.status).toBe(401);
    });

    it('toggles a like on and off and reports total count', async () => {
        const { token: author } = await registerAndToken();
        const { token: reader } = await registerAndToken(userFixtures.secondary);
        const { body: article } = await createArticle(author);

        const liked = await toggle(reader, article._id);
        expect(liked.status).toBe(201);
        expect(liked.body).toEqual({ liked: true, totalLikes: 1 });

        const unliked = await toggle(reader, article._id);
        expect(unliked.status).toBe(200);
        expect(unliked.body).toEqual({ liked: false, totalLikes: 0 });
    });

    it('counts likes from multiple users', async () => {
        const { token: author } = await registerAndToken();
        const { token: b } = await registerAndToken(userFixtures.secondary);
        const { token: c } = await registerAndToken(userFixtures.tertiary);
        const { body: article } = await createArticle(author);

        await toggle(b, article._id);
        await toggle(c, article._id);

        const summary = await request(app()).get(`/likes/${article._id}`);
        expect(summary.status).toBe(200);
        expect(summary.body).toEqual({ totalLikes: 2, likedByMe: false });

        const authed = await request(app())
            .get(`/likes/${article._id}`)
            .set('Cookie', b);
        expect(authed.status).toBe(200);
        expect(authed.body).toEqual({ totalLikes: 2, likedByMe: true });
    });

    it('refuses to let an author like their own article', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);

        const res = await toggle(token, article._id);
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/your own article/i);

        const summary = await request(app()).get(`/likes/${article._id}`);
        expect(summary.body.totalLikes).toBe(0);
    });

    it('keeps a self-like out of the trending ranking', async () => {
        const { token: author } = await registerAndToken();
        const { body: mine } = await createArticle(author, { title: 'Self promoted piece' });

        await toggle(author, mine._id);

        const trending = await request(app()).get('/articles/trending');
        expect(trending.status).toBe(200);
        expect(trending.body).toHaveLength(0);
    });
});
