import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle, userFixtures } from './helpers.js';

const toggle = (token, articleId) =>
    request(app()).post('/likes').set('x-authorization', token).send({ articleId });

describe('Likes', () => {
    it('requires authentication to toggle', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        const res = await request(app()).post('/likes').send({ articleId: article._id });
        expect(res.status).toBe(401);
    });

    it('toggles a like on and off and reports total count', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);

        const liked = await toggle(token, article._id);
        expect(liked.status).toBe(201);
        expect(liked.body).toEqual({ liked: true, totalLikes: 1 });

        const unliked = await toggle(token, article._id);
        expect(unliked.status).toBe(200);
        expect(unliked.body).toEqual({ liked: false, totalLikes: 0 });
    });

    it('counts likes from multiple users', async () => {
        const { token: a } = await registerAndToken();
        const { token: b } = await registerAndToken(userFixtures.secondary);
        const { body: article } = await createArticle(a);

        await toggle(a, article._id);
        await toggle(b, article._id);

        const list = await request(app()).get(`/likes/${article._id}`);
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(2);
    });
});
